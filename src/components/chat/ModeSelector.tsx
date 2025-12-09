interface ModeSelectorProps {
  isRagMode: boolean
  onModeChange: (isRag: boolean) => void
  ragInitialized: boolean
  ragInitializing: boolean
}

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
        onClick={() => onModeChange(true)}
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
