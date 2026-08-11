import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const loginError = login(username, password)
    if (loginError) {
      setError(loginError)
      return
    }

    navigate('/')
  }

  return (
    <>
      <h2>Log in</h2>
      <p className="auth-subtitle">Sign in to manage access requests.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-full">
          Log in
        </button>
      </form>

      <div className="demo-hint">
        <p>Demo accounts:</p>
        <ul>
          <li>
            <strong>user2</strong> / abcd — requester
          </li>
          <li>
            <strong>user1</strong> / 1234 — approver
          </li>
        </ul>
      </div>

      <p className="auth-footer">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </>
  )
}
