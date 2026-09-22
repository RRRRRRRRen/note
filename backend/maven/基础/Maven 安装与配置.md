# Maven 安装与配置

*类型：practice ｜ 难度：入门 ｜ 标签：Maven、macOS、环境变量、IDEA ｜ 更新：2026-09-22*

**Mac 上装 Maven 的完整链路：确认 JDK → 官网下载解压到 `/usr/local` → 配置 `MAVEN_HOME` 与 `PATH` → `mvn -version` 验证；之后按需改 `settings.xml`（本地仓库路径 + 阿里镜像加速），并在 IDEA 里对齐同一套配置；卸载即删目录、清环境变量。**

## 安装前提

- 确保已安装 **JDK**（Maven 依赖 Java 环境）：

```bash
java -version
```

- 如果未安装，推荐通过 [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) 或 [Homebrew OpenJDK](https://formulae.brew.sh/formula/openjdk) 安装

## 下载与解压

1. 访问 [Apache Maven 下载页面](https://maven.apache.org/download.cgi)，下载最新稳定版（如 `apache-maven-3.9.9-bin.tar.gz`）
2. 解压到指定目录（推荐 `/usr/local`）：

```bash
tar -xzvf ~/Downloads/apache-maven-3.9.9-bin.tar.gz -C /usr/local
```

## 配置环境变量

1. 编辑 Shell 配置文件（Bash 用 `~/.bash_profile`，Zsh 用 `~/.zshrc`）：

```bash
code ~/.zshrc    # 以 Zsh 为例
```

1. 添加以下内容：

```bash
export MAVEN_HOME=/usr/local/apache-maven-3.9.9
export PATH=$MAVEN_HOME/bin:$PATH
```

1. 使配置生效：

```bash
source ~/.zshrc
```

## 验证安装

```bash
mvn -version
```

成功输出示例：

```text
Apache Maven 3.9.5 (...)
Maven home: /usr/local/apache-maven-3.9.5
Java version: 17.0.8, vendor: Oracle Corporation
```

## 配置本地仓库与镜像（可选）

1. 本地仓库默认就在 `~/.m2`，无需特意创建
2. 编辑 `$MAVEN_HOME/conf/settings.xml`：

```bash
nano $MAVEN_HOME/conf/settings.xml
```

1. 找到 `<localRepository>` 标签并修改：

```xml
<localRepository>/Users/ren/.m2/repository</localRepository>
```

1. 找到 `<mirror>` 标签添加阿里镜像，依赖下载走国内源明显提速：

```xml
<mirror>
  <id>aliyun</id>
  <mirrorOf>central</mirrorOf>
  <name>Aliyun Maven Mirror</name>
  <url>https://maven.aliyun.com/repository/central</url>
</mirror>
```

## 在 IDEA 中配置

1. 打开 IDEA → Preferences → Build, Execution, Deployment → Build Tools → Maven（同样的配置需要在 File 中重新配置一遍）
2. 修改以下选项，与命令行保持一致：

- Maven home path：`/usr/local/apache-maven-3.9.9`
- User settings file：`$MAVEN_HOME/conf/settings.xml`
- Local repository：`/Users/ren/.m2/repository`

1. 打开 Runner 选项
2. VM Options 填入 `-DarchetypeCatalog=internal`，禁止联网下载远程 archetype 模板，新建项目更快

## 测试 Maven 项目

1. 生成一个简单项目：

```bash
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

1. 编译并运行：

```bash
cd my-app
mvn package
java -cp target/my-app-1.0-SNAPSHOT.jar com.example.App
```

- 输出 `Hello World!` 即表示安装配置全部成功

## 卸载

1. 删除 Maven 目录：

```bash
sudo rm -rf /usr/local/apache-maven-3.9.5
```

1. 移除环境变量：编辑 `~/.zshrc` 或 `~/.bash_profile`，删除 MAVEN_HOME 与 PATH 相关行
