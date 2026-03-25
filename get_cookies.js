/*
 *
 *
[rewrite_local]
# 网易云音乐 Cookie 获取（新版接口）
^https:\/\/music\.163\.com\/weapi\/user\/level url script-request-body https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/get_cookies.js

# 网易云音乐 Cookie 获取（旧版接口，备用）
^https:\/\/music\.163\.com\/weapi\/user\/get url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/get_cookies.js


[mitm]
hostname = music.163.com

*
*
*/

// 获取Cookie脚本
const cookieKey = "chavy_cookie_neteasemusic";

if ($request) {
  // 判断请求类型
  if ($request.url.includes("/weapi/user/level")) {
    // 新版接口
    const cookieData = {
      url: $request.url,
      headers: $request.headers,
      body: $request.body
    };
    $persistentStore.write(JSON.stringify(cookieData), cookieKey);
    $notification.post("网易云音乐", "新版Cookie获取成功", "请返回Quantumult X");
  } else if ($request.url.includes("/weapi/user/get")) {
    // 旧版接口
    const cookie = $request.headers["Cookie"] || $request.headers["cookie"];
    if (cookie) {
      $persistentStore.write(cookie, cookieKey);
      $notification.post("网易云音乐", "旧版Cookie获取成功", "请返回Quantumult X");
    }
  }
}

$done({});
