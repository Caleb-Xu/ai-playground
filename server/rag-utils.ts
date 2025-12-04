// RAG 工具函数
import type { SearchResult, VectorDocument } from './knowledge'

/**
 * 计算两个向量的余弦相似度
 * 余弦相似度范围是 -1 到 1，越接近 1 表示越相似
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  if (magnitude === 0)
    return 0

  return dotProduct / magnitude
}

/**
 * 在向量库中搜索最相似的文档
 */
export function searchSimilar(
  queryEmbedding: number[],
  vectorStore: VectorDocument[],
  topK: number = 3,
): SearchResult[] {
  const results: SearchResult[] = vectorStore.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }))

  // 按相似度降序排序，取前 K 个
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topK)
}
