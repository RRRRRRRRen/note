# JDK 安装与环境配置
*类型：practice ｜ 难度：入门 ｜ 标签：JDK、jenv、Homebrew、macOS、环境配置 ｜ 更新：2026-09-22*

**macOS 上推荐 Homebrew 装 openjdk、jenv 管多版本：brew 负责安装，软链接把 JDK 挂到系统标准目录，jenv 负责注册与切换（global / local / shell），最后用 `java -version` 验证。**

## 安装 JDK（Homebrew）

Homebrew 支持并行安装多个大版本，互不覆盖：

```bash
brew install openjdk@8
brew install openjdk@11
brew install openjdk@17
```

macOS 的 JVM 检索标准目录是 `/Library/Java/JavaVirtualMachines`，brew 装的 openjdk 默认不在这里，需要手动建立软链接（每个版本一条）：

```bash
sudo ln -sfn /usr/local/opt/openjdk@8/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-8.jdk
sudo ln -sfn /usr/local/opt/openjdk@11/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-11.jdk
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

## 多版本管理（jenv）

安装 jenv：

```bash
brew install jenv
```

在 `~/.zshrc` 中配置：

```bash
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"
```

把各版本 JDK 注册进 jenv（指向 `Contents/Home`）：

```bash
jenv add /usr/local/opt/openjdk@8/libexec/openjdk.jdk/Contents/Home/
jenv add /usr/local/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home/
jenv add /usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home/
```

常用命令：

```bash
jenv versions    # 查看所有已注册的 JDK 版本
jenv global 17   # 设置全局默认版本
jenv local 8     # 当前目录（项目）固定版本，生成 .java-version 文件
jenv shell 11    # 仅当前终端会话生效
```

## JAVA_HOME 与验证

jenv 默认只切换 `java` 命令，不导出 `JAVA_HOME`；开启 export 插件后，`jenv global/local` 切换会同步导出 `JAVA_HOME`：

```bash
jenv enable-plugin export
exec $SHELL -l   # 重启 shell 生效
```

验证安装结果：

```bash
java -version
echo $JAVA_HOME
```

- `java -version` 输出预期版本、`JAVA_HOME` 指向当前注册的 JDK 目录，即配置成功
