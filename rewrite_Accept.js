/*
*
*
https://kelee\.one/Tool/Loon/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js
https://ddgksf2013\.top/scripts/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js


[rewrite_local]
^https://(kelee\.one/Tool/Loon/|ddgksf2013\.top/scripts/).* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js

[mitm]
hostname = kelee.one, ddgksf2013.top

*
*
*/


(function() {
  let headers = $request.headers;
  let url = $request.url;

  // 1. kelee.one
  if (url.indexOf('kelee.one/Tool/Loon/') !== -1) {
    headers['User-Agent'] = 'Loon/936 CFNetwork/1404.0.5 Darwin/22.3.0';
  }

  // 2. ddgksf2013.top
  if (url.indexOf('ddgksf2013.top/scripts/') !== -1) {
    headers['User-Agent'] = 'Quantumult%20X/1.5.5 (iPhone14,3; iOS 16.3.1)';
    headers['X-Requested-With'] = 'Quantumult X';
  }

  // 3. 新增示例1：只改UA
  if (url.indexOf('新域名/路径') !== -1) {
    headers['User-Agent'] = '这里写新UA';
  }

  // 4. 新增示例2：改UA+其他头
  if (url.indexOf('另一个域名/路径') !== -1) {
    headers['User-Agent'] = '新UA';
    headers['X-Requested-With'] = 'XXX';
  }

  $done({ headers });
})();
