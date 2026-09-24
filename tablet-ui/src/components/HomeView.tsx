import { computeAttentionItems, type HomeState } from '../data/homeStore'
import { AttentionBanner } from './AttentionBanner'
import { SceneButtons } from './SceneButtons'

// FR-10: 홈(요약) 화면 — 씬 버튼과 주의 상태를 한 화면에서 2탭 이내로 접근하게 한다.
export function HomeView({ state }: { state: HomeState }) {
  const attentionItems = computeAttentionItems(state)

  return (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <SceneButtons activeMode={state.houseMode} />
      <AttentionBanner items={attentionItems} />
    </div>
  )
}
