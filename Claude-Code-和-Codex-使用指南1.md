# Claude Code 和 Codex 命令体系补充说明

这份是对前一版指南的纠偏和补充，重点回答一个问题：

> **Claude Code 和 Codex 的斜杠命令是不是同一套？**

答案先放前面：

## 结论
**不是同一套。**

更准确地说：
- **Claude Code** 有自己的官方 CLI 命令体系，也有内置 `/` 命令体系
- **Codex** 也有自己的官方 CLI / slash commands 体系
- 两者在“功能类别”上可能相似，比如：
  - 清理上下文
  - 切模型
  - 查看状态
  - 调权限
- 但它们**命令名称、入口、能力边界、文档组织方式并不完全相同**

另外，你在 OpenClaw / 某些代理层里看到的：
- `/model`
- `/status`
- `/new`
- `/reasoning`

也**不等于** Claude Code 官方命令或 Codex 官方命令本体，而是你当前运行环境额外提供的命令层。

---

# 一、这次联网确认到的官方入口

## Claude Code 官方入口
### 1）CLI 参考
- `https://code.claude.com/docs/en/cli-reference`

### 2）Built-in commands（内置命令）
- `https://code.claude.com/docs/en/commands`

搜索结果和抓取结果都能确认：
- Claude Code 官方文档里明确有 **Built-in commands** 页面
- 文档说明：在 Claude Code 里输入 `/` 可以看到可用命令
- 并且官方明确说，不同平台/套餐/环境下，能看到的命令不完全一样

也就是说：
> **Claude Code 官方确实有自己的 slash / built-in commands。**

---

## Codex 官方入口
### 1）Codex CLI slash commands
- `https://developers.openai.com/codex/cli/slash-commands`

### 2）Codex CLI reference
- `https://developers.openai.com/codex/cli/reference`

### 3）Codex CLI features
- `https://developers.openai.com/codex/cli/features`

搜索结果明确提到：
- Codex 的 slash commands 用于：
  - switching models（切模型）
  - adjusting permissions（调权限）
  - summarizing long conversations（总结长对话）
- Features 页面摘要还明确提到：
  - `/review`
  - `/fork`
  - 自定义可复用 prompt / 命令

也就是说：
> **Codex 官方也明确有自己的 slash commands，并不是只有 CLI 参数。**

---

# 二、Claude Code 官方命令体系：怎么理解

Claude Code 官方命令至少分两层：

## 1）CLI 命令层
也就是终端里直接敲的：

- `claude`
- `claude "query"`
- `claude -p "query"`
- `claude -c`
- `claude -r "<session>" "query"`
- `claude update`
- `claude auth login`
- `claude auth logout`
- `claude auth status`
- `claude agents`
- `claude mcp`
- `claude plugin`

### 这些命令是干嘛的
#### `claude`
启动交互式会话。

#### `claude "query"`
带一个初始问题启动会话。

#### `claude -p "query"`
更像一次性 query / SDK 调用后退出。

#### `claude -c`
继续当前目录最近一次会话。

#### `claude -r "<session>" "query"`
按 session ID / 名称恢复指定会话。

#### `claude update`
更新 Claude Code。

#### `claude auth login/logout/status`
登录 / 登出 / 查看认证状态。

#### `claude agents`
列出 agent / subagent 配置。

#### `claude mcp`
配置 MCP 服务器。

#### `claude plugin`
管理插件。

---

## 2）Built-in slash commands 层
Claude Code 官方 built-in commands 页面抓取到的部分，已经明确包括这些：

- `/add-dir <path>`
- `/agents`
- `/autofix-pr [prompt]`
- `/btw <question>`
- `/chrome`
- `/clear`
- `/reset`
- `/new`
- `/color [color|default]`
- `/compact [instructions]`
- `/config`
- `/settings`
- `/context`
- `/copy [N]`
- `/cost`
- `/desktop`
- `/app`
- `/diff`

### 其中比较常用的，我给你翻成人话

#### `/clear` / `/reset` / `/new`
清空对话历史 / 重置当前上下文。

这个很关键：
**Claude Code 官方自己就把 `/new` 作为 `/clear` 的别名之一。**
所以 `/new` 不是凭空编的，它在 Claude Code 官方 built-in commands 里就是存在的。

#### `/compact [instructions]`
压缩当前会话上下文，可带指令说明压缩重点。

#### `/config` / `/settings`
打开设置界面，调整主题、模型、输出风格等。

#### `/context`
查看当前上下文使用情况。

#### `/cost`
看 token 使用统计。

#### `/diff`
查看本次会话引入的变更 diff / 未提交改动。

#### `/copy [N]`
复制最近一条或倒数第 N 条回复。

#### `/add-dir <path>`
把额外目录加入当前会话可访问范围。

#### `/agents`
管理 agent / subagent 配置。

#### `/autofix-pr [prompt]`
让 Claude Code Web 会话去盯当前 PR，自动修 CI 失败 / review 评论一类问题。

---

# 三、Codex 官方命令体系：怎么理解

Codex 这边，这次联网能确定两件事：

## 1）Codex 有官方 CLI 体系
有：
- CLI reference
- Quickstart
- CLI 文档页

说明它不是纯聊天玩具，而是明确的终端工作流工具。

## 2）Codex 也有官方 slash commands
官方搜索结果摘要已经明确写到：

