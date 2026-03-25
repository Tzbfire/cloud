// Quantumult X 节点订阅脚本
// 功能：从指定网页抓取节点信息，转换为 Quantumult X 订阅格式
// 支持协议：vmess, vless, ss, trojan, hy2, hysteria
// 版本: 2.0
(async () => {
    try {
        // 1. 定义要抓取的目标URL
        // 这里可以设置一个默认URL，也可以通过$request.url获取订阅链接传入的URL
        let targetUrl = "https://wap.42web.io/";
        
        // 2. 如果通过订阅链接传递了URL参数，则使用该URL
        if ($request && $request.url) {
            // 从订阅链接中提取目标URL，例如：
            // 订阅链接格式：https://your-domain.com/subscribe?url=https://wap.42web.io/
            const urlMatch = $request.url.match(/[?&]url=([^&]+)/i);
            if (urlMatch && urlMatch[1]) {
                targetUrl = decodeURIComponent(urlMatch[1]);
            }
        }
        
        console.log(`🎯 开始抓取节点，目标URL: ${targetUrl}`);
        
        // 3. 发送HTTP请求获取页面内容
        const response = await $http.get({
            url: targetUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            },
            timeout: 10000
        });
        
        if (!response.data) {
            throw new Error("获取页面内容失败，响应为空");
        }
        
        console.log(`✅ 成功获取页面，长度: ${response.data.length} 字符`);
        
        // 4. 从HTML中提取节点链接
        const htmlContent = response.data;
        
        // 定义更全面的节点协议匹配模式
        const nodePatterns = [
            /(vmess:\/\/[^<>\s"']+)/gi,      // vmess协议
            /(vless:\/\/[^<>\s"']+)/gi,      // vless协议
            /(ss:\/\/[^<>\s"']+)/gi,         // shadowsocks协议
            /(ssr:\/\/[^<>\s"']+)/gi,        // shadowsocksR协议
            /(trojan:\/\/[^<>\s"']+)/gi,     // trojan协议
            /(hy2:\/\/[^<>\s"']+)/gi,        // hysteria2协议
            /(hysteria:\/\/[^<>\s"']+)/gi,   // hysteria协议
            /(tuic:\/\/[^<>\s"']+)/gi,       // tuic协议
            /(wg:\/\/[^<>\s"']+)/gi,         // wireguard协议
            /(vpn:\/\/[^<>\s"']+)/gi,        // 通用vpn协议
            /(proxy:\/\/[^<>\s"']+)/gi       // 通用proxy协议
        ];
        
        let allNodes = [];
        
        // 使用所有模式匹配节点
        for (const pattern of nodePatterns) {
            const matches = htmlContent.match(pattern);
            if (matches) {
                allNodes = allNodes.concat(matches);
            }
        }
        
        // 5. 处理匹配到的节点
        if (allNodes.length === 0) {
            throw new Error("未在页面中找到任何节点配置");
        }
        
        // 去重并解码HTML实体
        let uniqueNodes = [...new Set(allNodes)].map(node => {
            return node
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
                .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
                .trim();
        }).filter(node => node.length > 10); // 过滤掉过短的无效节点
        
        console.log(`✅ 成功提取 ${uniqueNodes.length} 个节点`);
        
        // 6. 转换为Quantumult X订阅格式
        // Quantumult X订阅文件格式：每行一个节点链接
        let subscriptionContent = uniqueNodes.join('\n');
        
        // 7. 添加订阅头部信息（可选）
        const subscriptionHeader = `# Quantumult X 订阅生成
# 生成时间: ${new Date().toLocaleString('zh-CN')}
# 源地址: ${targetUrl}
# 节点数量: ${uniqueNodes.length}
# 更新时间: ${new Date().toISOString().split('T')[0]}

`;
        
        subscriptionContent = subscriptionHeader + subscriptionContent;
        
        // 8. 保存到持久化存储（可选，用于缓存）
        $persistentStore.write(subscriptionContent, "last_subscription_content");
        $persistentStore.write(Date.now().toString(), "last_update_time");
        
        // 9. 发送通知
        $notification.post(
            "节点订阅更新成功",
            `从 ${new URL(targetUrl).hostname} 获取`,
            `共提取 ${uniqueNodes.length} 个节点\n点击查看详情`,
            {
                "open-url": "quantumult-x://main?action=node"
            }
        );
        
        // 10. 输出调试信息
        console.log("📋 提取的节点列表:");
        uniqueNodes.forEach((node, index) => {
            console.log(`${index + 1}. ${node.substring(0, 80)}${node.length > 80 ? '...' : ''}`);
        });
        
        // 11. 返回订阅内容
        $done({
            response: {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Subscription-Userinfo': `upload=0; download=0; total=${uniqueNodes.length}; expire=${Math.floor(Date.now()/1000) + 86400}`,
                    'Profile-Update-Interval': '24',
                    'Profile-Title': `节点订阅 (${uniqueNodes.length}个)`
                },
                body: subscriptionContent
            }
        });
        
    } catch (error) {
        console.log(`❌ 脚本执行出错: ${error.message}`);
        
        // 从缓存中读取上次成功的订阅（如果有）
        const cachedContent = $persistentStore.read("last_subscription_content");
        
        if (cachedContent) {
            console.log("⚠️ 使用缓存的订阅内容");
            $notification.post(
                "节点订阅更新失败，使用缓存",
                "网络错误或页面结构变化",
                "将返回上次成功的订阅内容"
            );
            
            $done({
                response: {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                        'Pragma': 'no-cache'
                    },
                    body: cachedContent
                }
            });
        } else {
            $notification.post(
                "节点订阅更新失败",
                "无法获取节点信息",
                `错误: ${error.message}`
            );
            
            $done({
                response: {
                    status: 500,
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8'
                    },
                    body: `# 订阅更新失败\n错误信息: ${error.message}\n请检查网络连接或页面结构`
                }
            });
        }
    }
})();
