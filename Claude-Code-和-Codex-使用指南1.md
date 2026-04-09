# Claude Code 和 Codex 使用指南

这份指南按“能直接上手”的思路写，重点不是空话，而是：

- 什么时候该用 Claude Code，什么时候该用 Codex
- 怎么提需求最有效
- 怎么让它少走弯路
- 怎么管会话、上下文、检查点
- 怎么做改代码、重构、排错、审查、文档整理
- 常见坑和推荐工作流

也参考了公开资料与官方入口：
- Anthropic Claude Code 产品/文档入口
- Claude 提示词最佳实践文档
- OpenAI Codex 开发者文档 / CLI / Quickstart

---

# 一、先说结论：Claude Code 和 Codex 怎么选

## Claude Code 更适合
- 大仓库理解
- 多文件重构
- 需要它“先理解，再下手”
- 复杂工程任务
- 让它先做方案，再执行
- 文档梳理、架构说明、迁移计划

## Codex 更适合
- 直接落地改代码
- 命令行里快速做事
- 以“任务执行”为主，而不是长篇讨论
- 修 bug、补测试、快速原型
- 更强调本地工作流、checkpoint、迭代试错

## 粗暴一点的选择法
- **先想清楚、再动刀** → Claude Code
- **别废话，直接干** → Codex

当然这不是绝对的，它们都能读代码、改文件、跑命令、做重构。
区别主要在“手感”和“你怎么驱动它”。

---

# 二、它们到底是什么

## Claude Code
Anthropic 的终端/代理式 coding agent。
核心特点是：
- 读整个项目
- 跨文件修改
- 跑测试/命令
- 适合先分析再执行

更像一个“会思考上下文的大脑型工程搭子”。

## Codex
OpenAI 的 coding agent / CLI 工作流。
核心特点是：
- 在终端里直接执行任务
- 非常适合面向代码改动的工作流
- 官方文档也强调 checkpoint / revert / best practices

更像一个“偏执行、偏工程流水线型”的搭子。

---

# 三、最重要的原则：别把它当读心术

不管是 Claude Code 还是 Codex，效果好不好，核心取决于你给的输入质量。

## 差的提法
- 帮我优化一下
- 这里改改
- 修复 bug
- 看看这个项目

这种话最大的问题是：
- 范围不清
- 目标不清
- 完成标准不清

## 好的提法
要尽量说清这 4 件事：

1. **目标**：你到底要什么
2. **范围**：改哪些，不改哪些
3. **约束**：技术栈、风格、兼容性、性能、安全要求
4. **验收标准**：怎样算完成

### 模板
```text
目标：修复用户登录后偶发 500 的问题
范围：只改 auth 和 session 相关代码，不改数据库 schema
约束：保持现有 API 兼容；不要引入新依赖；日志不要泄露 token
验收：本地测试通过；给出根因说明；列出改动文件
```

这类输入，成功率会高很多。

---

# 四、推荐工作流

## 工作流 1：先分析，后执行
适合复杂任务。

### 你这样说
```text
先不要改代码。
先读项目里和支付回调相关的实现，找出可能导致重复扣费的路径。
输出：
1. 根因分析
2. 修改方案
3. 风险点
4. 你准备改哪些文件
等我确认后再动手。
```

## 适用场景
- 重构
- 架构调整
- 难 bug
- 不熟悉的老项目
- 高风险改动

### 优点
- 不容易一上来乱改
- 你能先看它理解得对不对
- 更适合 Claude Code

---

## 工作流 2：直接执行，边做边汇报
适合明确任务。

### 你这样说
```text
给这个 FastAPI 项目加一个 /healthz 路由。
要求：
- 返回 200 和 {"ok": true}
- 加测试
- 更新 README 对应说明
- 改完后给我列出修改文件
```

## 适用场景
- 补接口
- 补测试
- 修简单 bug
- 小范围改造

### 优点
- 快
- 很适合 Codex

---

## 工作流 3：先让它缩范围
如果你自己都没完全想清楚，不要瞎下命令。

### 你这样说
```text
我想让这个项目的配置系统更清晰。
你先帮我拆成 3~5 个可执行的小任务，按风险从低到高排序。
每个任务说明：
- 改什么
- 为什么
- 风险
- 预估影响范围
```

这个用法特别值。
因为很多时候不是模型不行，是你给的任务太大太糊。

---

# 五、会话和上下文怎么用

## Claude Code / Codex 都有一个共同问题
上下文不是无限可靠的。
会话越长，越容易：
- 漏掉前面约束
- 混入旧结论
- 对某个细节过度自信