### Codex slash commands 用于：
- switching models
- adjusting permissions
- summarizing long conversations

并且 Features 页摘要点名了：
- `/review`
- `/fork`
- custom reusable prompts / commands

所以能确定：
> **Codex 的 slash commands 是官方文档里明确存在的，不是民间二创。**

---

# 四、两者最大的区别在哪

## 不是“有没有 slash commands”的区别
因为：
- Claude Code 有
- Codex 也有

## 真正的区别是：
### 1）命令集合不完全一样
比如：
- Claude Code 官方抓到有 `/clear`、`/compact`、`/context`、`/cost`
- Codex 官方摘要更明确提到 `/review`、`/fork`、切模型、调权限、总结长对话

### 2）文档组织方式不一样
- Claude Code：CLI reference + Built-in commands 分得比较清楚
- Codex：CLI reference + slash commands + features 分开写

### 3）命令手感和生态不一样
- Claude Code 看起来更强调：
  - 会话清理
  - context 管理
  - 配置 / app / diff / cost / PR 协作
- Codex 看起来更强调：
  - terminal-first control
  - review / fork / permissions / model switching
  - active session steering

---

# 五、所以 `/model` 到底算谁的命令？

这个问题要特别小心。

## 不能偷懒地说
“`/model` 就是 Claude Code 和 Codex 通用命令。”

这样说不严谨。

## 更严谨的说法应该是
### 在你现在这个环境里
`/model` 是**当前聊天代理环境可用命令**，你已经实际在用。

### 但从这次联网确认的结果看
- Codex 官方 slash commands 摘要明确提到 **switching models**
- Claude Code 官方抓到的 built-in commands 片段里，暂时**还没在这次抓取片段中直接看到 `/model` 这一条**
  - 但 Claude Code 的 `/config` / `/settings` 又明确可以调 model

所以当前能最稳妥说的是：

> **Codex 官方 slash commands 明确支持模型切换类操作；Claude Code 官方至少支持通过 config/settings 相关入口调整模型，但我这次抓到的片段还没直接截到 `/model` 这一行。**

也就是说，不能因为你当前环境有 `/model`，就直接把它当成两家完全一致的官方命令。

---

# 六、这次可以放心写进文档的东西

## 可以明确写
### Claude Code 官方命令体系里，至少可以确认这些内置命令：
- `/new`
- `/clear`
- `/reset`
- `/compact`
- `/config`
- `/settings`
- `/context`
- `/cost`
- `/copy`
- `/diff`
- `/agents`
- `/add-dir`
- `/autofix-pr`
- `/btw`
- `/desktop`
- `/app`

### Claude Code 官方 CLI 命令里，至少可以确认这些：
- `claude`
- `claude -p`
- `claude -c`
- `claude -r`
- `claude update`
- `claude auth ...`
- `claude agents`
- `claude mcp`
- `claude plugin`

### Codex 官方 slash commands 可以明确确认的能力有：
- 切模型
- 调权限
- 总结长对话
- `/review`
- `/fork`
- 自定义可复用命令 / prompts

---

# 七、最实用的最终结论

## 如果你以后再问“这是不是同一套命令”
你可以直接记这个答案：

### 不是同一套。
但它们有一部分**功能类别相似**。

## Claude Code 更像
- 自己有完整 CLI
- 也有内置 `/` 命令
- 还带 settings / context / cost / diff / PR 协作这类明显属于 Claude 生态的能力

## Codex 更像
- CLI + slash commands 双体系
- 更强调 terminal-first control
- 更强调 review / fork / permission / model switching 这类终端工作流命令

---

# 八、给你一个防混淆口诀

## 不要把三层东西混在一起

### 第一层：Claude Code 官方命令
例如：
- `claude -c`
- `/new`
- `/compact`
- `/diff`

### 第二层：Codex 官方命令
例如：
- Codex CLI reference 里的命令/参数
- Codex slash commands 里的 `/review`、`/fork`、模型切换、权限控制

### 第三层：你当前运行平台附加命令
例如：
- `/model`
- `/status`
- `/reasoning`

这些在 OpenClaw / 某个代理壳里能用，
**不代表 Claude Code 官方和 Codex 官方就一定完全同名同功能。**

---

# 九、这次纠偏后的简版结论

## 正确版一句话
**Claude Code 和 Codex 都有 slash commands，但不是同一套。你当前环境里的 `/model`、`/status`、`/reasoning` 这类命令，也可能是平台层额外提供的，不应直接混同为两家官方命令。**

---

# 十、官方入口备查

## Claude Code
- CLI reference：
  - `https://code.claude.com/docs/en/cli-reference`
- Built-in commands：
  - `https://code.claude.com/docs/en/commands`
- SDK slash commands：
  - `https://code.claude.com/docs/en/agent-sdk/slash-commands`

## Codex
- Codex CLI slash commands：
  - `https://developers.openai.com/codex/cli/slash-commands`
- Codex CLI reference：
  - `https://developers.openai.com/codex/cli/reference`
- Codex CLI features：
  - `https://developers.openai.com/codex/cli/features`

---

如果你要，我下一步可以继续给你做一份更硬的版本：

## 《Claude Code 官方命令表 vs Codex 官方命令表（对照版）》

我会按三列写：
- 命令
- 属于谁
- 干什么用

这样你以后就不会再混了。