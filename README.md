# 🤖 AI Playground

这是一个用于学习和实践 AI 应用开发的前端项目。通过构建这个项目，我们将从零开始掌握 LLM API 调用、Prompt 工程、流式输出以及 RAG 等核心能力。

## 🛠️ 技术栈

| 类别       | 技术                                 |
| ---------- | ------------------------------------ |
| 前端       | React 18 + TypeScript + Vite 5       |
| 后端       | Node.js 20 + Express + TypeScript    |
| 数据库     | SQLite (sql.js - 纯 JS 实现)         |
| 路由       | React Router v7                      |
| TS 运行    | tsx (无需编译直接运行 TS)            |
| 包管理     | pnpm                                 |
| 代码规范   | ESLint (@antfu/eslint-config)        |
| LLM API    | 火山引擎 (Volcengine) via OpenAI SDK |
| Markdown   | react-markdown + react-syntax-highlighter |

## ✨ 功能特性

- **流式对话**: 实时显示 AI 的逐字回复，提升用户体验
- **Prompt 工程**: 支持 System Prompt 配置和多种提示模板
- **RAG 模式**: 基于知识库的检索增强生成，显示来源文档及相似度
- **对话历史**: SQLite 持久化存储，支持多会话管理和 URL 路由
- **Markdown 渲染**: 代码高亮、表格、列表等完整支持
- **会话管理**: 自动生成标题、手动编辑、RAG 模式切换
- **类型安全**: 前后端全 TypeScript，完整类型定义

## 📚 学习路线与进度

### 1. 环境搭建 ✅

- [x] 初始化 React + Vite + TypeScript 项目
- [x] 配置 pnpm 和 ESLint

### 2. LLM API 调用 ✅

- [x] 选择合适的 API (火山引擎)
- [x] 后端代理模式保护 API 密钥
- [x] 处理模型返回结果

### 3. 流式输出 (Streaming) ✅

- [x] fetch + ReadableStream 实现
- [x] UI 逐字显示效果
- [x] 错误处理

### 4. Prompt 工程 ✅

- [x] System Prompt 配置
- [x] Few-shot 示例 (风格化翻译)
- [x] Chain-of-Thought 思维链 (数学解题)
- [x] Structured Output 结构化输出 (情感分析 JSON)

### 5. RAG (检索增强生成) ✅

- [x] 向量嵌入 (Embeddings)
- [x] 向量检索 + 相似度阈值 (75%)
- [x] 完整问答链路
- [x] 来源文档显示

### 6. TypeScript 迁移 ✅

- [x] 后端完整 TypeScript 重构
- [x] 类型定义 (KnowledgeDocument, VectorDocument, SearchResult)
- [x] tsx 运行时配置

---

## 🗺️ 进阶学习路线

### 第一阶段：用户体验优化

#### 7. Markdown 渲染 ✅

- [x] 集成 react-markdown
- [x] 代码块语法高亮 (react-syntax-highlighter + oneDark)
- [x] 支持表格、列表、链接等格式
- [x] 代码块复制按钮

#### 8. 对话历史管理 ✅

**实现内容**:

- [x] 后端 SQLite 数据库存储 (sql.js)
  - conversations 表: id, title, created_at, updated_at, is_rag_mode
  - messages 表: id, conversation_id, role, content, sources, created_at
- [x] CRUD API 端点
  - GET/POST/DELETE /api/conversations
  - PATCH /api/conversations/:id/mode (切换 RAG 模式)
  - PATCH /api/conversations/:id/title (修改标题)
  - GET /api/conversations/:id (获取会话详情及消息)
- [x] 前端 React Router 集成
  - URL 路径: `/chat/:conversationId`
  - 浏览器地址栏显示当前会话 ID
  - 刷新页面保持会话状态
- [x] 会话列表侧边栏
  - 显示所有会话及时间
  - RAG 模式徽章显示
  - 删除会话功能
- [x] 自动生成会话标题
  - 首条消息前 30 字符作为标题
  - 通过 HTTP 响应头 (X-Generated-Title) 实时通知前端
  - 无需刷新页面即可更新标题
- [x] 手动编辑标题
  - 双击或点击编辑按钮进入编辑模式
  - Enter 保存, Esc 取消
  - 失去焦点自动保存

**技术要点**:

```typescript
// 后端: 自动生成标题并通过响应头传递
if (messagesBefore.length === 0) {
  const conversation = db.getConversation(conversationId)
  if (conversation && conversation.title !== '新对话') {
    res.setHeader('X-Generated-Title', Buffer.from(conversation.title).toString('base64'))
  }
}

// 前端: 从响应头读取标题
const generatedTitleHeader = response.headers.get('X-Generated-Title')
if (generatedTitleHeader && onTitleGenerated) {
  const title = new TextDecoder('utf-8').decode(
    Uint8Array.from(atob(generatedTitleHeader), c => c.charCodeAt(0))
  )
  onTitleGenerated(title)
}
```

