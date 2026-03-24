/*
 *
 *

# Quantumult X 重写规则
# 功能：监控指定API返回的JSON数据，当指定字段满足条件时发送通知。
# 配置说明：将以下全部内容复制到Quantumult X的“重写”规则部分即可。

[rewrite_local]
# 匹配目标URL
^https:\/\/mcs-mimp-web\.sf-express\.com\/mcs-mimp\/integralPlanet\/getCxAdvertiseList url script-response-body https://raw.githubusercontent.com/yourname/yourrepo/main/script.js
# 如果需要MitM解密HTTPS流量，请确保主机名在MitM列表中
# 主机名：mcs-mimp-web.sf-express.com

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
