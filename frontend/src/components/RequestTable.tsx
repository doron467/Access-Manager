import type { AccessRequest, Application, AuthUser } from '../types'
import { StatusBadge } from './StatusBadge'

interface RequestTableProps {
  requests: AccessRequest[]
  applications: Application[]
  user: AuthUser
  onDecide?: (requestId: string, state: 'APPROVED' | 'REJECTED') => void
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function resolveAppName(appId: string, applications: Application[]): string {
  return applications.find((app) => app.id === appId)?.name ?? 'Unknown'
}

export function RequestTable({
  requests,
  applications,
  user,
  onDecide,
}: RequestTableProps) {
  const showActions = user.role === 'APPROVER' && onDecide

  if (requests.length === 0) {
    return <p className="empty-state">No requests found.</p>
  }

  return (
    <div className="table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>App</th>
            <th>Access level</th>
            <th>State</th>
            <th>Created by</th>
            <th>Created at</th>
            <th>Decision by</th>
            <th>Decision at</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{resolveAppName(request.appId, applications)}</td>
              <td>{request.level}</td>
              <td>
                <StatusBadge state={request.state} />
              </td>
              <td>{request.createdByUsername}</td>
              <td>{formatDate(request.createdAt)}</td>
              <td>{request.decisionByUsername ?? '—'}</td>
              <td>{formatDate(request.decisionAt)}</td>
              {showActions && (
                <td>
                  {request.state === 'PENDING' ? (
                    <div className="action-group">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => onDecide(request.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDecide(request.id, 'REJECTED')}
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
