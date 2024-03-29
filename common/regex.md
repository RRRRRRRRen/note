# 第一章 字符串匹配

> 正则表达式是匹配模式，要么匹配字符，要么匹配位置。这一章主要介绍匹配字符串。

## 1. 两种模糊匹配

> 正则表达式之所以强大，是因为其能实现模糊匹配。
> 而模糊匹配，有两个方向上的“模糊”：横向模糊和纵向模糊。

### 1.1 横向模糊匹配

> 横向模糊指的是，一个正则可匹配的字符串的长度不是固定的，可以是多种情况的。

例如使用量词实现横向模糊匹配。

```js
var regex = /ab{2,5}c/g;
var string = "abc abbc abbbc abbbbc abbbbbc abbbbbbc";
string.match(regex) // => ["abbc", "abbbc", "abbbbc", "abbbbbc"]
```

该正则表示的匹配规则为：第一个字符是“a”，接下来是2到5个字符“b”，最后是字符“c”。

### 1.2 纵向模糊匹配

> 纵向模糊指的是，一个正则匹配的字符串，具体到某一位字符时，它可以不是某个确定的字符，可以有多种可能。

例如使用字符组实现纵向匹配。

```js
var regex = /a[123]b/g;
var string = "a0b a1b a2b a3b a4b";
string.match(regex)  // => ["a1b", "a2b", "a3b"]
```

该正则表示的匹配规则为：可以匹配如下三种字符串："a1b"、"a2b"、"a3b"。

## 2. 字符组

> 需要强调的是，虽叫字符组（字符类），但只是其中一个字符。例如`[abc]`，表示匹配一个字符，它可以是“a”、“b”、“c”之一。

### 2.1 范围表示法

如果匹配字字符可能性特别多，可以使用范围表示法。

比如`[123456abcdefGHIJKLM]`，可以写成`[1-6a-fG-M]`。用连字符`-`来省略和简写。

当需要匹配连字符`-`时，可以写成如下的方式：`[-az]`或`[az-]`或`[a\-z]`。即要么放在开头，要么放在结尾，要么转义。总之不会让引擎认为是范围表示法就行了。

### 2.2 排除字符组

如果匹配的字符可以是任意字符，但是不能为某些字符时，可以使用排除的字符组写法。

例如`[^abc]`，表示是一个除"a"、"b"、"c"之外的任意一个字符。字符组的第一位放`^`（脱字符），表示求反的概念。

### 2.3 简写形式

| 字符  | 含义                           | 等价             | 说明                                                         |
| ----- | ------------------------------ | ---------------- | ------------------------------------------------------------ |
| `.`   | 通配符，联想省略号`...`中的`.` | `[^\n\r]`        | 匹配换行符之外的所有字符                                     |
| `\w`  | word                           | `[A-Za-z0-9_]`   | 匹配字母、数字、下划线                                       |
| `\W`  |                                | `[^A-Za-z0-9_]`  | 匹配非字母、数字、下划线                                     |
| `\d`  | digit                          | `[0-9]`          | 匹配所有数字                                                 |
| `\D`  |                                | `[^0-9]`         | 匹配所有非数字                                               |
| `\s`  | space character                | `[ \t\v\n\r\f]`  | 表示空白符，包括空格、水平制表符、垂直制表符、换行符、回车符、换页符。 |
| `\S`  |                                | `[^ \t\v\n\r\f]` |                                                              |
| `[^]` | 匹配任意字符                   |                  | 可以使用`[\d\D]`、`[\w\W]`、`[\s\S]`和`[^]`中任何的一个      |

| 字符 | 含义                   | 说明       |
| ---- | ---------------------- | ---------- |
| `\f` | form feed character    | 换页符     |
| `\n` | new line character     | 换行符     |
| `\r` | return character       | 回车符     |
| `\t` | tab character          | 制表符     |
| `\v` | vertical tab character | 垂直制表符 |

## 3. 量词

> 量词也称重复。掌握`{m,n}`的准确含义后，只需要记住一些简写形式。

### 3.1 简写形式

| 字符    | 记忆方式         | 等价    | 说明            |
| ------- | ---------------- | ------- | --------------- |
| `*`     | 通配符：任意次数 | `{0,}`  | 出现0次或者多次 |
| `+`     | 表示追加         | `{1,}`  | 出现1次或者多次 |
| `?`     | 询问有还是没有   | `{1,0}` | 出现0次或者1次  |
| `{n}`   |                  |         | 出现n次         |
| `{n,}`  |                  |         | 至少出现n次     |
| `{n,m}` |                  |         | 出现n到m次      |

