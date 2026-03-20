import { Link } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import { useCourses } from '../../features/courses/hooks/useCourses.ts'
import { useCreateCourse } from '../../features/courses/hooks/useCreateCourse.ts'
import { CourseForm } from '../../features/courses/ui/CourseForm/CourseForm.tsx'
import './CoursesPage.scss'

export const CoursesPage = () => {
  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourses()
  const createCourseMutation = useCreateCourse()

  const role = meData?.user.role
  const canCreate = role === 'teacher' || role === 'admin'

  return (
    <main className='courses-page'>
      <div className='courses-page__container'>
        <h1 className='courses-page__title'>Курси</h1>

        <nav className='courses-page__nav'>
          <Link to='/'>Головна</Link>
          <Link to='/me'>Мій профіль</Link>
        </nav>

      {canCreate ? (
        <section className='courses-page__section'>
          <h2 className='courses-page__subtitle'>Створення курсу</h2>
          <CourseForm
            mode='create'
            submitLabel='Створити курс'
            isPending={createCourseMutation.isPending}
            onSubmit={(payload) => createCourseMutation.mutate(payload)}
          />
          {createCourseMutation.isError ? (
            <p className='courses-page__message courses-page__message--error'>
              {createCourseMutation.error.message}
            </p>
          ) : null}
          {createCourseMutation.isSuccess ? (
            <p className='courses-page__message courses-page__message--success'>Курс успішно створено</p>
          ) : null}
        </section>
      ) : null}

      {isLoading ? <p className='courses-page__message'>Завантаження курсів...</p> : null}
      {isError ? <p className='courses-page__message courses-page__message--error'>{error.message}</p> : null}

      {!isLoading && !isError ? (
        <section className='courses-page__list'>
          {data?.courses.length ? (
            data.courses.map((course) => (
              <article
                key={course.id}
                className='courses-page__card'
              >
                <h3 className='courses-page__card-title'>{course.title}</h3>
                <p className='courses-page__card-text'>{course.shortDescription}</p>
                <p className='courses-page__card-text'>Статус: {course.status}</p>
                <p className='courses-page__card-text'>Кількість модулів: {course.modules.length}</p>
                <Link className='courses-page__link' to={`/courses/${course.id}`}>Перейти до курсу</Link>
              </article>
            ))
          ) : (
            <p className='courses-page__message'>Курсів поки немає</p>
          )}
        </section>
      ) : null}
      </div>
    </main>
  )
}