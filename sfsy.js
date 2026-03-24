/*
 *
 *
[rewrite_local]
# 匹配 https://mcs-mimp-web.sf-express.com/mcs-mimp/ 下的所有请求
^https:\/\/mcs-mimp-web\.sf-express\.com\/mcs-mimp\/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/sfsy.js

[mitm]
hostname = mcs-mimp-web.sf-express.com
*
*
*/


// 名称：顺丰 sessionId 监控脚本
// 功能：监控 mcs-mimp-web.sf-express.com 域下的所有请求，从请求头中提取 sessionId
// 作者：元宝
// 更新时间：2026年3月24日
// 类型：script-request-header

// 获取请求头中的所有 cookie
function getCookieValue(cookieString, cookieName) {
    if (!cookieString) return null;
    var match = cookieString.match(new RegExp('(^|;\\s*)' + cookieName + '=([^;]+)'));
    return match ? match[2] : null;
}

// 主处理函数
(function() {
    var request = $request;
    var headers = request.headers;
    var sessionId = null;
    var source = "";
    
    // 从 Cookie 头中查找
    if (headers.Cookie) {
        sessionId = getCookieValue(headers.Cookie, "sessionId");
        if (sessionId) {
            source = "Cookie 头";
        }
    }
    
    // 如果 Cookie 中没有，尝试从其他常见的位置查找
    if (!sessionId && headers.cookie) {
        sessionId = getCookieValue(headers.cookie, "sessionId");
        if (sessionId) {
            source = "cookie 头（小写）";
        }
    }
    
    // 如果仍然没有找到，尝试查找其他可能包含 sessionId 的头部字段
    if (!sessionId) {
        var headerKeys = Object.keys(headers);
        for (var i = 0; i < headerKeys.length; i++) {
            var key = headerKeys[i];
            var value = headers[key];
            
            // 检查头部值是否包含 sessionId= 格式
            if (typeof value === 'string') {
                var match = value.match(/sessionId=([^;,\s]+)/i);
                if (match && match[1]) {
                    sessionId = match[1];
                    source = key + " 头";
                    break;
                }
            }
        }
    }
    
    // 如果找到 sessionId，发送通知
    if (sessionId) {
        var url = request.url;
        var method = request.method || "未知";
        
        // 生成简短摘要用于通知
        var shortSessionId = sessionId;
        if (sessionId.length > 16) {
            shortSessionId = sessionId.substring(0, 8) + "..." + sessionId.substring(sessionId.length - 4);
        }
        
        var notificationTitle = "🔍 检测到 sessionId";
        var notificationSubtitle = "来源: " + source;
        var notificationBody = "sessionId: " + shortSessionId + 
                             "\nURL: " + url.split('?')[0] +  // 只显示路径，不显示查询参数
                             "\n方法: " + method + 
                             "\n时间: " + new Date().toLocaleTimeString('zh-CN') + 
                             "\n完整路径: " + url;
        
        $notify(notificationTitle, notificationSubtitle, notificationBody);
        
        // 可选：将 sessionId 存储到持久化存储，供其他脚本使用
        $persistentStore.write(sessionId, "sf_express_sessionid");
        
        // 可选：记录日志
        console.log("捕获到 sessionId: " + shortSessionId + " 来源: " + source);
    } else {
        // 可选：记录未找到 sessionId 的情况
        // console.log("未在请求头中找到 sessionId，URL: " + request.url);
    }
    
    // 继续请求，不修改任何内容
    $done({});
})();
