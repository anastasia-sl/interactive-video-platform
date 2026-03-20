import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMe } from '../features/auth/hooks/useMe'
import { useCourse } from '../features/courses/hooks/useCourse'
import { useDeleteCourse } from '../features/courses/hooks/useDeleteCourse'
import { useUpdateCourse } from '../features/courses/hooks/useUpdateCourse'
import { CourseForm } from '../features/courses/ui/CourseForm'

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
    Boolean(course) &&
    (role === 'admin' || (role === 'teacher' && myUserId === course?.authorId))

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Link to='/'>Головна</Link>
        <Link to='/courses'>Курси</Link>
        <Link to='/me'>Мій профіль</Link>
      </nav>

      {isLoading ? <p>Завантаження курсу...</p> : null}
      {isError ? <p style={{ color: 'crimson' }}>{error.message}</p> : null}

      {course ? (
        <>
          <h1>{course.title}</h1>
          <p>{course.shortDescription}</p>
          {course.description ? <p>{course.description}</p> : null}
          <p>Статус: {course.status}</p>
          <p>Slug: {course.slug}</p>
          <p>Теги: {course.tags.length ? course.tags.join(', ') : 'немає'}</p>

          <section style={{ marginTop: 32 }}>
            <h2>Структура курсу</h2>

            {course.modules.length ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {course.modules.map((module) => (
                  <section
                    key={module.id}
                    style={{ border: '1px solid #d0d0d0', borderRadius: 12, padding: 16 }}
                  >
                    <h3>
                      Модуль {module.order + 1}: {module.title}
                    </h3>
                    {module.description ? <p>{module.description}</p> : null}

                    {module.lessons.length ? (
                      <ol>
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <strong>{lesson.title}</strong> | {lesson.type} | порядок: {lesson.order}
                            {lesson.description ? <div>{lesson.description}</div> : null}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>У цьому модулі ще немає уроків</p>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <p>До курсу ще не додано модулі</p>
            )}
          </section>

          {canEdit ? (
            <section style={{ marginTop: 32 }}>
              <h2>Редагування курсу</h2>
              <CourseForm
                mode='edit'
                initialValues={course}
                submitLabel='Оновити курс'
                isPending={updateCourseMutation.isPending}
                onSubmit={(payload) => updateCourseMutation.mutate(payload)}
              />
              {updateCourseMutation.isError ? (
                <p style={{ color: 'crimson' }}>{updateCourseMutation.error.message}</p>
              ) : null}
              {updateCourseMutation.isSuccess ? (
                <p style={{ color: 'green' }}>Курс успішно оновлено</p>
              ) : null}

              <div style={{ marginTop: 16 }}>
                <button
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
              </div>

              {deleteCourseMutation.isError ? (
                <p style={{ color: 'crimson' }}>{deleteCourseMutation.error.message}</p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  )
}