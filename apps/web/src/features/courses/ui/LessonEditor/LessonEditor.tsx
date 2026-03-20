import type { LessonType } from '../../../../shared/types/course'
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

type Props = {
  lesson: EditableLesson
  index: number
  onChange: (nextLesson: EditableLesson) => void
  onRemove: () => void
}

export const LessonEditor = ({ lesson, index, onChange, onRemove }: Props) => {
  return (
    <div className='lesson-editor'>
      <div className='lesson-editor__header'>
        <h4 className='lesson-editor__title'>Урок {index + 1}</h4>
        <button className='lesson-editor__remove' type='button' onClick={onRemove}>
          Видалити урок
        </button>
      </div>

      <div className='lesson-editor__grid'>
        <input
          className='lesson-editor__field'
          value={lesson.title}
          onChange={(event) => onChange({ ...lesson, title: event.target.value })}
          placeholder='Назва уроку'
        />

        <input
          className='lesson-editor__field'
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

        <input
          className='lesson-editor__field'
          value={lesson.videoUrl}
          onChange={(event) => onChange({ ...lesson, videoUrl: event.target.value })}
          placeholder='Посилання на відео'
        />

        <input
          className='lesson-editor__field'
          value={lesson.durationSeconds}
          onChange={(event) => onChange({ ...lesson, durationSeconds: event.target.value })}
          placeholder='Тривалість у секундах'
        />

        <label className='lesson-editor__checkbox'>
          <input
            type='checkbox'
            checked={lesson.isPreview}
            onChange={(event) => onChange({ ...lesson, isPreview: event.target.checked })}
          />
          Preview
        </label>
      </div>

      <textarea
        className='lesson-editor__textarea'
        value={lesson.description}
        onChange={(event) => onChange({ ...lesson, description: event.target.value })}
        placeholder='Опис уроку'
        rows={3}
      />

      <textarea
        className='lesson-editor__textarea'
        value={lesson.content}
        onChange={(event) => onChange({ ...lesson, content: event.target.value })}
        placeholder='Текстовий контент уроку'
        rows={4}
      />
    </div>
  )
}