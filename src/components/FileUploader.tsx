import { useRef, useState, DragEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadFile } from '../lib/upload'
import { formatSize } from '../lib/utils'
import { useToast } from './Toast'

interface Props {
  label: string
  bucket: 'portfolio-videos' | 'portfolio-images'
  types: string[]
  maxMB: number
  value: string | null
  onChange: (url: string | null) => void
  kind: 'video' | 'image'
}

export default function FileUploader({ label, bucket, types, maxMB, value, onChange, kind }: Props) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [info, setInfo] = useState('')

  async function handle(file?: File) {
    if (!file) return
    if (!types.includes(file.type)) return toast(`${file.name} is not a supported file type.`, 'error')
    if (file.size > maxMB * 1048576) return toast(`${file.name} is larger than ${maxMB} MB.`, 'error')
    setProgress(0)
    try {
      const url = await uploadFile(bucket, file, setProgress)
      setInfo(`${file.name}, ${formatSize(file.size)}`)
      onChange(url)
      toast(`${label} uploaded.`)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setProgress(null)
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    handle(e.dataTransfer.files[0])
  }

  return (
    <div>
      <span className="label">{label}</span>
      {value && (
        <div className="mb-2 overflow-hidden rounded-md border border-line bg-black">
          {kind === 'video' ? (
            <video src={value} controls preload="metadata" className="max-h-64 w-full" />
          ) : (
            <img src={value} alt="Preview" className="max-h-64 w-full object-contain" />
          )}
        </div>
      )}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-line p-3"
      >
        <button type="button" className="btn btn-ghost" onClick={() => input.current?.click()} disabled={progress !== null}>
          <Upload size={16} /> {value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        </button>
        {value && (
          <button type="button" className="btn btn-ghost" onClick={() => { onChange(null); setInfo('') }} aria-label={`Remove ${label}`}>
            <X size={16} /> Remove
          </button>
        )}
        <span className="text-xs text-zinc-500">{info || `Drop a file here. Max ${maxMB} MB.`}</span>
        {progress !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded bg-line" role="progressbar" aria-valuenow={progress}>
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        <input ref={input} type="file" accept={types.join(',')} hidden onChange={e => { handle(e.target.files?.[0]); e.target.value = '' }} />
      </div>
    </div>
  )
}
