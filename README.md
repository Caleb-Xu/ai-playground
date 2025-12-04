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

---

## 🗺️ 进阶学习路线

### 第一阶段：用户体验优化

#### 7. Markdown 渲染 ⏳

- [ ] 集成 react-markdown
- [ ] 代码块语法高亮 (highlight.js / prism)
- [ ] 支持表格、列表、链接等格式

#### 8. 对话历史管理 ⏳

- [ ] 多轮对话上下文传递
- [ ] localStorage 持久化存储
- [ ] 历史记录列表与切换

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

_Last updated: 2025-12-04_
