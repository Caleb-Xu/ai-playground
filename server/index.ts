import type { Request, Response } from 'express'
import type { VectorDocument } from './knowledge'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { OpenAI } from 'openai'
import { KNOWLEDGE_BASE } from './knowledge'
import { searchSimilar } from './rag-utils'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

/**
 * 初始化 OpenAI 客户端
 * 注意：这里我们虽然用了 OpenAI SDK，但可以通过 baseURL 指向任何兼容 OpenAI 接口的服务
 */
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'dummy-key',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Chat API - 流式对话
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body

    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' })
    }

    // 开启流式模式
    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages,
      stream: true,
    })

    // 设置响应头，告诉浏览器这是一个流
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    // 遍历流，把每个片段实时写回给前端
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        res.write(content)
      }
    }

    res.end()
  }
  catch (error) {
    console.error('Error calling AI API:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to fetch response from AI',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    else {
      res.end()
    }
  }
})

// ========== RAG 相关接口 ==========

// Embedding API - 把文本转换成向量
app.post('/api/embedding', async (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // 支持单个字符串或字符串数组
    const input = Array.isArray(text) ? text : [text]

    const response = await client.embeddings.create({
      model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input,
    })

    res.json({
      embeddings: response.data.map(item => item.embedding),
      model: response.model,
      usage: response.usage,
    })
  }
  catch (error) {
    console.error('Error calling Embedding API:', error)
    res.status(500).json({
      error: 'Failed to generate embedding',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// ========== RAG 完整实现 ==========

/** 内存中的向量库 */
let vectorStore: VectorDocument[] = []

// 初始化向量库 - 把知识库文档全部向量化
app.post('/api/rag/init', async (_req: Request, res: Response) => {
  try {
    // eslint-disable-next-line no-console
    console.log('🔄 Initializing vector store...')

    const texts = KNOWLEDGE_BASE.map(doc => doc.content)

    const response = await client.embeddings.create({
      model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: texts,
    })

    vectorStore = KNOWLEDGE_BASE.map((doc, index) => ({
      ...doc,
      embedding: response.data[index].embedding,
    }))

    // eslint-disable-next-line no-console
    console.log(`✅ Vector store initialized with ${vectorStore.length} documents`)

    res.json({
      success: true,
      message: `Initialized ${vectorStore.length} documents`,
      documents: vectorStore.map(d => ({ id: d.id, title: d.title })),
    })
  }
  catch (error) {
    console.error('Error initializing vector store:', error)
    res.status(500).json({
      error: 'Failed to initialize vector store',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// RAG 问答接口 - 检索 + 生成（流式）
app.post('/api/rag/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    if (vectorStore.length === 0) {
      return res.status(400).json({
        error: 'Vector store is empty. Please call /api/rag/init first.',
      })
    }

    // Step 1: 把用户问题转成向量
    const questionEmbedding = await client.embeddings.create({
      model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: [question],
    })
    const queryVector = questionEmbedding.data[0].embedding

    // Step 2: 在向量库中搜索最相关的文档
    const allDocs = searchSimilar(queryVector, vectorStore, 3)

    // 设置相似度阈值：只保留相似度 > 0.75 的文档
    const SIMILARITY_THRESHOLD = 0.75
    const relevantDocs = allDocs.filter(doc => doc.score >= SIMILARITY_THRESHOLD)

    // Step 3: 构造带上下文的 Prompt
    let systemPrompt: string

    if (relevantDocs.length > 0) {
      const context = relevantDocs
        .map(doc => `【${doc.title}】\n${doc.content}`)
        .join('\n\n')

      systemPrompt = `你是一个智能客服助手。请根据以下参考资料回答用户的问题。
请基于参考资料给出准确的回答。

===== 参考资料 =====
${context}
===== 参考资料结束 =====`
    }
    else {
      systemPrompt = `你是一个智能客服助手。用户的问题超出了你的知识范围。
请礼貌地告诉用户你没有找到相关信息，并说明你可以回答关于课程内容、技术支持、退款政策等方面的问题。`
    }

    // Step 4: 调用 Chat API（流式输出）
    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      stream: true,
    })

    // 设置响应头
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    // 只返回通过阈值的相关文档
    const sourcesData = relevantDocs.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      similarity: d.score,
    }))
    res.setHeader('X-RAG-Sources', Buffer.from(JSON.stringify(sourcesData)).toString('base64'))

    // 流式输出
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        res.write(content)
      }
    }

    res.end()
  }
  catch (error) {
    console.error('Error in RAG ask:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to process RAG question',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    else {
      res.end()
    }
  }
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running at http://localhost:${port}`)
})