## 推荐做法
### 1）一个会话尽量只做一个主题
比如：
- 一个会话专门做登录问题
- 一个会话专门做 Docker 部署
- 一个会话专门做测试补齐

别在同一个会话里：
- 先修支付
- 再写文档
- 再聊服务器
- 再让它重构路由层

容易串味。

### 2）大任务分阶段开新会话
例如：
- 会话 A：分析方案
- 会话 B：实施改动
- 会话 C：代码 review 和补测试

### 3）关键约束要反复重申
不要以为说过一次它就永远记得。

比如每轮都可以提醒：
```text
提醒：
- 不要改数据库 schema
- 不要新增依赖
- 优先最小改动
- 最后给 diff 摘要
```

---

# 六、检查点（checkpoint）非常重要

这个尤其适合 Codex，也同样适合 Claude Code。

## 为什么要 checkpoint
因为 coding agent 真会改文件。
它不是陪你聊天，它会动代码。

所以每次做重要任务前，最好有一个回滚点。

## 推荐做法
### 方法 1：Git checkpoint
开始前：
```bash
git status
git add -A
git commit -m "checkpoint before auth bugfix"
```

做完后：
```bash
git diff
git log --oneline -n 3
```

### 方法 2：至少留 diff
如果不想 commit，至少：
```bash
git diff > before-change.patch
```

## 为什么官方也强调这件事
因为 AI coding agent 最大的风险不是“不会写”，
而是“它很勤快地写错很多地方”。

---

# 七、常见任务怎么下指令

## 1）修 bug
### 推荐提示词
```text
修复这个 bug：用户刷新页面后偶发退出登录。
请先：
1. 定位最可能的根因
2. 说明你要改哪些文件
3. 再实施修改
要求：
- 不改数据库 schema
- 不引入新依赖
- 补一个最小可复现测试
输出时给我：根因、改动点、风险
```

## 为什么这样写
因为 bug 修复最怕它“猜一个原因就开改”。
你要逼它先解释因果链。

---

## 2）做重构
### 推荐提示词
```text
重构这个模块，但不改变外部行为。
目标：
- 降低重复代码
- 提高可读性
- 保持 API 兼容
约束：
- 不改变函数签名
- 不改接口返回格式
- 先给重构计划，再开始改
验收：
- 列出改动文件
- 说明哪些重复被消除了
- 测试通过
```

## 重构时最重要的要求
一定要说：
- **不改变外部行为**
- **不改接口**
- **先计划后执行**

---

## 3）补测试
### 推荐提示词
```text
给这个模块补测试。
目标：覆盖主要成功路径、一个边界条件、两个失败路径。
约束：
- 不改业务代码，除非为了可测试性必须做最小调整
- 不引入重型测试依赖
输出：
- 新增了哪些测试
- 覆盖了哪些场景
- 还没覆盖哪些风险点
```

---

## 4）做代码审查
### 推荐提示词
```text
请对这个分支做 code review。
重点看：
- 正确性
- 安全问题
- 回归风险
- 性能问题
- 测试缺口
要求：
- 先列问题，按严重程度排序
- 每条问题说明原因
- 给出建议修法
- 先不要直接改代码
```

## 代码审查时不要让它一上来修改
review 阶段应该先“找问题”，不是先“顺手改”。

---

## 5）写新功能
### 推荐提示词
```text
实现一个文件上传接口。
要求：
- 支持 png/jpg/pdf
- 单文件最大 10MB
- 返回文件 id 和 url
- 非法类型返回 400
- 补测试
- 更新 API 文档
约束：
- 复用现有存储层
- 不引入云服务 SDK
- 先检查项目里是否已有类似实现
```

---

## 6）读代码并讲明白
### 推荐提示词
```text
帮我读这个项目的认证流程。
要求：
- 从入口路由开始
- 写清 token 在哪里生成、校验、刷新、失效
- 画成文字版调用链
- 标出最关键的 5 个文件
- 暂时不要改代码
```

这个特别适合 Claude Code。

---

# 八、Claude Code 更适合的提示方式

## Claude Code 的强项
- 全局理解
- 长链路分析
- 方案拆分
- 带解释的执行

## 适合这样驱动
### 方式 1：分析型
```text
先完整理解这个模块，再告诉我：
- 它的职责
- 边界
- 和哪些模块耦合
- 哪些地方最脆弱
```

### 方式 2：计划型
```text
先给一个三步实施计划。
每步说明：
- 改动范围
- 风险
- 回滚方式
等我确认后再做。
```