### 3.2 贪婪匹配

> 贪婪匹配是量词匹配的默认模式

如下贪婪匹配案例：

```js
var regex = /\d{2,5}/g;
var string = "123 1234 12345 123456";
string.match(regex) // => ["123", "1234", "12345", "12345"]
```

贪婪匹配会在符合条件的字符中尽可能多的匹配字符串，例如`123456`中，`12` `123` `1234` `12345`都满足上述正则，直到`123456`才不满足条件，所以当匹配尽可能多的字符时，会匹配到`12345`

### 3.3 惰性模式

> 与贪婪模式相对的为惰性模式，会尽可能少的匹配符合条件的字符。

```js
var regex = /\d{2,5}?/g;
var string = "123 1234 12345 123456";
string.match(regex) // => ["12", "12", "34", "12", "34", "12", "34", "56"]
```

在量词表示法后加`?`表示惰性匹配。

上述正则在遇到`12345`时，使用惰性匹配，会识别`12`满足条件，则不会查询更多字符。在全局模式`g`下，会继续查询其他满足规则的字符，在遇到`34`时又匹配成功，匹配`5`时失败。

## 4 分支多选

> 支持在多个子模式中任选其一。
> 具体形式为：`(p1|p2|p3)`，其中`p1`、`p2`和`p3`是子模式，用`|`（管道符）分隔，表示其中任何之一。

例如要匹配"good"和"nice"。

```js
var regex = /good|nice/g;
var string = "good idea, nice try.";
string.match(regex) // => ["good", "nice"]
```

匹配"good"和"goodbey"。

```js
var regex = /good|goodbey/g;
var string = "goodbye";
string.match(regex) // => ["good"]

var regex = /goodbey|good/g;
var string = "goodbye";
string.match(regex) // => ["goodbye"]
```

上述案例表示，分支多选时按照声明顺序进行匹配，当匹配成功时，则结束匹配不忘后查询。



# 第二章 位置匹配

> 正则表达式是匹配模式，要么匹配字符，要么匹配位置。这一章主要介绍匹配位置。

## 1. 什么是位置

位置是相邻字符之间的位置。

## 2. 如何匹配位置

>  位置匹配的锚字符

| 字符     | 含义         | 说明                                                         |
| -------- | ------------ | ------------------------------------------------------------ |
| `^`      | 脱字符       | 匹配行的开头                                                 |
| `$`      | 美元符       | 匹配行的结尾                                                 |
| `\b`     | 单词的边界   | ① \w和\W之间的位置<br />② ^与\w之间的位置<br />③ \w与$之间的位置 |
| `\B`     | 非单词的边界 | ① \w与\w之间的位置<br />② \W与\W之间的位置<br />③^与\W之间的位置<br />④\W与$之间的位置 |
| `(?=p)`  |              | p子模式前面的位置                                            |
| `(?!p)`  |              | 非p子模式前面的位置                                          |
| `(?<=p)` |              | p子模式后面的位置                                            |
| `(?<!p)` |              | 非p子模式后面的位置                                          |

### 2.1 `^`和`$`

`^`：脱字符，匹配开头，在多行匹配中匹配行开头。

`$`：美元符，匹配结尾，在多行匹配中匹配行结尾。

下面的案例将行的开头用‘#’代替：

```js
var result = "hello".replace(/^|$/g, '#');
result // => "#hello#"
```

在多行匹配`m`模式下的行为：

```js
var result = "I\nlove\njavascript".replace(/^|$/gm, '#');
console.log(result);
/*
#I#
#love#
#javascript#
*/
```

### 2.2 `\b`和`\B`

`\b`：单词边界，具体就是`\w`和`\W`之间的位置，也包括`\w`和`^`之间的位置，也包括`\w`和`$`之间的位置。

比如一个文件名的`\b`，如下：

```js
var result = "[JS] Lesson_01.mp4".replace(/\b/g, '#');
result // => "[#JS#] #Lesson_01#.#mp4#"
```

`\B`：非单词边界。具体说来就是`\w`与`\w`、`\W`与`\W`、`^`与`\W`，`\W`与`$`之间的位置。

比如一个文件名的`\D`，如下：

```js
var result = "[JS] Lesson_01.mp4".replace(/\B/g, '#');
result // => "#[J#S]# L#e#s#s#o#n#_#0#1.m#p#4"
```

