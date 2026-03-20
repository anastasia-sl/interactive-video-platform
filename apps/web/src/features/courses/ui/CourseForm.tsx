import { useState } from 'react'
import type {
  CourseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto
} from '../../../shared/types/course'

type CreateProps = {
  mode: 'create'
  initialValues?: never
  onSubmit: (payload: CreateCourseRequestDto) => void
  isPending?: boolean
  submitLabel: string
}

type EditProps = {
  mode: 'edit'
  initialValues: CourseDto
  onSubmit: (payload: UpdateCourseRequestDto) => void
  isPending?: boolean
  submitLabel: string
}

type Props = CreateProps | EditProps

export const CourseForm = (props: Props) => {
  const initialValues = props.mode === 'edit' ? props.initialValues : undefined

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [slug, setSlug] = useState(initialValues?.slug ?? '')
  const [shortDescription, setShortDescription] = useState(initialValues?.shortDescription ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialValues?.status ?? 'draft')
  const [tags, setTags] = useState(initialValues?.tags.join(', ') ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValues?.thumbnailUrl ?? '')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title,
      slug,
      shortDescription,
      description: description || undefined,
      status,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      thumbnailUrl: thumbnailUrl || undefined
    }

    if (props.mode === 'create') {
      props.onSubmit(payload)
      return
    }

    props.onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder='Назва курсу'
        required
      />
      <input
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        placeholder='slug-kursu'
        required
      />
      <input
        value={shortDescription}
        onChange={(event) => setShortDescription(event.target.value)}
        placeholder='Короткий опис'
        required
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder='Повний опис'
        rows={5}
      />
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}
      >
        <option value='draft'>draft</option>
        <option value='published'>published</option>
      </select>
      <input
        value={tags}
        onChange={(event) => setTags(event.target.value)}
        placeholder='react, typescript, frontend'
      />
      <input
        value={thumbnailUrl}
        onChange={(event) => setThumbnailUrl(event.target.value)}
        placeholder='https://example.com/image.jpg'
      />
      <button type='submit' disabled={props.isPending}>
        {props.isPending ? 'Збереження...' : props.submitLabel}
      </button>
    </form>
  )
}