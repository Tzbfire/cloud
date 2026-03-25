/*
 *
 *
[rewrite_local]
# 52pojie Cookie获取（运行一次后注释掉）
^https?://www\.52pojie\.cn/ url script-response-body 52pojie_sign.js


[mitm]
hostname = www.52pojie.cn

*
*
*/

// 52pojie自动签到脚本 for Quantumult X
// 作者：元宝
// 版本：1.0
// 功能：自动签到52pojie论坛并推送通知

// 配置部分 - 请根据实际情况修改
const CONFIG = {
    // 签到接口URL（根据52pojie论坛结构可能需要调整）
    signUrl: "https://www.52pojie.cn/home.php?mod=task&do=apply&id=2",
    // 签到状态检查URL
    checkUrl: "https://www.52pojie.cn/home.php?mod=space&do=home",
    // 通知标题
    notifyTitle: "52pojie签到通知",
    // 存储Cookie的键名
    cookieKey: "52pojie_cookie"
};

// 主函数
(async () => {
    try {
        // 1. 获取存储的Cookie
        let cookie = $persistentStore.read(CONFIG.cookieKey);
        
        if (!cookie) {
            // 如果没有Cookie，提示用户如何获取
            $notification.post(
                CONFIG.notifyTitle,
                "Cookie未设置",
                "请先访问52pojie网站登录，然后运行一次脚本获取Cookie"
            );
            $done();
            return;
        }
        
        // 2. 检查今日是否已签到
        const checkResult = await checkSignStatus(cookie);
        
        if (checkResult.alreadySigned) {
            $notification.post(
                CONFIG.notifyTitle,
                "签到状态",
                `今日已签到，连续签到${checkResult.continuousDays || 0}天`
            );
            $done();
            return;
        }
        
        // 3. 执行签到
        const signResult = await performSign(cookie);
        
        // 4. 发送通知
        if (signResult.success) {
            $notification.post(
                CONFIG.notifyTitle,
                "签到成功",
                `签到时间：${new Date().toLocaleString()}\n${signResult.message || "签到成功！"}`
            );
        } else {
            $notification.post(
                CONFIG.notifyTitle,
                "签到失败",
                `失败原因：${signResult.message || "未知错误"}\n请检查Cookie是否有效`
            );
        }
        
    } catch (error) {
        // 错误处理
        $notification.post(
            CONFIG.notifyTitle,
            "脚本执行出错",
            `错误信息：${error.message}\n请检查网络连接或脚本配置`
        );
    } finally {
        $done();
    }
})();

// 检查签到状态函数
async function checkSignStatus(cookie) {
    const headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br"
    };
    
    return new Promise((resolve, reject) => {
        $httpClient.get({
            url: CONFIG.checkUrl,
            headers: headers
        }, (error, response, data) => {
            if (error) {
                reject(new Error(`检查状态失败：${error}`));
                return;
            }
            
            if (response.status !== 200) {
                reject(new Error(`HTTP ${response.status}`));
                return;
            }
            
            // 解析页面，查找签到状态
            // 这里需要根据52pojie的实际页面结构进行调整
            const result = {
                alreadySigned: false,
                continuousDays: 0
            };
            
            // 简单的签到状态检测（根据常见页面特征）
            if (data.includes("今日已签到") || data.includes("已签到") || data.includes("签到成功")) {
                result.alreadySigned = true;
                
                // 尝试提取连续签到天数
                const continuousMatch = data.match(/连续签到\s*(\d+)\s*天/);
                if (continuousMatch) {
                    result.continuousDays = parseInt(continuousMatch[1]);
                }
            }
            
            resolve(result);
        });
    });
}

// 执行签到函数
async function performSign(cookie) {
    const headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.52pojie.cn/",
        "Origin": "https://www.52pojie.cn"
    };
    
    return new Promise((resolve, reject) => {
        $httpClient.post({
            url: CONFIG.signUrl,
            headers: headers,
            body: ""  // POST请求可能需要特定参数，根据实际情况调整
        }, (error, response, data) => {
            if (error) {
                reject(new Error(`签到请求失败：${error}`));
                return;
            }
            
            const result = {
                success: false,
                message: ""
            };
            
            // 根据响应判断签到结果
            if (response.status === 200) {
                if (data.includes("签到成功") || data.includes("已签到") || data.includes("任务已完成")) {
                    result.success = true;
                    result.message = "签到成功！";
                } else if (data.includes("今日已签到")) {
                    result.success = true;
                    result.message = "今日已签到过";
                } else {
                    result.message = `未知响应：${data.substring(0, 100)}...`;
                }
            } else {
                result.message = `HTTP ${response.status}`;
            }
            
            resolve(result);
        });
    });
}

// 辅助函数：获取Cookie（手动运行一次以设置Cookie）
function setupCookie() {
    // 这个函数需要手动运行一次来获取和保存Cookie
    $httpClient.get({
        url: "https://www.52pojie.cn/",
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        }
    }, (error, response, data) => {
        if (error) {
            $notification.post(
                CONFIG.notifyTitle,
                "获取Cookie失败",
                `错误：${error}`
            );
            $done();
            return;
        }
        
        // 从响应头中提取Cookie
        const cookies = response.headers["Set-Cookie"] || response.headers["set-cookie"];
        
        if (cookies) {
            // 保存Cookie
            $persistentStore.write(cookies, CONFIG.cookieKey);
            $notification.post(
                CONFIG.notifyTitle,
                "Cookie设置成功",
                "Cookie已保存，现在可以正常使用自动签到了"
            );
        } else {
            $notification.post(
                CONFIG.notifyTitle,
                "Cookie获取失败",
                "请确保已登录52pojie网站，然后重新运行此脚本"
            );
        }
        
        $done();
    });
}

// 如果需要手动设置Cookie，取消下面一行的注释并运行一次脚本
// setupCookie();
