export interface Project {
  id: string
  title: string
  slug: string
  description: string
  category: string
  client: string
  year: string
  video_url: string | null
  thumbnail_url: string | null
  featured: boolean
  published: boolean
  sort_order: number
  created_at: string
}

export interface Service { id: string; title: string; description: string; icon: string; sort_order: number; published: boolean }
export interface Testimonial { id: string; name: string; role: string; company: string; testimonial: string; avatar_url: string | null; sort_order: number; published: boolean }
export interface Social { id: string; platform: string; url: string; sort_order: number }

export type Content = Record<string, Record<string, string>>

export const CATEGORIES = ['Commercial', 'YouTube', 'Social Media', 'Documentary', 'Music Video', 'Wedding', 'Corporate', 'Motion Graphics', 'Other']
