import type { LessonType } from '../../../../shared/types/course'
import { VideoUrlInput } from '../../../../shared/ui/VideoUrlInput/VideoUrlInput'
import '../../../../shared/ui/VideoUrlInput/VideoUrlInput.scss'
import './LessonEditor.scss'

export type EditableLesson = {
  title: string
  description: string
  order: number
  type: LessonType
  videoUrl: string
  content: string
  durationSeconds: string
  isPreview: boolean
}

type LessonErrors = {
  title?: string
  order?: string
  videoUrl?: string
  durationSeconds?: string
  content?: string
}

type Props = {
  lesson: EditableLesson
  index: number
  errors?: LessonErrors
  onChange: (nextLesson: EditableLesson) => void
  onRemove: () => void
}

export const LessonEditor = ({ lesson, errors, onChange, onRemove }: Props) => {
  return (
    <div className='lesson-editor'>
      <div className='lesson-editor__header'>
        <h4 className='lesson-editor__title'>Урок {lesson.order}</h4>
        <button className='lesson-editor__remove' type='button' onClick={onRemove}>
          Видалити урок
        </button>
      </div>

      <div className='lesson-editor__grid'>
        <div className='lesson-editor__group'>
          <input
          className={`lesson-editor__field ${errors?.title ? 'lesson-editor__field--error' : ''}`}
          value={lesson.title}
          onChange={(event) => onChange({ ...lesson, title: event.target.value })}
          placeholder='Назва уроку'
          />
          {errors?.title ? <p className='lesson-editor__error'>{errors.title}</p> : null}
        </div>

        <div className='lesson-editor__group'>
          <input
            className={`lesson-editor__field ${errors?.order ? 'lesson-editor__field--error' : ''}`}
            type='number'
            value={lesson.order}
            onChange={(event) =>
              onChange({
                ...lesson,
                order: Number(event.target.value)
              })
            }
            placeholder='Порядок'
          />
          {errors?.order ? <p className='lesson-editor__error'>{errors.order}</p> : null}
        </div>

        <div className='lesson-editor__group'>
          <select
            className='lesson-editor__field'
            value={lesson.type}
            onChange={(event) =>
              onChange({
                ...lesson,
                type: event.target.value as LessonType
              })
            }
          >
            <option value='video'>video</option>
            <option value='text'>text</option>
          </select>
        </div>

        <div className='lesson-editor__group'>
          <VideoUrlInput
            value={lesson.videoUrl}
            error={errors?.videoUrl}
            onChange={(value) => onChange({ ...lesson, videoUrl: value })}
          />
        </div>

        <div className='lesson-editor__group'>
          <input
            className={`lesson-editor__field ${errors?.durationSeconds ? 'lesson-editor__field--error' : ''}`}
            value={lesson.durationSeconds}
            onChange={(event) => onChange({ ...lesson, durationSeconds: event.target.value })}
            placeholder='Тривалість у секундах'
          />
            {errors?.durationSeconds ? (
                <p className='lesson-editor__error'>{errors.durationSeconds}</p>
            ) : null}
        </div>

        <label className='lesson-editor__checkbox'>
          <input
            type='checkbox'
            checked={lesson.isPreview}
            onChange={(event) => onChange({ ...lesson, isPreview: event.target.checked })}
          />
          Preview
        </label>
      </div>

      <div className='lesson-editor__group'>
        <textarea
          className='lesson-editor__textarea'
          value={lesson.description}
          onChange={(event) => onChange({ ...lesson, description: event.target.value })}
          placeholder='Опис уроку'
          rows={3}
        />
      </div>

      <div className='lesson-editor__group'>
        <textarea
          className={`lesson-editor__textarea ${errors?.content ? 'lesson-editor__field--error' : ''}`}
          value={lesson.content}
          onChange={(event) => onChange({ ...lesson, content: event.target.value })}
          placeholder='Текстовий контент уроку'
          rows={4}
        />
        {errors?.content ? <p className='lesson-editor__error'>{errors.content}</p> : null}
      </div>
    </div>
  )
}