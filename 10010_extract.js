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
// 功能：从请求体（request body）中提取 token_online 和 appId
// 输出格式：token_online#appId
// 类型：script-request-header

(function() {
    var request = $request;
    
    // 1. 确认是否为POST请求
    if (request.method !== 'POST') {
        console.log("联通提取器：当前请求非POST，跳过处理。");
        $done({});
        return;
    }
    
    // 2. 获取请求体（URL编码格式的字符串）
    var bodyString = request.body;
    if (!bodyString || typeof bodyString !== 'string') {
        console.log("联通提取器：请求体为空或非字符串，跳过处理。");
        $done({});
        return;
    }
    
    console.log("联通提取器：开始解析请求体。");
    
    // 3. 解析 URL-encoded 请求体
    var params = {};
    var pairs = bodyString.split('&');
    
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length === 2) {
            var key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
            var value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
            params[key] = value;
        }
    }
    
    // 4. 提取目标参数
    var tokenOnline = params['token_online'];
    var appId = params['appId'];
    
    // 5. 判断并输出
    if (tokenOnline && appId) {
        var output = tokenOnline + "#" + appId;
        $notify("✅ 联通参数已提取", "来自请求体 (request body)", output);
        console.log("联通提取器：成功提取参数，长度 token_online=" + tokenOnline.length + "， appId=" + appId.length);
    } else {
        var msg = "提取失败。找到参数：";
        msg += "token_online=" + (tokenOnline ? "是(" + tokenOnline.length + "字符)" : "否");
        msg += "， appId=" + (appId ? "是(" + appId.length + "字符)" : "否");
        $notify("❌ 联通参数提取不完整", "", msg);
        console.log("联通提取器：" + msg + "，原始参数列表: " + JSON.stringify(Object.keys(params)));
    }
    
    $done({});
})();
