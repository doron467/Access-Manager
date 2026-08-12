import { useState, type FormEvent } from 'react'
import type { AccessLevel, Application } from '../types'

interface RequestFormProps {
  applications: Application[]
  onSubmit: (appId: string, level: AccessLevel, reason: string) => Promise<boolean>
}

export function RequestForm({ applications, onSubmit }: RequestFormProps) {
  const [appId, setAppId] = useState(applications[0]?.id ?? '')
  const [level, setLevel] = useState<AccessLevel>('READ')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const selectedAppId = appId || applications[0]?.id || ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedAppId) {
      return
    }

    if (!reason.trim()) {
      return
    }

    setSubmitting(true)
    const created = await onSubmit(selectedAppId, level, reason.trim())
    setSubmitting(false)

    if (created) {
      setReason('')
      setLevel('READ')
    }
  }

  return (
    <section className="panel">
      <h2>New access request</h2>

      <form className="request-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Application</span>
          <select
            value={selectedAppId}
            onChange={(event) => setAppId(event.target.value)}
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Access level</span>
          <select
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as AccessLevel)
            }
          >
            <option value="READ">Read</option>
            <option value="WRITE">Write</option>
          </select>
        </label>

        <label className="field">
          <span>Reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why do you need access to this application?"
            rows={4}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting || !selectedAppId}>
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </section>
  )
}
