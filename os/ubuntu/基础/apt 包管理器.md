# apt 包管理器

*类型：knowledge ｜ 难度：入门 ｜ 标签：Ubuntu、apt、yum、软件包、下载源*

**Linux 软件以包（二进制压缩包）的形式存在，集中存放在软件仓库里，由包管理器统一安装与更新：Red Hat 系用 `.rpm` 包配 `yum`，Debian 系（含 Ubuntu）用 `.deb` 包配 `apt`。yum 与 apt 的日常命令几乎一一对应——理解了「仓库 + 包」这个模型，换发行版不用重学。**

## 软件包与仓库

- 软件包是软件所有文件的二进制压缩包，包含安装软件的所有指令。
- Red Hat 家族包后缀为 `.rpm`，Debian 家族为 `.deb`。
- 包集中存放于软件仓库；`yum` 是 CentOS 的默认包管理工具，可以类比成 Node.js 的 npm。

## yum 常用命令

```bash
yum update            # 更新软件包（方法一）
yum upgrade           # 更新软件包（方法二）

yum search xxx        # 搜索软件包

yum install xxx       # 安装软件包
yum install -y xxx    # 安装过程自动回答 yes

yum remove xxx        # 删除软件包
```

## 切换下载源

### 查看软件源

```bash
yum repolist                                  # 查看软件源列表
ls /etc/yum.repos.d/                          # 查看仓库配置文件列表
cat /etc/yum.repos.d/CentOS-Base.repo         # 查看具体内容
```

### 备份原始配置

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
```

### 下载阿里云配置

```bash
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

注意事项：云服务器一般已自动配置服务商提供的下载源，无需额外配置。

### 生成缓存

```bash
yum makecache
```

## 注意事项

- `apt` 与 `yum` 命令对应关系：`apt update`/`apt install`/`apt remove` 分别对应 `yum update`/`yum install`/`yum remove`，模型一致。
- 换源前先备份原配置，出错可随时回滚。
- 换源后执行 `yum makecache`（或 `apt update`）刷新本地包索引，新源才生效。
