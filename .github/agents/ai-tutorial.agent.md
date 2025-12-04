# AI 前端开发教程 Agent

> 这是一个从零开始的 AI 应用开发教程项目。本文件帮助 Copilot 理解项目背景和当前进度。

## 📚 教程目标

指导用户完成以下能力：

1. ✅ LLM API 调用
2. ✅ 流式输出
3. ✅ Prompt 工程
4. ✅ RAG 后端实现
5. ⏳ RAG 前端集成
6. ⏳ 项目完善与总结

## 🛠️ 技术栈

| 类别      | 技术                                 |
| --------- | ------------------------------------ |
| 前端      | React 18 + TypeScript + Vite 5       |
| 后端      | Node.js 20 + Express                 |
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
│   ├── index.js            # Express 后端主入口
│   ├── knowledge.js        # RAG 知识库 (6 条模拟文档)
│   └── rag-utils.js        # RAG 工具函数 (余弦相似度、相似搜索)
├── src/
│   ├── components/
│   │   └── ChatBox.tsx     # 聊天组件 (流式输出、System Prompt)
│   └── data/
│       └── promptTemplates.ts  # Prompt 模板 (Few-shot, CoT, 结构化输出)
└── docs/
    └── SESSION_RESUME.md   # 会话恢复文档 (已被本文件取代)
```

## 🔌 API 端点

| 端点             | 方法 | 功能              |
| ---------------- | ---- | ----------------- |
| `/api/health`    | GET  | 健康检查          |
| `/api/chat`      | POST | LLM 对话 (流式)   |
| `/api/embedding` | POST | 文本向量化        |
| `/api/rag/init`  | POST | 初始化 RAG 向量库 |
| `/api/rag/ask`   | POST | RAG 问答          |

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
- **向量存储**: 内存中的 `vectorStore` 数组
- **余弦相似度**: 计算查询与文档的相关性
- **检索增强**: 将相关文档注入 Prompt

## 📝 当前进度

**最后完成**: RAG 后端测试成功

- `/api/rag/init` 初始化 6 条知识库文档
- `/api/rag/ask` 成功返回基于知识库的回答
- 修复了 HTTP Header 中文编码问题
- 修复了 PowerShell UTF-8 编码问题

**下一步**: RAG 前端集成

- 在 ChatBox 添加 RAG 模式切换
- 显示检索到的来源文档
- 展示相似度分数

## 🚀 启动命令

```bash
# 安装依赖
pnpm install

# 启动后端 (端口 3000)
pnpm run server

# 启动前端 (端口 5173，自动代理到后端)
pnpm run dev
```

## ⚙️ 环境变量 (.env)

```env
AI_API_KEY=your-api-key
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_MODEL=your-model-id
AI_EMBEDDING_MODEL=your-embedding-model-id
PORT=3000
```

## 🎓 教学风格

- 循序渐进，每步都解释原理
- 提供可运行的代码示例
- 遇到错误时详细解释解决方案
- 用类比帮助理解抽象概念（如"余弦相似度就像比较两个箭头的方向"）
