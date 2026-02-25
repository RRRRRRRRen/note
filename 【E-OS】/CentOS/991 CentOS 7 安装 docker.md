# 重新配置 yum

**步骤一：** 备份 yum 仓库地址配置文件

```bash
cp -v /etc/yum.repos.d/CentOS-Base.repo{,-backup}
```

**步骤二：** 修改配置文件

`/etc/yum.repos.d/CentOS-Base.repo`

```repo
[base]  
name=CentOS-$releasever - Base  
baseurl=https://vault.centos.org/7.9.2009/os/$basearch  
gpgcheck=1  
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7  
  
#released updates   
[updates]  
name=CentOS-$releasever - Updates  
baseurl=https://vault.centos.org/7.9.2009/updates/$basearch  
gpgcheck=1  
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7  
  
#additional packages that may be useful  
[extras]  
name=CentOS-$releasever - Extras  
baseurl=https://vault.centos.org/7.9.2009/extras/$basearch  
gpgcheck=1  
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7  
  
#additional packages that extend functionality of existing packages  
[centosplus]  
name=CentOS-$releasever - Plus  
baseurl=https://vault.centos.org/7.9.2009/centosplus/$basearch  
gpgcheck=1  
enabled=0  
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
```

**步骤三：** 清空缓存重新加载 yum

```shell
yum clean all && yum makecache
```

# 安装 Docker

**步骤一：** 卸载旧版 docker

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

**步骤二：** 设置 docker yum 源

```bash
sudo yum install -y yum-utils
sudo yum-config-manager \
--add-repo \
http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

**步骤三：** 安装 docker

```bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

**步骤四：** 启动 docker

```bash
sudo systemctl start docker
```

**步骤五：** 设置开机自启动

```bash
sudo systemctl enable docker
```

**步骤六：** 查看版本

```bash
docker -v
docker info
```

# 配置镜像加速

创建 Docker 的配置文件目录

```bash
sudo mkdir -p /etc/docker
```

写入配置文件 (阿里云已不可用)

```bash
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run"
    "https://sw0uz59y.mirror.aliyuncs.com",
  ]
}
EOF
```

重新加载配置文件

```bash
sudo systemctl daemon-reload
```

重启 docker

```bash
sudo systemctl restart docker
```
