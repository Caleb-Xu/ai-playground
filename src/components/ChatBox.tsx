import { useState } from 'react'
import { PROMPT_TEMPLATES } from '../data/promptTemplates'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function ChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES[0].systemPrompt)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSystemPrompt(template.systemPrompt)
      if (template.userPromptSample) {
        setInput(template.userPromptSample)
      }
      // 切换模板时清空历史记录，避免上下文干扰
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading)
      return

    const userMessage: Message = { role: 'user', content: input }
    // 注意：这里我们只更新 UI 显示的消息列表，不把 system prompt 放进去
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 构造发送给 API 的完整消息历史，包含 System Prompt
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage,
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      })

      if (!response.ok)
        throw new Error('Network response was not ok')

      if (!response.body)
        throw new Error('No response body')

      // 1. 创建一个空的 Assistant 消息占位
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])

      // 2. 获取 Reader 和 Decoder
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 3. 循环读取流
      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        // 解码二进制数据块
        const text = decoder.decode(value, { stream: true })

        // 更新最后一条消息的内容
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMsg = newMessages.at(-1)
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content += text
          }
          return newMessages
        })
      }
    }
    catch (error) {
      console.error('Error:', error)
      alert('发送失败，请检查控制台')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          onChange={handleTemplateChange}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #444',
            background: '#242424',
            color: '#fff',
            flex: 1,
          }}
        >
          {PROMPT_TEMPLATES.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#ccc',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em',
            whiteSpace: 'nowrap',
          }}
        >
          {showSystemPrompt ? '🔽 收起' : '⚙️ 查看 Prompt'}
        </button>
      </div>

      {showSystemPrompt && (
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          style={{
            width: '100%',
            height: '150px',
            marginBottom: '20px',
            padding: '10px',
            background: '#242424',
            border: '1px solid #444',
            color: '#fff',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          }}
          placeholder="在这里输入 System Prompt..."
        />
      )}

      <div style={{
        border: '1px solid #444',
        borderRadius: '8px',
        height: '400px',
        overflowY: 'auto',
        padding: '20px',
        marginBottom: '20px',
        background: '#1a1a1a',
      }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '150px' }}>
            开始你的第一次 AI 对话吧...
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                background: msg.role === 'user' ? '#0066cc' : '#333',
                color: '#fff',
                maxWidth: '80%',
                textAlign: 'left',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#666' }}>AI 正在思考...</div>}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #444',
            background: '#242424',
            color: '#fff',
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            background: isLoading ? '#666' : '#646cff',
            color: '#fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
