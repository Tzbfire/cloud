// 节点信息提取脚本 (Node Extractor)
// 功能：从特定HTML页面中提取 vmess://, hy2:// 等节点配置，并整理为纯文本列表
// 触发URL：用户提供的节点分享页面
// 版本: 1.0
(async () => {
    try {
        // 1. 获取原始的响应体（HTML 内容）
        let originalBody = $response.body;
        if (!originalBody) {
            throw new Error("响应体为空，无法处理");
        }

        // 2. 使用正则表达式匹配所有节点配置链接
        // 匹配模式：以 vmess://, vless://, ss://, trojan://, hy2://, hysteria:// 等常见协议开头
        // 直到遇到引号、空格或HTML标签结束
        const nodePattern = /(vmess:\/\/[^<>\s"']+)|(vless:\/\/[^<>\s"']+)|(ss:\/\/[^<>\s"']+)|(trojan:\/\/[^<>\s"']+)|(hy2:\/\/[^<>\s"']+)|(hysteria:\/\/[^<>\s"']+)/gi;
        
        let matches = originalBody.match(nodePattern);
        let extractedNodes = [];

        // 3. 处理匹配结果
        if (matches && matches.length > 0) {
            // 去重，同一个链接可能出现在页面的不同位置
            let uniqueMatches = [...new Set(matches)];
            
            for (let node of uniqueMatches) {
                // 解码可能存在的HTML实体（如 & 被转义为 &amp;）
                let decodedNode = node.replace(/&amp;/g, '&')
                                      .replace(/&lt;/g, '<')
                                      .replace(/&gt;/g, '>')
                                      .replace(/&quot;/g, '"')
                                      .replace(/&#39;/g, "'");
                extractedNodes.push(decodedNode);
            }
            
            console.log(`✅ 成功提取 ${extractedNodes.length} 个节点配置`);
        } else {
            console.log("⚠️ 未在页面中找到节点配置链接");
        }

        // 4. 构建最终输出
        let finalOutput = '';
        if (extractedNodes.length > 0) {
            // 方案A：将节点列表拼接为纯文本，一行一个
            finalOutput = `# 节点提取结果 (共 ${extractedNodes.length} 个)\n` +
                          `# 提取时间: ${new Date().toLocaleString('zh-CN')}\n` +
                          `# 原始URL: ${$request?.url || '未知'}\n` +
                          `\n` +
                          extractedNodes.join('\n') + '\n';
            
            // 可选：同时发送系统通知，告知提取结果
            $notification.post(
                "节点信息提取完成",
                `从页面中提取了 ${extractedNodes.length} 个节点`,
                `点击通知可复制所有链接`,
                {
                    // 点击通知自动复制所有节点文本到剪贴板
                    "url": `quantumult-x://copy?text=${encodeURIComponent(finalOutput)}`
                }
            );
        } else {
            // 没有找到节点，返回提示信息
            finalOutput = "# 未在页面中发现任何节点配置信息\n" +
                          "# 请确认页面包含 vmess://, vless://, ss://, trojan://, hy2://, hysteria:// 等协议的链接";
            
            $notification.post(
                "节点提取结果",
                "未找到节点配置",
                "页面中可能不包含标准格式的节点链接"
            );
        }

        // 5. 可选：将提取结果保存到持久化存储，供其他脚本使用
        if (extractedNodes.length > 0) {
            $persistentStore.write(finalOutput, "extracted_nodes_list");
        }

        // 6. 替换原响应体，返回纯文本结果
        $done({
            body: finalOutput,
            headers: {
                ...$response.headers,
                'Content-Type': 'text/plain; charset=utf-8' // 修改Content-Type为纯文本
            }
        });

    } catch (error) {
        // 错误处理
        console.log(`❌ 脚本执行出错: ${error.message}`);
        console.log(`📋 错误堆栈: ${error.stack}`);
        
        $notification.post(
            "节点提取脚本错误",
            "处理过程中发生异常",
            `错误: ${error.message}`
        );
        
        // 出错时返回原响应，不做修改
        $done($response);
    }
})();
