import { useEffect, useState } from 'react'
import { PROMPT_TEMPLATES } from '../data/promptTemplates'
import MarkdownRenderer from './MarkdownRenderer'

// 生成唯一 ID
let messageIdCounter = 0
function generateMessageId(): string {
  messageIdCounter += 1
  return `msg-${Date.now()}-${messageIdCounter}`
}

interface Message {
  id: string // 唯一标识符
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean // 标记是否正在流式输出
  // RAG 模式下的来源文档
  sources?: Array<{
    title: string
    content: string
    similarity: number
  }>
}

export function ChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES[0].systemPrompt)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)

  // RAG 相关状态
  const [isRagMode, setIsRagMode] = useState(false)
  const [ragInitialized, setRagInitialized] = useState(false)
  const [ragInitializing, setRagInitializing] = useState(false)

  // 初始化 RAG 向量库
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
          body: JSON.stringify({ question: userMessage.content }),
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
          body: JSON.stringify({ messages: apiMessages }),
        })
      }

      if (!response.ok)
        throw new Error(`Request failed: ${response.status}`)

      if (!response.body)
        throw new Error('No response body')

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
      const RENDER_INTERVAL = 50 // 每 50ms 最多渲染一次

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 流结束，渲染剩余内容并标记完成
          if (buffer) {
            setMessages(prev => prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + buffer, isStreaming: false }
                : msg,
            ))
          }
          else {
            setMessages(prev => prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, isStreaming: false }
                : msg,
            ))
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // 节流：限制渲染频率
        const now = Date.now()
        if (now - lastRenderTime >= RENDER_INTERVAL) {
          const textToRender = buffer
          buffer = ''
          lastRenderTime = now

          setMessages(prev => prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + textToRender }
              : msg,
          ))
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 模式切换 */}
      <div style={{
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        padding: '10px',
        background: '#1a1a1a',
        borderRadius: '8px',
        alignItems: 'center',
      }}
      >
        <span style={{ color: '#888', fontSize: '0.9em' }}>模式:</span>
        <button
          type="button"
          onClick={() => setIsRagMode(false)}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: !isRagMode ? '#646cff' : '#333',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          💬 普通对话
        </button>
        <button
          type="button"
          onClick={() => setIsRagMode(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: isRagMode ? '#646cff' : '#333',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          📚 RAG 问答
        </button>
        {isRagMode && (
          <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: ragInitialized ? '#4caf50' : '#ff9800' }}>
            {ragInitializing ? '⏳ 初始化中...' : ragInitialized ? '✅ 知识库就绪' : '⚠️ 未初始化'}
          </span>
        )}
      </div>

      {/* Prompt 模板选择（仅普通模式显示） */}
      {!isRagMode && (
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
      )}

      {!isRagMode && showSystemPrompt && (
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
        overflowX: 'hidden',
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
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
              overflow: 'hidden',
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
                minHeight: msg.role === 'assistant' ? '24px' : 'auto',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {msg.role === 'user'
                ? msg.content
                : (
                    <>
                      <MarkdownRenderer content={msg.content} />
                      {msg.isStreaming && <span className="cursor-blink">▊</span>}
                    </>
                  )}
            </div>
            {/* RAG 来源文档显示 */}
            {msg.sources && msg.sources.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: '#252525',
                borderRadius: '8px',
                fontSize: '0.85em',
                textAlign: 'left',
              }}
              >
                <div style={{ color: '#888', marginBottom: '6px' }}>
                  📚 参考来源:
                </div>
                {msg.sources.map(source => (
                  <div
                    key={source.title}
                    style={{
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: '#1a1a1a',
                      borderRadius: '4px',
                      borderLeft: '3px solid #646cff',
                    }}
                  >
                    <div style={{ color: '#aaa', fontWeight: 'bold' }}>
                      {source.title}
                      <span style={{ marginLeft: '8px', color: '#4caf50', fontSize: '0.85em' }}>
                        相似度:
                        {' '}
                        {(source.similarity * 100).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div style={{ color: '#777', marginTop: '4px' }}>
                      {source.content.slice(0, 100)}
                      {source.content.length > 100 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
