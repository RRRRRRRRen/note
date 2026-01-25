## 01 java 约定与习惯问题

问题1：为什么项目中经常使用LocalDateTime对象来保存时间

问题2：javadoc中有哪些常用的功能

问题3：为什么习惯上使用接口组织常量

问题：什么情况下需要使用到无界通配符泛型

问题：受检异常和非受检异常的区别和在项目中如何使用

问题：什么是sqel表达式，一般在哪些地方使用

问题：java排序功能Comparator.comparing如何使用

问题：Collections.singleton是什么，Collections还有哪些常用的api

问题：interface中的default的作用是什么

## 02 项目常见问题和设计

问题1：pojo是什么，什么样的数据适合定义为pojo

问题：java web项目中，什么样的数据需要实现Serializable

问题：swagger和knife4j的关系

问题：application.yaml、application-dev.yaml、application-local.yaml的作用

问题：spring项目的类路径的含义和作用

问题：使用PARENT_ID_ROOT表示树形结构中的根节点

## maven相关问题

问题：maven提供的bom功能的作用和用法，是如何生效的

问题：pom文件是什么

问题：pom文件常用的标签和用途

问题：pom文件有哪些内置properties，以及其解析顺序

问题：pom文件的dependencyManagement依赖管理细节

问题：如何在bom文件中引入bom，例如spring-boot-dependencies

问题：pom文件的Properties继承性

问题：pom模块依赖的传递性

## spring相关问题

问题：@SpringBootApplication注解的作用及scanBasePackages属性的作用

问题：Spring Security的@PreAuthorize注解是如何使用和配置的，原理是什么

问题：@RestController注解是什么

问题：@RequestMapping注解的作用及其衍生类有哪些

问题：如何为同一个controller配置多个请求路径

问题：@Resource注解注入的识别顺序是什么，举例说明

问题：@RequestBody注解的工作原理是什么

问题：注解的书写顺序对程序的运行有影响吗，例如@Valid @RequestBody的组合

问题：表示参数类型的注解有哪些，例如@RequestParam

问题：如何自定义注解

## 权限相关问题

问题：@PreAuthorize注解的运行机制是什么

## 参数校验相关

问题：@Validated和@Valid的作用和区别

问题：@Validated放在serviceImpl上和controller上有什么区别，让参数校验生效的关键步骤有哪些

问题：常见的参数校验注解有哪些，分别表示什么

问题：@InEnum注解的使用方法

## Mybatis相关问题

问题：@TableName注解的作用

问题：@TableId注解的作用

问题：@TableField注解可以做哪些事情，如何使用

问题：@TableLogic注解的作用，如何运作的

问题：@KeySequence注解的作用

问题：如何理解mybatis的回填功能

问题：简述mapper中增删改查的工作流程

问题：updateById的工作流程是怎样的，如何区分处理是否需要更新字段值为null的情况

问题：@Mapper注解的作用是什么，提供了哪些常用的方法

问题：为什么会在mapper中使用default来自定义sql，有什么优缺点

问题：com.github.yulichang.base.MPJBaseMapper提供了哪些功能，为什么要使用这个类

问题：LambdaQueryWrapper和QueryWrapper如何使用

## Lombok相关问题

问题：@Data注解的作用

问题：@EqualsAndHashCode的使用目的及其作用

问题：@AllArgsConstructor如何使用

问题：介绍@ToString注解

## Swagger及文档注释相关问题

问题：@Tag注解的作用

问题：@Operation注解的作用

问题：@Parameter注解的使用，以及为什么需要额外使用@Parameter注解

问题：@Schema注解如何使用，如何表示字段必填

问题：为什么要使用@Nullable来标注参数可以为null

## 工具类相关

问题：为什么要使用ObjUtil.equal来比较

问题：BeanUtil.toBean是做什么的，并介绍其原理

问题：hutool Assert 如何使用

问题：hutool CollUtil常用的api有哪些

## 序列化相关问题

问题：@JsonIgnore注解的作用和生效范围

问题：@JsonIgnoreProperties注解的作用，为什么出现了@JsonIgnoreProperties(value = "transMap") 

问题：反序列化中为什么需要空构造方法

问题：Easy-Trans如何使用，如何与mybatis plus集成

## 单元测试相关问题

问题：@VisibleForTesting是如何让私有方法变得可测试的