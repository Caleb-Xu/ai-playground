import type { Message } from './types'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

/** 消息列表组件 */
export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div
      style={{
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
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && <div style={{ color: '#666' }}>AI 正在思考...</div>}
    </div>
  )
}
