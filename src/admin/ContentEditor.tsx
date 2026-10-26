import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { IMAGE_TYPES } from '../lib/upload'
import FileUploader from '../components/FileUploader'
import { useToast } from '../components/Toast'

type Field = { key: string; label: string; type?: 'area' | 'image' | 'color' }

const fields: Record<string, Field[]> = {
  hero: [
    { key: 'eyebrow', label: 'Small label' },
    { key: 'heading', label: 'Main heading' },
    { key: 'description', label: 'Description', type: 'area' },
    { key: 'primaryCta', label: 'Primary button text' },
    { key: 'secondaryCta', label: 'Secondary button text' },
    { key: 'availability', label: 'Availability text' }
  ],
  about: [
    { key: 'heading', label: 'Heading' },
    { key: 'description', label: 'Short description', type: 'area' },
    { key: 'biography', label: 'Biography', type: 'area' },
    { key: 'experience', label: 'Experience' },
    { key: 'skills', label: 'Skills (separated by commas)', type: 'area' },
    { key: 'profileImage', label: 'Profile image', type: 'image' }
  ],
  contact: [
    { key: 'heading', label: 'Heading' },
    { key: 'description', label: 'Description', type: 'area' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'whatsapp', label: 'WhatsApp number with country code' },
    { key: 'location', label: 'Location' },
    { key: 'cta', label: 'Button text' }
  ],
  settings: [
    { key: 'siteName', label: 'Your name or site name' },
    { key: 'title', label: 'Professional title' },
    { key: 'description', label: 'Site description for search engines', type: 'area' },
    { key: 'accent', label: 'Accent color', type: 'color' }
  ]
}

export default function ContentEditor({ section, title }: { section: string; title: string }) {
  const toast = useToast()
  const [values, setValues] = useState<Record<string, string> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValues(null)
    supabase.from('site_content').select('content').eq('section', section).maybeSingle().then(({ data, error }) => {
      if (error) toast(error.message, 'error')
      setValues((data?.content as Record<string, string>) || {})
    })
  }, [section])

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('site_content').upsert({ section, content: values, updated_at: new Date().toISOString() }, { onConflict: 'section' })
    setSaving(false)
    toast(error ? error.message : 'Changes saved.', error ? 'error' : 'success')
  }

  if (!values) return <p className="text-zinc-500">Loading</p>

  return (
    <form onSubmit={save} className="mb-12 space-y-5">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {fields[section].map(f => {
        const v = values[f.key] || ''
        const set = (x: string) => setValues({ ...values, [f.key]: x })
        if (f.type === 'image') return <FileUploader key={f.key} label={f.label} kind="image" bucket="portfolio-images" types={IMAGE_TYPES} maxMB={10} value={v || null} onChange={x => set(x || '')} />
        return (
          <div key={f.key}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            {f.type === 'area' ? <textarea id={f.key} rows={4} className="input" value={v} onChange={e => set(e.target.value)} />
              : f.type === 'color' ? <input id={f.key} type="color" className="h-10 w-20 rounded border border-line bg-ink" value={v || '#8b7cff'} onChange={e => set(e.target.value)} />
              : <input id={f.key} className="input" value={v} onChange={e => set(e.target.value)} />}
          </div>
        )
      })}
      <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving' : 'Save changes'}</button>
    </form>
  )
}
