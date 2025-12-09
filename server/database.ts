// 数据库管理模块 (使用 sql.js)
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import initSqlJs from 'sql.js'
import type { Database as SqlJsDatabase } from 'sql.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** 会话接口 */
export interface Conversation {
  id: string
  title: string
  created_at: number
  updated_at: number
  is_rag_mode: 0 | 1
}

/** 会话消息接口 */
export interface ConversationMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: number
  sources?: string  // JSON 字符串,存储 RAG 参考来源
}

// 数据库文件路径
const DB_PATH = join(__dirname, '..', 'data', 'conversations.db')

let db: SqlJsDatabase

/** 初始化数据库 */
async function initDatabase() {
  const SQL = await initSqlJs()
  
  // 确保 data 目录存在
  const dataDir = dirname(DB_PATH)
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  // 加载或创建数据库
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  }
  else {
    db = new SQL.Database()
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '新对话',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_rag_mode INTEGER NOT NULL DEFAULT 0
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      sources TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON messages(conversation_id, created_at)
  `)

  // 清理重复的会话 (保留最新的)
  cleanupDuplicateConversations()

  saveDatabase()
}

/** 清理重复的会话记录 */
function cleanupDuplicateConversations() {
  const result = db.exec(`
    SELECT id, COUNT(*) as count 
    FROM conversations 
    GROUP BY id 
    HAVING count > 1
  `)
  
  if (result.length > 0 && result[0].values.length > 0) {
    console.log('🔧 检测到重复会话,正在清理...')
    // 删除所有记录,重新插入去重后的数据
    db.run('DELETE FROM conversations')
    saveDatabase()
  }
}

/** 保存数据库到文件 */
function saveDatabase() {
  const data = db.export()
  writeFileSync(DB_PATH, data)
}

// 立即初始化
await initDatabase()

/** 生成会话标题 */
function generateTitle(firstMessage: string): string {
  const maxLength = 30
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ')
  return cleaned.length <= maxLength ? cleaned : `${cleaned.slice(0, maxLength)}...`
}

/** 获取所有会话 (按更新时间倒序) */
export function getConversations(): Conversation[] {
  const result = db.exec('SELECT * FROM conversations ORDER BY updated_at DESC')
  if (result.length === 0 || result[0].values.length === 0) {
    return []
  }

  const columns = result[0].columns
  const conversations = result[0].values.map((row: any[]) => {
    const obj: any = {}
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx]
    })
    return obj as Conversation
  })
  
  // 去重: 使用 Map 确保 ID 唯一
  const uniqueMap = new Map<string, Conversation>()
  conversations.forEach(conv => {
    if (!uniqueMap.has(conv.id)) {
      uniqueMap.set(conv.id, conv)
    }
  })
  
  return Array.from(uniqueMap.values())
}

/** 创建新会话 */
export function createConversation(isRagMode = false): Conversation {
  const id = randomUUID()
  const now = Date.now()

  db.run(
    'INSERT INTO conversations (id, title, created_at, updated_at, is_rag_mode) VALUES (?, ?, ?, ?, ?)',
    [id, '新对话', now, now, isRagMode ? 1 : 0],
  )

  saveDatabase()

  return {
    id,
    title: '新对话',
    created_at: now,
    updated_at: now,
    is_rag_mode: isRagMode ? 1 : 0,
  }
}

/** 获取单个会话 */
export function getConversation(id: string): Conversation | null {
  const result = db.exec('SELECT * FROM conversations WHERE id = ?', [id])
  if (result.length === 0 || result[0].values.length === 0) {
    return null
  }

  const columns = result[0].columns
  const row = result[0].values[0] as any[]
  const obj: any = {}
  columns.forEach((col: string, idx: number) => {
    obj[col] = row[idx]
  })
  return obj as Conversation
}

/** 更新会话标题 */
export function updateConversationTitle(id: string, title: string) {
  db.run('UPDATE conversations SET title = ? WHERE id = ?', [title, id])
  saveDatabase()
}

/** 更新会话时间戳 */
export function touchConversation(id: string) {
  db.run('UPDATE conversations SET updated_at = ? WHERE id = ?', [Date.now(), id])
  saveDatabase()
}

/** 更新会话模式 */
export function updateConversationMode(id: string, isRagMode: boolean) {
  db.run('UPDATE conversations SET is_rag_mode = ? WHERE id = ?', [isRagMode ? 1 : 0, id])
  saveDatabase()
}

/** 删除会话 */
export function deleteConversation(id: string) {
  db.run('DELETE FROM conversations WHERE id = ?', [id])
  saveDatabase()
}

/** 获取会话的所有消息 */
export function getMessages(conversationId: string): ConversationMessage[] {
  const result = db.exec('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId])
  if (result.length === 0 || result[0].values.length === 0) {
    return []
  }

  const columns = result[0].columns
  return result[0].values.map((row: any[]) => {
    const obj: any = {}
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx]
    })
    return obj as ConversationMessage
  })
}

/** 添加消息 */
export function addMessage(
  conversationId: string, 
  role: 'user' | 'assistant', 
  content: string,
  sources?: any[]
) {
  const id = randomUUID()
  const now = Date.now()
  const sourcesJson = sources ? JSON.stringify(sources) : null

  db.run(
    'INSERT INTO messages (id, conversation_id, role, content, sources, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, conversationId, role, content, sourcesJson, now],
  )

  // 如果是第一条用户消息,自动生成标题
  const messages = getMessages(conversationId)
  if (messages.length === 1 && role === 'user') {
    const title = generateTitle(content)
    updateConversationTitle(conversationId, title)
  }

  // 更新会话时间戳
  touchConversation(conversationId)

  saveDatabase()
}