### 2.3 `(?=p)`和`(?!p)`

`(?=p)`：其中`p`是一个子模式，即`p`前面的位置。

**案例**：寻找`l`前面的位置。

```js
var result = "hello".replace(/(?=l)/g, '#');
console.log(result); 
// => "he#l#lo"
```

`(?!p)`：其中`p`是一个子模式，即不符合`p`子模式前面的位置。

**案例**：寻找非`l`前面的位置。

```js
var result = "hello".replace(/(?!l)/g, '#');
console.log(result); 
// => "#h#ell#o#"
```

### 2.4 `(?<=p)`和`(?<!p)`

`(?<=p)`：其中`p`是一个子模式，即`p`后面的位置。

**案例**：寻找`l`后面的位置。

```js
var result = "hello".replace(/(?<=l)/g, '#');
console.log(result); 
// => "hel#l#o"
```

`(?<!p)`：其中`p`是一个子模式，即不符合`p`子模式后面的位置。

**案例**：寻找非`l后面的位置。

```js
var result = "hello".replace(/(?<!l)/g, '#');
console.log(result); 
// => "h#e#llo#"
```



# 第三章 括号的作用

> 括号提供了分组，便于我们引用它。
> 引用某个分组，会有两种情形：在JavaScript里引用它，在正则表达式里引用它。

## 1. 分组和分支结构

> 这二者是括号最直觉的作用，也是最原始的功能。

### 1.1 分组

括号是提供分组功能，使量词`+`作用于分组的整体。

**案例**：寻找ab这个整体

```js
var regex = /(ab)+/g;
var string = "ababa abbb ababab";
console.log( string.match(regex) ); 
// => ["abab", "ab", "ababab"]
```

### 1.2 分支结构

提供了子表达式的所有可能。

**案例**：寻找多种字符串

```js
var regex = /^I love (JavaScript|Regular Expression)$/;
console.log( regex.test("I love JavaScript") );
console.log( regex.test("I love Regular Expression") );
// => true
// => true
```

## 2. 引用分组

> 这是括号一个重要的作用，有了它，我们就可以进行数据提取，以及更强大的替换操作。
>
> 而要使用它带来的好处，必须配合使用实现环境的API。

### 2.1 提取数据

**案例**：提取年月日

**(1) 使用string的match方法获取**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";
console.log( string.match(regex) ); 
// => ["2017-06-12", "2017", "06", "12", index: 0, input: "2017-06-12"]
```

`match`返回的一个数组，第一个元素是整体匹配结果，然后是各个分组（括号里）匹配的内容，然后是匹配下标，最后是输入的文本。

注意：如果正则是否有修饰符`g`，`match`返回的数组格式是不一样的.

**(2) 使用regex的exec方法获取**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";
console.log( regex.exec(string) ); 
// => ["2017-06-12", "2017", "06", "12", index: 0, input: "2017-06-12"]
```

另外也可以使用正则对象的`exec`方法。返回数据同`match`。

**(3) 使用正则构造函数属性值获取**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";

regex.test(string); // 正则操作即可，例如
//regex.exec(string);
//string.match(regex);

console.log(RegExp.$1); // "2017"
console.log(RegExp.$2); // "06"
console.log(RegExp.$3); // "12"
```

也可以使用构造函数的全局属性`$1`至`$9`来获取。

### 2.2 替换数据

**案例**：日期格式化

**(1) 使用模版字符串**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";
var result = string.replace(regex, "$2/$3/$1");
console.log(result); 
// => "06/12/2017"
```

**(2) 使用构造函数变量**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";
var result = string.replace(regex, function() {
	return RegExp.$2 + "/" + RegExp.$3 + "/" + RegExp.$1;
});
console.log(result); 
// => "06/12/2017"
```

**(3) 使用函数参数**

```js
var regex = /(\d{4})-(\d{2})-(\d{2})/;
var string = "2017-06-12";
var result = string.replace(regex, function(match, year, month, day) {
	return month + "/" + day + "/" + year;
});
console.log(result); 
// => "06/12/2017"
```

## 3. 反向引用

> 除了使用相应API来引用分组，也可以在正则本身里引用分组。但只能引用之前出现的分组，即反向引用。

### 3.1 反向引用的表示

**案例**：匹配相同分隔符的日期

