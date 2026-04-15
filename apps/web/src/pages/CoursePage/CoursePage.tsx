import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import { useCourse } from '../../features/courses/hooks/useCourse.ts'
import { useDeleteCourse } from '../../features/courses/hooks/useDeleteCourse.ts'
import { useUpdateCourse } from '../../features/courses/hooks/useUpdateCourse.ts'
import { CourseForm } from '../../features/courses/ui/CourseForm/CourseForm.tsx'
import { ModuleEditor, type EditableModule } from '../../features/courses/ui/ModuleEditor/ModuleEditor.tsx'
import { VideoPlayer } from '../../shared/ui/VideoPlayer/VideoPlayer'
import './CoursePage.scss'

type ViewMode = 'view' | 'edit-course' | 'edit-structure'

type LessonValidationErrors = {
  title?: string
  order?: string
  videoAssetId?: string
  durationSeconds?: string
  content?: string
}

type ModuleValidationErrors = {
  title?: string
  order?: string
  lessons?: LessonValidationErrors[]
}

const createEmptyModule = (): EditableModule => {
  return {
    title: '',
    description: '',
    order: 1,
    lessons: []
  }
}

export const CoursePage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourse(id)
  const updateCourseMutation = useUpdateCourse(id)
  const deleteCourseMutation = useDeleteCourse()

  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<ViewMode>('view')


  const course = data?.course
  const role = meData?.user.role
  const myUserId = meData?.user.id

  const canEdit =
    !!course &&
    (role === 'admin' || (role === 'teacher' && myUserId === course.authorId))

  useEffect(() => {
    if (!canEdit) {
      return
    }

    const routeMode = searchParams.get('mode')

    if (routeMode === 'edit-course' || routeMode === 'edit-structure') {
      setMode(routeMode)
    }
  }, [canEdit, searchParams, id])

  const initialModules = useMemo<EditableModule[]>(() => {
    if (!course) {
      return []
    }

    return course.modules.map((module) => ({
      title: module.title,
      description: module.description ?? '',
      order: module.order,
      lessons: module.lessons.map((lesson) => ({
        clientId: lesson.id,
        title: lesson.title,
        description: lesson.description ?? '',
        order: lesson.order,
        type: lesson.type,
        videoAssetId: lesson.videoAssetId ?? '',
        videoAsset: lesson.videoAsset,
        videoFileName: '',
        content: lesson.content ?? '',
        durationSeconds: lesson.durationSeconds ? String(lesson.durationSeconds) : '',
        isPreview: lesson.isPreview,
        hasInteractiveQuestions: lesson.hasInteractiveQuestions ?? false
      }))
    }))
  }, [course])

  const [modules, setModules] = useState<EditableModule[]>([])
  const [moduleErrors, setModuleErrors] = useState<ModuleValidationErrors[]>([])

  useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        ...createEmptyModule(),
        order: prev.length + 1
      }
    ])
    setModuleErrors((prev) => [...prev, {}])
  }

  const updateModule = (moduleIndex: number, nextModule: EditableModule) => {
    setModules((prev) => prev.map((item, index) => (index === moduleIndex ? nextModule : item)))
    setModuleErrors((prev) => prev.map((item, index) => (index === moduleIndex ? {} : item)))
  }

  const removeModule = (moduleIndex: number) => {
    setModules((prev) => prev.filter((_, index) => index !== moduleIndex))
    setModuleErrors((prev) => prev.filter((_, index) => index !== moduleIndex))
  }

  const validateStructure = () => {
    const nextErrors: ModuleValidationErrors[] = modules.map((module) => {
      const moduleError: ModuleValidationErrors = {}

      if (!module.title.trim()) {
        moduleError.title = 'Введіть назву модуля'
      }

      if (Number.isNaN(module.order) || module.order < 1) {
        moduleError.order = 'Порядок модуля повинен бути числом 1 або більше'
      }

      moduleError.lessons = module.lessons.map((lesson) => {
        const lessonError: LessonValidationErrors = {}

        if (!lesson.title.trim()) {
          lessonError.title = 'Введіть назву уроку'
        }

        if (Number.isNaN(lesson.order) || lesson.order < 1) {
          lessonError.order = 'Порядок уроку повинен бути числом 1 або більше'
        }

        if (lesson.type === 'video' && !lesson.videoAssetId.trim()) {
          lessonError.videoAssetId = 'Для відеоуроку завантажте відео'
        }

        if (lesson.durationSeconds.trim()) {
          const value = Number(lesson.durationSeconds)
          if (Number.isNaN(value) || value < 0) {
            lessonError.durationSeconds = 'Тривалість повинна бути числом 0 або більше'
          }
        }

        if (lesson.type === 'text' && !lesson.content.trim()) {
          lessonError.content = 'Для текстового уроку заповніть контент'
        }

        return lessonError
      })

      return moduleError
    })

    setModuleErrors(nextErrors)

    const hasErrors = nextErrors.some((moduleError) => {
      const hasModuleErrors = Boolean(moduleError.title || moduleError.order)
      const hasLessonErrors = moduleError.lessons?.some(
        (lessonError) =>
          lessonError.title ||
          lessonError.order ||
          lessonError.videoAssetId ||
          lessonError.durationSeconds ||
          lessonError.content
      )

      return hasModuleErrors || hasLessonErrors
    })

    return !hasErrors
  }

  const saveStructure = () => {
    if (!validateStructure()) {
      return
    }

    updateCourseMutation.mutate({
      modules: modules.map((module, moduleIndex) => ({
        title: module.title.trim(),
        description: module.description.trim() || undefined,
        order: Number.isNaN(module.order) ? moduleIndex + 1 : module.order,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          title: lesson.title.trim(),
          description: lesson.description.trim() || undefined,
          order: Number.isNaN(lesson.order) ? lessonIndex + 1 : lesson.order,
          type: lesson.type,
          videoAssetId: lesson.videoAssetId.trim() || undefined,
          content: lesson.content.trim() || undefined,
          durationSeconds: lesson.durationSeconds ? Number(lesson.durationSeconds) : undefined,
          isPreview: lesson.isPreview,
          hasInteractiveQuestions: lesson.hasInteractiveQuestions
        }))
      }))
    },
      {
        onSuccess: () => {
          setMode('view')
        }
      }
    )
  }

  return (
    <main  className='course-page'>
      <div className='course-page__container'>
      <nav className='course-page__nav'>
        <Link to='/'>Головна</Link>
        <Link to='/courses'>Курси</Link>
        {role === 'teacher' || role === 'admin' ? <Link to='/my-courses'>Мої курси</Link> : null}
        {role === 'teacher' || role === 'admin' ? <Link to='/courses/create'>Створити курс</Link> : null}
        <Link to='/me'>Мій профіль</Link>
      </nav>

      {isLoading ? <p className='course-page__message'>Завантаження курсу...</p> : null}
      {isError ? <p className='course-page__message course-page__message--error'>{error.message}</p> : null}

      {course ? (
        <>
        <section className='course-page__hero'>
          <div className='course-page__hero-top'>
            <div>
          <h1 className='course-page__title'>{course.title}</h1>
          <p className='course-page__text'>{course.shortDescription}</p>
              {course.thumbnailUrl ? (
                <img
                  className='course-page__thumbnail'
                  src={course.thumbnailUrl}
                  alt={course.title}
                />
              ) : null}
          {course.description ? <p className='course-page__text'>{course.description}</p> : null}
          <p className='course-page__meta'>Статус: {course.status}</p>
          <p className='course-page__meta'>Slug: {course.slug}</p>
          <p className='course-page__meta'>Теги: {course.tags.length ? course.tags.join(', ') : 'немає'}</p>
            </div>

            {canEdit ? (
              <div className='course-page__toolbar'>
                <button
                  className='course-page__toolbar-button'
                  type='button'
                  onClick={() => setMode('edit-course')}
                >
                  Редагувати курс
                </button>
                <button
                  className='course-page__toolbar-button'
                  type='button'
                  onClick={() => setMode('edit-structure')}
                >
                  Редагувати структуру
                </button>
              </div>
            ) : null}
          </div>
        </section>

          <section className='course-page__section'>
            {canEdit ? <h2 className='course-page__subtitle'>Попередній перегляд курсу</h2> : null}

            {course.modules.length ? (
              <div className='course-page__modules-preview'>
                {course.modules.map((module) => (
                  <section
                    key={module.id}
                    className='course-page__preview-card'
                  >
                    <h3 className='course-page__preview-title'>
                      Модуль {module.order}: {module.title}
                    </h3>
                    {module.description ? <p className='course-page__text'>{module.description}</p> : null}

                    {module.lessons.length ? (
                      <ol className='course-page__preview-list'>
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <strong>{lesson.title}</strong> | {lesson.type} | порядок: {lesson.order}
                            {lesson.description ? <div>{lesson.description}</div> : null}
                            {lesson.type === 'video' && lesson.videoAsset?.playbackUrl ? (
                                <VideoPlayer url={lesson.videoAsset.playbackUrl} />
                            ) : null}
                            {lesson.type === 'text' && lesson.content ? (
                              <div className='course-page__lesson-content'>{lesson.content}</div>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className='course-page__text'>У цьому модулі ще немає уроків</p>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <p className='course-page__text'>До курсу ще не додано модулі</p>
            )}
          </section>

          {canEdit && mode === 'edit-course' ? (
            <section className='course-page__section'>
              <div className='course-page__section-header'>
                <h2 className='course-page__subtitle'>Редагування курсу</h2>
                <button
                  className='course-page__secondary-button'
                  type='button'
                  onClick={() => setMode('view')}
                >
                  Скасувати
                </button>
              </div>

              <CourseForm
                mode='edit'
                initialValues={course}
                submitLabel='Оновити курс'
                isPending={updateCourseMutation.isPending}
                onSubmit={(payload) =>
                  updateCourseMutation.mutate(payload, {
                    onSuccess: () => {
                      setMode('view')
                    }
                  })
                }
              />

              {updateCourseMutation.isError ? (
                <p className='course-page__message course-page__message--error'>
                  {updateCourseMutation.error.message}
                </p>
              ) : null}

              {updateCourseMutation.isSuccess ? (
                <p className='course-page__message course-page__message--success'>
                  Курс успішно оновлено
                </p>
              ) : null}
            </section>
          ) : null}

      {canEdit && mode ==='edit-structure' ? (
            <section className='course-page__section'>
              <div className='course-page__section-header'>
                <h2 className='course-page__subtitle'>Редактор структури курсу</h2>
                <div className='course-page__section-actions'>
                  <button className='course-page__add-button' type='button' onClick={addModule}>
                    Додати модуль
                  </button>
                  <button
                    className='course-page__secondary-button'
                    type='button'
                    onClick={() => setMode('view')}
                  >
                    Скасувати
                  </button>
                </div>
              </div>

              <div className='course-page__modules-editor'>
                {modules.map((module, index) => (
                  <ModuleEditor
                    key={index}
                    module={module}
                    index={index}
                    errors={moduleErrors[index]}
                    onChange={(nextModule) => updateModule(index, nextModule)}
                    onRemove={() => removeModule(index)}
                  />
                ))}
              </div>

              <div className='course-page__actions'>
                <button
                  className='course-page__save-button'
                  type='button'
                  onClick={saveStructure}
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? 'Збереження...' : 'Зберегти структуру'}
                </button>
              </div>

              {updateCourseMutation.isError ? (
                <p className='course-page__message course-page__message--error'>
                  {updateCourseMutation.error.message}
                </p>
              ) : null}
            </section>
      ) : null}
      {canEdit ? (
            <section className='course-page__section'>
            <h2 className='course-page__subtitle'>Керування курсом</h2>
            <button
            className='course-page__delete-button'
            type='button'
            onClick={() => {
            deleteCourseMutation.mutate(id, {
            onSuccess: () => {
            navigate('/courses')
          }
          })
          }}
          disabled={deleteCourseMutation.isPending}
        >
        {deleteCourseMutation.isPending ? 'Видалення...' : 'Видалити курс'}
        </button>

              {deleteCourseMutation.isError ? (
                <p className='course-page__message course-page__message--error'>
                  {deleteCourseMutation.error.message}
                </p>
              ) : null}
            </section>
      ) : null}
    </>
  ) : null}
</div>
</main>
)
}