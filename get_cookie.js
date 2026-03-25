/*
 *
 *
[rewrite_local]
[rewrite_local]
# 从购买流程接口获取 Cookie
^https?:\/\/music\.163\.com\/eapi\/vipnewcenter\/app\/cashier\/buyflow url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/get_cookie.js


[mitm]
hostname = music.163.com

*
*
*/

// 网易云音乐 Cookie 获取脚本（从购买流程接口）
// 专门针对：http://music.163.com/eapi/vipnewcenter/app/cashier/buyflow
// Quantumult X 专用
// 保存为 get_cookie_buyflow.js

const cookieKey = "chavy_cookie_neteasemusic";
const cookieTypeKey = "chavy_cookie_type";

if ($request) {
  try {
    console.log(`🎯 捕获到购买流程接口请求: ${$request.url}`);
    
    // 提取 Cookie
    let cookie = "";
    
    // 尝试从不同位置获取 Cookie
    if ($request.headers) {
      // 优先从 headers 获取
      cookie = $request.headers["Cookie"] || 
               $request.headers["cookie"] || 
               $request.headers["X-Cookie"] ||
               $request.headers["x-cookie"];
    }
    
    // 如果 headers 中没有，尝试从 body 中提取（如果是 POST 请求）
    if (!cookie && $request.body) {
      try {
        const bodyStr = typeof $request.body === 'string' ? $request.body : JSON.stringify($request.body);
        // 尝试从 body 中提取 cookie 相关字段
        const cookieMatch = bodyStr.match(/"cookie"\s*:\s*"([^"]+)"/i) || 
                           bodyStr.match(/"Cookie"\s*:\s*"([^"]+)"/i);
        if (cookieMatch && cookieMatch[1]) {
          cookie = cookieMatch[1];
          console.log("✅ 从请求体中提取到 Cookie");
        }
      } catch (e) {
        console.log(`⚠️ 解析请求体失败: ${e}`);
      }
    }
    
    if (cookie) {
      // 清理 Cookie（移除多余的空格和换行）
      cookie = cookie.trim().replace(/\s+/g, ' ');
      
      // 保存 Cookie
      $persistentStore.write(cookie, cookieKey);
      
      // 标记为旧版格式（字符串格式）
      $persistentStore.write("old", cookieTypeKey);
      
      // 发送通知
      $notification.post(
        "🎵 网易云音乐", 
        "购买流程Cookie获取成功", 
        `Cookie长度: ${cookie.length}字符\n已保存，可执行签到`
      );
      
      console.log(`✅ Cookie保存成功，长度: ${cookie.length}`);
      console.log(`📋 Cookie前100字符: ${cookie.substring(0, 100)}...`);
      
      // 同时保存请求信息用于调试
      const debugInfo = {
        url: $request.url,
        method: $request.method,
        headers: Object.keys($request.headers || {}),
        timestamp: new Date().toISOString()
      };
      $persistentStore.write(JSON.stringify(debugInfo), "netease_debug_info");
      
    } else {
      $notification.post(
        "❌ 网易云音乐", 
        "Cookie获取失败", 
        "未找到Cookie字段\n请检查请求头"
      );
      console.log("❌ 未找到Cookie字段");
      console.log("📋 请求头Keys:", Object.keys($request.headers || {}));
    }
    
  } catch (e) {
    $notification.post(
      "❌ 网易云音乐", 
      "Cookie获取失败", 
      `错误: ${e.message || e}`
    );
    console.log(`❌ 获取Cookie失败: ${e}`);
    console.log(`🔍 错误详情:`, e);
  }
} else {
  console.log("⚠️ 未捕获到请求");
}

$done({});
