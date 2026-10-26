import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Menu, X, Play, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { applyAccent } from '../lib/utils'
import type { Project, Service, Testimonial, Social, Content } from '../lib/types'

interface Data { projects: Project[]; services: Service[]; testimonials: Testimonial[]; social: Social[]; content: Content }

async function load(): Promise<Data> {
  const [p, s, t, so, c] = await Promise.all([
    supabase.from('projects').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false }),
    supabase.from('services').select('*').eq('published', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('published', true).order('sort_order'),
    supabase.from('social_links').select('*').order('sort_order'),
    supabase.from('site_content').select('*')
  ])
  const err = p.error || s.error || t.error || so.error || c.error
  if (err) throw err
  const content: Content = {}
  c.data?.forEach(r => { content[r.section] = r.content })
  return { projects: p.data as Project[], services: s.data as Service[], testimonials: t.data as Testimonial[], social: (so.data as Social[]).filter(x => x.url), content }
}

function VideoViewer({ project, onClose }: { project: Project; onClose: () => void }) {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="mx-auto max-w-5xl px-4 py-16" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="fixed right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close"><X /></button>
        <div className="relative aspect-video overflow-hidden rounded-md bg-panel">
          {project.video_url && !failed ? (
            <>
              {!ready && <div className="absolute inset-0 grid place-items-center text-sm text-zinc-500">Loading video</div>}
              <video src={project.video_url} poster={project.thumbnail_url || undefined} controls playsInline preload="metadata" className="h-full w-full" onLoadedData={() => setReady(true)} onError={() => setFailed(true)} />
            </>
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-500">{failed ? 'This video could not be loaded.' : 'No video attached yet.'}</div>
          )}
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold">{project.title}</h2>
        <p className="mt-2 text-sm text-zinc-400">{[project.category, project.client, project.year].filter(Boolean).join(', ')}</p>
        <p className="mt-4 max-w-2xl whitespace-pre-line text-zinc-300">{project.description}</p>
      </div>
    </div>
  )
}

