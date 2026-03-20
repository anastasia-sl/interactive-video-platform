import { useState, useMemo } from 'react'
import type {
  CourseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto
} from '../../../../shared/types/course.ts'
import './CourseForm.scss'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

type Errors = {
  title?: string
  slug?: string
  shortDescription?: string
  thumbnailUrl?: string
}

export const CourseForm = (props: Props) => {
  const initialValues = props.mode === 'edit' ? props.initialValues : undefined

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [slug, setSlug] = useState(initialValues?.slug ?? '')
  const [shortDescription, setShortDescription] = useState(initialValues?.shortDescription ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialValues?.status ?? 'draft')
  const [tags, setTags] = useState(initialValues?.tags.join(', ') ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValues?.thumbnailUrl ?? '')
  const [errors, setErrors] = useState<Errors>({})

  const fieldsClassName = useMemo(
    () => ({
      title: errors.title ? 'course-form__field course-form__field--error' : 'course-form__field',
      slug: errors.slug ? 'course-form__field course-form__field--error' : 'course-form__field',
      shortDescription: errors.shortDescription
        ? 'course-form__field course-form__field--error'
        : 'course-form__field',
      thumbnailUrl: errors.thumbnailUrl
        ? 'course-form__field course-form__field--error'
        : 'course-form__field'
    }),
    [errors]
  )

  const validate = () => {
    const nextErrors: Errors = {}

    if (title.trim().length < 3) {
      nextErrors.title = 'Назва курсу повинна містити щонайменше 3 символи'
    }

    if (!slugPattern.test(slug.trim())) {
      nextErrors.slug =
        'Slug може містити лише малі латинські літери, цифри та дефіс між словами'
    }

    if (shortDescription.trim().length < 10) {
      nextErrors.shortDescription = 'Короткий опис повинен містити щонайменше 10 символів'
    }

    if (thumbnailUrl.trim()) {
      try {
        new URL(thumbnailUrl.trim())
      } catch {
        nextErrors.thumbnailUrl = 'Введіть коректне посилання на зображення'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim() || undefined,
      status,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      thumbnailUrl: thumbnailUrl.trim() || undefined
    }

    if (props.mode === 'create') {
      props.onSubmit(payload)
      return
    }

    props.onSubmit(payload)
  }

  return (
    <form className='course-form' onSubmit={handleSubmit}>
      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-title`}>
          Назва курсу
        </label>
        <input
          id={`${props.mode}-title`}
          className={fieldsClassName.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='Введіть назву курсу'
        />
        {errors.title ? <p className='course-form__error'>{errors.title}</p> : null}
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-slug`}>
          Slug
        </label>
        <input
          id={`${props.mode}-slug`}
          className={fieldsClassName.slug}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder='osnovy-react'
        />
        {errors.slug ? <p className='course-form__error'>{errors.slug}</p> : null}
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-short-description`}>
          Короткий опис
        </label>
        <input
          id={`${props.mode}-short-description`}
          className={fieldsClassName.shortDescription}
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          placeholder='Короткий опис курсу'
        />
        {errors.shortDescription ? (
          <p className='course-form__error'>{errors.shortDescription}</p>
        ) : null}
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-description`}>
          Повний опис
        </label>
        <textarea
          id={`${props.mode}-description`}
          className='course-form__textarea'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder='Детальний опис курсу'
          rows={5}
        />
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-status`}>
          Статус
        </label>
        <select
          id={`${props.mode}-status`}
          className='course-form__field'
          value={status}
          onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}
        >
          <option value='draft'>draft</option>
          <option value='published'>published</option>
        </select>
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-tags`}>
          Теги
        </label>
        <input
          id={`${props.mode}-tags`}
          className='course-form__field'
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder='react, typescript, frontend'
        />
      </div>

      <div className='course-form__group'>
        <label className='course-form__label' htmlFor={`${props.mode}-thumbnail`}>
          Зображення курсу
        </label>
        <input
          id={`${props.mode}-thumbnail`}
          className={fieldsClassName.thumbnailUrl}
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          placeholder='https://example.com/image.jpg'
        />
        {errors.thumbnailUrl ? <p className='course-form__error'>{errors.thumbnailUrl}</p> : null}
      </div>

      <button className='course-form__submit' type='submit' disabled={props.isPending}>
        {props.isPending ? 'Збереження...' : props.submitLabel}
      </button>
    </form>
  )
}