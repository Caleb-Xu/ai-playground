import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { OpenAI } from 'openai'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize OpenAI client
// 注意：这里我们虽然用了 OpenAI SDK，但可以通过 baseURL 指向任何兼容 OpenAI 接口的服务（如 DeepSeek, Moonshot 等）
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'dummy-key',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' })
    }

    // 开启流式模式
    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages,
      stream: true, // 关键点：开启流式
    })

    // 设置响应头，告诉浏览器这是一个流
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    // 遍历流，把每个片段 (chunk) 实时写回给前端
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        res.write(content)
      }
    }

    // 流结束
    res.end()
  }
  catch (error) {
    console.error('Error calling AI API:', error)
    // 如果流还没开始就报错，返回 JSON 错误；如果流已经开始，只能在流里中断
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to fetch response from AI',
        details: error.message,
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
