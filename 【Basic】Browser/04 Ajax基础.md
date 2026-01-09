# Ajax 基础知识

## 目录
- [Ajax 基础知识](#ajax-基础知识)
  - [目录](#目录)
  - [1. Ajax 概述](#1-ajax-概述)
  - [2. XMLHttpRequest 对象](#2-xmlhttprequest-对象)
    - [2.1 基本用法](#21-基本用法)
    - [2.2 XMLHttpRequest 状态码](#22-xmlhttprequest-状态码)
    - [2.3 事件处理](#23-事件处理)
  - [3. 发送 GET/POST 请求](#3-发送-getpost-请求)
    - [3.1 GET 请求](#31-get-请求)
    - [3.2 POST 请求](#32-post-请求)
  - [4. 处理响应](#4-处理响应)
  - [5. 上传文件](#5-上传文件)
  - [6. 取消请求](#6-取消请求)
  - [7. 错误处理](#7-错误处理)
  - [8. 现代替代方案](#8-现代替代方案)
    - [8.1 Fetch API](#81-fetch-api)
    - [8.2 Axios](#82-axios)
  - [9. 最佳实践](#9-最佳实践)

## 1. Ajax 概述

Ajax 全称：`Asynchronous Javascript And XML`（异步的 JavaScript 和 XML）

- A：Asynchronous（异步）
- J：JavaScript
- A：And
- X：XML（Extensible Markup Language）

> 注意：虽然 Ajax 名称中包含 XML，但现代开发中 JSON 格式已取代 XML 成为主流数据交换格式。

Ajax 是一种在不重新加载整个页面的情况下，与服务器交换数据并更新部分网页内容的技术。其核心特点是：
- 异步通信：不阻塞用户操作
- 局部更新：仅更新页面特定部分
- 提升用户体验：减少页面闪烁和等待时间

## 2. XMLHttpRequest 对象

`XMLHttpRequest` 是 Ajax 的核心，它是一种支持异步请求的技术。通过 `XMLHttpRequest`，可以使用 JavaScript 向服务器发送请求并处理响应，而不会阻塞用户操作。

### 2.1 基本用法

```js
// 1. 创建 XMLHttpRequest 对象
let xhr = new XMLHttpRequest();

// 2. 配置请求参数
xhr.open("POST", "http://www.example.com/api/login");

// 3. 设置请求头
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

// 4. 发送请求
xhr.send("username=admin&password=123456");

// 5. 注册回调函数处理响应
xhr.onreadystatechange = () => {
  // 检查请求是否完成且响应就绪
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
```

### 2.2 XMLHttpRequest 状态码

- `0`：未初始化（已创建 xhr 对象，但尚未调用 open() 方法）
- `1`：已打开（已调用 open() 方法，连接已建立）
- `2`：已发送（已调用 send() 方法，请求已发送）
- `3`：接收中（正在接收响应，responseText 属性已部分接收）
- `4`：完成（整个请求过程完毕，响应已接收完成）

### 2.3 事件处理

- `onreadystatechange` 事件：当 [readyState](file:///c:/Users/ren/github/note/【Basic】Browser/05%20浏览器优化.md#L23) 属性改变时触发，无论请求成功或失败
- `onload` 事件：请求成功完成时触发（仅在 [readyState](file:///c:/Users/ren/github/note/【Basic】Browser/05%20浏览器优化.md#L23) 为 4 时）
- `onerror` 事件：请求发生错误时触发
- `onabort` 事件：请求被取消时触发
- `ontimeout` 事件：请求超时时触发

## 3. 发送 GET/POST 请求

### 3.1 GET 请求

```js
// GET 请求参数附加在 URL 后面
function sendGetRequest(url, params) {
  // 将参数对象转换为查询字符串
  const queryString = Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
  
  const fullUrl = url + (url.includes('?') ? '&' : '?') + queryString;
  
  let xhr = new XMLHttpRequest();
  xhr.open('GET', fullUrl, true);  // true 表示异步请求
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('响应数据：', xhr.responseText);
      } else {
        console.error('请求失败：', xhr.status);
      }
    }
  };
  
  xhr.send();
}

// 使用示例
sendGetRequest('http://api.example.com/users', { id: 1, name: '张三' });
```

### 3.2 POST 请求

```js
function sendPostRequest(url, data) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  
  // 设置请求头
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('响应数据：', xhr.responseText);
      } else {
        console.error('请求失败：', xhr.status);
      }
    }
  };
  
  // 将数据转换为 JSON 字符串发送
  xhr.send(JSON.stringify(data));
}

// 使用示例
sendPostRequest('http://api.example.com/users', { 
  name: '张三', 
  email: 'zhangsan@example.com' 
});
```

## 4. 处理响应

```js
function handleResponse(xhr) {
  let response;
  
  switch(xhr.getResponseHeader('Content-Type')) {
    case 'application/json':
      response = JSON.parse(xhr.responseText);
      break;
    case 'text/xml':
      response = xhr.responseXML;
      break;
    default:
      response = xhr.responseText;
  }
  
  return response;
}
```

## 5. 上传文件

```js
// 为文件输入框注册 change 事件
document.querySelector("#input-file").addEventListener('change', function(e) {
  // 修复原代码中的 this 指向问题
  let file = e.target.files[0];
  
  if (file === undefined) {
    return alert("请上传文件");
  }
  
  // 创建 FormData 对象
  let fd = new FormData();
  fd.append("file", file);
  
  // 使用 XMLHttpRequest 上传
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://www.example.com/api/upload');
  
  // 上传进度监听
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      let percentComplete = (e.loaded / e.total) * 100;
      console.log('上传进度：' + percentComplete + '%');
    }
  };
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('上传成功：', JSON.parse(xhr.responseText));
      } else {
        console.error('上传失败：', xhr.status);
      }
    }
  };
  
  xhr.send(fd);
});

// 自定义上传按钮
const DIYBtn = document.getElementById('custom-upload-btn');
const FileInput = document.getElementById('input-file');

DIYBtn.onclick = () => {
  FileInput.click();  // 触发隐藏的文件输入框
};
```

## 6. 取消请求

### 原生 XMLHttpRequest 取消

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.send();

// 在适当时候取消请求
xhr.abort();  // 会触发 onabort 事件
```

### 现代方法取消请求

```js
// 使用 AbortController 取消请求（现代浏览器支持）
const controller = new AbortController();

fetch('/api/data', {
  signal: controller.signal
})
.then(response => response.json())
.then(data => console.log(data))
.catch(err => {
  if (err.name === 'AbortError') {
    console.log('请求已被取消');
  } else {
    console.error('请求出错：', err);
  }
});

// 取消请求
controller.abort();
```

**取消请求的意义：**
- 避免不必要的网络资源消耗
- 防止页面跳转后旧请求的回调函数影响新页面
- 改善用户体验，避免混乱的状态更新

## 7. 错误处理

```js
function requestWithRetry(url, options = {}, maxRetries = 3) {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    
    function makeRequest() {
      const xhr = new XMLHttpRequest();
      
      xhr.open(options.method || 'GET', url);
      xhr.timeout = options.timeout || 10000;  // 设置超时时间
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`请求失败，正在重试... (${retryCount}/${maxRetries})`);
            setTimeout(makeRequest, 1000 * retryCount);  // 延迟重试
          } else {
            reject(new Error(`请求失败，已重试 ${maxRetries} 次: ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = function() {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(makeRequest, 1000 * retryCount);
        } else {
          reject(new Error('网络错误，请求失败'));
        }
      };
      
      xhr.ontimeout = function() {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(makeRequest, 1000 * retryCount);
        } else {
          reject(new Error('请求超时'));
        }
      };
      
      xhr.send(options.body);
    }
    
    makeRequest();
  });
}
```

## 8. 现代替代方案

### 8.1 Fetch API

```js
// 使用 Fetch API（现代浏览器支持）
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// 使用 async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 8.2 Axios

```js
// 使用 Axios 库（需要引入）
axios({
  method: 'POST',
  url: 'http://api.example.com/users',
  data: {
    name: '张三',
    email: 'zhangsan@example.com'
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Error:', error);
});

// 或者使用更简洁的方法
axios.post('http://api.example.com/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
```

## 9. 最佳实践

1. **错误处理**：始终添加错误处理逻辑
2. **超时设置**：为请求设置合理的超时时间
3. **取消请求**：在适当时候取消不必要的请求
4. **安全性**：注意防止 CSRF 和 XSS 攻击
5. **性能优化**：使用缓存、压缩响应数据
6. **兼容性**：考虑不同浏览器的兼容性
7. **加载状态**：提供加载指示器提升用户体验
8. **数据验证**：在发送前验证数据的有效性