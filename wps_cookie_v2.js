/*
 *
 *
[rewrite_local]
# 匹配目标URL，提取请求头中的Cookie
^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/component_action url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/wps_cookie_v2.js

[mitm]
hostname = personal-act.wps.cn
*
*
*/

/**
 * 通用框架写法 - WPS Cookie 提取
 */
const $ = new Env("WPS参数");
const headers = $request.headers;
const cookie = headers['Cookie'] || headers['cookie'];

if (cookie) {
    // 成功获取 Cookie 时发送通知
    $.notify("🍪 WPS Cookie 已获取", "", cookie);
    console.log(`[WPS提取] 成功获取 Cookie, 长度: ${cookie.length}`);
    
    // 如果你需要持久化存储以便其他脚本调用，可以取消下面这行的注释：
    // $persistentStore.write(cookie, "wps_activity_cookie");
} else {
    // 失败时仅在日志打印，避免无效弹窗干扰（如需弹窗可自行添加 $.notify）
    console.log("[WPS提取] 失败：请求头中未找到 Cookie 字段");
}

$.done({});

// --- 简易兼容环境 (Env) ---
function Env(name) {
    return {
        name,
        isQX: typeof $task !== "undefined",
        isSurge: typeof $network !== "undefined" && typeof $script !== "undefined",
        isLoon: typeof $loon !== "undefined",
        notify: function(title, subtitle, content) {
            if (this.isQX) $notify(title, subtitle, content);
            if (this.isSurge || this.isLoon) $notification.post(title, subtitle, content);
        },
        done: (obj = {}) => $done(obj)
    };
}
