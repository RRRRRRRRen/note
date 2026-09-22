# JSON 数据处理

*类型：knowledge ｜ 难度：入门 ｜ 标签：Python、JSON、序列化 ｜ 更新：2026-09-22*

**JSON 处理就两个方向：`json.dumps()` 把 Python 对象序列化为 JSON 字符串（写出 / 传输前用），`json.loads()` 把 JSON 字符串反序列化回 Python 对象（读入后用）——方向记「dump 出去、load 进来」即可。**

## 序列化与反序列化

- `json.dumps(obj)`：Python 对象 → JSON 字符串
- `json.loads(str)`：JSON 字符串 → Python 对象

```python
import json

user = {"name": "Tom", "age": 18}

text = json.dumps(user)         # 序列化：'{"name": "Tom", "age": 18}'
restored = json.loads(text)     # 反序列化：{'name': 'Tom', 'age': 18}
print(restored["name"])         # Tom —— 还原后按字典正常访问
```

- 对应关系：Python 字典 / 列表 ↔ JSON 对象 / 数组，`None` ↔ `null`，`True` ↔ `true`
- 典型场景：配置文件落盘用 `dumps` 写、程序启动用 `loads` 读；接口收发同理
