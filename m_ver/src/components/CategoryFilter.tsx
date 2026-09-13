import type { Category } from '../types'
import { CATEGORIES, CATEGORY_STYLES } from '../constants/categories'

export type FilterValue = Category | '전체'

interface CategoryFilterProps {
  total: number
  categoryCounts: Record<Category, number>
  selected: FilterValue
  onSelect: (value: FilterValue) => void
}

export function CategoryFilter({ total, categoryCounts, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <button
        type="button"
        aria-pressed={selected === '전체'}
        onClick={() => onSelect('전체')}
        className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 ${
          selected === '전체'
            ? 'bg-neutral-900 text-white'
            : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
        }`}
      >
        전체 ({total})
      </button>
      {CATEGORIES.map((category) => {
        const isActive = selected === category
        const style = CATEGORY_STYLES[category]
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category)}
            className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <span
              className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${
                isActive ? 'bg-white' : style.dot
              }`}
            />
            {category} ({categoryCounts[category]})
          </button>
        )
      })}
    </div>
  )
}
