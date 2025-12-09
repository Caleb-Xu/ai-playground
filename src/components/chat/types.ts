/** 消息类型定义 */
export interface Message {
  id: string // 唯一标识符
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean // 标记是否正在流式输出
  // RAG 模式下的来源文档
  sources?: Array<{
    title: string
    content: string
    similarity: number
  }>
}

// 生成唯一 ID
let messageIdCounter = 0
export function generateMessageId(): string {
  messageIdCounter += 1
  return `msg-${Date.now()}-${messageIdCounter}`
}