```js
var regex = /\d{4}(-|\/|\.)\d{2}\1\d{2}/;
var string1 = "2017-06-12";
var string2 = "2017/06/12";
var string3 = "2017.06.12";
var string4 = "2016-06/12";
console.log( regex.test(string1) ); // true
console.log( regex.test(string2) ); // true
console.log( regex.test(string3) ); // true
console.log( regex.test(string4) ); // false
```

`\1`：表示上一个分组具体匹配的内容，而不是上一个分组的简写方式。

### 3.2 嵌套括号

以左括号（开括号）为准，依次计数。

```js
var regex = /^((\d)(\d(\d)))\1\2\3\4$/;
var string = "1231231233";
console.log( regex.test(string) ); // true
console.log( RegExp.$1 ); // 123
console.log( RegExp.$2 ); // 1
console.log( RegExp.$3 ); // 23
console.log( RegExp.$4 ); // 3
```

### 3.3 引用不存在的分组

当引用的分组不存在时，直接识别为对应的字符。

例如`\1`识别为1的转义`\u0001`。

## 4. 非捕获分组

> 之前文中出现的分组，都会捕获它们匹配到的数据，以便后续引用，因此也称他们是捕获型分组。
>
> 如果只想要括号最原始的功能，但不会引用它，即，既不在API里引用，也不在正则里反向引用。

使用非捕获分组`(?:p)`，例如本文第一个例子可以修改为：

```js
var regex = /(?:ab)+/g;
var string = "ababa abbb ababab";
console.log( string.match(regex) ); 
// => ["abab", "ab", "ababab"]
```


# 第四章 修饰符

| 修饰符 | 含义        | 说明                              |
| ------ | ----------- | --------------------------------- |
| `i`    | ignore      | 不区分大小写                      |
| `g`    | global      | 全局匹配                          |
| `m`    | mutil line  | 多行模式，使`^` `$`在每一行都生效 |
| `s`    | single line | 单行模式，使.包含换行符           |



# 案例分析

## 1. 字符串匹配案例

### 1.1 匹配html标签id

```js
let string = '<div id="container" class="main"></div>'
let regex = /id=".*?"/
// id="				a：匹配id="
// .*					b：匹配换行符之外的任意字符任意个数
// .*?				c：惰性匹配b
// id=".*?" 	d：匹配开头为a，中间为c，结尾为"的情况

string.match(regex)[0] // id="container"
```

```js
let string = '<div id="container" class="main"></div>'
let regex = /id="[^"]*"/ 
// id="				a：匹配id="
// [^"]				b：匹配非"的任意字符
// [^"]*			c：匹配任意个数的b
// id="[^"]*"	d：匹配开头为a，中间为c，结尾为"的情况

string.match(regex)[0] // id="container"
```

### 1.2 匹配16进制的颜色

```js
let string = "#ffbbad #Fc01DF #FFF #ffE"
let regex = /#([a-fA-F\d]{6}|[a-fA-F\d]{3})/g
// #																	a：匹配#
// [a-fA-F\d]{6}											b：匹配6个指定字符
// [a-fA-F\d]{3}  										c：匹配3个指定字符
// ([a-fA-F\d]{6}|[a-fA-F\d]{3})			d：匹配b或者c的情况
// /#([a-fA-F\d]{6}|[a-fA-F\d]{3})/g	e：全局匹配

string.match(regex) // ['#ffbbad', '#Fc01DF', '#FFF', '#ffE']
```

### 1.3 匹配24小时制

```js
let regex = /^(0?\d|1\d|2[0-3]):(0?|[1-5])\d/
// 0?\d 															a：匹配1位或0位数字0后面还有1位数字
// 1\d																b：匹配1后还有任意1位数字
// 2[0-3]															c：匹配2后面还有一位0-3的数字
// (0?\d|1\d|2[0-3])									d：匹配a或b或c的情况
// :																	e：中间有一个冒号
// 0?																	f：匹配1位或0位数字0
// [1-5]															g：匹配1-5
// (0?|[1-5])\d												h：匹配f或g，并且后面还有1位数字
// ^(0?\d|1\d|2[0-3]):(0?|[1-5])\d		i：以d开头，中间为e，后面为h的情况

regex.test("23:59") // true
regex.test("02:07") // true
regex.test("7:09") // true
```

### 1.4 匹配日期

```js
var regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
// \d{4}-											a: 四个数字后面有个连字符
// (0[1-9]|1[0-2])-						b: 表示01到12的月份表示法，后面有个连字符
// (0[1-9]|[12][0-9]|3[01]) 	c: 表示01到31的日期表示法
// ^ $ 												d: 限制开头和结尾的位置

regex.test("2017-06-10") // true
```

