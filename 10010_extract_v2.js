/*
 *
 *
[rewrite_local]
# 关键修改：将 script-request-header 替换为 script-request-body
^https:\/\/loginxhm\.10010\.com\/mobileService\/login_vcode_member\.htm url script-request-body https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/10010_extract_v2.js

[mitm]
hostname = loginxhm.10010.com
*
*
*/

/**
 * 通用框架写法 - 联通参数提取 (Request Body 版)
 */
const $ = new Env("联通参数");
const body = $request.body || $request.rawBody;

if (!body || typeof body !== 'string') {
    console.log("[联通提取] 无法获取有效的请求体");
    // 如果需要静默运行，可以注释掉下面这行通知
    // $.notify("联通提取失败", "", "未识别到请求体内容");
} else {
    // 使用正则快速提取参数
    const appId = body.match(/appId=([^&]+)/)?.[1];
    const tokenOnline = body.match(/token_online=([^&]+)/)?.[1];

    if (appId && tokenOnline) {
        // 解码获取到的值（处理 URL 编码字符）
        const d_appId = decodeURIComponent(appId);
        const d_token = decodeURIComponent(tokenOnline);
        
        const result = `${d_token}#${d_appId}`;
        $.notify("✅ 联通参数提取成功", "", result);
        //关闭日志输出
        //console.log(`[联通提取] 成功: ${result}`);
    } else {
        console.log("[联通提取] 参数不完整，跳过通知");
    }
}

// 必须返回 body，否则请求可能会挂起或失败
$.done({ body });

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
