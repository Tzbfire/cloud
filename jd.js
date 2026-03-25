// 订阅脚本: read_stored_nodes.js
// 读取存储的节点并生成订阅

const NODE_LIST_KEY = 'Node_List_42web';

function main() {
    try {
        // 读取存储的节点
        const storedData = $persistentStore.read(NODE_LIST_KEY);
        
        if (!storedData) {
            return $done({
                body: '# 暂无存储的节点\n# 请先运行节点监控脚本'
            });
        }
        
        const nodeList = JSON.parse(storedData);
        
        if (!Array.isArray(nodeList) || nodeList.length === 0) {
            return $done({
                body: '# 存储列表为空\n# 请先运行节点监控脚本获取节点'
            });
        }
        
        // 提取所有节点内容
        const nodes = nodeList.map(node => node.content);
        
        // 生成订阅内容
        const subscribeContent = [
            `# 节点订阅`,
            `# 更新时间: ${new Date().toLocaleString()}`,
            `# 节点数量: ${nodes.length}`,
            '',
            ...nodes,
            '',
            `# 结束`
        ].join('\n');
        
        return $done({
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': 'attachment; filename="nodes.txt"',
                'Subscription-Userinfo': 'upload=0; download=0; total=1073741824000; expire=2546241231'
            },
            body: subscribeContent
        });
        
    } catch (error) {
        return $done({
            body: `# 读取节点失败\n# ${error.message}`
        });
    }
}

main();
