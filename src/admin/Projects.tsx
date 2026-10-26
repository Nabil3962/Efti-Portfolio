import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, Eye, Pencil, Trash2, GripVertical, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { CATEGORIES, type Project } from '../lib/types'

export default function Projects() {
  const toast = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState<Project[] | null>(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [status, setStatus] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)

  async function refresh() {
    const { data, error } = await supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false })
    if (error) toast(error.message, 'error')
    setItems((data as Project[]) || [])
  }

  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => (items || []).filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) && (!cat || p.category === cat) && (!status || (status === 'published') === p.published)
  ), [items, q, cat, status])

  async function remove(p: Project) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('projects').delete().eq('id', p.id)
    if (error) return toast(error.message, 'error')
    toast('Project deleted.')
    refresh()
  }

  async function duplicate(p: Project) {
    const { id, created_at, ...rest } = p
    const { error } = await supabase.from('projects').insert({ ...rest, title: `${p.title} copy`, slug: `${p.slug}-${Date.now().toString(36)}`, published: false })
    if (error) return toast(error.message, 'error')
    toast('Project duplicated as a draft.')
    refresh()
  }

  async function drop(targetId: string) {
    if (!items || !dragId || dragId === targetId) return
    const list = [...items]
    const from = list.findIndex(p => p.id === dragId)
    const to = list.findIndex(p => p.id === targetId)
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    const ordered = list.map((p, i) => ({ ...p, sort_order: i + 1 }))
    setItems(ordered)
    setDragId(null)
    const results = await Promise.all(ordered.map(p => supabase.from('projects').update({ sort_order: p.sort_order }).eq('id', p.id)))
    const failed = results.find(r => r.error)
    if (failed?.error) { toast(failed.error.message, 'error'); refresh() } else toast('Order saved.')
  }

  if (!items) return <p className="text-zinc-500">Loading</p>

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <Link to="/admin/projects/new" className="btn btn-primary">Add project</Link>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Search projects" aria-label="Search projects" value={q} onChange={e => setQ(e.target.value)} />
        <select className="input" aria-label="Category" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" aria-label="Status" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Published and drafts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>
      {items.length === 0 ? (
        <p className="mt-8 text-zinc-400">Your portfolio is empty. Click + to add your first project.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {filtered.map(p => (
            <li key={p.id} draggable onDragStart={() => setDragId(p.id)} onDragOver={e => e.preventDefault()} onDrop={() => drop(p.id)} className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-panel p-3">
              <GripVertical size={16} className="cursor-grab text-zinc-600" aria-hidden />
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-ink">{p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-zinc-500">{p.category}, {new Date(p.created_at).toLocaleDateString()}, {p.published ? 'Published' : 'Draft'}</p>
              </div>
              {p.featured && <Star size={16} className="text-accent" aria-label="Featured" />}
              <div className="flex gap-1">
                <button className="rounded p-2 hover:bg-ink" aria-label="Edit" onClick={() => navigate(`/admin/projects/${p.id}`)}><Pencil size={16} /></button>
                <a className="rounded p-2 hover:bg-ink" aria-label="Preview" href={`/work/${p.slug}`} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                <button className="rounded p-2 hover:bg-ink" aria-label="Duplicate" onClick={() => duplicate(p)}><Copy size={16} /></button>
                <button className="rounded p-2 text-red-400 hover:bg-ink" aria-label="Delete" onClick={() => remove(p)}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-zinc-600">Drag the handle to reorder. Drafts are hidden from the public site.</p>
    </div>
  )
}
