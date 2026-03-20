import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import { useCourses } from '../../features/courses/hooks/useCourses.ts'
import { useCreateCourse } from '../../features/courses/hooks/useCreateCourse.ts'
import { CourseForm } from '../../features/courses/ui/CourseForm/CourseForm.tsx'
import './CoursesPage.scss'

type StatusFilter = 'all' | 'published' | 'draft'

export const CoursesPage = () => {
  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourses()
  const createCourseMutation = useCreateCourse()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)

  const role = meData?.user.role
  const myUserId = meData?.user.id
  const canCreate = role === 'teacher' || role === 'admin'

  const filteredCourses = useMemo(() => {
    const courses = data?.courses ?? []

    if (statusFilter === 'all') {
      return courses
    }

    return courses.filter((course) => course.status === statusFilter)
  }, [data?.courses, statusFilter])

  return (
    <main className='courses-page'>
      <div className='courses-page__container'>
        <div className='courses-page__header'>
        <h1 className='courses-page__title'>Курси</h1>

          <div className='courses-page__nav-wrap'>
        <nav className='courses-page__nav'>
          <Link to='/'>Головна</Link>
          {canCreate ? <Link to='/my-courses'>Мої курси</Link> : null}
          <Link to='/me'>Мій профіль</Link>
        </nav>
            <div className='courses-page__filter'>
              <label htmlFor='course-status-filter'>Фільтр</label>
              <select
                id='course-status-filter'
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value='all'>Усі</option>
                <option value='published'>published</option>
                <option value='draft'>draft</option>
              </select>
            </div>
          </div>
        </div>

        {canCreate ? (
          <section className='courses-page__section'>
            <div className='courses-page__section-header'>
              <h2 className='courses-page__subtitle'>Створення курсу</h2>

              {!isCreateFormOpen ? (
                <button
                  className='courses-page__primary-button'
                  type='button'
                  onClick={() => setIsCreateFormOpen(true)}
                >
                  Створити курс
                </button>
              ) : (
                <button
                  className='courses-page__secondary-button'
                  type='button'
                  onClick={() => setIsCreateFormOpen(false)}
                >
                  Скасувати
                </button>
              )}
            </div>

            {isCreateFormOpen ? (
              <>
                <CourseForm
                  mode='create'
                  submitLabel='Створити курс'
                  isPending={createCourseMutation.isPending}
                  onSubmit={(payload) =>
                    createCourseMutation.mutate(payload, {
                      onSuccess: () => {
                        setIsCreateFormOpen(false)
                      }
                    })
                  }
                />

                {createCourseMutation.isError ? (
                  <p className='courses-page__message courses-page__message--error'>
                    {createCourseMutation.error.message}
                  </p>
                ) : null}

                {createCourseMutation.isSuccess ? (
                  <p className='courses-page__message courses-page__message--success'>
                    Курс успішно створено
                  </p>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

      {isLoading ? <p className='courses-page__message'>Завантаження курсів...</p> : null}
      {isError ? <p className='courses-page__message courses-page__message--error'>{error.message}</p> : null}

      {!isLoading && !isError ? (
        <section className='courses-page__list'>
          {filteredCourses.length ? (
            filteredCourses.map((course) => {
              const isMine = myUserId === course.authorId

              return (
                <article key={course.id} className='courses-page__card'>
                  <div className='courses-page__card-top'>
                    <div>
                      <h3 className='courses-page__card-title'>{course.title}</h3>
                      <p className='courses-page__card-text'>{course.shortDescription}</p>
                    </div>

                    <div className='courses-page__badges'>
                      <span className='courses-page__status'>{course.status}</span>
                      {isMine ? <span className='courses-page__mine-badge'>Мій курс</span> : null}
                    </div>
                  </div>

                  <p className='courses-page__card-text'>Кількість модулів: {course.modules.length}</p>

                  <Link className='courses-page__link' to={`/courses/${course.id}`}>
                    Перейти до курсу
                  </Link>
                </article>
              )
            })
          ) : (
            <p className='courses-page__message'>Курсів за вибраним фільтром немає</p>
          )}
        </section>
      ) : null}
      </div>
    </main>
  )
}