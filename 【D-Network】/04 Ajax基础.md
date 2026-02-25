# Ajax基础

## 概述

Ajax（Asynchronous JavaScript and XML）是一种在不重新加载整个页面的情况下与服务器交换数据并局部更新页面的技术。现代开发中 JSON 已取代 XML 成为主流数据格式。

核心特点：

- 异步通信，不阻塞用户操作
- 局部更新，减少页面闪烁

---

## XMLHttpRequest

### 基本用法

```js
const xhr = new XMLHttpRequest();

xhr.open('POST', 'http://www.example.com/api/login');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.send('username=admin&password=123456');

xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
```

### readyState 状态码

| 值 | 含义 |
| --- | --- |
| `0` | 未初始化，尚未调用 `open()` |
| `1` | 已打开，已调用 `open()` |
| `2` | 已发送，已调用 `send()` |
| `3` | 接收中，`responseText` 已部分接收 |
| `4` | 完成，响应已全部接收 |

### 事件

| 事件 | 触发时机 |
| --- | --- |
| `onreadystatechange` | `readyState` 改变时（无论成功或失败） |
| `onload` | 请求成功完成时 |
| `onerror` | 请求发生错误时 |
| `onabort` | 请求被取消时 |
| `ontimeout` | 请求超时时 |

---

## 发送请求

### GET 请求

```js
function sendGetRequest(url, params) {
  const queryString = Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');

  const fullUrl = url + (url.includes('?') ? '&' : '?') + queryString;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', fullUrl, true);

  xhr.onreadystatechange = function () {
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
```

### POST 请求

```js
function sendPostRequest(url, data) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('响应数据：', xhr.responseText);
      } else {
        console.error('请求失败：', xhr.status);
      }
    }
  };

  xhr.send(JSON.stringify(data));
}
```

---

## 文件上传

```js
document.querySelector('#input-file').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return alert('请上传文件');

  const fd = new FormData();
  fd.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://www.example.com/api/upload');

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      console.log('上传进度：' + ((e.loaded / e.total) * 100) + '%');
    }
  };

  xhr.onreadystatechange = function () {
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
```

---

## 取消请求

原生 XHR：

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.send();
xhr.abort(); // 触发 onabort 事件
```

使用 `AbortController`（推荐）：

```js
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已��取消');
    }
  });

controller.abort();
```

取消请求的意义：避免不必要的网络消耗，防止页面跳转后旧请求的回调影响新页面。

---

## 错误处理与重试

```js
function requestWithRetry(url, options = {}, maxRetries = 3) {
  return new Promise((resolve, reject) => {
    let retryCount = 0;

    function makeRequest() {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || 'GET', url);
      xhr.timeout = options.timeout || 10000;

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(makeRequest, 1000 * retryCount);
          } else {
            reject(new Error(`请求失败，已重试 ${maxRetries} 次: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = xhr.ontimeout = function () {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(makeRequest, 1000 * retryCount);
        } else {
          reject(new Error('请求失败'));
        }
      };

      xhr.send(options.body);
    }

    makeRequest();
  });
}
```

---

## 现代替代方案

### Fetch API

```js
// Promise 写法
fetch('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// async/await 写法
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

### Axios

```js
axios.post('http://api.example.com/users', {
  name: '[name]',
  email: '[email]'
})
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```