#### 9. 中断生成 ⏳

- [ ] AbortController 取消请求
- [ ] 停止生成按钮
- [ ] 优雅处理中断状态

### 第二阶段：功能增强

#### 10. Token 计数与成本 ⏳

- [ ] tiktoken 库计算 token 数
- [ ] 显示输入/输出 token 用量
- [ ] 成本估算展示

#### 11. 多模型切换 ⏳

- [ ] 模型选择下拉框
- [ ] 动态切换 API 配置
- [ ] 不同模型参数适配

#### 12. UI 美化 ⏳

- [ ] 集成 Tailwind CSS
- [ ] shadcn/ui 组件库
- [ ] 响应式布局适配

### 第三阶段：RAG 进阶

#### 13. 文本分块策略 ⏳

- [ ] 固定大小分块
- [ ] 语义分块 (按段落/章节)
- [ ] 重叠分块优化

#### 14. 文件上传解析 ⏳

- [ ] 前端文件上传组件
- [ ] TXT/Markdown 文件解析
- [ ] PDF 解析 (pdf-parse)

#### 15. 向量库持久化 ⏳

- [ ] SQLite 存储向量
- [ ] 或使用 LanceDB / Chroma
- [ ] 增量更新知识库

#### 16. Rerank 重排序 ⏳

- [ ] 集成 Rerank API
- [ ] 二次排序提升精度
- [ ] 对比效果评估

### 第四阶段：高级 AI 能力

#### 17. Function Calling ⏳

- [ ] 定义工具函数 schema
- [ ] AI 自主选择调用工具
- [ ] 处理工具返回结果

#### 18. Agent 模式 ⏳

- [ ] ReAct 推理循环
- [ ] 多步任务规划
- [ ] 工具链组合调用

#### 19. 多模态交互 ⏳

- [ ] 图片上传与理解
- [ ] Vision API 集成
- [ ] 图文混合对话

### 第五阶段：工程化

#### 20. 单元测试 ⏳

- [ ] Vitest 测试框架
- [ ] 后端 API 测试
- [ ] 前端组件测试

#### 21. Docker 部署 ⏳

- [ ] Dockerfile 编写
- [ ] docker-compose 配置
- [ ] 生产环境部署

---

## 🚀 快速开始

1.  **安装依赖**

    ```bash
    pnpm install
    ```

2.  **配置环境变量**

    在项目根目录创建 `.env` 文件：

    ```properties
    AI_API_KEY=your-api-key
    AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
    AI_MODEL=your-model-id
    AI_EMBEDDING_MODEL=your-embedding-model-id
    PORT=3000
    ```

3.  **启动服务**

    需要同时启动前端和后端：

    ```bash
    # 终端 1: 启动后端 (端口 3000)
    pnpm server

    # 终端 2: 启动前端 (端口 5173)
    pnpm dev
    ```

4.  **代码检查与修复**

    ```bash
    pnpm lint:fix
    ```

## � 项目结构

```
ai-playground/
├── server/
│   ├── index.ts            # Express 后端主入口
│   ├── knowledge.ts        # RAG 知识库 + 类型定义
│   ├── rag-utils.ts        # RAG 工具函数
│   └── tsconfig.json       # 后端 TS 配置
├── src/
│   ├── components/
│   │   └── ChatBox.tsx     # 聊天组件
│   └── data/
│       └── promptTemplates.ts  # Prompt 模板
├── .github/
│   └── agents/
│       └── ai-tutorial.agent.md  # Copilot 上下文
├── .env                    # 环境变量 (git-ignored)
├── package.json
└── vite.config.ts
```

## �💻 如何在其他设备继续开发

如果你 clone 了这个仓库到新电脑，请按以下步骤恢复环境：

1.  **安装依赖**

    ```bash
    # 如果没有安装 pnpm
    npm install -g pnpm

    # 安装项目依赖
    pnpm install
    ```

2.  **配置环境变量**

    项目根目录下的 `.env` 文件被 git 忽略了（为了安全）。你需要手动创建一个 `.env` 文件，参考上方的环境变量配置。

3.  **启动服务**

    需要同时启动前端和后端：
    - 终端 1 (后端): `pnpm server`
    - 终端 2 (前端): `pnpm dev`

---

## 📐 代码规范与质量标准

### 设计原则

#### 1. DRY 原则 (Don't Repeat Yourself)
- 发现重复代码立即抽取函数/组件
- 相似逻辑封装为可复用 Hook
- 避免复制粘贴,改用函数调用

#### 2. 单一职责原则
- 一个函数只做一件事
- 组件职责清晰,不混杂业务逻辑与 UI
- 单个文件控制在 200 行以内

