import { detectVideoSource } from '../VideoPlayer/detectVideoSource'

const SOURCE_LABELS: Record<string, string> = {
  youtube: '✓ YouTube',
  vimeo: '✓ Vimeo',
  loom: '✓ Loom',
  direct: '✓ Пряме відео-посилання',
}

type Props = {
  value: string
  error?: string
  onChange: (value: string) => void
}

export const VideoUrlInput = ({ value, error, onChange }: Props) => {
  const source = value.trim() ? detectVideoSource(value.trim()) : null

  const hint =
    source === null
      ? null
      : source.type === 'unsupported'
        ? { ok: false, label: '✗ Непідтримуване посилання' }
        : { ok: true, label: SOURCE_LABELS[source.type] }

  return (
    <div className='video-url-input'>
      <input
        className={`lesson-editor__field ${error ? 'lesson-editor__field--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Посилання на відео (YouTube, Vimeo, Loom або .mp4)'
      />
      {hint ? (
        <p
          className={`video-url-input__hint ${hint.ok ? 'video-url-input__hint--ok' : 'video-url-input__hint--error'}`}
        >
          {hint.label}
        </p>
      ) : null}
      {error ? <p className='lesson-editor__error'>{error}</p> : null}
    </div>
  )
}