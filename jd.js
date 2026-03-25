// QuanX 脚本：节点监控 (正文优先版 - 修复提取错误)
// 修正：优先匹配 <div class="text">，避免抓取到 meta 中的截断数据

const $ = new Env('节点监控 - 正文优先');

// ✅ 已内置你的 Cookie
const MY_COOKIE = "PHPSESSID=7a359e8b4af4d6197e989d86fca7c2b2; __test=16276b7e12b02906a34245f34b5e1660";

const HOME_URL = 'http://wap.42web.io/';
const BASE_DOMAIN = 'http://wap.42web.io';
const LAST_ID_KEY = 'Latest_Node_ID_42web';

// --- 存储兼容函数 ---
function getStorage(key) {
    if (typeof $prefs !== 'undefined' && typeof $prefs.getVal === 'function') {
        return $prefs.getVal(key);
    }
    if (typeof $persistentStore !== 'undefined') {
        return $persistentStore.read(key);
    }
    return null;
}

function setStorage(key, val) {
    if (typeof $prefs !== 'undefined' && typeof $prefs.setVal === 'function') {
        $prefs.setVal(key, val);
        return true;
    }
    if (typeof $persistentStore !== 'undefined') {
        $persistentStore.write(val, key);
        return true;
    }
    return false;
}

async function main() {
    $.log('=== 开始任务 (正文优先模式) ===');

    try {
        // 1. 请求首页
        let homeResp = await httpGet(HOME_URL);
        if (homeResp.status !== 200) throw new Error(`首页请求失败：${homeResp.status}`);
        if (homeResp.body.includes("aes.js")) {
            $.notify('⚠️ Cookie 失效', '网站返回验证页面', '请更新 Cookie');
            return;
        }

        // 2. 解析 ID
        let idMatches = homeResp.body.match(/index\.php\?act=pl&id=(\d+)/g);
        if (!idMatches || idMatches.length === 0) {
            $.notify('解析失败', '首页未找到 ID', '');
            return;
        }

        let allIds = [...new Set(idMatches.map(url => parseInt(url.match(/\d+$/)[0])))];
        allIds.sort((a, b) => a - b);
        $.log(`首页找到 ${allIds.length} 个 ID: ${allIds.join(', ')}`);

        // 3. 过滤新 ID
        let lastRecordedId = parseInt(getStorage(LAST_ID_KEY) || '0');
        let newIds = allIds.filter(id => id > lastRecordedId);
        
        if (newIds.length === 0) {
            $.log('没有新 ID，任务结束。');
            $.done();
            return;
        }

        $.log(`发现 ${newIds.length} 个新 ID: ${newIds.join(', ')}`);

        // 4. 遍历抓取
        let foundLinks = [];
        let currentMaxId = lastRecordedId;

        for (let id of newIds) {
            let detailUrl = `${BASE_DOMAIN}/index.php?act=pl&id=${id}`;
            $.log(`正在抓取 ID ${id}...`);

            let detailResp = await httpGet(detailUrl);
            if (detailResp.status !== 200) continue;
            
            let detailHtml = detailResp.body;
            if (id > currentMaxId) currentMaxId = id;

            // 🟢 核心修改：提取逻辑 (优先正文)
            let nodeLink = extractNodeLinkPriority(detailHtml);

            if (nodeLink) {
                $.log(`✅ ID ${id} 提取成功 (来自正文)`);
                $.log(`链接：${nodeLink}`); // 日志打印完整链接
                foundLinks.push(nodeLink);
            } else {
                $.log(`❌ ID ${id} 未提取到链接`);
            }
            
            await $.wait(500);
        }

        // 5. 通知
        if (foundLinks.length > 0) {
            setStorage(LAST_ID_KEY, currentMaxId.toString());
            let title = `🎉 发现 ${foundLinks.length} 个新节点`;
            let message = foundLinks.join('\n\n------------------\n\n');
            $.notify(title, '长按复制完整链接', message);
            $.log('任务完成！');
        } else {
            if (currentMaxId > lastRecordedId) {
                setStorage(LAST_ID_KEY, currentMaxId.toString());
            }
            $.log('未发现有效节点。');
        }

    } catch (e) {
        $.log(`出错：${e.message}`);
        $.notify('错误', e.message);
    } finally {
        $.done();
    }
}

// 🟢 修正后的提取函数：优先匹配正文 <div class="text">
function extractNodeLinkPriority(html) {
    let link = null;

    // 【第一步】优先尝试从正文 <div class="text"><p>...</p></div> 提取
    // 正则解释：匹配 <div class="text"> 后面的 <p> 标签内的 vmess 或 hy2 链接
    let pMatch = html.match(/<div\s+class="text">\s*<p>(vmess:[^<]+|hy2:[^<]+)/i);
    
    if (pMatch && pMatch[1]) {
        link = pMatch[1].replace(/&amp;/g, '&').trim();
        $.log(`[提取策略] 命中正文匹配 (Priority 1)`);
        return link;
    } else {
        $.log(`[提取策略] 正文未命中，尝试 Meta (Priority 2)`);
    }

    // 【第二步】如果正文没找到，再尝试 meta description (作为备选)
    let metaMatch = html.match(/<meta\s+name="description"\s+content="(vmess:\/\/[^"]+|hy2:\/\/[^"]+)"/i);
    if (metaMatch && metaMatch[1]) {
        link = metaMatch[1];
        $.log(`[提取策略] 命中 Meta 匹配 (备选)`);
        return link;
    }

    return null;
}

function httpGet(url) {
    return new Promise((resolve) => {
        $task.fetch({
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Cookie': MY_COOKIE
            }
        }).then(res => {
            resolve({ status: res.statusCode, body: res.body });
        }).catch(err => {
            resolve({ status: 0, body: '' });
        });
    });
}

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.notify = (t, s, m) => $notify(t, s, m);
    this.wait = (ms) => new Promise(r => setTimeout(r, ms));
    this.done = () => $done();
}

main();
