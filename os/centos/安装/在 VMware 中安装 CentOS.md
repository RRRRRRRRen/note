# 在 VMware 中安装 CentOS

*类型：practice ｜ 难度：入门 ｜ 标签：CentOS、VMware、虚拟化、网络模式、磁盘分区*

**在虚拟机里装 CentOS 是一条固定流水线：BIOS 开虚拟化 → 装 VMware → 按架构选镜像 → 选网络模式 → 手动分区。最容易踩坑的两处：Apple Silicon 必须选 aarch64 镜像（选错无法启动）；网络模式决定虚拟机能否被局域网访问（NAT 要端口转发，桥接才有独立 IP）。**

## 开启虚拟化设置

要在 VMware、VirtualBox 或 KVM 中运行虚拟机，需先在 BIOS/UEFI 中开启硬件虚拟化（VT-x/AMD-V）。

### 确认 CPU 是否支持虚拟化

Windows 用户，在命令提示符运行：

```cmd
systeminfo | find "虚拟化"
```

- 显示「已启用」：虚拟化已开启。
- 显示「未启用」：需要进 BIOS 设置。

Linux 用户：

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```

- 输出 ≥1：CPU 支持虚拟化（`vmx` 是 Intel VT-x，`svm` 是 AMD-V）。
- 输出 0：BIOS 未开启虚拟化，或 CPU 不支持。

Mac 用户默认已开启虚拟化，且无法更改。

### 进入 BIOS/UEFI

1. 重启电脑，在开机自检（POST）时按特定按键进入 BIOS。
2. 常见品牌按键：

| 品牌 | 按键 |
| --- | --- |
| ASUS（华硕） | `F2` 或 `Del` |
| Dell（戴尔） | `F2` 或 `F12` |
| HP（惠普） | `F10` 或 `Esc` |
| Lenovo（联想） | `F2` 或 `Fn + F2` |
| MSI（微星） | `Del` |
| Acer（宏碁） | `F2` 或 `Del` |

3. 找到虚拟化选项并启用：
  - Intel CPU：`Intel Virtualization Technology (VT-x)` 或 `Intel VT-d`。
  - AMD CPU：`SVM Mode` 或 `AMD-V`。
4. 按 `F10`（Save & Exit）保存退出，电脑自动重启。

## 安装 VMware Fusion

1. 官网下载：[vmware.com/products/fusion](https://www.vmware.com/products/fusion.html)
  - Apple Silicon（M1/M2/M3）：选 Fusion 13+（原生支持 ARM）。
  - Intel Mac：选 Fusion 12+。
2. 双击 `.dmg`，把 VMware Fusion 拖入 Applications。
3. 首次运行按提示在「安全性与隐私」中允许系统扩展，输入管理员密码完成安装。

## 下载 CentOS 镜像

- 推荐在[阿里巴巴开源镜像站](https://developer.aliyun.com/mirror/)下载。
- 架构必须与虚拟机匹配：
  - Intel Mac → `x86_64` 镜像。
  - Apple Silicon → 必须选 `aarch64` 镜像。

## VMware 网络配置

网络模式决定虚拟机如何与主机、局域网、外网通信，安装前先想清楚需求。

### 主要网络模式对比

| 模式 | 虚拟机 IP | 能否访问外网 | 能否被局域网访问 | 适用场景 |
| --- | --- | --- | --- | --- |
| 桥接 | 与主机同网段的独立 IP | 是 | 是 | 虚拟机作为独立设备（如服务器） |
| NAT | 主机分配的私有 IP | 是 | 需端口转发 | 默认模式，安全上网 |
| 仅主机 | 主机分配的私有 IP | 否 | 否（仅主机可见） | 隔离测试、内部开发环境 |
| 自定义 LAN Segment | 用户自定义 | 取决于配置 | 取决于配置 | 复杂多虚拟机隔离网络 |

### 桥接模式

- 原理：虚拟机通过主机物理网卡直接接入局域网，如同一台真实设备。
- IP：由局域网 DHCP 分配（或手动设置），与主机同网段。
- 优点：可被局域网其他设备访问；直接使用物理网络带宽。
- 缺点：占用局域网 IP；需配置防火墙允许外部访问。
- 配置：虚拟机设置 → 网络适配器 → 桥接模式并指定物理网卡 → 虚拟机内配 IP。

### NAT 模式（默认）

- 原理：虚拟机通过主机 NAT 服务共享主机 IP 上网，主机充当路由器。
- IP：由 VMware 虚拟 DHCP 分配。
- 优点：可访问外网且外部无法直接访问（安全）；不占局域网 IP。
- 缺点：外部访问虚拟机需配置端口转发（虚拟网络编辑器 → NAT 设备 → 端口转发）。

### 仅主机模式

- 原理：虚拟机与主机通过私有虚拟网络通信，与外网完全隔离。
- 优点：绝对安全，适合敏感服务测试；主机与虚拟机可互访。
- 缺点：虚拟机无法访问互联网。

### 高级功能

- 端口转发（NAT）：将主机端口映射到虚拟机端口，如主机 `8080` → 虚拟机 `80`。
- 静态 IP：Linux 可用 `nmtui` 图形化设置，或编辑 `/etc/sysconfig/network-scripts/ifcfg-ens33`（CentOS 7）。
- 多网卡混合：网卡 1 走 NAT 上网，网卡 2 走仅主机与主机通信。

### 常见问题

- 虚拟机无法上网：确认模式为 NAT 或桥接，再排查连通性：

```bash
ping 8.8.8.8                      # 测试外网连通性
ip a                              # 检查 IP 是否分配
systemctl restart NetworkManager  # 重启网络服务
```

- 局域网访问虚拟机：用桥接模式并保证同网段，或 NAT 加端口转发。
- 主机与虚拟机共享文件：装 VMware Tools 启用文件夹共享，或走 SSH/SFTP。

## CentOS 分区设置

合理的磁盘分区对性能、数据安全和后期维护至关重要。

### 推荐分区方案（基础）

| 挂载点 | 推荐大小 | 文件系统 | 作用 |
| --- | --- | --- | --- |
| `/` | 20 GB ~ 50 GB | XFS/ext4 | 根目录，系统核心文件 |
| `/boot` | 1 GB | ext4 | 启动引导文件（必选） |
| `/home` | 剩余空间的 30%~50% | XFS/ext4 | 用户数据存储 |
| `swap` | 内存的 1~2 倍 | swap | 虚拟内存（内存 ≤ 8 GB 时需配置） |

swap 建议：内存 ≤ 4 GB 取 2 倍；4~8 GB 取 1 倍；≥ 8 GB 可省略或保留 4 GB 应急。

### 服务器/生产环境追加

| 挂载点 | 推荐大小 | 作用 |
| --- | --- | --- |
| `/var` | 10 GB ~ 50 GB | 日志、缓存（频繁写入） |
| `/opt` | 10 GB ~ 20 GB | 第三方软件安装目录 |
| `/tmp` | 5 GB ~ 10 GB | 临时文件（可定期清理） |

### 手动分区步骤

1. 启动安装镜像，选「Install CentOS」→「安装位置」选择磁盘。
2. 选「我要配置分区」→ 完成。
3. 新磁盘选「标准分区」或 LVM（推荐，便于动态扩容）。分区表选择：磁盘 > 2 TB 必须 GPT；旧系统兼容可选 MBR。
4. 点「+」逐个添加分区（`/boot` 1 GB ext4、`/` 20 GB XFS、`/home` 与 `swap` 按需）。
5. 检查布局 → 完成 → 接受更改。

### 关键注意事项

- `/boot` 必须独立分区且不可加密，否则引导加载器（GRUB）无法访问导致启动失败。
- `/` 根分区必须存在。
- 文件系统选择：XFS 是 CentOS 7+ 默认，适合大文件与高性能场景；ext4 兼容性好，适合小文件频繁读写。
- 生产环境推荐 LVM（支持动态扩容）；加密分区会牺牲部分性能，且 `/boot` 不参与加密。
- 不分配 swap 时，物理内存耗尽系统可能崩溃，建议至少保留少量。

### 后期调整分区

```bash
# 查看卷组空间
vgdisplay

# 扩展逻辑卷（如 /home）
lvextend -L +10G /dev/mapper/centos-home
xfs_growfs /home                      # XFS 文件系统用此命令刷新
resize2fs /dev/mapper/centos-home     # ext4 用此命令
```

新增磁盘：

```bash
# 1. fdisk 或 parted 分区后，格式化
mkfs.xfs /dev/sdb1
# 2. 挂载
mount /dev/sdb1 /mnt/data
```

查看现有分区：

```bash
lsblk            # 查看磁盘和分区
df -Th           # 查看挂载点和文件系统
```
