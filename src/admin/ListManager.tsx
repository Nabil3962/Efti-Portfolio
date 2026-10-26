import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { IMAGE_TYPES } from '../lib/upload'
import FileUploader from '../components/FileUploader'
import { useToast } from '../components/Toast'

type Row = Record<string, any> & { id: string }
type Field = { key: string; label: string; type?: 'area' | 'image' | 'check' }

const config = {
  services: { table: 'services', title: 'Services', add: 'Add service', blank: { title: 'New service', description: '', icon: 'Film', published: true }, fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'area' }, { key: 'icon', label: 'Icon name from lucide.dev, for example Film, Palette, Sparkles' }, { key: 'published', label: 'Show on website', type: 'check' }] as Field[] },
  testimonials: { table: 'testimonials', title: 'Testimonials', add: 'Add testimonial', blank: { name: 'New client', role: '', company: '', testimonial: 'Write the testimonial here.', published: true }, fields: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'company', label: 'Company' }, { key: 'testimonial', label: 'Testimonial', type: 'area' }, { key: 'avatar_url', label: 'Avatar', type: 'image' }, { key: 'published', label: 'Show on website', type: 'check' }] as Field[] },
  social: { table: 'social_links', title: 'Social links', add: 'Add link', blank: { platform: 'Instagram', url: '' }, fields: [{ key: 'platform', label: 'Platform' }, { key: 'url', label: 'URL' }] as Field[] }
}

export default function ListManager({ kind }: { kind: keyof typeof config }) {
  const c = config[kind]
  const toast = useToast()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data, error } = await supabase.from(c.table).select('*').order('sort_order')
    if (error) toast(error.message, 'error')
    setRows((data as Row[]) || [])
  }

  useEffect(() => { setRows(null); refresh() }, [kind])

  const edit = (id: string, key: string, value: unknown) => setRows(rows!.map(r => (r.id === id ? { ...r, [key]: value } : r)))

  async function add() {
    const { error } = await supabase.from(c.table).insert({ ...c.blank, sort_order: (rows?.length || 0) + 1 })
    if (error) return toast(error.message, 'error')
    refresh()
  }

  async function remove(r: Row) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    const { error } = await supabase.from(c.table).delete().eq('id', r.id)
    if (error) return toast(error.message, 'error')
    toast('Deleted.')
    refresh()
  }

  function move(i: number, d: number) {
    const list = [...rows!]
    const j = i + d
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setRows(list)
  }

  async function save() {
    setSaving(true)
    const results = await Promise.all(rows!.map((r, i) => supabase.from(c.table).update({ ...r, sort_order: i + 1 }).eq('id', r.id)))
    setSaving(false)
    const failed = results.find(r => r.error)
    toast(failed?.error ? failed.error.message : 'Changes saved.', failed?.error ? 'error' : 'success')
  }

  if (!rows) return <p className="text-zinc-500">Loading</p>

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">{c.title}</h1>
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <p className="text-zinc-400">Nothing here yet. Use the add button below.</p>}
        {rows.map((r, i) => (
          <div key={r.id} className="space-y-3 rounded-md border border-line bg-panel p-4">
            {c.fields.map(f => {
              if (f.type === 'image') return <FileUploader key={f.key} label={f.label} kind="image" bucket="portfolio-images" types={IMAGE_TYPES} maxMB={5} value={r[f.key]} onChange={v => edit(r.id, f.key, v)} />
              if (f.type === 'check') return <label key={f.key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r[f.key]} onChange={e => edit(r.id, f.key, e.target.checked)} />{f.label}</label>
              return (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  {f.type === 'area' ? <textarea rows={3} className="input" value={r[f.key] || ''} onChange={e => edit(r.id, f.key, e.target.value)} /> : <input className="input" value={r[f.key] || ''} onChange={e => edit(r.id, f.key, e.target.value)} />}
                </div>
              )
            })}
            <div className="flex gap-1">
              <button type="button" className="rounded p-2 hover:bg-ink" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="rounded p-2 hover:bg-ink" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="rounded p-2 text-red-400 hover:bg-ink" aria-label="Delete" onClick={() => remove(r)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button className="btn btn-ghost" onClick={add}>{c.add}</button>
        <button className="btn btn-primary" onClick={save} disabled={saving || rows.length === 0}>{saving ? 'Saving' : 'Save changes'}</button>
      </div>
    </div>
  )
}
