/*
*
*

[rewrite_local]
^http://qx\.node/sub url script-analyze-echo-response https://raw.githubusercontent.com/Tzbfire/cloud/refs/heads/main/43web.js

[mitm]
hostname = qx.node

*
*
*/

/*
Quantumult X 节点提取脚本 - 全自动Cookie更新+纯文本网页版
核心功能：自动解密生成__test Cookie → 提取文章 → 提取节点链接 → 纯文本网页展示
适配：iOS 圈X | 类型：script-response-body
使用：配置rewrite规则指向任意地址，访问即可触发纯文本结果
*/


// ===================== 用户配置区 =====================
const CONFIG = {
    // 目标网站
    baseUrl: "https://wap.42web.io",
    
    // 固定Cookie（如失效需更新）
    phpSessId: "7a359e8b4af4d6197e989d86fca7c2b2",
    
    // 输出格式: "text" | "html" | "base64" | "yaml"
    outputFormat: "text",
    
    // 日志级别: 0=错误, 1=基本信息, 2=详细调试
    logLevel: 0,
    
    // 请求超时(毫秒)
    timeout: 15000,
    
    // User-Agent
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1"
};

// ===================== 工具函数 =====================
const Utils = {
    log(level, msg) {
        if (level <= CONFIG.logLevel) console.log(msg);
    },
    
    // 十六进制转换
    hexToBytes(hex) {
        const bytes = [];
        hex.replace(/(..)/g, (_, pair) => {
            bytes.push(parseInt(pair, 16));
        });
        return bytes;
    },
    
    bytesToHex(bytes) {
        return bytes.map(b => (b < 16 ? '0' : '') + b.toString(16)).join('');
    },
    
    // Base64 编码
    encodeBase64(str) {
        return $text.base64Encode(str);
    },
    
    // 创建标准HTTP响应
    createResponse(body, type = "text") {
        const mimeTypes = {
            text: "text/plain; charset=utf-8",
            html: "text/html; charset=utf-8",
            base64: "text/plain; charset=utf-8",
            yaml: "text/yaml; charset=utf-8"
        };
        
        return {
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": mimeTypes[type] || mimeTypes.text,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            },
            body: body
        };
    }
};

// ===================== AES 解密模块 =====================
const AES = (() => {
    // S盒和逆S盒
    const SBOX = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];
    const RSBOX = [0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d];
    const RCON = [0x8d,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];
    
    // 伽罗华域乘法
    function gmul(a, b) {
        let p = 0;
        for (let i = 0; i < 8; i++) {
            if (b & 1) p ^= a;
            const hi = a & 0x80;
            a = (a << 1) & 0xff;
            if (hi) a ^= 0x1b;
            b >>= 1;
        }
        return p;
    }
    
    // 密钥扩展
    function keyExpansion(key) {
        const nk = key.length / 4;
        const nr = nk + 6;
        const w = [];
        
        for (let i = 0; i < nk; i++) {
            w[i] = key.slice(i * 4, i * 4 + 4);
        }
        
        for (let i = nk; i < 4 * (nr + 1); i++) {
            let temp = [...w[i - 1]];
            
            if (i % nk === 0) {
                temp.push(temp.shift());
                temp = temp.map(b => SBOX[b]);
                temp[0] ^= RCON[i / nk];
            } else if (nk > 6 && i % nk === 4) {
                temp = temp.map(b => SBOX[b]);
            }
            
            w[i] = w[i - nk].map((b, j) => b ^ temp[j]);
        }
        
        return w;
    }
    
    // 解密单块
    function decryptBlock(input, w) {
        const nb = 4;
        const nr = w.length / nb - 1;
        const state = Array.from({length: 4}, (_, i) => 
            Array.from({length: nb}, (_, j) => input[i + j * 4])
        );
        
        // 轮密钥加
        function addRoundKey(round) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < nb; j++) {
                    state[i][j] ^= w[round * nb + j][i];
                }
            }
        }
        
        // 逆字节替换
        function invSubBytes() {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < nb; j++) {
                    state[i][j] = RSBOX[state[i][j]];
                }
            }
        }
        
        // 逆行移位
        function invShiftRows() {
            for (let i = 1; i < 4; i++) {
                const row = state[i];
                state[i] = [...row.slice(-i), ...row.slice(0, -i)];
            }
        }
        
        // 逆列混淆
        function invMixColumns() {
            for (let j = 0; j < nb; j++) {
                const s = [0, 1, 2, 3].map(i => state[i][j]);
                state[0][j] = gmul(s[0], 0xe) ^ gmul(s[1], 0xb) ^ gmul(s[2], 0xd) ^ gmul(s[3], 0x9);
                state[1][j] = gmul(s[0], 0x9) ^ gmul(s[1], 0xe) ^ gmul(s[2], 0xb) ^ gmul(s[3], 0xd);
                state[2][j] = gmul(s[0], 0xd) ^ gmul(s[1], 0x9) ^ gmul(s[2], 0xe) ^ gmul(s[3], 0xb);
                state[3][j] = gmul(s[0], 0xb) ^ gmul(s[1], 0xd) ^ gmul(s[2], 0x9) ^ gmul(s[3], 0xe);
            }
        }
        
        addRoundKey(nr);
        
        for (let round = nr - 1; round > 0; round--) {
            invShiftRows();
            invSubBytes();
            addRoundKey(round);
            invMixColumns();
        }
        
        invShiftRows();
        invSubBytes();
        addRoundKey(0);
        
        return Array.from({length: 16}, (_, i) => state[i % 4][Math.floor(i / 4)]);
    }
    
    // CBC模式解密
    function decrypt(ciphertext, key, iv) {
        const blocks = [];
        for (let i = 0; i < ciphertext.length; i += 16) {
            blocks.push(ciphertext.slice(i, i + 16));
        }
        
        const w = keyExpansion(key);
        let prev = [...iv];
        const plaintext = [];
        
        for (const block of blocks) {
            const decrypted = decryptBlock(block, w);
            plaintext.push(...decrypted.map((b, i) => b ^ prev[i]));
            prev = [...block];
        }
        
        // PKCS7 去填充
        const padLen = plaintext[plaintext.length - 1];
        if (padLen > 0 && padLen <= 16) {
            return plaintext.slice(0, -padLen);
        }
        return plaintext;
    }
    
    return { decrypt };
})();