### 方式 3：解释型
```text
改完之后，像在给接手同事做交接一样，解释你的改动。
```

## 使用 Claude Code 的一个诀窍
**不要只让它“做”，也要让它“解释为什么这样做”。**
这样更容易发现它理解歪没歪。

---

# 九、Codex 更适合的提示方式

## Codex 的强项
- 命令行工作流顺手
- 执行效率高
- 快速落地改动
- 和 git / test / run 结合自然

## 适合这样驱动
### 方式 1：任务型
```text
修复 tests/test_auth.py 里失败的用例，直到 pytest 通过。
改完后总结原因。
```

### 方式 2：目标型
```text
把这个脚本改成支持 --dry-run。
要求保持原有参数兼容，并补一个示例用法。
```

### 方式 3：迭代型
```text
先做最小可运行版本，不要求完美。
完成后再列第二轮可优化项。
```

## 使用 Codex 的一个诀窍
**给它明确的终止条件。**
比如：
- `直到测试通过`
- `输出修改文件列表后结束`
- `不要做额外重构`

不然它有时会越做越多。

---

# 十、什么时候要阻止它继续

这点非常重要。

## 出现这些情况时，应该叫停
### 1）它开始“顺手优化”很多不相关文件
这通常意味着范围失控了。

### 2）它为了修一个 bug，想顺手重构整个模块
危险。

### 3）它解释不清为什么这样改
说明理解可能不扎实。

### 4）它说“应该可以”“大概没问题”，但没验证
这类表述要小心。

### 5）它不停重复试错，却没有缩小问题范围
这时候要让它回到分析模式。

## 可以这样打断
```text
停。
不要继续改。
先总结你刚才改了什么、为什么失败、下一步最小方案是什么。
```

---

# 十一、最容易踩的坑

## 1）任务太大
比如：
- 重构整个项目
- 全部现代化
- 把架构优化一下

这种话非常容易翻车。

### 正确做法
拆成小任务：
- 先理清模块边界
- 再清理一个目录
- 再补测试
- 再替换一类旧接口

---

## 2）没有限制“不准改什么”
如果你不说，它可能真改。

### 你应该明确写
- 不改 schema
- 不改公共 API
- 不新增依赖
- 不改 CI
- 不动部署文件

---

## 3）没有要求验证
你让它改代码，却没要求验证，它就可能“写完就跑”。

### 最少也要加
- 跑测试
- 跑 lint
- 给出未验证部分

---

## 4）把分析、执行、review 混成一锅
这会导致输出很乱。

### 更好的做法
分三轮：
1. 分析
2. 执行
3. review / polish

---

## 5）把它当权威
它很强，但不是神。
尤其在这些地方要自己复核：
- 安全
- 并发
- 数据一致性
- 迁移脚本
- 删除逻辑
- 权限边界

---

# 十二、推荐的标准任务模板

## 模板 A：小改动
```text
任务：
给 xx 模块加一个 xx 功能。

要求：
- 只改必要文件
- 不引入新依赖
- 保持现有接口兼容
- 补最小测试

输出：
- 修改了哪些文件
- 为什么这么改
- 还剩什么风险
```

## 模板 B：复杂 bug
```text
任务：
排查并修复 xx bug。

先不要改代码，先做：
1. 复述问题
2. 给出可能根因
3. 说明排查路径
4. 列出准备修改的文件

等我确认后再改。
```

## 模板 C：重构
```text
任务：
重构 xx 模块。

目标：
- 降低重复
- 提高可维护性
- 保持外部行为不变

约束：
- 不改 API
- 不改 schema
- 不新增依赖

验收：
- 测试通过
- 给出前后结构说明
- 列出风险和回滚点
```

## 模板 D：代码审查
```text
请 review 这组改动。
重点看：
- correctness
- security
- performance
- test coverage

要求：
- 按严重程度排序
- 先列问题，不要直接改
- 每条问题给建议修法
```

---

# 十三、我个人建议的最佳实践

## 对 Claude Code
### 最佳姿势
- 先让它读
- 再让它讲
- 然后让它规划
- 最后才执行

### 一句话版
**Claude Code 更适合“先想后做”。**

---

## 对 Codex
### 最佳姿势
- 目标具体
- 范围清楚
- 终止条件明确
- 先有 checkpoint

### 一句话版
**Codex 更适合“目标明确，直接开干”。**

---

# 十四、实际协作建议

## 最舒服的组合拳
### 方案 1
- Claude Code：分析 + 方案
- Codex：执行 + 收尾

### 方案 2
- Claude Code：讲清楚老代码
- Codex：做改动
- 再让 Claude Code：review

