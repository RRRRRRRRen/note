# write() 返回 false 之后会怎样？

*类型：knowledge ｜ 难度：高级 ｜ 标签：Stream、背压、Node.js ｜ 更新：2026-09-10*

**`write() === false` 不是错误——数据已经照常进入内部缓冲，它只是一句提醒：缓冲已达 highWaterMark，消费跟不上了。无视它程序不会崩，但缓冲会随生产无限膨胀，直到 OOM。正确反应是三步：暂停生产 → 监听 drain（缓冲被消费清空时触发）→ 恢复写入。这套循环手写容易漏，`pipe`/`pipeline` 已把它自动化——所以生产代码永远用 `pipeline`：背压传导、错误传播、资源清理三件事一起接管。**

前置知识：流的读写全是异步回调——理解事件循环如何调度宏任务（事件循环是怎么调度的：从调用栈到微任务），才能理解 drain 为什么在「之后某个时刻」触发。

## 两种模式：流动与暂停

Readable 有两种把数据交给你的方式。**流动模式**：监听 `data` 事件或调用 `resume()` 后，数据被持续自动推过来，你必须立刻接住每一块，没人问你要不要；**暂停模式**：流停在内部缓冲区里，等你显式调用 `read()` 才拉取。两种模式随时切换：挂上 `data` 监听进入流动，`pause()` 或移除监听退回暂停。

为什么非要一个「暂停」模式？因为背压需要物理基础：下游必须有能力让上游停下来，缓冲才不会失控。暂停模式就是上游的刹车，流动模式是松开刹车滑行。一个事实要先接受：Readable 不会因为「你还没读」就停止生产——它只会在缓冲超过水位线后停下来等你。下游的所有控制手段，最终都落在 pause/resume 这对原语上，`pipe` 的全部工作也只是在正确时机踩刹车。

## highWaterMark：水位线，不是上限

可读流和可写流内部都有缓冲区，`highWaterMark` 是它的**阈值**。语义必须精确：超过阈值**不报错、不丢数据、也不阻止写入**——它只改变两件事：`write()` 的返回值变成 `false`，以及流开始向外发出「该缓一缓」的信号。它是水位线不是容量上限：水位线之上的缓冲照单全收，内存最终涨多高，完全取决于你是否尊重那个返回值。

数值上有一个常见误区要修正——「默认 64KB」只对字节流成立，且 objectMode 下水位线的计量单位会整个换掉。以下是本机 Node v22.17.0 的实测值：

```typescript
import * as fs from "node:fs";
import { Readable, Writable } from "node:stream";

new Readable().readableHighWaterMark;                      // 65536（64KiB）
new Writable().writableHighWaterMark;                      // 65536（64KiB）
new Readable({ objectMode: true }).readableHighWaterMark;  // 16（16 个对象，不是字节）
fs.createReadStream("big.log").readableHighWaterMark;      // 65536
fs.createWriteStream("out.log").writableHighWaterMark;     // 65536
```

> **记忆卡：水位线是信号阈值，不是容量上限**
> 字节流默认 **64KiB**，objectMode 默认 **16 个对象**。越过它只有两个后果：`write()` 返回 `false`、内部 needDrain 置位——不抛错、不拦截、不丢数据。

## write() 返回 false 与 drain 的精确时机

`write(chunk)` 把数据排进缓冲区后**立刻返回**——「写」永远是异步完成的，返回值描述的是排队后的缓冲状态：`true` 表示还没到水位线，可以继续；`false` 表示这条写入让 `writableLength` 达到了 `highWaterMark`，内部 needDrain 随之置位（`writableNeedDrain` 可读）。此时正确的动作是停止生产，等 `drain` 事件。

drain 的时机有精确答案：**缓冲被底层消费到清空时**。每块数据真正写完（write 回调被调用）缓冲就少一块，清空那一刻若 needDrain 置位，drain 触发。用一段可复现的代码验证：