// ===================== HTTP 请求模块 =====================
const Http = {
    defaultHeaders(cookie = "") {
        const headers = {
            "Host": "wap.42web.io",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": CONFIG.ua,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive"
        };
        if (cookie) headers["Cookie"] = cookie;
        return headers;
    },
    
    async get(url, cookie = "") {
        return new Promise((resolve, reject) => {
            $task.fetch({
                url: url,
                method: "GET",
                headers: this.defaultHeaders(cookie),
                timeout: CONFIG.timeout
            }).then(resolve).catch(reject);
        });
    }
};

// ===================== 节点提取器 =====================
const NodeExtractor = {
    // 从HTML中提取挑战参数
    extractChallenge(html) {
        const reg = /var a=toNumbers\("([0-9a-fA-F]+)"\),b=toNumbers\("([0-9a-fA-F]+)"\),c=toNumbers\("([0-9a-fA-F]+)"\);/;
        const match = html.match(reg);
        return match ? {
            key: Utils.hexToBytes(match[1]),
            iv: Utils.hexToBytes(match[2]),
            cipher: Utils.hexToBytes(match[3])
        } : null;
    },
    
    // 解密获取 __test cookie
    decryptCookie(challenge) {
        const decrypted = AES.decrypt(challenge.cipher, challenge.key, challenge.iv);
        const testValue = Utils.bytesToHex(decrypted);
        
        if (!testValue || testValue.length !== 32) {
            throw new Error(`解密失败，无效值: ${testValue}`);
        }
        
        return testValue;
    },
    
    // 提取文章列表
    extractArticles(html) {
        const regex = /<h2[^>]*>\s*<a\s+href="index\.php\?act=pl(?:&|&amp;)id=(\d+)"[^>]*>([^<]+)<\/a>\s*<\/h2>/gi;
        const articles = [];
        let match;
        
        while ((match = regex.exec(html)) !== null) {
            articles.push({
                id: match[1],
                title: match[2].trim(),
                url: `${CONFIG.baseUrl}/index.php?act=pl&id=${match[1]}`
            });
        }
        
        return articles;
    },
    
    // 从详情页提取节点
    extractNodes(html) {
        const nodes = new Set();
        
        // 提取正文
        const contentRegex = /<div class="text"[^>]*>([\s\S]*?)<\/div>/gi;
        const linkRegex = /[a-zA-Z0-9]+:\/\/[^\s<"\n]+/gi;
        
        let contentMatch;
        while ((contentMatch = contentRegex.exec(html)) !== null) {
            const content = contentMatch[1].replace(/&amp;/g, "&");
            let linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                nodes.add(linkMatch[0].trim());
            }
        }
        
        return Array.from(nodes);
    }
};

