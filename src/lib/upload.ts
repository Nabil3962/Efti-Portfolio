import { supabase, supabaseUrl, supabaseKey } from './supabase'

export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadFile(bucket: string, file: File, onProgress: (pct: number) => void) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('You are signed out. Sign in again.')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', supabaseKey)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = e => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      if (xhr.status < 300) return resolve()
      let message = 'Upload failed.'
      try { message = JSON.parse(xhr.responseText).message || message } catch { /* keep default */ }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Network error during upload.'))
    xhr.send(file)
  })

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
