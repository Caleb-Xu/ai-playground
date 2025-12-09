import { useState } from 'react'
import { PROMPT_TEMPLATES } from '../data/promptTemplates'
import ModeSelector from './chat/ModeSelector'
import PromptTemplateSelector from './chat/PromptTemplateSelector'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'
import { useChat, useRagInit } from './chat/useChat'

/** 聊天主组件 */
export function ChatBox() {
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES[0].systemPrompt)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [isRagMode, setIsRagMode] = useState(false)

  // RAG 初始化
  const { ragInitialized, ragInitializing } = useRagInit({ isRagMode })

  // 聊天逻辑
  const { input, setInput, messages, isLoading, handleSend, clearMessages } = useChat({
    systemPrompt,
    isRagMode,
  })

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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 模式切换 */}
      <ModeSelector
        isRagMode={isRagMode}
        onModeChange={setIsRagMode}
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
  )
}