```typescript
import { Buffer } from "node:buffer";
import { Writable } from "node:stream";

const ws = new Writable({
  highWaterMark: 16 * 1024,                 // 16KiB 水位线，方便演示
  write(chunk, enc, cb) { setTimeout(cb, 40); }, // 模拟慢消费：40ms 才写完一块
});

console.log("write #1 ->", ws.write(Buffer.alloc(8 * 1024)));
console.log("write #2 ->", ws.write(Buffer.alloc(8 * 1024)));
ws.on("drain", () =>
  console.log("drain, writableLength =", ws.writableLength),
);
// write #1 -> true
// write #2 -> false
// drain, writableLength = 0        （约 80ms 后）
```

逐行解读输出：

```text
输出时序 / drain timing

write #1 -> true            【同步】
  写入后 writableLength = 8192，未达 16384 水位线，缓冲有余量，立刻返回 true。

write #2 -> false           【同步】
  这条写入让 writableLength 达到 16384、正好触及水位线——返回 false，
  内部 needDrain 置位，但数据照常入队，没有任何失败。

drain, writableLength = 0   【宏任务】
  两条 chunk 的 write 回调（各 40ms）先后完成，缓冲被消费清空的那一刻触发
  drain——此刻才适合恢复写入。
```

注意一个不对称：`drain` **只会在收到过 false 之后发出**——没收到过 false，缓冲再怎么被消费也不会有 drain。恢复写入后若再次越过水位线，needDrain 再次置位，要再次等待。「write → false → 等 drain → 恢复」是一个可以循环任意次的状态机，不是一次性开关。

## pipe 与 pipeline 如何传导背压

手写传导就是那三步：data 回调里 `write()` 返回 false 时对源调 `pause()`；收到 `drain` 后 `resume()`。`pipe` 内部做的正是这件事，可以用两个事件把它看穿——下游消费慢时，readable 反复被 pause，每消费完一块才被 resume，生产速度被强行拉平到消费速度（Node v22.17.0 实测日志）：

```typescript
import { Buffer } from "node:buffer";
import { Readable, Writable } from "node:stream";

const src = Readable.from(
  (function* () {
    for (let i = 0; i < 6; i++) yield Buffer.alloc(16 * 1024, i);
  })(),
  { highWaterMark: 16 * 1024 },
);
const sink = new Writable({
  highWaterMark: 16 * 1024,
  write(c, e, cb) { setTimeout(() => { console.log("消费", c[0]); cb(); }, 60); },
});

src.on("pause", () => console.log(">> readable 被 pause（背压传导）"));
src.on("resume", () => console.log(">> readable resume"));
src.pipe(sink);

// 日志（节选，实测）：resume 与 pause 反复交替——
// >> readable resume
// >> readable 被 pause（背压传导）
// 消费 0
// >> readable resume
// >> readable 被 pause（背压传导）
// 消费 1 …
```

`pipeline` 在 pipe 的传导之上补齐了另外两件事：**错误传播**与**资源清理**。pipe 不监听上游错误，任一段出错其余段不知情；pipeline 把整条链当一个整体——任一段出错，Promise 以该错误 reject，所有段（包括中间的 Transform）被逐个 destroy，不会留下悬挂句柄。下面的实测里 transform 中途抛错，异常被抛给 await，源流被销毁：

```typescript
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const src = Readable.from([1, 2, 3]);
try {
  await pipeline(
    src,
    async function* (chunks) {
      for await (const c of chunks) {
        if (c === 2) throw new Error("transform 炸了");
        yield c;
      }
    },
    async (chunks) => { for await (const c of chunks) { /* 消费 */ } },
  );
} catch (e) {
  console.log("捕获:", (e as Error).message);      // 捕获: transform 炸了
  console.log("src.destroyed:", src.destroyed);    // src.destroyed: true
}
```

Node 17+ 推荐 `node:stream/promises` 的 `pipeline`：返回 Promise 可进 async 流程，还支持传 `AbortSignal` 中断整条链。手写 `on("data")` 循环的时代，这三件事（背压、错误、清理）每一件都要自己写对——遗漏任何一件都不会在写代码时报错，只在生产环境报内存或句柄问题。

