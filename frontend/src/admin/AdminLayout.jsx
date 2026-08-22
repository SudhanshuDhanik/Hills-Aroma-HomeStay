import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/bookings', label: 'Bookings & Enquiries' },
  { to: '/admin/blocked-dates', label: 'Blocked Dates' },
  { to: '/admin/pricing', label: 'Pricing' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-sand-50">
      <aside className="w-60 bg-brand-900 text-brand-50 flex flex-col">
        <div className="p-5 font-display text-lg border-b border-brand-800">Admin Panel</div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-brand-700 text-white' : 'text-brand-100 hover:bg-brand-800'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-3 px-3 py-2 rounded-lg text-sm text-left text-brand-100 hover:bg-brand-800">
          Log Out
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
