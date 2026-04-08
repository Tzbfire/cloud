/*
[rewrite_local]
# 只精确匹配 https://api.m.jd.com/ 这个绝对地址（不匹配任何子路径、查询参数或其他）
^https:\/\/api\.m\.jd\.com\/$ url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/jd_cookie.js
[mitm]
hostname = api.m.jd.com
*/

/*
 * 京东 API Cookie提取（精确匹配版）
 */
const $ = new Env("京东API Cookie");

const headers = $request.headers;
const cookie = headers['Cookie'] || headers['cookie'] || headers['cookie2']; // 兼容不同大小写和 cookie2

if (cookie) {
    // 成功获取 Cookie 时发送通知
    $.notify("京东API Cookie 已获取 ✅", "", `${cookie}`);
    
    // 关闭日志输出（仅在控制台保留关键信息）
    //console.log(`[JD Cookie提取] 成功获取 Cookie✅✅, 长度: ${cookie.length}`);
    console.log(`[JD Cookie提取] 获取成功✅✅✅✅✅: ${cookie}`);
    
    // 如果你需要持久化存储以便其他脚本调用，可以取消下面这行的注释：
    // $persistentStore.write(cookie, "jd_api_cookie");
} else {
    // 失败时仅在日志打印，避免无效弹窗干扰
    console.log("[JD API提取] 失败：请求头中未找到 Cookie 字段");
}

$.done({});

// --- 简易兼容环境 (Env) ---
function Env(name) {
    return {
        name,
        isQX: typeof $task !== "undefined",
        isSurge: typeof $network !== "undefined" && typeof $script !== "undefined",
        isLoon: typeof $loon !== "undefined",
        notify: function (title, subtitle, content) {
            if (this.isQX) $notify(title, subtitle, content);
            if (this.isSurge || this.isLoon) $notification.post(title, subtitle, content);
        },
        done: (obj = {}) => $done(obj)
    };
}
