/*
 *
 *
[rewrite_local]
# 匹配目标URL，提取请求头中的Cookie
^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/component_action url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/wps_cookie.js

[mitm]
hostname = personal-act.wps.cn

*
*
*/


// 名称：WPS Cookie 提取器
// 功能：提取指定接口请求头中的 Cookie 字段
// 类型：script-request-header

(function() {
    'use strict';
    
    var request = $request;
    var headers = request.headers;
    
    console.log("WPS Cookie 提取器：脚本被触发，URL: " + request.url);
    
    // 从请求头中获取 Cookie（兼容大小写）
    var cookie = headers.Cookie || headers.cookie;
    
    if (cookie) {
        // 发送通知显示完整的 Cookie
        $notify("🍪 WPS Cookie 已获取", request.url, cookie);
        console.log("WPS Cookie 提取器：成功获取 Cookie，长度 " + cookie.length + " 字符");
        
        // 可选：将 Cookie 保存到持久化存储，供其他脚本使用
        // $persistentStore.write(cookie, "wps_activity_cookie");
        
        // 可选：解析并显示主要的 Cookie 键值对（如需要特定 Cookie 可修改此处）
        // var cookies = cookie.split('; ');
        // var mainCookies = [];
        // for (var i = 0; i < Math.min(cookies.length, 5); i++) {
        //     mainCookies.push(cookies[i]);
        // }
        // $notify("WPS Cookie 主要项", "", mainCookies.join('\n'));
        
    } else {
        $notify("❌ WPS Cookie 提取失败", "", "请求头中未找到 Cookie 字段");
        console.log("WPS Cookie 提取器：未找到 Cookie，可用请求头字段: " + JSON.stringify(Object.keys(headers)));
    }
    
    $done({});
})();