#### 3. 关注点分离
- **UI 组件**: 纯展示逻辑,通过 props 接收数据
- **业务逻辑**: 封装在自定义 Hook 中
- **类型定义**: 统一在 `types.ts` 管理
- **常量配置**: 提取到独立文件

### 命名规范

```typescript
// ✅ 函数名: 动词开头,驼峰命名
function handleSend() {}
function updateMessage() {}

// ✅ 布尔值: is/has/should 前缀
const isLoading = false
const hasError = true
const shouldRender = true

// ✅ 常量: 全大写,下划线分隔
const RENDER_INTERVAL = 50
const MAX_RETRY_COUNT = 3

// ✅ 类型/接口: PascalCase
interface Message {}
type UseChatOptions = {}

// ✅ 组件: PascalCase
function ChatBox() {}
export default MessageList
```

### TypeScript 规范

```typescript
// ✅ 避免使用 any
const data: unknown = await fetch()

// ✅ 优先使用类型推断
const count = 0  // 自动推断为 number

// ✅ 复杂类型抽取为 interface/type
interface User {
  id: string
  name: string
}

// ✅ 使用泛型提高复用性
function wrapInArray<T>(value: T): T[] {
  return [value]
}
```

### React 组件规范

```typescript
// ✅ Props 类型定义
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean  // 可选属性用 ?
}

// ✅ 组件解构 props
export function Button({ onClick, children, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>
}

// ✅ 事件处理函数以 handle 开头
const handleClick = () => {}
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
```

### 性能优化规范

```typescript
// ✅ 使用节流/防抖
const RENDER_INTERVAL = 50
if (now - lastRenderTime >= RENDER_INTERVAL) {
  render()
}

// ✅ 避免在循环中创建函数
// ❌ 错误
items.map((item, index) => <Item key={index} onClick={() => handle(item)} />)

// ✅ 正确
const handleClick = (item: Item) => handle(item)
items.map(item => <Item key={item.id} onClick={() => handleClick(item)} />)

// ✅ 列表渲染使用唯一 key (不用 index)
messages.map(msg => <Message key={msg.id} {...msg} />)
```

### 错误处理规范

```typescript
// ✅ 异步操作必须 try-catch
try {
  const response = await fetch('/api/chat')
  const data = await response.json()
} catch (error) {
  console.error('Error:', error)
  // 提供友好的错误提示
  alert('发送失败,请检查网络连接')
}

// ✅ finally 清理状态
finally {
  setIsLoading(false)
}
```

### 注释规范

```typescript
/** 
 * JSDoc: 用于函数、接口、类型的说明文档
 * @param input - 用户输入的消息
 * @returns 格式化后的消息对象
 */
function createMessage(input: string): Message {
  // 单行注释: 用于复杂逻辑解释、代码段分隔
  const trimmed = input.trim()
  
  // 生成唯一 ID
  return {
    id: generateId(),
    content: trimmed,
  }
}
```

### 代码组织规范

```
✅ 推荐的目录结构:
components/
├── ChatBox.tsx          # 主组件
└── chat/                # 相关子模块
    ├── index.ts         # 统一导出
    ├── types.ts         # 类型定义
    ├── useChat.ts       # Hook
    ├── MessageList.tsx  # 子组件
    └── ...

❌ 避免:
components/
├── ChatBox.tsx
├── MessageList.tsx      # 扁平化,难以管理
├── MessageBubble.tsx
└── ...
```

### 可维护性检查清单

- [ ] 是否有重复代码可以抽取?
- [ ] 函数是否超过 30 行? (考虑拆分)
- [ ] 文件是否超过 200 行? (考虑模块化)
- [ ] 组件职责是否单一?
- [ ] 类型定义是否完整?
- [ ] 错误处理是否完善?
- [ ] 是否有魔法数字? (应提取为常量)
- [ ] 变量/函数命名是否语义化?

---

## 📝 项目文档更新日志

### 2025-12-09: 模块 8 - 对话历史管理

**新增功能**:
- ✅ 后端 SQLite 数据库 (sql.js) 存储会话和消息
- ✅ React Router 集成,支持 URL 路由 (`/chat/:conversationId`)
- ✅ 自动生成会话标题 (首条消息前 30 字符)
- ✅ 手动编辑标题 (双击/编辑按钮)
- ✅ 会话列表侧边栏,支持 RAG 徽章显示
- ✅ 标题通过 HTTP 响应头 (`X-Generated-Title`) 实时更新

**技术要点**:
- 使用 `sql.js` 替代 `better-sqlite3` (纯 JS 实现,无需编译)
- 响应头 Base64 编码传递标题,避免污染聊天内容
- React StrictMode 双重调用问题通过 `useRef` 解决

---

_Last updated: 2025-12-09_
