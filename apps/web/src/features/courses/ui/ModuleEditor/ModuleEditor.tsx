import {LessonEditor, type EditableLesson} from './../LessonEditor/LessonEditor'
import './ModuleEditor.scss'

export type EditableModule = {
  title: string
  description: string
  order: number
  lessons: EditableLesson[]
}

type LessonErrors = {
  title?: string
  order?: string
  videoUrl?: string
  durationSeconds?: string
  content?: string
}

type ModuleErrors = {
  title?: string
  order?: string
  lessons?: LessonErrors[]
}

type Props = {
  module: EditableModule
  index: number
  errors?: ModuleErrors
  onChange: (nextModule: EditableModule) => void
  onRemove: () => void
}

const createEmptyLesson = (): EditableLesson => {
  return {
    title: '',
    description: '',
    order: 0,
    type: 'video',
    videoUrl: '',
    content: '',
    durationSeconds: '',
    isPreview: false
  }
}

export const ModuleEditor = ({module, index, errors, onChange, onRemove}: Props) => {
  const updateLesson = (lessonIndex: number, nextLesson: EditableLesson) => {
    const nextLessons = [...module.lessons]
    nextLessons[lessonIndex] = nextLesson
    onChange({
      ...module,
      lessons: nextLessons
    })
  }

  const removeLesson = (lessonIndex: number) => {
    onChange({
      ...module,
      lessons: module.lessons.filter((_, indexValue) => indexValue !== lessonIndex)
    })
  }

  const addLesson = () => {
    onChange({
      ...module,
      lessons: [...module.lessons, createEmptyLesson()]
    })
  }

  return (
    <div className='module-editor'>
      <div className='module-editor__header'>
        <h3 className='module-editor__title'>Модуль {index + 1}</h3>
        <button className='module-editor__remove' type='button' onClick={onRemove}>
          Видалити модуль
        </button>
      </div>

      <div className='module-editor__grid'>
        <div className='module-editor__group'>
          <input
            className={`module-editor__field ${errors?.title ? 'module-editor__field--error' : ''}`}
            value={module.title}
            onChange={(event) => onChange({...module, title: event.target.value})}
            placeholder='Назва модуля'
          />
          {errors?.title ? <p className='module-editor__error'>{errors.title}</p> : null}
        </div>

        <div className='module-editor__group'>
          <input
            className={`module-editor__field ${errors?.order ? 'module-editor__field--error' : ''}`}
            type='number'
            value={module.order}
            onChange={(event) =>
              onChange({
                ...module,
                order: Number(event.target.value)
              })
            }
            placeholder='Порядок'
          />
          {errors?.order ? <p className='module-editor__error'>{errors.order}</p> : null}
        </div>
      </div>

      <textarea
        className='module-editor__textarea'
        value={module.description}
        onChange={(event) => onChange({...module, description: event.target.value})}
        placeholder='Опис модуля'
        rows={3}
      />

      <div className='module-editor__lessons'>
        {module.lessons.map((lesson, lessonIndex) => (
          <LessonEditor
            key={`${index}-${lessonIndex}`}
            lesson={lesson}
            index={lessonIndex}
            errors={errors?.lessons?.[lessonIndex]}
            onChange={(nextLesson) => updateLesson(lessonIndex, nextLesson)}
            onRemove={() => removeLesson(lessonIndex)}
          />
        ))}
      </div>

      <button className='module-editor__add' type='button' onClick={addLesson}>
        Додати урок
      </button>
    </div>
  )
}