function Card({ p, big, onOpen }: { p: Project; big?: boolean; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className={`group relative block overflow-hidden rounded-md bg-panel text-left ${big ? 'md:col-span-2 aspect-[16/8]' : 'aspect-video'}`}>
      {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-accent text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Play size={16} fill="currentColor" /></span>
      <div className="absolute bottom-0 p-4 md:p-6">
        <p className="text-xs text-zinc-300">{p.category}</p>
        <h3 className={`font-display font-bold ${big ? 'text-3xl' : 'text-xl'}`}>{p.title}</h3>
      </div>
    </button>
  )
}

export default function Home() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [menu, setMenu] = useState(false)

  useEffect(() => { load().then(setData).catch(e => setError(e.message)) }, [])

  const settings = data?.content.settings
  useEffect(() => {
    if (!settings) return
    applyAccent(settings.accent)
    document.title = `${settings.siteName} | ${settings.title}`
    document.querySelector('meta[name=description]')?.setAttribute('content', settings.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${settings.siteName} | ${settings.title}`)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', settings.description)
  }, [settings])

  const categories = useMemo(() => ['All', ...Array.from(new Set(data?.projects.map(p => p.category) || []))], [data])
  const shown = useMemo(() => (data?.projects || []).filter(p => filter === 'All' || p.category === filter), [data, filter])
  const open = data?.projects.find(p => p.slug === slug)

  if (error) return <div className="grid min-h-screen place-items-center p-6 text-red-400">Could not load the site: {error}</div>
  if (!data) return <div className="grid min-h-screen place-items-center text-zinc-500">Loading</div>

  const { hero, about, contact } = data.content
  const skills = (about?.skills || '').split(',').map(s => s.trim()).filter(Boolean)
  const links = [['Home', '#top'], ['Work', '#work'], ['About', '#about'], ['Services', '#services'], ['Contact', '#contact']]

  return (
    <div id="top">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-display text-lg font-extrabold">{settings?.siteName}</a>
          <div className="hidden items-center gap-8 text-sm md:flex">
            {links.map(([l, h]) => <a key={h} href={h} className="text-zinc-400 hover:text-white">{l}</a>)}
            <a href="#contact" className="btn btn-primary !py-2">Let's work together</a>
          </div>
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>{menu ? <X /> : <Menu />}</button>
        </nav>
        {menu && (
          <div className="flex flex-col gap-4 border-t border-line px-5 py-5 md:hidden">
            {links.map(([l, h]) => <a key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-5 py-20">
          <p className="hero-rise mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />{hero?.availability}
          </p>
          <h1 className="hero-rise font-display text-[clamp(3rem,10vw,9rem)] font-extrabold leading-[0.92] tracking-tight">{hero?.heading}</h1>
          <p className="hero-rise mt-8 max-w-xl text-lg text-zinc-400">{hero?.eyebrow ? `${hero.eyebrow}. ` : ''}{hero?.description}</p>
          <div className="hero-rise mt-10 flex flex-wrap gap-3">
            <a href="#work" className="btn btn-primary">{hero?.primaryCta}</a>
            <a href="#contact" className="btn btn-ghost">{hero?.secondaryCta}</a>
          </div>
        </section>

        <section id="work" className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Selected work</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c} className={`rounded-full border px-4 py-1.5 text-sm ${filter === c ? 'border-accent bg-accent text-ink' : 'border-line text-zinc-400 hover:text-white'}`}>{c}</button>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="mt-12 text-zinc-500">No projects yet.</p>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shown.map(p => <Card key={p.id} p={p} big={p.featured && filter === 'All'} onOpen={() => navigate(`/work/${p.slug}`)} />)}
            </div>
          )}
        </section>

        <section id="services" className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Services</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {data.services.map(s => {
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon] || Icons.Film
              return (
                <div key={s.id} className="bg-ink p-6">
                  <Icon className="text-accent" />
                  <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{s.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[2fr_3fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-panel">
            {about?.profileImage && <img src={about.profileImage} alt={settings?.siteName} loading="lazy" className="h-full w-full object-cover" />}
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold md:text-5xl">{about?.heading}</h2>
            <p className="mt-6 text-lg text-zinc-300">{about?.description}</p>
            <p className="mt-4 max-w-prose whitespace-pre-line text-zinc-400">{about?.biography}</p>
            <p className="mt-6 text-sm text-zinc-300">{about?.experience}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {skills.map(s => <li key={s} className="rounded-full border border-line px-3 py-1.5 text-sm text-zinc-300">{s}</li>)}
            </ul>
          </div>
        </section>

        {data.testimonials.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-20">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Kind words</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.testimonials.map(t => (
                <figure key={t.id} className="rounded-md border border-line bg-panel p-6">
                  <blockquote className="text-zinc-200">{t.testimonial}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm">
                    {t.avatar_url && <img src={t.avatar_url} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" />}
                    <span><span className="block font-semibold">{t.name}</span><span className="text-zinc-500">{[t.role, t.company].filter(Boolean).join(' at ')}</span></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="mx-auto max-w-7xl px-5 py-28">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-none">{contact?.heading}</h2>
          <p className="mt-6 max-w-xl text-lg text-zinc-400">{contact?.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`mailto:${contact?.email}`} className="btn btn-primary"><Mail size={16} />{contact?.cta}</a>
            {contact?.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} className="btn btn-ghost" target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
          <p className="mt-6 text-sm text-zinc-500">{[contact?.email, contact?.phone, contact?.location].filter(Boolean).join(', ')}</p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display font-bold">{settings?.siteName}</p>
            <p className="text-sm text-zinc-500">{settings?.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            {data.social.map(s => <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white">{s.platform}</a>)}
          </div>
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} {settings?.siteName}. All rights reserved. <Link to="/admin/login" className="ml-2 text-zinc-600 hover:text-zinc-400">Admin</Link></p>
        </div>
      </footer>

      {open && <VideoViewer project={open} onClose={() => navigate('/')} />}
    </div>
  )
}
