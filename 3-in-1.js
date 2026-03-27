/*
三合一参数提取脚本 (顺丰 + 联通 + WPS)
[说明]：本脚本用于自动获取三个 App 的登录凭证或任务参数。 

[rewrite_local]
1. 顺丰：匹配广告/会员列表接口，获取 Cookie 中的 sessionId 等
^https:\/\/mcs-mimp-web\.sf-express\.com\/mcs-mimp\/integralPlanet\/getCxAdvertiseList url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/3-in-1.js

2. 联通：匹配短信登录接口，从请求体 (Body) 中获取 token 和 appId
^https:\/\/loginxhm\.10010\.com\/mobileService\/login_vcode_member\.htm url script-request-body https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/3-in-1.js

3. WPS：匹配组件动作接口，获取 Cookie
^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/component_action url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/3-in-1.js

[mitm]
hostname = mcs-mimp-web.sf-express.com, loginxhm.10010.com, personal-act.wps.cn

*/

// --- 1. 初始化每个 App 的独立助手实例 ---
// 传入的名字会显示在通知栏的标题开头，方便区分是谁发的通知
const SF = new Env("顺丰参数");
const LT = new Env("联通参数");
const WPS = new Env("WPS参数");

// --- 2. 准备基础数据 (从请求中拿到的原材料) ---
const url = $request.url;           // 当前触发的完整网址
const headers = $request.headers;   // 请求头 (包含 Cookie、User-Agent 等)
const body = $request.body || "";   // 请求体 (联通等 App 的参数通常在这里)

// --- 3. 核心分流逻辑：利用正则表达式判断当前是哪个 App 的请求 ---

/**
 * 【A. 顺丰逻辑】
 * 来源：Request Header (Cookie)
 */
    if (/sf-express\.com/.test(url)) {
    // 统一获取 Cookie，兼容大小写写法
    const cookie = headers['Cookie'] || headers['cookie'] || "";
    
    // 使用正则从 Cookie 字符串中精准匹配出三个关键 ID
    const sessionId = cookie.match(/sessionId=([^;]+)/)?.[1];
    const loginMobile = cookie.match(/_login_mobile_=([^;]+)/)?.[1];
    const loginUserId = cookie.match(/_login_user_id_=([^;]+)/)?.[1];

    // 只有当三个参数都找齐了，才发送通知，避免频繁弹窗
    if (sessionId && loginMobile && loginUserId) {
        const msg = `sessionId=${sessionId};_login_mobile_=${loginMobile};_login_user_id_=${loginUserId}`;
        SF.notify("✅ 顺丰参数获取成功", "已获取全部参数", msg);
        console.log(`[顺丰提取] 成功: ${msg}`);
    }
}

/**
 * 【B. 联通逻辑】
 * 来源：Request Body (请求体)
 * 注意：联通的参数在正文里，且经过了 URL 编码
 */
else if (/10010\.com/.test(url)) {
    // 从请求正文中提取 appId 和 token
    const appId = body.match(/appId=([^&]+)/)?.[1];
    const tokenOnline = body.match(/token_online=([^&]+)/)?.[1];

    if (appId && tokenOnline) {
        // 对提取到的内容进行解码（处理掉 %3A %2F 等符号）
        const d_appId = decodeURIComponent(appId);
        const d_token = decodeURIComponent(tokenOnline);
        
        // 按照常见的脚本格式拼接：token#appId
        const result = `${d_token}#${d_appId}`;
        LT.notify("✅ 联通参数提取成功", "", result);
        console.log(`[联通提取] 成功: ${result}`);
    }
}

/**
 * 【C. WPS 逻辑】
 * 来源：Request Header (Cookie)
 */
else if (/wps\.cn/.test(url)) {
    const cookie = headers['Cookie'] || headers['cookie'];
    if (cookie) {
        // WPS 通常直接使用完整的 Cookie 字符串
        WPS.notify("🍪 WPS Cookie 已获取", "", cookie);
        console.log(`[WPS提取] 成功: ${cookie}`);
    }
}

// --- 4. 统一收尾工作 ---
/**
 * 特别注意：
 * 联通因为是拦截的 script-request-body，如果最后不把 body 传回去，
 * 手机上的联通 App 会因为拿不到数据而导致登录失败或白屏。
 */
if (/10010\.com/.test(url)) {
    LT.done({ body }); // 把原始 body 还原给 App 
} else {
    $done({}); // 顺丰和 WPS 只需要正常结束脚本即可
}

// --- 5. 简易兼容环境 (Env 模具) ---
/**
 * 这个函数的作用是让脚本同时支持 QX、Surge 和 Loon
 * 它会自动根据运行环境选择正确的通知指令
 */
function Env(name) {
    return {
        name,
        // 检查当前环境是否为 Quantumult X
        isQX: typeof $task !== "undefined",
        // 检查当前环境是否为 Surge
        isSurge: typeof $network !== "undefined" && typeof $script !== "undefined",
        // 检查当前环境是否为 Loon
        isLoon: typeof $loon !== "undefined",
        
        // 统一的通知函数
        notify: function(title, subtitle, content) {
            const finalTitle = `[${this.name}] ${title}`;
            if (this.isQX) $notify(finalTitle, subtitle, content);
            if (this.isSurge || this.isLoon) $notification.post(finalTitle, subtitle, content);
        },
        
        // 统一的结束函数
        done: (obj = {}) => $done(obj)
    };
}








/*
* 以下未启用
*

/ **
 * 【5. 万能兼容环境 (Env 模具) - 升级版】
 * 支持软件：Quantumult X, Surge, Loon, Shadowrocket, Stash
 * /
function Env(name) {
    return {
        name: name,
        // 判断是否为 Quantumult X
        isQX: typeof $task !== "undefined",
        // 判断是否为 Loon
        isLoon: typeof $loon !== "undefined",
        // 判断是否为 Surge (排除掉 Stash)
        isSurge: typeof $network !== "undefined" && typeof $script !== "undefined" && (typeof $environment === "undefined" || !$environment["stash-version"]),
        // 判断是否为 Stash
        isStash: typeof $environment !== "undefined" && $environment["stash-version"],
        // 判断是否为 Shadowrocket (小火箭)
        isRocket: typeof $rocket !== "undefined",

        / **
         * 统一通知函数
         * 会自动根据当前软件环境调用正确的弹窗指令
         * /
        notify: function(title, subtitle, content) {
            const finalTitle = `[${this.name}] ${title}`;
            
            // 1. 如果是 QX，使用 $notify
            if (this.isQX) {
                $notify(finalTitle, subtitle, content);
            } 
            // 2. 如果是 Surge, Loon, Stash, Shadowrocket，使用 $notification.post
            else if (this.isSurge || this.isLoon || this.isStash || this.isRocket) {
                $notification.post(finalTitle, subtitle, content);
            }
            // 3. 兜底策略：如果是其他环境，直接打印到日志
            else {
                console.log(`${finalTitle}\n${subtitle}\n${content}`);
            }
        },

        / **
         * 统一结束函数
         * 确保脚本运行完后能正常释放资源，防止 App 卡死
         * /
        done: (obj = {}) => {
            if (typeof $done !== "undefined") {
                $done(obj);
            }
        }
    };
}

*
*
*/