## 交互演示：背压模拟器

背压模拟器对比遵守与忽略 highWaterMark 的缓冲表现（水位线 64KB、每周期生产 32KB、每周期消费 16KB，消费慢于生产即背压出现的前提），两种模式的运行行为如下：

- **正确：等待 drain 模式**——缓冲涨到 64KB 以上时 `write()` 返回 false，暂停写入等 drain；消费侧每周期消化 16KB，缓冲被清空的瞬间 drain 触发、恢复写入。日志依次出现「缓冲 NKB ≥ highWaterMark → write() 返回 false，暂停写入等 drain」「已暂停（缓冲 NKB ≥ 64KB），等待 drain」「drain 触发（缓冲区清空）→ 恢复写入」。24 个周期过去，缓冲区始终在水位线附近震荡——这就是背压在兜底。
- **错误：无视返回值模式**——返回 false 后照写不误，缓冲持续膨胀，日志反复提示「write() 返回 false 仍继续写 → 缓冲区 NKB 持续膨胀」；缓冲涨到 512KB 封顶定格（演示用），真实场景内存继续膨胀直至 OOM。

## 边界与陷阱

背压响应：

```javascript
// 【反例】
readable.on("data", (chunk) => {
  ws.write(chunk); // 返回值被丢弃
});
// 问题：返回 false 后照写不误，缓冲无限膨胀——文件多大内存涨多快，
// 这是手写流代码 OOM 的头号成因。
```

```javascript
// 【正解】
readable.on("data", (chunk) => {
  if (!ws.write(chunk)) {
    readable.pause();                          // 暂停生产
    ws.once("drain", () => readable.resume()); // 缓冲清空再恢复
  }
});
// 要点：检查返回值 → 暂停 → drain 恢复，三步就是背压的全部——也是 pipe 内部做的事。
```

错误传播：

```javascript
// 【反例】
fs.createReadStream("big.log")
  .pipe(gzip)
  .pipe(fs.createWriteStream("big.log.gz"));
// 任一段出错：无通知、不销毁、句柄悬挂
// 问题：pipe 零错误处理：源或目标出错后其余段毫不知情，fd 不释放，进程可能挂而不退。
```

```javascript
// 【正解】
await pipeline(
  fs.createReadStream("big.log"),
  gzip,
  fs.createWriteStream("big.log.gz"),
); // 任一段出错：Promise reject + 全链 destroy
// 要点：pipeline 把错误传播与逐段销毁收进一个函数，node:stream/promises 一行接管。
```

error 与 destroy：

```javascript
// 【反例】
ws.on("drain", doWrite); // 只关心恢复写入
// 没监听 error；出错后也没人调 destroy
// 问题：流上没有 error 监听器时，错误会以 unhandled error event 直接击穿进程；
// 不 destroy 则 fd/Socket 不释放。
```

```javascript
// 【正解】
ws.on("error", (err) => {
  console.error(err);
  ws.destroy(); // 显式释放底层资源
});
// 要点：或者干脆交给 pipeline：error 监听与 destroy 都是它的内置动作，不需要逐流手写。
```

## 经典追问链

**Q1：write() 返回 false 之后继续 write，会报错或丢数据吗？**

考返回值语义的精确理解——不少人把 false 当「写入失败」去处理，方向从一开始就错了。

都不会。false 不是错误：数据照单全收排进内部缓冲，返回值只是「缓冲已达水位线，消费跟不上了」的建议信号。继续写完全合法，后果只有一个——writableLength 持续增长、内存膨胀。所以背压是性能与稳定性问题（内存、延迟），不是正确性问题：程序不会崩，只会被内存一点点压死。

加分项：排查手段，writableLength 看积压字节数，writableNeedDrain 看是否正处于「等 drain」状态——内存曲线陡增时先看这两个值。

