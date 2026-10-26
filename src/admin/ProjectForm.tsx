import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import { VIDEO_TYPES, IMAGE_TYPES } from '../lib/upload'
import FileUploader from '../components/FileUploader'
import { useToast } from '../components/Toast'
import { CATEGORIES } from '../lib/types'

const empty = { title: '', description: '', category: 'Commercial', client: '', year: String(new Date().getFullYear()), video_url: null as string | null, thumbnail_url: null as string | null, featured: false, published: true }

export default function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('projects').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { toast('Project not found.', 'error'); navigate('/admin/projects'); return }
      setForm({ ...empty, ...data })
      setLoading(false)
    })
  }, [id])

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    const res = id
      ? await supabase.from('projects').update(payload).eq('id', id)
      : await supabase.from('projects').insert({ ...payload, slug: `${slugify(form.title)}-${Date.now().toString(36).slice(-4)}`, sort_order: 0 })
    setSaving(false)
    if (res.error) return toast(res.error.message, 'error')
    toast(id ? 'Changes saved.' : 'Project uploaded successfully.')
    navigate('/admin/projects')
  }

  if (loading) return <p className="text-zinc-500">Loading</p>

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="font-display text-3xl font-bold">{id ? 'Edit project' : 'Add new project'}</h1>
      <div>
        <label className="label" htmlFor="title">Project title</label>
        <input id="title" className="input" required value={form.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="cat">Category</label>
          <select id="cat" className="input" value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor="client">Client</label>
          <input id="client" className="input" value={form.client} onChange={e => set('client', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="year">Year</label>
          <input id="year" className="input" value={form.year} onChange={e => set('year', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="desc">Description</label>
        <textarea id="desc" rows={4} className="input" value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <FileUploader label="Thumbnail" kind="image" bucket="portfolio-images" types={IMAGE_TYPES} maxMB={10} value={form.thumbnail_url} onChange={v => set('thumbnail_url', v)} />
      <FileUploader label="Video" kind="video" bucket="portfolio-videos" types={VIDEO_TYPES} maxMB={500} value={form.video_url} onChange={v => set('video_url', v)} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Featured project</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} /> Publish immediately</label>
      <div className="flex gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/projects')}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving' : id ? 'Save changes' : 'Publish'}</button>
      </div>
    </form>
  )
}
