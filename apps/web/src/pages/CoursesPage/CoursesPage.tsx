import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import { useCourses } from '../../features/courses/hooks/useCourses.ts'
import './CoursesPage.scss'

type StatusFilter = 'all' | 'published' | 'draft'

export const CoursesPage = () => {
  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourses()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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
          {canCreate ? <Link to="/courses/create">Створити курс</Link> : null}
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