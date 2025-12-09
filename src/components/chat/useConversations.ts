import { useEffect, useRef, useState } from 'react'

/** 会话接口 */
export interface Conversation {
  id: string
  title: string
  created_at: number
  updated_at: number
  is_rag_mode: 0 | 1
}

/** 会话管理 Hook */
export function useConversations(initialConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId || null)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useRef(false)

  // 加载所有会话
  const loadConversations = async (keepCurrentSelection = false) => {
    console.log('🔄 Loading conversations...')
    setIsLoading(true)
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      
      setConversations(data)
      
      // 如果需要保持当前选中状态,直接返回
      if (keepCurrentSelection) {
        setIsLoading(false)
        return data.length > 0
      }

      // 验证 URL 中的初始会话 ID (仅在首次加载时)
      if (initialConversationId && !currentConversationId) {
        const conversationExists = data.some((c: Conversation) => c.id === initialConversationId)
        if (conversationExists) {
          console.log(`✅ 从 URL 恢复会话: ${initialConversationId}`)
          setCurrentConversationId(initialConversationId)
          return true
        } else {
          console.warn(`⚠️ 会话 ${initialConversationId} 不存在,选择第一个会话`)
        }
      }

      // 如果没有初始会话 ID 或会话不存在,自动选择第一个
      if (!currentConversationId && data.length > 0) {
        setCurrentConversationId(data[0].id)
        return true
      }
      return data.length > 0
    }
    catch (error) {
      console.error('Failed to load conversations:', error)
      return false
    }
    finally {
      setIsLoading(false)
    }
  }

  // 创建新会话
  const createConversation = async (isRagMode = false) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRagMode }),
      })
      const newConversation = await res.json()
      
      setConversations(prev => [newConversation, ...prev])
      setCurrentConversationId(newConversation.id)
      
      return newConversation
    }
    catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    }
  }

  // 删除会话
  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      
      // 使用函数式更新避免闭包问题
      setConversations(prev => {
        const newConversations = prev.filter(c => c.id !== id)
        
        // 如果删除的是当前会话,切换到第一个会话
        if (currentConversationId === id) {
          setCurrentConversationId(newConversations.length > 0 ? newConversations[0].id : null)
        }
        
        return newConversations
      })
    }
    catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  // 切换当前会话
  const selectConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  // 更新会话标题
  const updateConversationTitle = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      
      if (!response.ok) throw new Error('Failed to update title')
      
      // 更新本地状态
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, title } : c)),
      )
    }
    catch (error) {
      console.error('Failed to update conversation title:', error)
    }
  }

  // 获取当前会话对象
  const currentConversation = conversations.find(c => c.id === currentConversationId)

  // 初始化时加载会话列表
  useEffect(() => {
    // 防止 StrictMode 双重调用导致重复初始化
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      const hasConversations = await loadConversations()
      // 如果没有任何会话,创建一个新的
      if (!hasConversations) {
        await createConversation(false)
      }
    }
    init()
  }, [])

  return {
    conversations,
    currentConversationId,
    currentConversation,
    isLoading,
    createConversation,
    deleteConversation,
    selectConversation,
    updateConversationTitle,
    refreshConversations: loadConversations,
  }
}
