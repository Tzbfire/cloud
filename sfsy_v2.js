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

const $ = new Env("顺丰参数");

(async () => {
    // 1. 验证请求是否存在
    if (typeof $request === "undefined") return;

    // 2. 获取并处理 Cookie
    const headers = $request.headers;
    const cookieStr = headers.Cookie || headers.cookie || "";

    // 3. 提取目标参数
    const sessionId = getCookieValue(cookieStr, "sessionId");
    const loginMobile = getCookieValue(cookieStr, "_login_mobile_");
    const loginUserId = getCookieValue(cookieStr, "_login_user_id_");

    // 4. 判断并执行通知逻辑
    if (sessionId && loginMobile && loginUserId) {
        const result = `sessionId=${sessionId};_login_mobile_=${loginMobile};_login_user_id_=${loginUserId};`;
        
        // 控制台打印便于调试查看
        $.log(`\n🎉 获取成功:\n${result}`);
        
        // 发送系统通知
        $.msg($.name, "✅ 已获取全部参数", result);
    } else {
        // 如果只抓到部分，可以选择记录日志但不弹窗，避免干扰
        $.log(`\n⚠️ 正在匹配参数...当前状态:\nsessionId: ${!!sessionId}\nmobile: ${!!loginMobile}\nuserId: ${!!loginUserId}`);
    }

})()
.catch((e) => $.logErr(e))
.finally(() => $.done({}));

/**
 * Cookie 提取工具函数
 */
function getCookieValue(source, key) {
    if (!source) return null;
    const reg = new RegExp(`${key}=([^;]+)`);
    const res = source.match(reg);
    return res ? res[1] : null;
}

/**
 * --- 标准 Env 环境类 (兼容 QX, Surge, Loon, Node.js) ---
 * 包含常用的日志、通知、持久化存储方法
 */
function Env(name) {
    this.name = name;
    this.logs = [];
    this.log = (...e) => { e.length > 0 && (this.logs = [...this.logs, ...e]); console.log(e.join(", ")); };
    this.logErr = (e) => this.log("", `❗️${this.name}, 错误!`, e.stack);
    this.msg = (e = this.name, t = "", s = "") => {
        const isQX = typeof $task !== "undefined";
        const isLoon = typeof $loon !== "undefined";
        const isSurge = typeof $network !== "undefined" && typeof $script !== "undefined";
        if (isQX) $notify(e, t, s);
        else if (isLoon || isSurge) $notification.post(e, t, s);
        else this.log("","",`${e}\n${t}\n${s}`);
    };
    this.done = (e = {}) => { typeof $done !== "undefined" ? $done(e) : console.log("Done."); };
}
