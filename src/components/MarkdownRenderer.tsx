import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

/** 复制按钮组件 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '4px 8px',
        fontSize: '12px',
        backgroundColor: copied ? '#22c55e' : '#374151',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {copied ? '已复制!' : '复制'}
    </button>
  )
}

/** Markdown 渲染组件，支持代码高亮和 GFM */
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义代码块渲染
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')

            // 如果有语言标识，使用语法高亮
            if (match) {
              return (
                <div style={{ position: 'relative', margin: '8px 0' }}>
                  <CopyButton code={codeString} />
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '6px',
                      fontSize: '0.9em',
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            }

            // 行内代码
            return (
              <code
                className={className}
                style={{
                  backgroundColor: '#1f2937',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
          // 段落样式 - 避免默认的大 margin
          p({ children }) {
            return (
              <p style={{ margin: '8px 0', lineHeight: 1.6 }}>
                {children}
              </p>
            )
          },
          // 列表样式
          ul({ children }) {
            return (
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {children}
              </ol>
            )
          },
          // 自定义表格样式
          table({ children }) {
            return (
              <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table
                  style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    minWidth: '300px',
                  }}
                >
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th
                style={{
                  border: '1px solid #4b5563',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td
                style={{
                  border: '1px solid #4b5563',
                  padding: '8px 12px',
                }}
              >
                {children}
              </td>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
