# 🤖 AI Playground

这是一个用于学习和实践 AI 应用开发的前端项目。通过构建这个项目，我们将从零开始掌握 LLM API 调用、Prompt 工程、流式输出以及 RAG 等核心能力。

## 🛠️ 技术栈

| 类别     | 技术                                 |
| -------- | ------------------------------------ |
| 前端     | React 18 + TypeScript + Vite 5       |
| 后端     | Node.js 20 + Express + TypeScript    |
| TS 运行  | tsx (无需编译直接运行 TS)            |
| 包管理   | pnpm                                 |
| 代码规范 | ESLint (@antfu/eslint-config)        |
| LLM API  | 火山引擎 (Volcengine) via OpenAI SDK |

## ✨ 功能特性

- **流式对话**: 实时显示 AI 的逐字回复，提升用户体验
- **Prompt 工程**: 支持 System Prompt 配置和多种提示模板
- **RAG 模式**: 基于知识库的检索增强生成，显示来源文档及相似度
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

_Last updated: 2025-12-04_
