import { useEffect, useState } from 'react'
import type { Message } from './types'
import { generateMessageId } from './types'

// 常量配置
const RENDER_INTERVAL = 50 // 每 50ms 最多渲染一次

interface UseChatOptions {
  systemPrompt: string
  isRagMode: boolean
  conversationId: string | null
  onTitleGenerated?: (title: string) => void
}

/** 聊天核心逻辑 Hook */
export function useChat({ systemPrompt, isRagMode, conversationId, onTitleGenerated }: UseChatOptions) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 加载会话历史消息
  useEffect(() => {
    if (!conversationId)
      return

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`)
        const data = await res.json()
        
        // 将后端消息转换为前端 Message 格式
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: generateMessageId(),
          role: msg.role,
          content: msg.content,
          isStreaming: false,
          // 解析 sources JSON 字符串
          sources: msg.sources ? JSON.parse(msg.sources) : undefined,
        }))
        
        setMessages(loadedMessages)
      }
      catch (error) {
        console.error('Failed to load conversation messages:', error)
      }
    }

    loadMessages()
  }, [conversationId])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading || !conversationId)
      return

    const userMessage: Message = { id: generateMessageId(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let response: Response

      if (isRagMode) {
        // RAG 模式：调用 /api/rag/ask（流式）
        response = await fetch('/api/rag/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: userMessage.content,
            conversationId,
          }),
        })
      }
      else {
        // 普通模式：调用 /api/chat（流式）
        const apiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: userMessage.role, content: userMessage.content },
        ]

        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: apiMessages,
            conversationId,
          }),
        })
      }

      if (!response.ok)
        throw new Error(`Request failed: ${response.status}`)

      if (!response.body)
        throw new Error('No response body')

      // 从响应头读取自动生成的标题
      const generatedTitleHeader = response.headers.get('X-Generated-Title')
      if (generatedTitleHeader && onTitleGenerated) {
        try {
          const binaryString = atob(generatedTitleHeader)
          const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0))
          const title = new TextDecoder('utf-8').decode(bytes)
          onTitleGenerated(title)
        }
        catch (e) {
          console.error('Failed to parse generated title:', e)
        }
      }

      // RAG 模式：从响应头解析来源文档
      let sources: Message['sources']
      if (isRagMode) {
        const sourcesHeader = response.headers.get('X-RAG-Sources')
        if (sourcesHeader) {
          try {
            // Base64 解码 + UTF-8 处理
            const binaryString = atob(sourcesHeader)
            const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0))
            const decoded = new TextDecoder('utf-8').decode(bytes)
            sources = JSON.parse(decoded)
          }
          catch (e) {
            console.error('Failed to parse RAG sources:', e)
          }
        }
      }

      // 创建一个空的 Assistant 消息占位
      const assistantId = generateMessageId()
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        sources,
      }
      setMessages(prev => [...prev, assistantMessage])

      // 流式读取 - 使用缓冲区减少渲染次数
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastRenderTime = 0

      // 统一的消息更新函数
      const updateAssistantMessage = (textToAdd: string, isDone = false) => {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: msg.content + textToAdd, isStreaming: !isDone }
            : msg,
        ))
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 流结束，渲染剩余内容并标记完成
          updateAssistantMessage(buffer, true)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 节流：限制渲染频率
        const now = Date.now()
        if (now - lastRenderTime >= RENDER_INTERVAL) {
          updateAssistantMessage(buffer)
          buffer = ''
          lastRenderTime = now
        }
      }
    }
    catch (error) {
      console.error('Error:', error)
      // eslint-disable-next-line no-alert
      alert('发送失败，请检查控制台')
    }
    finally {
      setIsLoading(false)
    }
  }

  // 清空历史记录
  const clearMessages = () => {
    setMessages([])
  }

  return {
    input,
    setInput,
    messages,
    isLoading,
    handleSend,
    clearMessages,
  }
}

interface UseRagInitOptions {
  isRagMode: boolean
}

/** RAG 初始化 Hook */
export function useRagInit({ isRagMode }: UseRagInitOptions) {
  const [ragInitialized, setRagInitialized] = useState(false)
  const [ragInitializing, setRagInitializing] = useState(false)

  const initRag = async () => {
    setRagInitializing(true)
    try {
      const res = await fetch('/api/rag/init', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setRagInitialized(true)
        // eslint-disable-next-line no-console
        console.log(`RAG 初始化成功: ${data.message}`)
      }
    }
    catch (error) {
      console.error('RAG 初始化失败:', error)
    }
    finally {
      setRagInitializing(false)
    }
  }

  // 切换 RAG 模式时自动初始化
  useEffect(() => {
    if (isRagMode && !ragInitialized && !ragInitializing) {
      initRag()
    }
  }, [isRagMode, ragInitialized, ragInitializing])

  return {
    ragInitialized,
    ragInitializing,
  }
}
