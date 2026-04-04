/*

[rewrite_local]
# 只精确匹配 https://api.m.jd.com/ 这个绝对地址（不匹配任何子路径、查询参数或其他）
^https:\/\/api\.m\.jd\.com\/$ url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/jd_cookie.js

[mitm]
hostname = api.m.jd.com

*/

 *京东 API Cookie提取（精确匹配版）
 *功能：仅当请求完全等于 https://api.m.jd.com/ 时，自动提取请求头中的 Cookie 并通知 * 使用方法：
 *1. 把下面整个脚本保存为 jd_api_cookie.js 并上传到 GitHub Raw *2. 在 Quantumult X / Surge / Loon 的重写规则中添加上面的 [rewrite_local] 和 [mitm]
 *3.打开京东 App 或触发一次精准的 https://api.m.jd.com/ 请求即可获取 *4. 获取成功后建议立即把重写规则注释掉，避免重复弹窗 */

const $ = new Env("京东API Cookie");

const headers = $request.headers;
const cookie = headers['Cookie'] || headers['cookie'] || headers['cookie2']; //兼容不同大小写和 cookie2if (cookie) {
 //成功获取 Cookie 时发送通知 $.notify("京东API Cookie 已获取 ✅", "", `Cookie长度: ${cookie.length}\n\n${cookie.substring(0,200)}...（已截断显示）`);
 console.log(`[JD API提取]成功获取 Cookie,长度: ${cookie.length}`);
 console.log(`[JD API提取] 获取成功: ${cookie}`);
 // 如果你需要持久化存储以便其他脚本调用，取消下面这行的注释：
 // $persistentStore.write(cookie, "jd_api_cookie");
 // console.log(`[JD API提取] 已保存到持久化存储: jd_api_cookie`);
} else {
 //失败时仅在日志打印，避免无效弹窗干扰 console.log("[JD API提取]失败：请求头中未找到 Cookie字段");
}

$.done({});

// ---简易兼容环境 (Env) ---
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
