import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null)

  useEffect(() => {
    supabase.from('projects').select('*').order('created_at', { ascending: false }).then(({ data }) => setProjects((data as Project[]) || []))
  }, [])

  if (!projects) return <p className="text-zinc-500">Loading</p>

  const stats = [
    ['Total projects', projects.length],
    ['Published', projects.filter(p => p.published).length],
    ['Featured', projects.filter(p => p.featured).length],
    ['Categories', new Set(projects.map(p => p.category)).size]
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-md border border-line bg-panel p-4">
            <p className="text-3xl font-bold">{v}</p>
            <p className="text-sm text-zinc-400">{l}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-display text-xl font-bold">Recent projects</h2>
      {projects.length === 0 ? (
        <p className="mt-4 text-zinc-400">Your portfolio is empty. Click + to add your first project.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-md border border-line">
          {projects.slice(0, 5).map(p => (
            <li key={p.id}><Link to={`/admin/projects/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-panel">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-panel">{p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}</div>
              <span className="min-w-0 flex-1 truncate">{p.title}</span>
              <span className="text-xs text-zinc-500">{p.published ? 'Published' : 'Draft'}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
