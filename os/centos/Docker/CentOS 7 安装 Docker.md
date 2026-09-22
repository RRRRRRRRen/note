# CentOS 7 安装 Docker

*类型：practice ｜ 难度：入门 ｜ 标签：CentOS、Docker、yum、镜像加速*

**CentOS 7 已停止维护，官方 yum 源下线，装 Docker 的第一步是把 yum 源切到 vault.centos.org 归档源；之后按「卸旧版 → 加 Docker 源 → 装包 → 启动 → 开机自启 → 配镜像加速」六步走完。镜像加速配置里的 JSON 两项之间别丢逗号，改完记得 daemon-reload 再重启 docker。**

## 重新配置 yum 源

CentOS 7 官方源已 EOL，需改用 vault 归档源。

步骤一：备份 yum 仓库配置文件

```bash
cp -v /etc/yum.repos.d/CentOS-Base.repo{,-backup}
```

步骤二：修改 `/etc/yum.repos.d/CentOS-Base.repo`

```text
[base]
name=CentOS-$releasever - Base
baseurl=https://vault.centos.org/7.9.2009/os/$basearch
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

[updates]
name=CentOS-$releasever - Updates
baseurl=https://vault.centos.org/7.9.2009/updates/$basearch
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

[extras]
name=CentOS-$releasever - Extras
baseurl=https://vault.centos.org/7.9.2009/extras/$basearch
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

[centosplus]
name=CentOS-$releasever - Plus
baseurl=https://vault.centos.org/7.9.2009/centosplus/$basearch
enabled=0
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
```

步骤三：清空缓存并重建

```bash
yum clean all && yum makecache
```

## 安装 Docker

步骤一：卸载旧版 docker（避免旧组件冲突）

```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

步骤二：添加 Docker 的 yum 源（阿里云镜像）

```bash
sudo yum install -y yum-utils
sudo yum-config-manager \
--add-repo \
http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

步骤三：安装 Docker Engine 及组件

```bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

步骤四：启动 docker

```bash
sudo systemctl start docker
```

步骤五：设置开机自启动

```bash
sudo systemctl enable docker
```

步骤六：验证安装

```bash
docker -v      # 查看版本
docker info    # 查看详细运行信息
```

## 配置镜像加速

创建 Docker 配置目录：

```bash
sudo mkdir -p /etc/docker
```

写入配置文件（阿里云个人加速地址已不可用，可用公共加速源替代）：

```bash
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://sw0uz59y.mirror.aliyuncs.com"
  ]
}
EOF
```

重新加载 systemd 配置并重启 docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 注意事项

- `daemon.json` 是严格 JSON：数组最后一项后不能有逗号，原文示例中的悬空逗号会导致 docker 启动失败。
- 修改 `daemon.json` 后必须 `daemon-reload` + `restart`，否则配置不生效。
- 验证加速是否生效：`docker info` 输出的 `Registry Mirrors` 字段应列出所配地址。
