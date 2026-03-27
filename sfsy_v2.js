/*
 *
 *
[rewrite_local]
^https:\/\/mcs-mimp-web\.sf-express\.com\/mcs-mimp\/integralPlanet\/getCxAdvertiseList url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/sfsy.js

[mitm]
hostname = mcs-mimp-web.sf-express.com
*
*
*/

/**
 * 通用框架写法 - 顺丰参数提取
 */
const $ = new Env("顺丰参数");
const headers = $request.headers;
const cookie = headers['Cookie'] || headers['cookie'] || "";

if (cookie) {
    const sessionId = cookie.match(/sessionId=([^;]+)/)?.[1];
    const loginMobile = cookie.match(/_login_mobile_=([^;]+)/)?.[1];
    const loginUserId = cookie.match(/_login_user_id_=([^;]+)/)?.[1];

    // 只有三个值都存在时才执行通知
    if (sessionId && loginMobile && loginUserId) {
        const msg = `sessionId=${sessionId};_login_mobile_=${loginMobile};_login_user_id_=${loginUserId}`;
        $.notify("顺丰参数", "已获取全部参数", msg);
        console.log(`[顺丰参数] 获取成功: ${msg}`);
    }
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
