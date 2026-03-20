import { Link } from 'react-router-dom'
import { useMe } from '../features/auth/hooks/useMe'
import { useCourses } from '../features/courses/hooks/useCourses'
import { useCreateCourse } from '../features/courses/hooks/useCreateCourse'
import { CourseForm } from '../features/courses/ui/CourseForm'

export const CoursesPage = () => {
  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourses()
  const createCourseMutation = useCreateCourse()

  const role = meData?.user.role
  const canCreate = role === 'teacher' || role === 'admin'

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1>Курси</h1>

      <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Link to='/'>Головна</Link>
        <Link to='/me'>Мій профіль</Link>
      </nav>

      {canCreate ? (
        <section style={{ marginBottom: 32 }}>
          <h2>Створення курсу</h2>
          <CourseForm
            mode='create'
            submitLabel='Створити курс'
            isPending={createCourseMutation.isPending}
            onSubmit={(payload) => createCourseMutation.mutate(payload)}
          />
          {createCourseMutation.isError ? (
            <p style={{ color: 'crimson' }}>{createCourseMutation.error.message}</p>
          ) : null}
          {createCourseMutation.isSuccess ? (
            <p style={{ color: 'green' }}>Курс успішно створено</p>
          ) : null}
        </section>
      ) : null}

      {isLoading ? <p>Завантаження курсів...</p> : null}
      {isError ? <p style={{ color: 'crimson' }}>{error.message}</p> : null}

      {!isLoading && !isError ? (
        <section style={{ display: 'grid', gap: 16 }}>
          {data?.courses.length ? (
            data.courses.map((course) => (
              <article
                key={course.id}
                style={{ border: '1px solid #d0d0d0', borderRadius: 12, padding: 16 }}
              >
                <h3>{course.title}</h3>
                <p>{course.shortDescription}</p>
                <p>Статус: {course.status}</p>
                <p>Кількість модулів: {course.modules.length}</p>
                <Link to={`/courses/${course.id}`}>Перейти до курсу</Link>
              </article>
            ))
          ) : (
            <p>Курсів поки немає</p>
          )}
        </section>
      ) : null}
    </main>
  )
}