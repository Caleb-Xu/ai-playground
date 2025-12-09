import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PROMPT_TEMPLATES } from '../data/promptTemplates'
import ModeSelector from './chat/ModeSelector'
import PromptTemplateSelector from './chat/PromptTemplateSelector'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'
import { ConversationList } from './chat/ConversationList'
import { useChat, useRagInit } from './chat/useChat'
import { useConversations } from './chat/useConversations'

/** 聊天主组件 */
export function ChatBox() {
  const navigate = useNavigate()
  const { conversationId: urlConversationId } = useParams<{ conversationId?: string }>()
  
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES[0].systemPrompt)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [isRagMode, setIsRagMode] = useState(false)

  // 会话管理
  const {
    conversations,
    currentConversationId,
    currentConversation,
    createConversation,
    deleteConversation,
    selectConversation,
    updateConversationTitle,
    refreshConversations,
  } = useConversations(urlConversationId)

  // 当 currentConversationId 变化时,更新 URL (仅当不在根路径且 ID 不匹配时)
  useEffect(() => {
    if (currentConversationId) {
      // 如果当前在 /chat/:id 路由,但 ID 不匹配,更新 URL
      if (urlConversationId && currentConversationId !== urlConversationId) {
        navigate(`/chat/${currentConversationId}`, { replace: true })
      }
      // 如果当前在根路径 "/",导航到 /chat/:id
      else if (!urlConversationId && window.location.pathname === '/') {
        navigate(`/chat/${currentConversationId}`, { replace: true })
      }
    }
  }, [currentConversationId, urlConversationId, navigate])

  // 当切换会话时,同步 isRagMode 状态
  useEffect(() => {
    if (currentConversation) {
      const newIsRagMode = currentConversation.is_rag_mode === 1
      // 只在值真正改变时才更新,避免不必要的重渲染
      if (newIsRagMode !== isRagMode) {
        setIsRagMode(newIsRagMode)
      }
    }
  }, [currentConversation?.id, currentConversation?.is_rag_mode])

  // RAG 初始化
  const { ragInitialized, ragInitializing } = useRagInit({ isRagMode })

  // 聊天逻辑
  const { input, setInput, messages, isLoading, handleSend, clearMessages } = useChat({
    systemPrompt,
    isRagMode,
    conversationId: currentConversationId,
    onTitleGenerated: (title) => {
      // 当接收到自动生成的标题时,立即更新本地状态
      if (currentConversationId) {
        updateConversationTitle(currentConversationId, title)
      }
    },
  })

  // 模式切换处理 - 同步到后端
  const handleModeChange = async (newIsRagMode: boolean) => {
    setIsRagMode(newIsRagMode)
    
    // 如果有当前会话,更新其模式
    if (currentConversationId) {
      try {
        await fetch(`/api/conversations/${currentConversationId}/mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRagMode: newIsRagMode }),
        })
        // 刷新会话列表以同步最新状态,但保持当前选中
        await refreshConversations(true)
      }
      catch (error) {
        console.error('Failed to update conversation mode:', error)
      }
    }
  }

  // 模板切换处理
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSystemPrompt(template.systemPrompt)
      if (template.userPromptSample) {
        setInput(template.userPromptSample)
      }
      // 切换模板时清空历史记录，避免上下文干扰
      clearMessages()
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 左侧会话列表 */}
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onCreateConversation={createConversation}
        onDeleteConversation={deleteConversation}
        onUpdateTitle={updateConversationTitle}
        isRagMode={isRagMode}
      />

      {/* 右侧聊天区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#242424' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 模式切换 */}
          <ModeSelector
            isRagMode={isRagMode}
            onModeChange={handleModeChange}
            ragInitialized={ragInitialized}
            ragInitializing={ragInitializing}
          />

          {/* Prompt 模板选择（仅普通模式显示） */}
          {!isRagMode && (
            <PromptTemplateSelector
              systemPrompt={systemPrompt}
              showSystemPrompt={showSystemPrompt}
              onSystemPromptChange={setSystemPrompt}
              onToggleSystemPrompt={() => setShowSystemPrompt(!showSystemPrompt)}
              onTemplateChange={handleTemplateChange}
            />
          )}

          {/* 消息列表 */}
          <MessageList messages={messages} isLoading={isLoading} />

          {/* 输入框 */}
          <ChatInput
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  )
}
