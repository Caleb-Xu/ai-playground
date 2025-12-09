interface ModeSelectorProps {
  isRagMode: boolean
  onModeChange: (isRag: boolean) => void
  ragInitialized: boolean
  ragInitializing: boolean
}

// 按钮样式常量
const BUTTON_BASE_STYLE = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
} as const

/** 对话模式切换组件 */
export default function ModeSelector({
  isRagMode,
  onModeChange,
  ragInitialized,
  ragInitializing,
}: ModeSelectorProps) {
  return (
    <div
      style={{
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
        onClick={() => onModeChange(false)}
        style={{
          ...BUTTON_BASE_STYLE,
          background: !isRagMode ? '#646cff' : '#333',
        }}
      >
        💬 普通对话
      </button>
      <button
        type="button"
        onClick={() => onModeChange(true)}
        style={{
          ...BUTTON_BASE_STYLE,
          background: isRagMode ? '#646cff' : '#333',
        }}
      >
        📚 RAG 问答
      </button>
      {isRagMode && (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.8em',
            color: ragInitialized ? '#4caf50' : '#ff9800',
          }}
        >
          {ragInitializing ? '⏳ 初始化中...' : ragInitialized ? '✅ 知识库就绪' : '⚠️ 未初始化'}
        </span>
      )}
    </div>
  )
}
