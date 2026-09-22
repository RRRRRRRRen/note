# SSH 免密登录配置与排错

*类型：practice ｜ 难度：入门 ｜ 标签：CentOS、SSH、密钥登录、免密、sshd*

**SSH 免密登录的本质是「本机私钥签名、服务器公钥验证」：本地生成密钥对，把公钥追加进服务器的 `~/.ssh/authorized_keys`，之后 `ssh` 直接连即可。配置失败九成出在权限——`.ssh` 目录 700、`authorized_keys` 600，权限过松 sshd 直接拒收。**

## 确认本地已有 SSH 密钥

检查是否已生成密钥（默认存储在 `~/.ssh/` 目录）：

```bash
ls ~/.ssh/
```

- 看到 `id_rsa`（RSA 密钥）或 `id_ed25519`（Ed25519 密钥）等文件，说明密钥已存在。
- 未生成过则先生成：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"  # 推荐 Ed25519 算法
```

## 将公钥上传到服务器

### 方法一：ssh-copy-id（最简单）

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub username@server_ip
```

输入一次服务器密码后，公钥会自动追加到服务器的 `~/.ssh/authorized_keys`。

### 方法二：手动复制

`ssh-copy-id` 不可用时手动操作：

```bash
# 1. 查看本地公钥内容
cat ~/.ssh/id_ed25519.pub

# 2. 密码登录服务器
ssh username@server_ip

# 3. 在服务器上配置公钥
mkdir -p ~/.ssh                                # 目录不存在则创建
echo "你的公钥内容" >> ~/.ssh/authorized_keys    # 追加，不是覆盖
chmod 600 ~/.ssh/authorized_keys               # 必须设置权限
```

## 使用密钥登录

```bash
ssh -i ~/.ssh/id_ed25519 username@server_ip
```

密钥是默认名称（如 `id_rsa`、`id_ed25519`）时可省略 `-i`：

```bash
ssh username@server_ip
```

## 可选配置：简化登录

### 别名配置（~/.ssh/config）

在本地 `~/.ssh/config` 中添加（没有则新建）：

```text
Host myserver                    # 自定义别名
    HostName server_ip           # 服务器 IP 或域名
    User username                # 登录用户名
    IdentityFile ~/.ssh/id_ed25519  # 指定私钥路径
```

之后一条命令直达：

```bash
ssh myserver
```

### 禁用密码登录（提升安全性）

在服务器上编辑 `/etc/ssh/sshd_config`：

```bash
sudo nano /etc/ssh/sshd_config
```

```text
PasswordAuthentication no    # 禁用密码登录
```

重启 SSH 服务生效：

```bash
sudo systemctl restart sshd
```

禁用前务必确认密钥登录已经跑通，否则会把自己锁在外面。

## 常见问题排查

### 仍提示输入密码

检查服务器端权限——这是最高频原因：

```bash
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

确认 sshd 允许公钥认证（`/etc/ssh/sshd_config`）：

```text
PubkeyAuthentication yes
```

### 连接超时或拒绝

- 检查服务器防火墙是否开放 SSH 端口：

```bash
sudo ufw allow 22  # 使用 ufw 的情况
```

- 确认 IP 和端口是否正确（非 22 端口要显式指定）：

```bash
ssh -p 2222 username@server_ip
```

### 密钥权限错误

本地私钥权限必须为 600：

```bash
chmod 600 ~/.ssh/id_ed25519
```
