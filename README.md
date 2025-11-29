# 🤖 AI Playground

这是一个用于学习和实践 AI 应用开发的前端项目。通过构建这个项目，我们将从零开始掌握 LLM API 调用、Prompt 工程、流式输出以及 RAG 等核心能力。

## 🛠️ 技术栈

- **框架**: React + TypeScript
- **构建工具**: Vite
- **包管理**: pnpm
- **代码规范**: ESLint (@antfu/eslint-config)

## 📚 学习路线与进度

### 1. 环境搭建 ✅

- [x] 初始化 React + Vite + TypeScript 项目
- [x] 配置 pnpm 和 ESLint

### 2. LLM API 基础 (即将开始)

- [ ] 选择合适的 API
- [ ] 前端安全调用
- [ ] 处理模型返回结果

### 3. 流式输出 (Streaming)

- [ ] fetch / EventSource / WebSocket
- [ ] UI 逐字显示效果
- [ ] 中断与错误处理

### 4. Prompt 工程

- [ ] System / User / Tool Prompts
- [ ] 结构化 Prompt 设计
- [ ] Few-shot & Chain-of-Thought

### 5. RAG (检索增强生成)

- [ ] 向量嵌入 (Embeddings)
- [ ] 向量检索
- [ ] 完整问答链路

## 🚀 快速开始

1.  **安装依赖**

    ```bash
    pnpm install
    ```

2.  **启动开发服务器**

    ```bash
    pnpm dev
    ```

3.  **代码检查与修复**

    ```bash
    pnpm lint:fix
    ```

## 💻 如何在其他设备继续开发

如果你 clone 了这个仓库到新电脑，请按以下步骤恢复环境：

1.  **安装依赖**

    ```bash
    # 如果没有安装 pnpm
    npm install -g pnpm

    # 安装项目依赖
    pnpm install
    ```

2.  **配置环境变量**
    项目根目录下的 `.env` 文件被 git 忽略了（为了安全）。你需要手动创建一个 `.env` 文件，并填入以下内容：

    ```properties
    # .env
    AI_API_KEY=你的_API_KEY_这里
    AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # 或者其他服务商地址
    AI_MODEL=你的模型ID
    PORT=3000
    ```

3.  **启动服务**
    需要同时启动前端和后端：
    - 终端 1 (后端): `pnpm server`
    - 终端 2 (前端): `pnpm dev`

---

_Last updated: 2025-11-29_