### 1.5 window操作系统文件路径

```js
var regex = /^[a-zA-Z]:\\([^\\:*<>|"?\r\n/]+\\)*([^\\:*<>|"?\r\n/]+)?$/;
// ^[a-zA-Z]:								a:大小写字符开头，后面有个冒号
// \\ 											b: 表示一个反斜杠
// \\:*<>|"?\r\n/ 					c: 列举特殊字符
// ([^\\:*<>|"?\r\n/]+\\)* 	d: 匹配目录名出现任意次
// ([^\\:*<>|"?\r\n/]+)? 		e: 匹配文件名出现最多一次
// ^ $ 											f: 限制开头和结尾的位置

regex.test("F:\\study\\javascript\\regex\\regular expression.pdf")
regex.test("F:\\study\\javascript\\regex\\")
regex.test("F:\\study\\javascript")
regex.test("F:\\")
```

## 2. 位置匹配案例

### 2.1 数字千分位分割

```js
let price = '123456789'
let priceReg = /(?=(\d{3})+$)/g
// \d{3}								a：匹配三位数字
// (\d{3})+							b：匹配a出现1或多次
// (\d{3})+$						c：匹配b作为结尾
// (?=(\d{3})+$) 				d：匹配c前面的位置
// (?!^)(?=(\d{3})+$) 	e：匹配d前面不为开头的位置

price.replace(priceReg, ',') // 123,456,789
```

### 2.2 多个数字千分位分割

```js
var string = "12345678 123456789"
var reg = /\B(?=(\d{3})+\b)/g
// (\d{3})+\b					a：连续的三个数字后面是单词的边界
// (?=(\d{3})+\b)			b：a前面的位置
// \B(?=(\d{3})+\b)		c：b前面不能位单词的边界

string.replace(reg, ',') // => "12,345,678 123,456,789"
```

### 2.3 密码验证字符种类

```js
// 同时包含具体两种字符，数字和小写字母
var string = 'aa112233aa'
var reg = /^(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9]{6,12}$/
// (?=.*[0-9]) 								a：存在一个位置，这个位置后面有数字
// (?=.*[a-z]) 								b：存在一个位置，这个位置后面有字母
// [a-zA-Z0-9]{6,12}$ 				c：6到12个指定字符作为结尾
// ^(?=.*[0-9])(?=.*[a-z]) 		d：这个位置是开头也是也是a和b

reg.test(string) // true
```

```js
// 同时包含至少两种字符
var string = 'aa112233aaZZ'
var reg = /(?!^[0-9]{6,12}$)(?!^[a-z]{6,12}$)(?!^[A-Z]{6,12}$)[a-zA-Z0-9]{6,12}$/
// (?!^[0-9]{6,12}$)	a：不能位开头和结尾之间都是纯数字
// (?!^[a-z]{6,12}$)	a：不能位开头和结尾之间都是纯小写字母
// (?!^[A-Z]{6,12}$)	a：不能位开头和结尾之间都是纯大写字母

reg.test(string) // true
```



## 3. 括号匹配案例

### 3.1 匹配成对标签

```js
var regex = /<([^>]+)>[\d\D]*<\/\1>/;
// ([^>]+) 			a：分组1:匹配至少一个非>字符
// <([^>]+)>		b：匹配<a>
// [\d\D]*			c：匹配任意数量的任意字符
// <\/\1>				d：匹配</分组1匹配的内容>

var string1 = "<title>regular expression</title>";
var string2 = "<p>laoyao bye bye</p>";
var string3 = "<title>wrong!</p>";
console.log( regex.test(string1) ); // true
console.log( regex.test(string2) ); // true
console.log( regex.test(string3) ); // false
```





### **日期格式转换**

```js
// 将以下格式替换为mm/dd/yyy
let string = '2021-08-14'
let reg = /(\d{4})-(\d{2})-(\d{2})/

// 第一种写法
let result1 = string.replace(reg, '$2/$3/$1')
console.log(result1) // 08/14/2021

// 第二种写法
let result2 = string.replace(reg, () => {
    return RegExp.$2 + '/' + RegExp.$3 + '/' + RegExp.$1
})
console.log(result2) // 08/14/2021

// 第三种写法
let result3 = string.replace(reg, ($0, $1, $2, $3) => {
    return $2 + '/' + $3 + '/' + $1
})
console.log(result3) // 08/14/2021
```

