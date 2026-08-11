import type { RequestState } from '../types'

const labels: Record<RequestState, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

interface StatusBadgeProps {
  state: RequestState
}

export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${state.toLowerCase()}`}>
      {labels[state]}
    </span>
  )
}
