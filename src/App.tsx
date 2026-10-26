import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Projects from './admin/Projects'
import ProjectForm from './admin/ProjectForm'
import ContentEditor from './admin/ContentEditor'
import ListManager from './admin/ListManager'
import { RequireAuth } from './lib/auth'
import { configured } from './lib/supabase'

export default function App() {
  if (!configured) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <p className="max-w-md text-zinc-400">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment, then restart the app.</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectForm />} />
        <Route path="hero" element={<ContentEditor section="hero" title="Hero" />} />
        <Route path="about" element={<ContentEditor section="about" title="About" />} />
        <Route path="contact" element={<><ContentEditor section="contact" title="Contact" /><ListManager kind="social" /></>} />
        <Route path="settings" element={<ContentEditor section="settings" title="Site settings" />} />
        <Route path="services" element={<ListManager kind="services" />} />
        <Route path="testimonials" element={<ListManager kind="testimonials" />} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
