import type { Message } from './types'

interface RagSourcesProps {
  sources: NonNullable<Message['sources']>
}

/** RAG 来源文档显示组件 */
export default function RagSources({ sources }: RagSourcesProps) {
  return (
    <div
      style={{
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
      {sources.map(source => (
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
  )
}
