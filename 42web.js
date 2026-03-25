/*
*
*
Quantumult X 节点提取脚本 - 全自动Cookie更新+纯文本网页版
核心功能：自动解密生成__test Cookie → 提取文章 → 提取节点链接 → 纯文本网页展示
适配：iOS 圈X | 类型：script-response-body
使用：配置rewrite规则指向任意地址，访问即可触发纯文本结果

[rewrite_local]
^http://qx\.node/sub url script-analyze-echo-response https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/42web.js

[mitm]
hostname = qx.node


*
*
*/
// ===================== 配置区 =====================
const enableDetailLog = false;  // 详细日志开关
const baseUrl = "https://wap.42web.io";
const homeUrl = baseUrl + "/";
const PHPSESSID_FIXED = "7a359e8b4af4d6197e989d86fca7c2b2";  // 固定PHPSESSID
// ===================================================
// ===================== 页面原生工具函数 =====================
function toNumbers(d) {
    var e = [];
    d.replace(/(..)/g, function(d) {
        e.push(parseInt(d, 16));
    });
    return e;
}
function toHex() {
    for (var d = [], d = 1 == arguments.length && arguments[0].constructor == Array ? arguments[0] : arguments, e = "", f = 0; f < d.length; f++) 
        e += (16 > d[f] ? "0" : "") + d[f].toString(16);
    return e.toLowerCase();
}
// ===================== AES核心实现 =====================
const sbox = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];
const rsbox = [0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d];
const rcon = [0x8d,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];
function AES_decryptBlock(input, w) {
    let nb = 4;
    let nr = w.length / nb - 1;
    let state = [[], [], [], []];
    for (let i = 0; i < 4 * nb; i++) state[i % 4][Math.floor(i / 4)] = input[i];
    addRoundKey(state, w, nr, nb);
    for (let round = nr - 1; round > 0; round--) {
        invShiftRows(state, nb);
        invSubBytes(state, nb);
        addRoundKey(state, w, round, nb);
        invMixColumns(state, nb);
    }
    invShiftRows(state, nb);
    invSubBytes(state, nb);
    addRoundKey(state, w, 0, nb);
    let output = [];
    for (let i = 0; i < 4 * nb; i++) output[i] = state[i % 4][Math.floor(i / 4)];
    return output;
}
function invSubBytes(state, nb) {
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < nb; j++)
            state[i][j] = rsbox[state[i][j]];
}
function invShiftRows(state, nb) {
    let temp = [];
    for (let i = 1; i < 4; i++) {
        for (let j = 0; j < 4; j++) temp[(j + i) % nb] = state[i][j];
        for (let j = 0; j < 4; j++) state[i][j] = temp[j];
    }
}
function galoisMult(a, b) {
    let p = 0;
    let hiBitSet;
    for (let i = 0; i < 8; i++) {
        if ((b & 1) == 1) p ^= a;
        hiBitSet = a & 0x80;
        a <<= 1;
        if (hiBitSet == 0x80) a ^= 0x1b;
        b >>= 1;
    }
    return p & 0xff;
}
function invMixColumns(state, nb) {
    for (let j = 0; j < nb; j++) {
        let s0 = state[0][j], s1 = state[1][j], s2 = state[2][j], s3 = state[3][j];
        state[0][j] = galoisMult(s0, 0xe) ^ galoisMult(s1, 0xb) ^ galoisMult(s2, 0xd) ^ galoisMult(s3, 0x9);
        state[1][j] = galoisMult(s0, 0x9) ^ galoisMult(s1, 0xe) ^ galoisMult(s2, 0xb) ^ galoisMult(s3, 0xd);
        state[2][j] = galoisMult(s0, 0xd) ^ galoisMult(s1, 0x9) ^ galoisMult(s2, 0xe) ^ galoisMult(s3, 0xb);
        state[3][j] = galoisMult(s0, 0xb) ^ galoisMult(s1, 0xd) ^ galoisMult(s2, 0x9) ^ galoisMult(s3, 0xe);
    }
}
function addRoundKey(state, w, round, nb) {
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < nb; j++)
            state[i][j] ^= w[round * nb + j][i];
}
function keyExpansion(key) {
    let nb = 4;
    let nk = key.length / 4;
    let nr = nk + 6;
    let w = [];
    let temp = [];
    for (let i = 0; i < nk; i++) {
        w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
    }
    for (let i = nk; i < nb * (nr + 1); i++) {
        w[i] = [];
        for (let t = 0; t < 4; t++) temp[t] = w[i - 1][t];
        if (i % nk == 0) {
            let t = temp[0];
            for (let j = 0; j < 3; j++) temp[j] = temp[j + 1];
            temp[3] = t;
            for (let j = 0; j < 4; j++) temp[j] = sbox[temp[j]];
            temp[0] ^= rcon[i / nk];
        } else if (nk > 6 && i % nk == 4) {
            for (let j = 0; j < 4; j++) temp[j] = sbox[temp[j]];
        }
        for (let j = 0; j < 4; j++) w[i][j] = w[i - nk][j] ^ temp[j];
    }
    return w;
}
function PKCS7_unpad(data) {
    let padLen = data[data.length - 1];
    if (padLen < 1 || padLen > 16) return data;
    return data.slice(0, data.length - padLen);
}
function slowAES_decrypt(ciphertext, mode, key, iv) {
    let blockSize = 16;
    let keySchedule = keyExpansion(key);
    let plaintext = [];
    let cipherBlocks = [];
    let blockCount = Math.ceil(ciphertext.length / blockSize);
    for (let i = 0; i < blockCount; i++) {
        cipherBlocks[i] = ciphertext.slice(i * blockSize, (i + 1) * blockSize);
    }
    if (mode == 2) {
        let prevBlock = iv.slice();
        for (let i = 0; i < blockCount; i++) {
            let decrypted = AES_decryptBlock(cipherBlocks[i], keySchedule);
            for (let j = 0; j < blockSize; j++) plaintext.push(decrypted[j] ^ prevBlock[j]);
            prevBlock = cipherBlocks[i].slice();
        }
    } else {
        for (let i = 0; i < blockCount; i++) {
            let decrypted = AES_decryptBlock(cipherBlocks[i], keySchedule);
            plaintext = plaintext.concat(decrypted);
        }
    }
    return PKCS7_unpad(plaintext);
}
// 日志控制
function detailLog(msg) {
    if (enableDetailLog) console.log(msg);
}
// 核心执行逻辑
console.log("==================== 脚本启动 ====================");
console.log("详细日志状态：" + (enableDetailLog ? "已开启" : "已关闭"));

