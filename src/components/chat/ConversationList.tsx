import { useState } from 'react'
import type { Conversation } from './useConversations'

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onCreateConversation: (isRagMode: boolean) => void
  onDeleteConversation: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  isRagMode: boolean
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onUpdateTitle,
  isRagMode,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  /** 格式化时间戳为可读日期 */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    if (days === 1) {
      return '昨天'
    }
    if (days < 7) {
      return `${days}天前`
    }
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }

  /** 开始编辑标题 */
  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditingTitle(conv.title)
  }

  /** 保存标题 */
  const saveTitle = async (id: string) => {
    if (editingTitle.trim() && editingTitle !== conversations.find(c => c.id === id)?.title) {
      await onUpdateTitle(id, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle('')
  }

  /** 取消编辑 */
  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>会话历史</h2>
        <button
          type="button"
          onClick={() => onCreateConversation(isRagMode)}
          className="new-conversation-btn"
          title="新建会话"
        >
          + 新会话
        </button>
      </div>

      <div className="conversation-items">
        {conversations.length === 0
          ? (
              <div className="empty-state">
                暂无会话,点击上方按钮创建
              </div>
            )
          : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="conversation-title">
                    {conv.is_rag_mode === 1 && <span className="rag-badge">RAG</span>}
                    {editingId === conv.id
                      ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onBlur={() => saveTitle(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveTitle(conv.id)
                              }
                              else if (e.key === 'Escape') {
                                cancelEditing()
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                            className="title-input"
                            autoFocus
                          />
                        )
                      : (
                          <span
                            className="title-text"
                            onDoubleClick={e => startEditing(conv, e)}
                          >
                            {conv.title}
                          </span>
                        )}
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-date">{formatDate(conv.updated_at)}</span>
                    <div className="action-buttons">
                      {editingId !== conv.id && (
                        <button
                          type="button"
                          onClick={e => startEditing(conv, e)}
                          className="edit-btn"
                          title="编辑标题"
                        >
                          ✎
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(conv.id)
                        }}
                        className="delete-btn"
                        title="删除会话"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
      </div>

      <style>{`
        .conversation-list {
          width: 280px;
          background: #1a1a1a;
          border-right: 1px solid #404040;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .conversation-list-header {
          padding: 16px;
          border-bottom: 1px solid #404040;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .conversation-list-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #e5e7eb;
        }

        .new-conversation-btn {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .new-conversation-btn:hover {
          background: #2563eb;
        }

        .conversation-items {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-state {
          padding: 24px 16px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .conversation-item {
          padding: 12px;
          margin-bottom: 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          color: #e5e7eb;
        }

        .conversation-item:hover {
          background: #2d2d2d;
        }

        .conversation-item.active {
          background: #2563eb;
          color: white;
        }

        .conversation-title {
          font-weight: 500;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .title-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .title-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 4px 8px;
          color: inherit;
          font-size: inherit;
          font-family: inherit;
          outline: none;
        }

        .title-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .rag-badge {
          background: #10b981;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .conversation-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #9ca3af;
        }

        .conversation-item.active .conversation-meta {
          color: rgba(255, 255, 255, 0.7);
        }

        .action-buttons {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s, background-color 0.2s;
        }

        .edit-btn {
          color: #60a5fa;
        }

        .delete-btn {
          color: #ef4444;
        }

        .conversation-item:hover .edit-btn,
        .conversation-item:hover .delete-btn {
          opacity: 1;
        }

        .edit-btn:hover {
          background: rgba(96, 165, 250, 0.2);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .conversation-item.active .edit-btn,
        .conversation-item.active .delete-btn {
          color: white;
        }
      `}</style>
    </div>
  )
}