### 方案 3
- Codex：先快速做 MVP
- Claude Code：再做结构整理和说明文档

这个组合在真实项目里挺好用。

---

# 十五、什么时候不该用它们

## 不建议直接放手的场景
- 数据删除
- 批量迁移生产数据
- 权限系统大改
- 安全边界调整
- 支付/计费核心逻辑
- 涉及密钥、凭证、生产配置的高风险改动

这些场景可以让它：
- 分析
- 出方案
- 生成草稿

但不要完全无脑自动执行。

---

# 十六、最后给你一个最短版速记

## Claude Code 速记
- 适合：分析、规划、复杂重构
- 用法：先读 → 先讲 → 先计划 → 再执行
- 关键：让它解释“为什么”

## Codex 速记
- 适合：直接改、修 bug、补测试、终端任务
- 用法：目标清楚、范围清楚、终止条件清楚
- 关键：先 checkpoint，避免失控

## 通用三原则
1. 任务要小
2. 约束要硬
3. 验证要写

---

# 十七、一个真正好用的万能提示词

如果你懒得每次重写，可以直接用这个：

```text
你先理解任务，再执行。

任务目标：
[写你的目标]

范围：
[写允许修改的范围]

不要改：
[写禁止修改的部分]

约束：
- 保持现有行为兼容
- 最小改动优先
- 不新增依赖（如非必要）
- 改完后说明原因

验收标准：
[写完成标准]

执行要求：
1. 先复述你的理解
2. 给出实施计划
3. 再开始修改
4. 最后列出改动文件、验证结果、剩余风险
```

---

# 参考入口

## Claude / Anthropic
- Claude Code 产品页：
  - https://www.anthropic.com/product/claude-code
  - https://claude.com/product/claude-code
- Claude 文档首页：
  - https://platform.claude.com/docs/en/home
- Claude 提示词最佳实践：
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

## OpenAI Codex
- Codex 文档首页：
  - https://developers.openai.com/codex
- Codex CLI：
  - https://developers.openai.com/codex/cli
- Codex Quickstart：
  - https://developers.openai.com/codex/quickstart
- Codex GitHub：
  - https://github.com/openai/codex

---

如果你要，我下一步还能继续给你补两份更实用的附录：

1. **《Claude Code 常用提示词模板》**
2. **《Codex 常用提示词模板》**

这样你以后直接复制就能用。

---

# 十八、常见命令 / 斜杠命令怎么用

先说清一件事：

**`/model` 这种命令更像是你当前这套聊天/代理环境（例如 OpenClaw、某些终端代理层、某些 IDE integration）提供的控制命令，不完全等于 Claude Code 或 Codex 本体的“统一官方命令集”。**

也就是说：
- 有些命令是**平台层命令**
- 有些是**agent 自己的交互命令**
- 有些是**CLI 参数 / 子命令**，不是聊天里的 `/xxx`

所以最稳的理解方式是：

## 1）聊天代理层常见命令（你现在最常用的这类）
这些命令通常用于控制当前会话、模型、推理方式，而不是直接改代码。

### `/new`
**作用：** 新开/重置当前会话上下文。

**适合：**
- 话题完全切换
- 上下文已经脏了
- 模型开始串台
- 你不想让旧上下文继续影响当前任务

**例子：**
```text
/new
```

---

### `/status`
**作用：** 查看当前会话状态。

通常会看到：
- 当前模型
- 会话状态
- 推理/verbose 状态
- 一些运行信息

**适合：**
- 想知道当前到底在用什么模型
- 想看会话是不是正常
- 想确认当前运行模式

**例子：**
```text
/status
```

---

### `/model`
**作用：** 切换当前会话使用的模型。

**适合：**
- 当前任务更适合另一个模型
- 想测试不同模型手感
- 想在不重开会话的情况下切换模型

**例子：**
```text
/model dooong/gpt-5.4
/model hajimi/gpt-5.4
/model default
```

**注意：**
- 这是“同一会话换模型”，不是自动清空上下文
- 模型换了，不代表旧上下文就消失了

---

### `/reasoning`
**作用：** 开关或调整推理模式。

**适合：**
- 复杂分析任务
- 希望它多想一层
- 或者你嫌它太慢，想关掉/调低

**例子：**
```text
/reasoning
```

不同环境下可能会：
- 切换开/关
- 或显示当前 reasoning 状态

---

### `/sessions`（如果所在平台提供）
**作用：** 查看或管理已有会话。

**适合：**
- 看有哪些历史 session
- 做会话排查
- 管理旧上下文