// 初始化纯文本返回内容
let textContent = "";
// 第一步：请求首页获取挑战
$task.fetch({
    url: homeUrl,
    method: "GET",
    headers: {
        "Host": "wap.42web.io",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }
}).then(firstRes => {
    console.log("==================== 首页请求完成 ====================");
    console.log("首页响应状态码：" + firstRes.statusCode);
    detailLog("首页响应内容：\n" + firstRes.body);
    // 检查是否是挑战页面
    const reg = /var a=toNumbers\("([0-9a-fA-F]+)"\),b=toNumbers\("([0-9a-fA-F]+)"\),c=toNumbers\("([0-9a-fA-F]+)"\);/;
    const match = firstRes.body.match(reg);
    
    var testValue;
    var fullCookie;
    
    if (!match || match.length < 4) {
        // 没有挑战页面，说明Cookie还有效，直接使用固定Cookie
        console.log("未检测到挑战页面，使用固定Cookie");
        testValue = "a66889974ceffbddf7a0a880efece1a5";
        fullCookie = `__test=${testValue}; PHPSESSID=${PHPSESSID_FIXED}`;
    } else {
        const [, aHex, bHex, cHex] = match;
        console.log("提取到 a(key)：" + aHex);
        console.log("提取到 b(iv)：" + bHex);
        detailLog("提取到 c(密文)：" + cHex);
        // 解密生成__test
        testValue = toHex(slowAES_decrypt(toNumbers(cHex), 2, toNumbers(aHex), toNumbers(bHex)));
        if (!testValue || testValue.length !== 32) {
            throw new Error("解密失败，生成的__test无效：" + testValue);
        }
        
        fullCookie = `__test=${testValue}; PHPSESSID=${PHPSESSID_FIXED}`;
        console.log("解密成功，__test：" + testValue);
    }
    detailLog("完整Cookie：" + fullCookie);
    // 第二步：使用新Cookie请求首页获取文章列表
    console.log("==================== 使用新Cookie请求首页 ====================");
    return $task.fetch({
        url: homeUrl,
        method: "GET",
        headers: {
            "Host": "wap.42web.io",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Cookie": fullCookie,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive"
        }
    }).then(homeRes => {
        return { homeRes, fullCookie, testValue };
    });
}).then(({ homeRes, fullCookie, testValue }) => {
    console.log("首页请求状态码：" + homeRes.statusCode);
    
    if (homeRes.statusCode < 200 || homeRes.statusCode >= 300) {
        throw new Error("首页请求失败，状态码：" + homeRes.statusCode);
    }
    
    const homeHtml = homeRes.body;
    detailLog("首页HTML：\n" + homeHtml);
    // 第三步：提取文章列表
    console.log("==================== 提取文章列表 ====================");
    const idRegex = /<h2[^>]*>\s*<a\s+href="index\.php\?act=pl(?:&|&amp;)id=(\d+)"[^>]*>([^<]+)<\/a>\s*<\/h2>/gi;
    const articleList = [];
    let idMatch;
    while ((idMatch = idRegex.exec(homeHtml)) !== null) {
        const articleId = idMatch[1];
        const articleTitle = idMatch[2].trim();
        detailLog("命中文章 | ID：" + articleId + " | 标题：" + articleTitle);
        articleList.push({
            id: articleId,
            title: articleTitle,
            url: baseUrl + "/index.php?act=pl&id=" + articleId
        });
    }
    if (articleList.length === 0) {
        throw new Error("未匹配到任何文章");
    }
    
    console.log("文章匹配完成，共找到" + articleList.length + "篇有效文章");
    // 第四步：批量请求详情页
    console.log("==================== 批量请求详情页 ====================");
    const detailRequestList = articleList.map(article => {
        detailLog("准备请求：" + article.title);
        return $task.fetch({
            url: article.url,
            method: "GET",
            headers: {
                "Host": "wap.42web.io",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Cookie": fullCookie,
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                "Connection": "keep-alive"
            }
        }).then(detailRes => {
            return { success: true, article: article, html: detailRes.body };
        }).catch(error => {
            return { success: false, article: article, errorMsg: error.error || "未知错误" };
        });
    });
    return Promise.all(detailRequestList).then(detailResults => {
        return { detailResults, testValue };
    });
}).then(({ detailResults, testValue }) => {
    // 第五步：提取节点链接
    console.log("==================== 提取节点链接 ====================");
    const resultList = [];
    const allNodes = new Set();
    const titleRegex = /<h1[^>]*>([^<]+)<\/h1>/i;
    const contentRegex = /<div class="text"[^>]*>([\s\S]*?)<\/div>/gi;
    const linkRegex = /[a-zA-Z0-9]+:\/\/[^\s<"\n]+/gi;
    detailResults.forEach(result => {
        const article = result.article;
        if (!result.success) {
            const errorInfo = "【" + article.title + "】请求失败：" + result.errorMsg;
            console.log(errorInfo);
            resultList.push(errorInfo);
            return;
        }
        detailLog("【" + article.title + "】请求成功，开始提取内容");
        const html = result.html;
        // 提取详情页真实标题
        let finalTitle = article.title;
        const titleMatch = html.match(titleRegex);
        if (titleMatch && titleMatch[1]) {
            finalTitle = titleMatch[1].trim();
        }
        // 提取正文内容&节点链接
        let contentList = [];
        let contentMatch;
        while ((contentMatch = contentRegex.exec(html)) !== null) {
            const rawContent = contentMatch[1];
            const fixedContent = rawContent.replace(/&amp;/g, "&");
            
            let linkMatch;
            while ((linkMatch = linkRegex.exec(fixedContent)) !== null) {
                const nodeLink = linkMatch[0].trim();
                detailLog("命中节点链接：" + nodeLink);
                contentList.push(nodeLink);
                allNodes.add(nodeLink);
            }
        }
        // 整理单篇结果（纯文本）
        let articleResult = "【" + finalTitle + "】";
        if (contentList.length === 0) {
            articleResult += "\n未提取到有效链接";
        } else {
            articleResult += "\n" + contentList.join("\n");
        }
        resultList.push(articleResult);
    });
    // 第六步：拼接纯文本结果（核心改造）
    console.log("==================== 最终提取结果 ====================");
    console.log("共提取到" + allNodes.size + "个有效节点");
    // 纯文本头部信息
    textContent = `节点提取${allNodes.size > 0 ? '成功' : '完成'}\n`;
    textContent += `=============================================\n`;
    textContent += `Cookie：__test=${testValue}; PHPSESSID=${PHPSESSID_FIXED}\n`;
    textContent += `统计信息：共${detailResults.length}篇文章 | 有效节点${allNodes.size}个\n`;
    textContent += `=============================================\n\n`;
    // 拼接各文章结果
    textContent += resultList.join("\n\n");
}).catch(globalError => {
    // 异常处理：纯文本错误信息
    const errorMsg = globalError.error || globalError.message || String(globalError);
    console.log("【全局异常】脚本执行失败：" + errorMsg);
    textContent = `节点提取失败\n`;
    textContent += `=============================================\n`;
    textContent += `错误原因：${errorMsg}\n`;
    textContent += `=============================================\n`;
}).finally(() => {
    // 最终返回纯文本（设置Content-Type为text/plain）
    $done({
        status: "HTTP/1.1 200 OK",
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
        },
        body: textContent.trim()
    });
});
