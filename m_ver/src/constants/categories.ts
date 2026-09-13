import type { Category } from '../types'

export const CATEGORIES: Category[] = ['업무', '개인', '공부', '여행']

/** 카테고리별 강조색 스타일. Tailwind theme(@theme)에 정의된 color-category-* 토큰을 사용한다. */
export const CATEGORY_STYLES: Record<
  Category,
  { text: string; bg: string; dot: string; ring: string }
> = {
  업무: {
    text: 'text-category-work',
    bg: 'bg-category-work-soft',
    dot: 'bg-category-work',
    ring: 'ring-category-work',
  },
  개인: {
    text: 'text-category-personal',
    bg: 'bg-category-personal-soft',
    dot: 'bg-category-personal',
    ring: 'ring-category-personal',
  },
  공부: {
    text: 'text-category-study',
    bg: 'bg-category-study-soft',
    dot: 'bg-category-study',
    ring: 'ring-category-study',
  },
  여행: {
    text: 'text-category-travel',
    bg: 'bg-category-travel-soft',
    dot: 'bg-category-travel',
    ring: 'ring-category-travel',
  },
}
