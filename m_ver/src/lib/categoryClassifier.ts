import type { Category } from '../types'
import { CATEGORIES } from '../constants/categories'
import { CATEGORY_KEYWORDS } from '../constants/categoryKeywords'

/**
 * 제목 텍스트에서 카테고리를 추정한다. 카테고리별로 일치하는 키워드 개수를 세어
 * 가장 많이 일치하는 카테고리를 반환하고, 하나도 일치하지 않으면 null을 반환한다.
 * 동점일 때는 CATEGORIES 순서(업무-개인-공부-여행)상 앞선 카테고리를 우선한다.
 */
export function guessCategory(text: string): Category | null {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return null

  let best: { category: Category; score: number } | null = null

  for (const category of CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[category]
    const score = keywords.reduce(
      (count, keyword) => count + (normalized.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    )
    if (score > 0 && (!best || score > best.score)) {
      best = { category, score }
    }
  }

  return best?.category ?? null
}
