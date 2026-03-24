/*
 *
 *

[rewrite_local]
# 关键修改：将 script-request-header 替换为 script-request-body
^https:\/\/loginxhm\.10010\.com\/mobileService\/login_vcode_member\.htm url script-request-body https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/unicom_extract.js

[mitm]
hostname = loginxhm.10010.com

*
*
*/
// 名称：联通参数提取器 (script-request-body 修正版)
// 功能：从请求体（request body）中提取 token_online 和 appId
// 输出格式：token_online#appId
// 类型：script-request-body

(function() {
    'use strict';
    
    console.log("联通提取器(script-request-body)：脚本开始执行。");
    
    // 在 script-request-body 类型中，请求体可能通过 $request.body 或 $request.rawBody 访问
    // 我们优先尝试 $request.body，如果无效则尝试 $request.rawBody
    var body = $request.body;
    
    if (!body || typeof body !== 'string') {
        console.log("尝试从 $request.body 获取失败，尝试 $request.rawBody。");
        body = $request.rawBody; // 在某些版本或情况下，原始数据在这里
    }
    
    // 再次检查请求体是否有效
    if (!body || typeof body !== 'string') {
        console.log("错误：无法获取有效的请求体。$request 对象结构:", JSON.stringify(Object.keys($request)));
        $notify("❌ 联通提取失败", "script-request-body", "无法读取请求体，请检查脚本类型配置。");
        $done({});
        return;
    }
    
    console.log("联通提取器：成功获取请求体，长度 " + body.length + " 字符");
    console.log("请求体前100字符预览: " + body.substring(0, 100));
    
    // 解析URL编码的请求体
    var params = {};
    try {
        var pairs = body.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            if (pair.length === 2) {
                var key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
                var value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
                params[key] = value;
            }
        }
    } catch (e) {
        console.log("解析请求体时发生错误: " + e);
        $notify("❌ 联通提取失败", "解析错误", e.toString());
        $done({});
        return;
    }
    
    // 提取目标参数
    var appId = params['appId'];
    var tokenOnline = params['token_online'];
    
    // 判断并发送通知
    if (appId && tokenOnline) {
        var output = tokenOnline + "#" + appId;
        $notify("✅ 联通参数提取成功", "script-request-body", output);
        console.log("提取成功！appId长度:" + appId.length + ", token_online长度:" + tokenOnline.length);
    } else {
        var errorMsg = "提取不全。找到的参数: " + JSON.stringify(Object.keys(params));
        $notify("❌ 联通参数提取不全", "", errorMsg);
        console.log("提取失败: " + errorMsg);
    }
    
    // 重要：在 script-request-body 类型中，必须返回修改后的请求对象（即使未修改）
    $done({body: body});
})();
