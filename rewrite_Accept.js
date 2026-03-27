/*
*
*
[rewrite_local]

^https://kelee\.one/Tool/Loon/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js

^https://ddgksf2013\.top/scripts/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js

[mitm]
hostname = kelee.one, ddgksf2013.top

*
*
*/


(function() {
  let headers = $request.headers;
  headers['User-Agent'] = 'Quantumult%20X/1.5.5 (iPhone14,3; iOS 16.3.1)';
  headers['X-Requested-With'] = 'Quantumult X';
  $done({ headers: headers });
})();