**Q2：drain 到底什么时候触发？缓冲降到水位线以下就会触发吗？**

「返回 false 就等 drain」人人会背，但 drain 的精确时机大多数人答不出——这题区分背下来的和真懂的。

不是。drain 的前提是先收到过 false（needDrain 置位）；触发时机是缓冲被底层消费到清空——实测 Node v22.17.0：16KiB 水位线连写两条 8KiB，第二条返回 false，约 80ms 后 drain 触发，此刻 writableLength === 0。恢复写入后若再次越过水位线，要再次等 drain——它是可循环的状态机，不是一次性开关。

加分项：恢复写入的惯用写法是 `ws.once("drain", resume 生产循环)`——用 on 反复注册是典型泄漏源。

**Q3：objectMode 下 highWaterMark 的语义有什么不同？会埋什么坑？**

考「水位线 = 字节数」这个默认心智在对象流下的失效——逐行解析、数据库游标都是 objectMode 重灾区。

计数单位从字节换成「对象个数」，默认 16 个。坑在量纲错觉：64KiB 字节水位线对应确定的内存上界，而 16 个对象可能是 16 个 10 字节的小 JSON，也可能是 16 张 50MB 的图片——水位线不再对应任何内存上界。所以 objectMode 流的 highWaterMark 要按「单对象平均大小 × 可接受积压数」重新估算，宁可调小。

加分项：字节流同样是估计而非承诺，write 一个 10MB 的 Buffer 一次就能越过 64KiB 水位线——水位线约束的是缓冲总量，不是单次写入大小。

**Q4：pipe 和 pipeline 在错误处理上到底差在哪？**

高频对比题——答出「pipeline 会传播错误」只是及格线，面试官想听的是出错之后每段流各自处于什么状态。

核心差异是「出错后谁负责善后」。readable.pipe(writable) 不监听上游错误：任一段出错，其余段不会被通知也不会被销毁——可写流里已缓冲的数据悬挂、fd 不释放，进程可能既不退出也不干活。pipeline 把整条链当一个整体：任一段出错，Promise 以该错误 reject，且所有段（包括中间 Transform）被逐个 destroy，资源确定释放。

加分项：cleanup 细节，pipe 时代要自己给每段挂 error 监听、把错误转发给下一段、必要时 unpipe 并 destroy 中间流——n 段管道要连 n×(n-1) 条错误线；pipeline 把连线和销毁顺序全部收进一个函数，这才是「永远 pipeline」的完整理由。

**Q5：为什么 write() 设计成永不失败，背压用返回值加事件表达，而不是阻塞或抛错？**

压轴题，从 API 细节跳到设计取舍——考是否理解 Node 异步模型的根约束：事件循环不能被阻塞。

因为流跑在单线程事件循环上。write 若同步阻塞到数据真正落盘或发出，一个慢消费者就能冻结整个进程；若把「下游变慢」设计成抛错，又把正常波动误报成故障。所以 Node 把「写」建模为入队后立即返回，用返回值和 drain 事件表达下游承载力——代价是把尊重背压的责任交给每个调用者，写错的代码不报错、只吃内存。后续 API 的演进一直在收回这个责任：pipe 自动传导，pipeline 自动清理与传播，for await...of 让消费端根本碰不到 write——抽象层级越高，越难写错。

加分项：同一约束在 Web Streams 里换了表达，ReadableStream 用 desiredSize 暴露水位、用 pull 让下游反向拉取——背压是所有流抽象的必修课，区别只是信号的形状。

## 写在最后

背压的本质只有一句话：**让生产速率服从消费能力**。流的世界用 write 返回值与 drain 事件表达它；没有流的世界里，同一个问题以「并发数失控」的面目出现——下一站可以看看无流场景下的同一道题：怎么把并发请求数限制在 N 以内。

## 延伸阅读

- 怎么把并发请求数限制在 N 以内？——背压的孪生问题：没有流时可用的生产节流手段——并发池，同样是让生产服从承载能力。
