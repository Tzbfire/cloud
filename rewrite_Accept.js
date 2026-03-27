/*
*
*
[rewrite_local]

*可莉网站重写
^https://kelee\.one/Tool/Loon/.* url script-request-header https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/rewrite_Accept.js


[mitm]
hostname = kelee.one

*
*
*/


(function() {
  let headers = $request.headers;
  headers['User-Agent'] = 'Loon/936 CFNetwork/1404.0.5 Darwin/22.3.0';
  $done({ headers: headers });
})();
