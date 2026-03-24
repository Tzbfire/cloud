/*
 *
 *

[rewrite_local]
# 关键：必须使用 script-request-header 类型来处理“请求”
^https:\/\/loginxhm\.10010\.com\/mobileService\/login_vcode_member\.htm url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/10010_extract.js

[mitm]
hostname = loginxhm.10010.com

*
*
*/
// 名称：联通参数提取器 (修复版)
// 功能：从请求体（request body）中提取 token_online 和 appId
// 输出格式：token_online#appId
// 类型：script-request-header

(function() {
    'use strict';
    
    var request = $request;
    console.log("联通提取器：脚本被触发，方法为 " + request.method);
    
    // 1. 检查是否为POST请求
    if (request.method !== 'POST') {
        console.log("联通提取器：非POST请求，跳过。");
        $done({});
        return;
    }
    
    // 2. 获取并检查请求体
    var body = request.body;
    if (!body || typeof body !== 'string') {
        console.log("联通提取器：请求体无效。");
        $notify("❌ 联通提取失败", "", "未获取到请求体");
        $done({});
        return;
    }
    
    console.log("联通提取器：原始请求体前200字符 - " + body.substring(0, 200));
    
    // 3. 解析URL编码的请求体
    var params = {};
    var pairs = body.split('&');
    
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length === 2) {
            // 解码参数名和值
            var key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
            var value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
            params[key] = value;
            // 日志：记录找到的目标参数
            if (key === 'appId' || key === 'token_online') {
                console.log("找到参数: " + key + " (长度:" + value.length + ")");
            }
        }
    }
    
    // 4. 提取目标参数
    var appId = params['appId'];
    var tokenOnline = params['token_online'];
    
    // 5. 判断并发送通知
    if (appId && tokenOnline) {
        var output = tokenOnline + "#" + appId;
        $notify("✅ 联通参数提取成功", "", output);
        console.log("联通提取器：成功，输出字符长度 " + output.length);
        
        // 可选：复制到持久化存储，方便其他脚本调用
        // $persistentStore.write(output, "unicom_token_appid");
        
    } else {
        var errorMsg = "提取不全。";
        errorMsg += "appId: " + (appId ? "有" : "无");
        errorMsg += ", token_online: " + (tokenOnline ? "有" : "无");
        $notify("❌ 联通参数提取不全", "", errorMsg);
        console.log("联通提取器失败: " + errorMsg);
    }
    
    $done({});
})();
