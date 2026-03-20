import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import { useCourse } from '../../features/courses/hooks/useCourse.ts'
import { useDeleteCourse } from '../../features/courses/hooks/useDeleteCourse.ts'
import { useUpdateCourse } from '../../features/courses/hooks/useUpdateCourse.ts'
import { CourseForm } from '../../features/courses/ui/CourseForm/CourseForm.tsx'
import { ModuleEditor, type EditableModule } from '../../features/courses/ui/ModuleEditor/ModuleEditor.tsx'
import './CoursePage.scss'

const createEmptyModule = (): EditableModule => {
  return {
    title: '',
    description: '',
    order: 0,
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

  const course = data?.course
  const role = meData?.user.role
  const myUserId = meData?.user.id

  const canEdit =
    !!course &&
    (role === 'admin' || (role === 'teacher' && myUserId === course.authorId))

  const initialModules = useMemo<EditableModule[]>(() => {
    if (!course) {
      return []
    }

    return course.modules.map((module) => ({
      title: module.title,
      description: module.description ?? '',
      order: module.order,
      lessons: module.lessons.map((lesson) => ({
        title: lesson.title,
        description: lesson.description ?? '',
        order: lesson.order,
        type: lesson.type,
        videoUrl: lesson.videoUrl ?? '',
        content: lesson.content ?? '',
        durationSeconds: lesson.durationSeconds ? String(lesson.durationSeconds) : '',
        isPreview: lesson.isPreview
      }))
    }))
  }, [course])

  const [modules, setModules] = useState<EditableModule[]>([])

  useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  const addModule = () => {
    setModules((prev) => [...prev, createEmptyModule()])
  }

  const updateModule = (moduleIndex: number, nextModule: EditableModule) => {
    setModules((prev) => prev.map((item, index) => (index === moduleIndex ? nextModule : item)))
  }

  const removeModule = (moduleIndex: number) => {
    setModules((prev) => prev.filter((_, index) => index !== moduleIndex))
  }

  const saveStructure = () => {
    updateCourseMutation.mutate({
      modules: modules.map((module, moduleIndex) => ({
        title: module.title.trim(),
        description: module.description.trim() || undefined,
        order: Number.isNaN(module.order) ? moduleIndex : module.order,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          title: lesson.title.trim(),
          description: lesson.description.trim() || undefined,
          order: Number.isNaN(lesson.order) ? lessonIndex : lesson.order,
          type: lesson.type,
          videoUrl: lesson.videoUrl.trim() || undefined,
          content: lesson.content.trim() || undefined,
          durationSeconds: lesson.durationSeconds ? Number(lesson.durationSeconds) : undefined,
          isPreview: lesson.isPreview
        }))
      }))
    })
  }

  return (
    <main  className='course-page'>
      <div className='course-page__container'>
      <nav className='course-page__nav'>
        <Link to='/'>Головна</Link>
        <Link to='/courses'>Курси</Link>
        <Link to='/me'>Мій профіль</Link>
      </nav>

      {isLoading ? <p className='course-page__message'>Завантаження курсу...</p> : null}
      {isError ? <p className='course-page__message course-page__message--error'>{error.message}</p> : null}

      {course ? (
        <>
        <section className='course-page__hero'>
          <h1 className='course-page__title'>{course.title}</h1>
          <p className='course-page__text'>{course.shortDescription}</p>
          {course.description ? <p className='course-page__text'>{course.description}</p> : null}
          <p className='course-page__meta'>Статус: {course.status}</p>
          <p className='course-page__meta'>Slug: {course.slug}</p>
          <p className='course-page__meta'>Теги: {course.tags.length ? course.tags.join(', ') : 'немає'}</p>
        </section>

          <section className='course-page__section'>
            <h2 className='course-page__subtitle'>Структура курсу</h2>

            {course.modules.length ? (
              <div className='course-page__modules-preview'>
                {course.modules.map((module) => (
                  <section
                    key={module.id}
                    className='course-page__preview-card'
                  >
                    <h3 className='course-page__preview-title'>
                      Модуль {module.order + 1}: {module.title}
                    </h3>
                    {module.description ? <p className='course-page__text'>{module.description}</p> : null}

                    {module.lessons.length ? (
                      <ol className='course-page__preview-list'>
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <strong>{lesson.title}</strong> | {lesson.type} | порядок: {lesson.order}
                            {lesson.description ? <div>{lesson.description}</div> : null}
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

          {canEdit ? (
            <>
            <section className='course-page__section'>
              <h2 className='course-page__subtitle'>Редагування курсу</h2>
              <CourseForm
                mode='edit'
                initialValues={course}
                submitLabel='Оновити курс'
                isPending={updateCourseMutation.isPending}
                onSubmit={(payload) => updateCourseMutation.mutate(payload)}
              />
              {updateCourseMutation.isError ? (
                <p className='course-page__message course-page__message--error'>{updateCourseMutation.error.message}</p>
              ) : null}
              {updateCourseMutation.isSuccess ? (
                <p className='course-page__message course-page__message--success'>Курс успішно оновлено</p>
              ) : null}
            </section>
            <section className='course-page__section'>
              <div className='course-page__section-header'>
                <h2 className='course-page__subtitle'>Редактор структури курсу</h2>
                <button className='course-page__add-button' type='button' onClick={addModule}>
                  Додати модуль
                </button>
              </div>

              <div className='course-page__modules-editor'>
                {modules.map((module, index) => (
                  <ModuleEditor
                    key={index}
                    module={module}
                    index={index}
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

              {updateCourseMutation.isSuccess ? (
                <p className='course-page__message course-page__message--success'>
                  Зміни успішно збережено
                </p>
              ) : null}
            </section>
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
            </>
          ) : null}
        </>
      ) : null}
      </div>
    </main>
  )
}