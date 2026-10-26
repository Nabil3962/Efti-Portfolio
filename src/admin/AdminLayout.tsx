import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Film, User, Sparkles, MessageSquareQuote, Mail, Settings, LogOut, Plus, Type } from 'lucide-react'
import { supabase } from '../lib/supabase'

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: Film },
  { to: '/admin/hero', label: 'Hero', icon: Type },
  { to: '/admin/about', label: 'About', icon: User },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/contact', label: 'Contact', icon: Mail },
  { to: '/admin/settings', label: 'Site settings', icon: Settings }
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-panel md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:block md:py-6">
          <Link to="/" className="font-display font-bold">View website</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-accent text-ink' : 'text-zinc-400 hover:text-white'}`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
          <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-white"><LogOut size={16} />Logout</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 pb-28 md:p-8">
        <div className="mx-auto max-w-4xl"><Outlet /></div>
      </main>
      {!pathname.startsWith('/admin/projects/') && (
        <Link to="/admin/projects/new" aria-label="Add project" className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-accent text-ink shadow-xl hover:bg-white"><Plus size={28} /></Link>
      )}
    </div>
  )
}
