# AI 前端开发教程 Agent

> 本文件为 GitHub Copilot 提供项目上下文。完整学习路线请参考 `README.md`。

## 📍 当前进度

**已完成**: 基础阶段 (1-6) + 第 7 模块 Markdown 渲染

**下一步**: 第 8 模块 - 对话历史管理 (多轮上下文 + localStorage)

## � 已解决的技术问题

| 问题                      | 解决方案                                  |
| ------------------------- | ----------------------------------------- |
| ESLint process 未定义     | `import process from 'node:process'`      |
| HTTP Header 中文乱码      | Base64 编码 + 前端 UTF-8 解码             |
| React 状态竞态 (重复文本) | 使用 `map()` 创建新对象，避免直接修改     |
| RAG 返回不相关文档        | 添加 0.75 相似度阈值过滤                  |
| ESLint array-index-key    | 给消息分配唯一 ID (`generateMessageId()`) |

## � 代码规范

### 注释风格

```typescript
/** JSDoc: 用于变量、接口、类型、函数定义 */
interface KnowledgeDocument {
  id: string
  title: string
}

// 单行注释: 用于路由说明、代码段分隔、行内解释
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})
```

### 类型导入

```typescript
// 区分类型导入和运行时导入
import type { Request, Response } from 'express'
import express from 'express'
```

## 🔌 API 端点速查

| 端点             | 方法 | 说明                   |
| ---------------- | ---- | ---------------------- |
| `/api/chat`      | POST | LLM 对话 (流式)        |
| `/api/embedding` | POST | 文本向量化             |
| `/api/rag/init`  | POST | 初始化向量库           |
| `/api/rag/ask`   | POST | RAG 问答 (流式 + 来源) |

## 🎓 教学风格

- 循序渐进，每步解释原理
- 提供可运行的代码示例
- 遇到错误时详细解释解决方案
- 用类比帮助理解抽象概念

---

_Last updated: 2025-12-04_
