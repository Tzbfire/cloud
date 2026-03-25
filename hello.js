// hello.js
// 这是一个 QuanX/Surge/Loon 通用的响应体修改脚本

// 1. 定义我们要返回的 HTML 内容
// 这里为了美观加了一点简单的 CSS，你也可以只写 "Hello World"
const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f2f5;
            color: #333;
        }
        .container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { color: #007aff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello World</h1>
        <p>这是一个由本地重写脚本生成的纯文本页面。</p>
        <p>当前时间：<span id="time"></span></p>
    </div>
    <script>
        document.getElementById('time').innerText = new Date().toLocaleString();
    </script>
</body>
</html>
`;

// 2. 构建响应头，告诉浏览器这是 HTML 内容
const responseHeaders = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache" // 防止缓存，确保每次刷新都运行脚本
};

// 3. 返回结果
// $done 是 QuanX/Surge/Loon 的标准 API
$done({
    body: htmlContent,
    headers: responseHeaders,
    status: 200
});
