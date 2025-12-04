# AI 前端开发教程 Agent

> 这是一个从零开始的 AI 应用开发教程项目。本文件帮助 Copilot 理解项目背景和当前进度。
>
> **自动更新规则**: 每当项目有重要更新时（新功能完成、重大重构、技术栈变更），应同步更新本文件和 `README.md`。

## 📚 教程目标

指导用户完成以下能力：

1. ✅ LLM API 调用
2. ✅ 流式输出
3. ✅ Prompt 工程
4. ✅ RAG 后端实现
5. ✅ RAG 前端集成
6. ✅ TypeScript 迁移
7. ⏳ 项目完善与总结

## 🛠️ 技术栈

| 类别      | 技术                                 |
| --------- | ------------------------------------ |
| 前端      | React 18 + TypeScript + Vite 5       |
| 后端      | Node.js 20 + Express + TypeScript    |
| TS 运行   | tsx (无需编译直接运行 TS)            |
| 包管理    | pnpm                                 |
| 代码规范  | ESLint (@antfu/eslint-config)        |
| LLM API   | 火山引擎 (Volcengine) via OpenAI SDK |
| Node 版本 | Volta 管理 (20.10.0)                 |

## 📁 项目结构

```
ai-playground/
├── .env                    # API 密钥配置 (git-ignored)
├── package.json            # 项目配置，包含 volta 节点版本
├── vite.config.ts          # Vite 配置，含后端代理
├── server/
│   ├── index.ts            # Express 后端主入口 (TypeScript)
│   ├── knowledge.ts        # RAG 知识库 + 类型定义
│   ├── rag-utils.ts        # RAG 工具函数 (余弦相似度、相似搜索)
│   └── tsconfig.json       # 后端 TypeScript 配置
├── src/
│   ├── components/
│   │   └── ChatBox.tsx     # 聊天组件 (流式输出、System Prompt、RAG 模式)
│   └── data/
│       └── promptTemplates.ts  # Prompt 模板 (Few-shot, CoT, 结构化输出)
└── .github/
    └── agents/
        └── ai-tutorial.agent.md  # Copilot 上下文 (本文件)
```

## 🔌 API 端点

| 端点             | 方法 | 功能                       |
| ---------------- | ---- | -------------------------- |
| `/api/health`    | GET  | 健康检查                   |
| `/api/chat`      | POST | LLM 对话 (流式)            |
| `/api/embedding` | POST | 文本向量化                 |
| `/api/rag/init`  | POST | 初始化 RAG 向量库          |
| `/api/rag/ask`   | POST | RAG 问答 (流式 + 来源文档) |

## 🧠 已学习的概念

### 1. LLM API 调用

- 使用 OpenAI SDK 连接火山引擎 API
- 通过 `baseURL` 配置切换不同 LLM 提供商
- 后端代理模式保护 API 密钥

### 2. 流式输出

- 后端：`stream: true` + `res.write()` 逐块发送
- 前端：`ReadableStream` + `TextDecoder` 实时渲染

### 3. Prompt 工程

- System Prompt 配置
- Few-shot 示例 (风格化翻译)
- Chain of Thought 思维链 (数学解题)
- Structured Output 结构化输出 (情感分析 JSON)

### 4. RAG (Retrieval-Augmented Generation)

- **Embedding API**: 将文本转换为向量
- **向量存储**: 内存中的 `vectorStore` 数组 (带类型定义)
- **余弦相似度**: 计算查询与文档的相关性
- **相似度阈值**: 75% 阈值过滤不相关文档
- **检索增强**: 将相关文档注入 Prompt
- **来源显示**: 前端显示检索到的文档及相似度分数

### 5. TypeScript 最佳实践

- 后端完整类型定义 (`KnowledgeDocument`, `VectorDocument`, `SearchResult`)
- 使用 `import type` 区分类型导入和运行时导入
- tsx 运行时无需编译步骤

## 📝 当前进度

**已完成**:

- ✅ React + Vite + TypeScript 项目初始化
- ✅ pnpm + ESLint 配置
- ✅ Node.js/Express 后端 + Volcengine API 集成
- ✅ 流式输出 (后端 stream + 前端 ReadableStream)
- ✅ Prompt 工程 UI (System Prompt + 模板切换)
- ✅ RAG 后端 (Embedding + 向量存储 + 相似度搜索 + 阈值过滤)
- ✅ RAG 前端集成 (模式切换、流式响应、来源文档显示)
- ✅ 后端 TypeScript 迁移 (server/_.js → server/_.ts)
- ✅ 注释风格规范化

**已解决的问题**:

- ESLint process 错误: `import process from 'node:process'`
- HTTP Header 中文编码: Base64 编码 + UTF-8 解码
- React 状态竞态: 使用 `map()` 创建新对象避免直接修改
- 相似度阈值: 0.75 阈值过滤不相关文档
- ESLint array-index-key: 给消息分配唯一 ID

**下一步**: 项目完善与总结

## 🚀 启动命令

```bash
# 安装依赖
pnpm install

# 启动后端 (端口 3000)
pnpm server

# 启动前端 (端口 5173，自动代理到后端)
pnpm dev
```

## ⚙️ 环境变量 (.env)

```env
AI_API_KEY=your-api-key
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_MODEL=your-model-id
AI_EMBEDDING_MODEL=your-embedding-model-id
PORT=3000
```

## 📏 代码规范

### 注释风格

- **JSDoc (`/** \*/`)\*\*: 用于变量、常量、接口、类型、函数定义
- **单行注释 (`//`)**: 用于路由说明、代码段分隔、行内解释

```typescript
/** 知识库文档的基础类型 */
interface KnowledgeDocument {
  id: string
  title: string
  content: string
}

// ========== API Routes ==========

// 健康检查端点
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})
```

## 🎓 教学风格

- 循序渐进，每步都解释原理
- 提供可运行的代码示例
- 遇到错误时详细解释解决方案
- 用类比帮助理解抽象概念（如"余弦相似度就像比较两个箭头的方向"）

---

_Last updated: 2025-12-04_
