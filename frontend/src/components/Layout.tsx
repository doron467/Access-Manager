import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <Link to="/" className="layout-title">
            Access Manager
          </Link>
        </div>

        {user && (
          <div className="layout-user">
            <span className="layout-username">{user.username}</span>
            <span className={`role-badge role-badge--${user.role.toLowerCase()}`}>
              {user.role.toLowerCase()}
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">Access Manager</h1>
        <Outlet />
      </div>
    </div>
  )
}
