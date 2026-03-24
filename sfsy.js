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
// 名称：sessionId提取器
// 功能：提取sessionId并通知
// 作者：元宝
// 类型：script-request-header

(function() {
    var request = $request;
    var headers = request.headers;
    var sessionId = null;
    
    // 从请求头中查找sessionId
    if (headers.Cookie && headers.Cookie.match(/sessionId=([^;]+)/)) {
        sessionId = headers.Cookie.match(/sessionId=([^;]+)/)[1];
    } else if (headers.cookie && headers.cookie.match(/sessionId=([^;]+)/)) {
        sessionId = headers.cookie.match(/sessionId=([^;]+)/)[1];
    } else {
        // 检查其他头部字段
        for (var key in headers) {
            if (typeof headers[key] === 'string' && headers[key].match(/sessionId=([^;,\s]+)/i)) {
                var match = headers[key].match(/sessionId=([^;,\s]+)/i);
                if (match) {
                    sessionId = match[1];
                    break;
                }
            }
        }
    }
    
    // 如果找到sessionId，发送简单通知
    if (sessionId) {
        $notify("SessionID", "", sessionId);
    }
    
    $done({});
})();