**注意：**
并不是每个环境都开放这个命令。

---

### `/help`
**作用：** 查看当前环境支持的命令。

**适合：**
- 不确定当前平台到底支持哪些斜杠命令
- 想查命令格式

---

## 2）Claude Code 更常见的“操作方式”
Claude Code 很多时候不一定靠 `/xxx` 这种聊天命令来工作，更多是：
- 在终端里启动
- 给任务
- 让它读代码 / 改代码 / 跑命令

所以它更像：
- **任务驱动**
- **提示词驱动**
- **终端工作流驱动**

### Claude Code 里你最该会的，不是背一堆命令，而是这几种用法：

#### 用法 A：只分析，不动代码
```text
先不要改代码，先分析这个仓库的认证流程。
```

#### 用法 B：计划后执行
```text
先给我实施计划，确认后再修改。
```

#### 用法 C：执行后解释
```text
改完后给我说明：改了哪些文件、为什么这么改、还有哪些风险。
```

#### 用法 D：限制范围
```text
只改 api/auth 和 tests，不要动数据库和部署文件。
```

也就是说，Claude Code 的“命令感”没有那么强，**更核心的是任务约束表达能力。**

---

## 3）Codex 更常见的“操作方式”
Codex 在 CLI / 终端侧的工作流更明显一些。

它常见的官方入口和操作思路是：
- 启动 Codex CLI
- 进入某个工作目录
- 提交任务
- 让它改代码 / 跑测试 / 总结结果

你更应该掌握的是这几类“任务命令思维”：

### 用法 A：直接给目标
```text
修复这个仓库里 failing tests，直到 pytest 通过。
```

### 用法 B：加终止条件
```text
给这个脚本加 --dry-run，改完后停止，并列出修改文件。
```

### 用法 C：要求 checkpoint 工作流
```text
开始前先确认 git 状态，改完后给出 diff 摘要。
```

### 用法 D：限制别乱扩展
```text
不要顺手重构无关模块，不要新增依赖。
```

同样，Codex 真正决定效果的，也不是“背命令”，而是你给它的任务是否可执行。

---

# 十九、你最应该记住的“命令 + 用途”速查表

## 在聊天代理层 / OpenClaw 这类环境里

### `/new`
- **用途：** 重开当前会话
- **什么时候用：** 换话题、上下文乱了

### `/status`
- **用途：** 看当前状态
- **什么时候用：** 想知道当前模型 / 推理状态 / 会话状态

### `/model xxx`
- **用途：** 切模型
- **什么时候用：** 想换脑子但不想重开会话

### `/reasoning`
- **用途：** 调整推理模式
- **什么时候用：** 复杂任务想让它想更多，或嫌慢想关掉

### `/help`
- **用途：** 看当前环境支持哪些命令
- **什么时候用：** 忘了命令、想确认语法

---

# 二十、最实用的使用建议

如果你是日常真正在用，不用背一堆。

## 你最该记住的只有这几个：

### 1）`/new`
上下文脏了就开新会话。

### 2）`/status`
不确定当前什么状态就看一眼。

### 3）`/model xxx`
任务变了、想换模型就切。

### 4）任务提示词四件套
永远说清：
- 目标
- 范围
- 不准改什么
- 验收标准

这比背更多命令更重要。

---

# 二十一、给你的一个更贴近实战的例子

## 例子 1：先换模型再干活
```text
/model dooong/gpt-5.4
```
然后发：
```text
先不要改代码，先分析这个项目的登录流程，找出 token 校验链路。
```

---

## 例子 2：上下文乱了直接重开
```text
/new
```
然后重新说：
```text
现在是一个新任务：给这个 Python 项目补健康检查接口和测试。
只改 web 层和 tests，不要动数据库。
```

---

## 例子 3：看状态
```text
/status
```
确认当前模型和会话没跑偏，再继续任务。

---

# 二十二、一句话总结

- **Claude Code / Codex 的核心，不是背一堆 slash 命令**
- **真正有用的是：会话管理 + 模型切换 + 任务描述能力**
- 对你来说，最常用、最值钱的命令就是：
  - `/new`
  - `/status`
  - `/model`
  - `/reasoning`
  - `/help`

如果你要，我下一步还能继续给你补一份：

## 《Claude Code 和 Codex 常用提示词模板大全》

直接给你分场景：
- 修 bug
- 重构
- 补测试
- 做 review
- 写新功能
- 读代码讲解

那份会比这份更适合你直接复制粘贴。

---

# 附录：命令体系补充与纠偏


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
