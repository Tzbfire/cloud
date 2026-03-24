/*
 *
 *
[rewrite_local]
^https:\/\/loginxhm\.10010\.com\/mobileService\/login_vcode_member\.htm url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/10010_extract.js

[mitm]
hostname = loginxhm.10010.com
*
*
*/

// 名称：联通登录参数提取器
// 功能：从请求体中提取 token_online 和 appId，并按格式输出
// 作者：元宝
// 类型：script-request-header

(function() {
    var request = $request;
    
    // 检查请求方法是否为POST，并且包含请求体
    if (request.method !== 'POST' || !request.body) {
        // 如果不是POST请求或没有请求体，则不作处理
        $done({});
        return;
    }
    
    // 获取请求体（URL编码格式）
    var requestBody = request.body;
    
    // 辅助函数：从URL编码的字符串中解析参数
    function parseUrlEncoded(bodyString) {
        var params = {};
        if (!bodyString) return params;
        
        // 按 & 分割参数
        var pairs = bodyString.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            if (pair.length === 2) {
                // 对键和值进行解码（URL解码）
                var key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
                var value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
                params[key] = value;
            }
        }
        return params;
    }
    
    // 解析请求体
    var params = parseUrlEncoded(requestBody);
    
    // 提取目标参数
    var tokenOnline = params['token_online'];
    var appId = params['appId'];
    
    // 只有两个值都找到时才发送通知
    if (tokenOnline && appId) {
        var notificationBody = tokenOnline + "#" + appId;
        $notify("联通参数", "已提取 token_online 和 appId", notificationBody);
        
        // （可选）可以存储到持久化存储，供其他脚本使用
        // $persistentStore.write(notificationBody, "unicom_params");
    } else {
        // 可选：如果没有找到两个参数，可以记录日志
        // console.log("未找到全部参数。token_online: " + (tokenOnline ? "有" : "无") + ", appId: " + (appId ? "有" : "无"));
    }
    
    $done({});
})();