// ===================== 格式化输出 =====================
const Formatter = {
    // 纯文本格式
    text(articles, allNodes, cookie) {
        const lines = [
            `节点提取${allNodes.length > 0 ? '成功' : '完成'}`,
            `=============================================`,
            `Cookie: __test=${cookie}; PHPSESSID=${CONFIG.phpSessId}`,
            `统计: ${articles.length}篇文章 | ${allNodes.length}个节点`,
            `=============================================`,
            ""
        ];
        
        articles.forEach(article => {
            lines.push(`【${article.title}】`);
            if (article.nodes.length === 0) {
                lines.push("未提取到有效链接");
            } else {
                lines.push(...article.nodes);
            }
            lines.push("");
        });
        
        return lines.join("\n");
    },
    
    // HTML 格式
    html(articles, allNodes, cookie) {
        const articleHtml = articles.map(a => `
            <div class="article">
                <h3>${a.title}</h3>
                <div class="nodes">
                    ${a.nodes.map(n => `<div class="node">${n}</div>`).join('') || '<p class="empty">无节点</p>'}
                </div>
            </div>
        `).join('');
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>节点订阅 - ${allNodes.length}个节点</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; padding: 20px; background: #f5f5f5; }
        .header { background: #007AFF; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; margin-bottom: 8px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .article { background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .article h3 { font-size: 16px; color: #333; margin-bottom: 12px; }
        .node { background: #f0f0f0; padding: 10px 12px; border-radius: 8px; margin: 6px 0; font-family: monospace; font-size: 12px; word-break: break-all; color: #555; }
        .empty { color: #999; font-style: italic; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>节点订阅</h1>
        <p>共 ${allNodes.length} 个节点 | ${articles.length} 篇文章</p>
    </div>
    ${articleHtml}
    <div class="footer">Generated by QX Node Extractor</div>
</body>
</html>`;
    },
    
    // Base64 订阅格式（标准格式）
    base64(allNodes) {
        const nodeStr = allNodes.join("\n");
        return Utils.encodeBase64(nodeStr);
    },
    
    // YAML 格式 (Clash)
    yaml(allNodes) {
        // 简单转换，实际使用可能需要更复杂的解析
        const proxies = allNodes.map((node, i) => {
            // 这里简化处理，实际应根据节点类型解析
            return `  - {name: "Node${i+1}", server: "server", port: 443, type: auto}`;
        });
        
        return `proxies:\n${proxies.join("\n")}`;
    }
};

// ===================== 主程序 =====================
async function main() {
    Utils.log(1, "=== 节点提取脚本启动 ===");
    
    try {
        // 1. 请求首页，检测是否需要解密
        Utils.log(1, "[1/4] 请求首页...");
        const homeRes = await Http.get(CONFIG.baseUrl + "/");
        Utils.log(2, `首页响应: ${homeRes.statusCode}`);
        
        // 2. 处理Cookie
        let testCookie;
        const challenge = NodeExtractor.extractChallenge(homeRes.body);
        
        if (challenge) {
            Utils.log(1, "[2/4] 检测到挑战页面，开始解密...");
            testCookie = NodeExtractor.decryptCookie(challenge);
            Utils.log(1, `解密成功: __test=${testCookie}`);
        } else {
            Utils.log(1, "[2/4] 未检测到挑战，使用固定Cookie");
            testCookie = "a66889974ceffbddf7a0a880efece1a5"; // 备用值
        }
        
        const fullCookie = `__test=${testCookie}; PHPSESSID=${CONFIG.phpSessId}`;
        
        // 3. 再次请求首页获取文章列表
        Utils.log(1, "[3/4] 获取文章列表...");
        const listRes = await Http.get(CONFIG.baseUrl + "/", fullCookie);
        
        if (listRes.statusCode < 200 || listRes.statusCode >= 300) {
            throw new Error(`首页请求失败: ${listRes.statusCode}`);
        }
        
        const articles = NodeExtractor.extractArticles(listRes.body);
        Utils.log(1, `找到 ${articles.length} 篇文章`);
        
        if (articles.length === 0) {
            throw new Error("未找到任何文章");
        }
        
        // 4. 并发请求详情页
        Utils.log(1, "[4/4] 抓取详情页...");
        const articleDetails = await Promise.all(
            articles.map(async article => {
                try {
                    const res = await Http.get(article.url, fullCookie);
                    const nodes = NodeExtractor.extractNodes(res.body);
                    return { ...article, nodes };
                } catch (e) {
                    Utils.log(0, `获取失败 [${article.title}]: ${e.message}`);
                    return { ...article, nodes: [], error: e.message };
                }
            })
        );
        
        // 5. 汇总所有节点
        const allNodes = articleDetails.flatMap(a => a.nodes);
        Utils.log(1, `提取完成: ${allNodes.length} 个节点`);
        
        // 6. 格式化输出
        let output;
        switch (CONFIG.outputFormat) {
            case "html":
                output = Formatter.html(articleDetails, allNodes, testCookie);
                break;
            case "base64":
                output = Formatter.base64(allNodes);
                break;
            case "yaml":
                output = Formatter.yaml(allNodes);
                break;
            case "text":
            default:
                output = Formatter.text(articleDetails, allNodes, testCookie);
        }
        
        Utils.log(1, "=== 执行成功 ===");
        $done(Utils.createResponse(output, CONFIG.outputFormat));
        
    } catch (error) {
        Utils.log(0, `执行失败: ${error.message}`);
        const errorOutput = CONFIG.outputFormat === "html" 
            ? `<h1>错误</h1><p>${error.message}</p>`
            : `错误: ${error.message}`;
        $done(Utils.createResponse(errorOutput, CONFIG.outputFormat));
    }
}

// 启动
main();
