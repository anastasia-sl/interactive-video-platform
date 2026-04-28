import {type ChangeEvent, useState} from 'react'
import type { LessonType } from '../../../../shared/types/course'
import type { VideoAssetDto } from '@interactive-video-platform/shared'
import { useUploadVideo } from '../../hooks/useUploadVideo'
import { InteractiveQuestionsEditor } from '../../../interactive-questions/ui/InteractiveQuestionsEditor/InteractiveQuestionsEditor'
import './LessonEditor.scss'

export type EditableLesson = {
  id?: string
  clientId: string
  title: string
  description: string
  order: number
  type: LessonType
  videoAssetId: string
  videoAsset?: VideoAssetDto
  videoFileName: string
  content: string
  durationSeconds: string
  isPreview: boolean
  hasInteractiveQuestions: boolean
}

type LessonErrors = {
  title?: string
  order?: string
  videoAssetId?: string
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
  const uploadMutation = useUploadVideo()
  const [isInteractiveQuestionsEditorOpen, setIsInteractiveQuestionsEditorOpen] = useState(false)

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as LessonType

    if (nextType === 'text') {
      onChange({
        ...lesson,
        type: nextType,
        videoAssetId: '',
        videoAsset: undefined,
        videoFileName: '',
        durationSeconds: '',
        hasInteractiveQuestions: false
      })
      return
    }

    onChange({
      ...lesson,
      type: nextType
    })
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        onChange({
          ...lesson,
          videoAssetId: result.videoAsset.id,
          videoAsset: result.videoAsset,
          videoFileName: file.name,
          durationSeconds:
              result.videoAsset.durationSec !== undefined
                  ? String(result.videoAsset.durationSec)
                  : lesson.durationSeconds
        })
      }
    })

    event.target.value = ''
  }
    const lessonIdForInteractiveQuestions = lesson.id

    const videoDurationSeconds = Number(
        lesson.videoAsset?.durationSec ?? lesson.durationSeconds
    )


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
          <select className='lesson-editor__field' value={lesson.type} onChange={handleTypeChange}>
            <option value='video'>video</option>
            <option value='text'>text</option>
          </select>
        </div>

        <div className='lesson-editor__group'>
          <input
            className={`lesson-editor__field ${errors?.durationSeconds ? 'lesson-editor__field--error' : ''}`}
            value={lesson.durationSeconds}
            readOnly
            placeholder='Тривалість відео визначається автоматично у секундах'
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

      {lesson.type === 'video' ? (
          <div className='lesson-editor__group'>
            <p className='lesson-editor__label'>Завантажте відео:</p>
            <input
                className='lesson-editor__field'
                type='file'
                accept='video/mp4,video/webm,video/ogg'
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
            />

            {uploadMutation.isPending ? (
                <p className='lesson-editor__hint'>Завантаження відео...</p>
            ) : null}

            {uploadMutation.isError ? (
                <p className='lesson-editor__error'>{uploadMutation.error.message}</p>
            ) : null}

            {lesson.videoFileName ? (
                <p className='lesson-editor__hint'>Файл: {lesson.videoFileName}</p>
            ) : null}

            {lesson.videoAsset ? (
                <p className='lesson-editor__hint lesson-editor__hint--ok'>
                  Відео завантажено ✓ | asset: {lesson.videoAsset.id} | статус: {lesson.videoAsset.status}
                </p>
            ) : null}

            {errors?.videoAssetId ? (
                <p className='lesson-editor__error'>{errors.videoAssetId}</p>
            ) : null}
          </div>
      ) : null}

      {lesson.type === 'text' && (
          <p>Інтерактивні питання доступні тільки для відеоуроків.</p>
      )}

      {lesson.type === 'video' && !lesson.videoAssetId && (
          <p>Щоб додати інтерактивні питання, спочатку завантажте відео до уроку.</p>
      )}

      {lesson.type === 'video' &&
          lesson.videoAssetId &&
          lesson.videoAsset?.status !== 'ready' && (
              <p>Інтерактивні питання можна додати після завершення обробки відео.</p>
          )}

      {lesson.type === 'video' &&
          lesson.videoAssetId &&
          lesson.videoAsset?.status === 'ready' &&
          !lessonIdForInteractiveQuestions && (
              <p>Щоб додати інтерактивні питання, спочатку збережіть урок.</p>
          )}

      {lesson.type === 'video' &&
          lesson.videoAssetId &&
          lesson.videoAsset?.status === 'ready' &&
          lessonIdForInteractiveQuestions && (
              <section>
                <button
                    type="button"
                    onClick={() =>
                        setIsInteractiveQuestionsEditorOpen((currentValue) => !currentValue)
                    }
                >
                  {isInteractiveQuestionsEditorOpen
                      ? 'Закрити редактор інтерактивних питань'
                      : 'Додати інтерактивні питання'}
                </button>

                {isInteractiveQuestionsEditorOpen && (
                    <InteractiveQuestionsEditor
                        lessonId={lessonIdForInteractiveQuestions}
                        videoUrl={lesson.videoAsset.playbackUrl ?? lesson.videoAsset.secureUrl}
                        durationSeconds={
                          Number.isFinite(videoDurationSeconds)
                              ? videoDurationSeconds
                              : undefined
                        }
                    />
                )}
              </section>
          )}

      {lesson.type === 'text' ? (
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
      ) : null}
    </div>
  )
}