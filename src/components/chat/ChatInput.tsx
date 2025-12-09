interface ChatInputProps {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

/** 聊天输入框组件 */
export default function ChatInput({ input, isLoading, onInputChange, onSend }: ChatInputProps) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <input
        type="text"
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSend()}
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
        onClick={onSend}
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
  )
}
