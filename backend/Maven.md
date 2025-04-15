# 安装 Maven

### **1. 安装前提**
- 确保已安装 **JDK**（Maven 依赖 Java 环境）：
  ```bash
  java -version
  ```
  - 如果未安装，推荐通过 [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) 或 [Homebrew OpenJDK](https://formulae.brew.sh/formula/openjdk) 安装。

---

### **2. 下载 Maven**
1. **访问官网**：  
   下载最新稳定版（如 `apache-maven-3.9.9-bin.tar.gz`）：  
   [Apache Maven 下载页面](https://maven.apache.org/download.cgi)

2. **解压到指定目录**（推荐 `/usr/local`）：
   ```bash
   tar -xzvf ~/Downloads/apache-maven-3.9.9-bin.tar.gz -C /usr/local
   ```

---

### **3. 配置环境变量**
1. **编辑 Shell 配置文件**（根据你的 Shell 选择文件）：
   - Bash（默认）：`~/.bash_profile`  
   - Zsh：`~/.zshrc`  

   ```bash
   code ~/.zshrc  # 以 Zsh 为例
   ```

2. **添加以下内容**：
   ```bash
   export MAVEN_HOME=/usr/local/apache-maven-3.9.9
   export PATH=$MAVEN_HOME/bin:$PATH
   ```

3. **使配置生效**：
   ```bash
   source ~/.zshrc
   ```

---

### **4. 验证安装**
```bash
mvn -version
```
成功输出示例：
```
Apache Maven 3.9.5 (...)
Maven home: /usr/local/apache-maven-3.9.5
Java version: 17.0.8, vendor: Oracle Corporation
```

---

### **5. 配置 Maven 本地仓库（可选）**
1. **创建本地仓库目录**

   使用默认`~/.m2` 

2. **修改 Maven 配置**：  
   编辑 `$MAVEN_HOME/conf/settings.xml`：

   ```bash
   nano $MAVEN_HOME/conf/settings.xml
   ```
   找到 `<localRepository>` 标签并修改：
   ```xml
   <localRepository>/Users/ren/.m2/repository</localRepository>
   ```

   找到 `<mirror>` 标签并添加阿里镜像：

   ```xml
   <mirror>
     <id>aliyun</id>
     <mirrorOf>central</mirrorOf>
     <name>Aliyun Maven Mirror</name>
     <url>https://maven.aliyun.com/repository/central</url>
   </mirror>
   ```

   

---

### **6. 在 IDEA 中配置**
1. **打开 IDEA** → **Preferences** → **Build, Execution, Deployment** → **Build Tools** → **Maven**  
   - 同样的配置需要在 File 中重新配置
   - ![image-20250327013846532](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20250327013846532.png)
2. 修改以下选项：
   - **Maven home path**: `/usr/local/apache-maven-3.9.9`  
   - **User settings file**: `$MAVEN_HOME/conf/settings.xml`  
   - **Local repository**: `/Users/ren/.m2/repository`（与上一步一致）  
3. 打开Runner选项
4. 修改
   - VM Options：`-DarchetypeCatalog=internal`用于禁止下载远程maven模版

---

### **7. 测试 Maven 项目**
1. **生成一个简单项目**：
   ```bash
   mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
   ```

2. **编译并运行**：
   ```bash
   cd my-app
   mvn package
   java -cp target/my-app-1.0-SNAPSHOT.jar com.example.App
   ```
   输出 `Hello World!` 即表示成功。

---

# 卸载 Maven
### 1. 删除 Maven 目录：

```bash
sudo rm -rf /usr/local/apache-maven-3.9.5
```

### 2. 移除环境变量配置（编辑 `~/.zshrc` 或 `~/.bash_profile` 删除相关行）。

---

通过以上步骤，你可以在 Mac 上完成 Maven 的安装和基础配置。如果需要更高级的定制（如多版本切换），可以结合工具如 `jenv`（类似 `nvm`）管理。