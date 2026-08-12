import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { RequestForm } from '../components/RequestForm'
import { RequestTable } from '../components/RequestTable'
import { useAuth } from '../context/AuthContext'
import type {
  AccessLevel,
  AccessRequest,
  AIReview,
  Application,
  RequestState,
} from '../types'
import {
  createRequest,
  decideRequest,
  getApplications,
  listRequests,
  reviewRequest,
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)
  const [aiReview, setAiReview] = useState<{
    request: AccessRequest
    review: AIReview
  } | null>(null)


  useEffect(() => {
    async function loadApplications() {
      if (!user) {
        return
      }

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
  }, [user])


  useEffect(() => {
    async function loadRequests() {
      if (!user) {
        return
      }

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
  }, [user, stateFilter, appFilter, levelFilter])


  async function handleCreateRequest(
    appId: string,
    level: AccessLevel,
    reason: string
  ) {
    try {
      setActionError(null)
      setActionSuccess(null)

      await createRequest(appId, level, reason)

      const results = await listRequests({
        state: stateFilter || undefined,
        appId: appFilter || undefined,
        level: levelFilter || undefined,
      })

      setRequests(results)
      setActionSuccess('Access request submitted successfully.')
      return true
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to create request.',
      )
      return false
    }
  }


  async function handleDecide(
    requestId: string,
    state: 'APPROVED' | 'REJECTED',
  ) {
    try {
      setActionError(null)
      setActionSuccess(null)

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

  async function handleRequestReview(request: AccessRequest) {
    try {
      setActionError(null)
      setActionSuccess(null)
      setReviewingRequestId(request.id)
      const review = await reviewRequest(request.id)
      setAiReview({ request, review })
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to get AI review.',
      )
    } finally {
      setReviewingRequestId(null)
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />
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

      {actionSuccess && (
        <p className="form-success" role="status">{actionSuccess}</p>
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
            onRequestReview={
              user.role === 'APPROVER'
                ? handleRequestReview
                : undefined
            }
            reviewingRequestId={reviewingRequestId}
          />
        )}
      </section>

      {aiReview && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setAiReview(null)}
        >
          <section
            className="ai-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-review-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="ai-review-header">
              <div>
                <p className="ai-review-eyebrow">AI analysis</p>
                <h2 id="ai-review-title">Access request recommendation</h2>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAiReview(null)}
              >
                Close
              </button>
            </div>
            <p className="ai-review-request">
              Request for <strong>{aiReview.request.createdByUsername}</strong>
            </p>
            <dl className="ai-review-summary">
              <div>
                <dt>Recommendation</dt>
                <dd>
                  <span className={`ai-recommendation ai-recommendation--${aiReview.review.recommendation.toLowerCase()}`}>
                    {aiReview.review.recommendation.toLowerCase()}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{Math.round(aiReview.review.confidence * 100)}%</dd>
              </div>
            </dl>
            <div className="ai-review-reasoning">
              <h3>Analysis</h3>
              <p>{aiReview.review.reasoning}</p>
            </div>
            <p className="ai-review-disclaimer">
              This is a recommendation only. The final access decision remains yours.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
