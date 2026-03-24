/*
 *
 *
# Quantumult X 重写规则
# 功能：监控指定API返回的JSON数据，当指定字段满足条件时发送通知。
# 配置说明：将以下全部内容复制到Quantumult X的“重写”规则部分即可。

[rewrite_local]
# 匹配目标URL
^https:\/\/mcs-mimp-web\.sf-express\.com\/mcs-mimp\/integralPlanet\/getCxAdvertiseList url script-response-body https://raw.githubusercontent.com/yourname/yourrepo/main/script.js
# 如果需要MitM解密HTTPS流量，请确保主机名在MitM列表中
# 主机名：mcs-mimp-web.sf-express.com

[mitm]
hostname = mcs-mimp-web.sf-express.com


*
*
*/

// 脚本名称：监控顺丰广告列表状态
// 作者：元宝
// 描述：监控 getCxAdvertiseList 接口返回的JSON数据，当指定字段匹配条件时，发送通知提醒。
// 更新时间：2026年3月24日
// Quantumult X 响应体脚本 (script-response-body)

// 获取请求的Cookie
var cookie = $request.headers['Cookie'];
var sessionId = null;
if (cookie) {
    // 使用正则表达式从Cookie中提取sessionId的值
    var match = cookie.match(/sessionId=([^;]+)/);
    if (match && match[1]) {
        sessionId = match[1];
    }
}

// 尝试解析响应体为JSON
try {
    var obj = JSON.parse($response.body);

    // ****** 用户配置区域开始 ******
    // 请修改以下三个变量来定义你的监控逻辑
    var targetField = "data.advertiseList[0].status"; // 要监控的JSON字段路径，支持点号和数组索引
    var expectedValue = 1; // 期望匹配的值。可以是数字、字符串或布尔值。当actualValue == expectedValue 时触发通知。
    var checkEquality = true; // 为true时，检查是否相等 (==)；为false时，检查是否不相等 (!=)
    // ****** 用户配置区域结束 ******

    // 通用函数：根据路径获取嵌套对象的值
    function getValueByPath(obj, path) {
        return path.split('.').reduce(function(prev, curr) {
            // 处理数组索引，例如 "advertiseList[0]"
            var arrayMatch = curr.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch && prev) {
                var arrayName = arrayMatch[1];
                var arrayIndex = parseInt(arrayMatch[2], 10);
                return prev[arrayName] && prev[arrayName][arrayIndex];
            } else {
                return prev ? prev[curr] : undefined;
            }
        }, obj);
    }

    var actualValue = getValueByPath(obj, targetField);
    var shouldNotify = false;
    var conditionMet = false;

    if (checkEquality) {
        conditionMet = (actualValue == expectedValue); // 使用 == 进行宽松比较，适用于数字/字符串匹配
        shouldNotify = conditionMet;
    } else {
        conditionMet = (actualValue != expectedValue);
        shouldNotify = conditionMet;
    }

    if (shouldNotify) {
        // 构建通知消息
        var notificationTitle = "🔔 监控目标已触发";
        var notificationSubtitle = "路径: " + targetField;
        var notificationBody = "当前值: " + JSON.stringify(actualValue) + 
                             "\n期望值: " + JSON.stringify(expectedValue) + 
                             "\n条件: " + (checkEquality ? "等于" : "不等于") + 
                             "\n时间: " + new Date().toLocaleString('zh-CN');
        if (sessionId) {
            notificationBody += "\n会话ID: " + sessionId.substring(0, 8) + "..."; // 避免泄露过长敏感信息
        }

        // 发送Quantumult X通知
        $notify(notificationTitle, notificationSubtitle, notificationBody);
    }

    // 最后，必须将原始的响应体传递下去，不修改任何内容
    $done({});

} catch (e) {
    // 如果JSON解析或处理出错，记录日志并原样返回响应
    $notify("⚠️ 脚本执行出错", "监控 getCxAdvertiseList", "错误信息: " + e.message);
    $done({});
}

