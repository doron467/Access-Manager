import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { RequestForm } from '../components/RequestForm'
import { RequestTable } from '../components/RequestTable'
import { useAuth } from '../context/AuthContext'
import type { AccessLevel, RequestState } from '../types'
import {
  createRequest,
  decideRequest,
  getApplications,
  listRequests,
} from '../services/requestService'

export function DashboardPage() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [stateFilter, setStateFilter] = useState<RequestState | ''>('')
  const [appFilter, setAppFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<AccessLevel | ''>('')
  const [actionError, setActionError] = useState<string | null>(null)

  const applications = useMemo(() => getApplications(), [])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const requests = useMemo(
    () =>
      listRequests(user, {
        state: stateFilter || undefined,
        appId: appFilter || undefined,
        level: levelFilter || undefined,
      }),
    [user, stateFilter, appFilter, levelFilter, refreshKey],
  )

  function refresh() {
    setRefreshKey((value) => value + 1)
  }

  function handleCreateRequest(appId: string, level: AccessLevel) {
    createRequest(user, appId, level)
    setActionError(null)
    refresh()
  }

  function handleDecide(requestId: string, state: 'APPROVED' | 'REJECTED') {
    const result = decideRequest(user, requestId, state)
    if ('error' in result) {
      setActionError(result.error)
      return
    }

    setActionError(null)
    refresh()
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            {user.role === 'REQUESTER'
              ? 'Submit new access requests and track your submissions.'
              : 'Review pending requests and manage access decisions.'}
          </p>
        </div>
      </div>

      {user.role === 'REQUESTER' && (
        <RequestForm applications={applications} onSubmit={handleCreateRequest} />
      )}

      <section className="panel">
        <div className="panel-header">
          <h2>{user.role === 'REQUESTER' ? 'My requests' : 'All requests'}</h2>

          <div className="filters">
            <label className="field field-inline">
              <span>State</span>
              <select
                value={stateFilter}
                onChange={(event) =>
                  setStateFilter(event.target.value as RequestState | '')
                }
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>

            <label className="field field-inline">
              <span>App</span>
              <select
                value={appFilter}
                onChange={(event) => setAppFilter(event.target.value)}
              >
                <option value="">All</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-inline">
              <span>Level</span>
              <select
                value={levelFilter}
                onChange={(event) =>
                  setLevelFilter(event.target.value as AccessLevel | '')
                }
              >
                <option value="">All</option>
                <option value="READ">Read</option>
                <option value="WRITE">Write</option>
              </select>
            </label>
          </div>
        </div>

        {actionError && <p className="form-error">{actionError}</p>}

        <RequestTable
          requests={requests}
          applications={applications}
          user={user}
          onDecide={user.role === 'APPROVER' ? handleDecide : undefined}
        />
      </section>
    </div>
  )
}
