import { PROMPT_TEMPLATES } from '../../data/promptTemplates'

interface PromptTemplateSelectorProps {
  systemPrompt: string
  showSystemPrompt: boolean
  onSystemPromptChange: (prompt: string) => void
  onToggleSystemPrompt: () => void
  onTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

/** Prompt 模板选择组件 */
export default function PromptTemplateSelector({
  systemPrompt,
  showSystemPrompt,
  onSystemPromptChange,
  onToggleSystemPrompt,
  onTemplateChange,
}: PromptTemplateSelectorProps) {
  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          onChange={onTemplateChange}
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
          onClick={onToggleSystemPrompt}
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
          onChange={e => onSystemPromptChange(e.target.value)}
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
    </>
  )
}
