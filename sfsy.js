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
// 优化版：只有三个值都找到时才发送通知
(function() {
    var request = $request;
    var headers = request.headers;
    
    // 提取函数
    function extractCookieValue(cookieString, keyName) {
        if (!cookieString) return null;
        var regex = new RegExp(keyName + '=([^;]+)');
        var match = cookieString.match(regex);
        return match ? match[1] : null;
    }
    
    // 获取Cookie字符串
    var cookieStr = headers.Cookie || headers.cookie || '';
    
    // 提取三个参数
    var sessionId = extractCookieValue(cookieStr, 'sessionId');
    var loginMobile = extractCookieValue(cookieStr, '_login_mobile_');
    var loginUserId = extractCookieValue(cookieStr, '_login_user_id_');
    
    // 只有三个值都找到时才发送通知
    if (sessionId && loginMobile && loginUserId) {
        var notificationBody = 
            "sessionId: " + sessionId + ";" +
            "_login_mobile_: " + loginMobile + ";" +
            "_login_user_id_: " + loginUserId;
        
        $notify("顺丰参数", "已获取全部参数", notificationBody);
    }
    
    $done({});
})();
