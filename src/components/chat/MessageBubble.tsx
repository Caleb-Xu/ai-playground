import type { Message } from './types'
import MarkdownRenderer from '../MarkdownRenderer'
import RagSources from './RagSources'

interface MessageBubbleProps {
  message: Message
}

/** 单个消息气泡组件 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      style={{
        marginBottom: '12px',
        textAlign: message.role === 'user' ? 'right' : 'left',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '8px 12px',
          borderRadius: '12px',
          background: message.role === 'user' ? '#0066cc' : '#333',
          color: '#fff',
          maxWidth: '80%',
          textAlign: 'left',
          minHeight: message.role === 'assistant' ? '24px' : 'auto',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          overflow: 'hidden',
        }}
      >
        {message.role === 'user'
          ? message.content
          : (
              <>
                <MarkdownRenderer content={message.content} />
                {message.isStreaming && <span className="cursor-blink">▊</span>}
              </>
            )}
      </div>

      {/* RAG 来源文档显示 */}
      {message.sources && message.sources.length > 0 && (
        <RagSources sources={message.sources} />
      )}
    </div>
  )
}
