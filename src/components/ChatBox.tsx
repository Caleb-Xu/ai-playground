import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading)
      return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
          const lastMsg = newMessages[newMessages.length - 1]
          if (lastMsg.role === 'assistant') {
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
