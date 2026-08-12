import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { RequestForm } from '../components/RequestForm'
import { RequestTable } from '../components/RequestTable'
import { useAuth } from '../context/AuthContext'
import type {
  AccessLevel,
  AccessRequest,
  Application,
  RequestState,
} from '../types'
import {
  createRequest,
  decideRequest,
  getApplications,
  listRequests,
} from '../services/requestService'


export function DashboardPage() {
  const { user } = useAuth()

  const [applications, setApplications] = useState<Application[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])

  const [stateFilter, setStateFilter] = useState<RequestState | ''>('')
  const [appFilter, setAppFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<AccessLevel | ''>('')

  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)


  if (!user) {
    return <Navigate to="/login" replace />
  }


  useEffect(() => {
    async function loadApplications() {
      try {
        const apps = await getApplications()
        setApplications(apps)
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : 'Failed to load applications.',
        )
      }
    }

    loadApplications()
  }, [])


  useEffect(() => {
    async function loadRequests() {
      setLoading(true)

      try {
        const results = await listRequests({
          state: stateFilter || undefined,
          appId: appFilter || undefined,
          level: levelFilter || undefined,
        })

        setRequests(results)
        setActionError(null)
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : 'Failed to load requests.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [stateFilter, appFilter, levelFilter])


  async function handleCreateRequest(
    appId: string,
    level: AccessLevel,
    reason: string
  ) {
    try {
      setActionError(null)

      await createRequest(appId, level, reason)

      const results = await listRequests({
        state: stateFilter || undefined,
        appId: appFilter || undefined,
        level: levelFilter || undefined,
      })

      setRequests(results)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to create request.',
      )
    }
  }


  async function handleDecide(
    requestId: string,
    state: 'APPROVED' | 'REJECTED',
  ) {
    try {
      setActionError(null)

      await decideRequest(requestId, state)

      const results = await listRequests({
        state: stateFilter || undefined,
        appId: appFilter || undefined,
        level: levelFilter || undefined,
      })

      setRequests(results)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to update request.',
      )
    }
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
        <RequestForm
          applications={applications}
          onSubmit={handleCreateRequest}
        />
      )}


      <section className="panel">
        <div className="panel-header">
          <h2>
            {user.role === 'REQUESTER'
              ? 'My requests'
              : 'All requests'}
          </h2>


          <div className="filters">
            <label className="field field-inline">
              <span>State</span>

              <select
                value={stateFilter}
                onChange={(event) =>
                  setStateFilter(
                    event.target.value as RequestState | '',
                  )
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
                onChange={(event) =>
                  setAppFilter(event.target.value)
                }
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
                  setLevelFilter(
                    event.target.value as AccessLevel | '',
                  )
                }
              >
                <option value="">All</option>
                <option value="READ">Read</option>
                <option value="WRITE">Write</option>
              </select>
            </label>
          </div>
        </div>


        {actionError && (
          <p className="form-error">{actionError}</p>
        )}


        {loading ? (
          <p>Loading requests...</p>
        ) : (
          <RequestTable
            requests={requests}
            applications={applications}
            user={user}
            onDecide={
              user.role === 'APPROVER'
                ? handleDecide
                : undefined
            }
          />
        )}
      </section>
    </div>
  )
}