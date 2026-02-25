# JDK 安装

安装 Jenny

```shell
brew install jenv
```

在 zsh 中配置 jenv：

```shell
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"
```

查看所有 jdk 版本

```shell
jenv versions
```

切换全局 jdk 版本

```shell
jenv global 17
```

安装 jdk

```shell
brew install openjdk@8
```

链接到 jdk 默认目录

![image-20240509214447921](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20240509214447921.png)

```shell
sudo ln -sfn /usr/local/opt/openjdk@8/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-8.jdk
```

```shell
sudo ln -sfn /usr/local/opt/openjdk@11/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-11.jdk
```

```shell
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

添加 jdk 到 jenv 中

```shell
jenv add /usr/local/opt/openjdk@8/libexec/openjdk.jdk/Contents/Home/
jenv add /usr/local/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home/
jenv add /usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home/
```
