# 用户切换：su、sudo 与 exit

*类型：practice ｜ 难度：入门 ｜ 标签：CentOS、su、sudo、exit、权限*

**Linux 下临时换身份执行操作有三个关键字：`su` 整体切换到目标用户（输目标用户密码）、`sudo` 以目标用户身份执行单条命令（输自己密码）、`exit` 退出当前会话回到上一层。安全实践上 sudo 优于 su：权限粒度细、自动记录日志、不需要共享 root 密码。**

## su：切换用户

`su`（substitute user / switch user）用于切换用户身份，默认切换到 root。

### 基本语法

```bash
su [选项] [用户名]
```

- 用户名：目标用户，不指定默认为 `root`。
- 选项：控制行为，如是否加载目标用户的环境。

### 常用选项

```bash
su - username   # 模拟完整登录，加载目标用户的环境变量与配置
su -            # 切换到 root 并加载 root 的环境
su -c "ls /root"  # 以 root 身份执行单条命令，执行完回到原会话
```

`-`（`--login`）的区别：带上它会加载目标用户的 `.bash_profile`/`.bashrc`，环境与真正登录一致；不带则只换身份、保留当前环境变量，常导致「切了 root 却找不到命令」的困惑。

## su 与 sudo 的区别

| 功能 | `su` | `sudo` |
| --- | --- | --- |
| 切换方式 | 切换到目标用户的 shell，输入目标用户密码 | 以目标用户（通常 root）执行单条命令，输入当前用户密码 |
| 安全性 | 需共享 root 密码，容易产生隐患 | 权限可配置、记录日志，通常更安全 |
| 环境切换 | 需 `su -` 才加载目标环境 | 自动加载目标用户环境 |
| 日志记录 | 无自动日志 | 记录执行的每条命令，便于审计 |

## exit：退出会话

`exit` 退出当前 shell 会话，返回调用它的上一层环境，适用于本地终端、远程 SSH、脚本等所有 shell 场景。

### 基本语法

```bash
exit [n]
```

- `n`：可选的退出状态码。`0` 表示正常退出，非 `0` 表示错误或异常退出。

### 常见用法

```bash
exit    # 退出当前 shell 会话
exit 0  # 正常退出
exit 1  # 非正常退出，通常表示错误
```

嵌套 shell 时，`exit` 逐层退出最内层：

```bash
bash    # 启动一个新的子 shell
exit    # 退出子 shell，回到外层
```

脚本中用 `exit` 结束执行并返回状态码：

```bash
#!/bin/bash
echo "开始执行脚本"

# 如果发生错误，退出脚本并返回错误码
if [ ! -f "/some/file" ]; then
  echo "文件不存在！"
  exit 1  # 返回非零状态，表示错误
fi

echo "脚本执行完成"
exit 0  # 正常退出，表示成功
```

## logout 与 exit 的关系

- `logout` 用于退出**登录 shell**（登录后创建的 shell），`exit` 更通用，适用于所有 shell 会话。
- 多数情况下两者效果相同；在非登录 shell 中使用 `logout` 会报错。

```bash
exit    # 退出 shell，任何场景
logout  # 退出登录 shell
```
