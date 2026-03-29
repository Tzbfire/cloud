/**
 * Quantumult X 脚本: 修改联通官方白名单响应体
 * 
[rewrite_local]
# 匹配目标链接并执行脚本
^https:\/\/m\.client\.10010\.com\/edopinterface\/officialWhite\/checkOfficialWhitePhone url script-response-body https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/10010_wifi_call.js

hostname = m.client.10010.com
*/


const $ = new Env("联通白名单修正");

let body = $response.body;

if (body) {
    // 1. 匹配 "respCode" 后面跟着冒号，再跟着 "0211"
    let newBody = body.replace(/"respCode"\s*:\s*"0211"/g, '"respCode":"0000"');
    
    // 2. 把那个“受邀限制”的提示语也改掉
    //newBody = newBody.replace(/"respMsg"\s*:\s*"[^"]*"/g, '"respMsg":"脚本已解除限制"');

    $.log(`[联通脚本] 正则替换完成`);
    $.done({ body: newBody });
} else {
    $.done({});
}

// --- Env 环境适配代码 ---
function Env(name) {
    this.name = name;
    this.isQX = typeof $task !== "undefined";
    this.isLoon = typeof $loon !== "undefined";
    this.isSurge = typeof $httpClient !== "undefined" && !this.isLoon;
    this.log = (...args) => console.log(`[${this.name}] ` + args.join(" "));
    this.done = (obj = {}) => {
        if (this.isQX) $done(obj);
        if (this.isSurge || this.isLoon) {
            if (obj.body) $done({ body: obj.body });
            else $done({});
        }
    };
}
