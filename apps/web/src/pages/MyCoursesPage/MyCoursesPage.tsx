import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks/useMe'
import { useCourses } from '../../features/courses/hooks/useCourses'
import './MyCoursesPage.scss'
import {AppNavigation} from "../../shared/ui/AppNavigation/AppNavigation.tsx";

type StatusFilter = 'all' | 'published' | 'draft'

export const MyCoursesPage = () => {
  const { data: meData } = useMe()
  const { data, isLoading, isError, error } = useCourses()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const role = meData?.user.role
  const myUserId = meData?.user.id
  const canManage = role === 'teacher' || role === 'admin'

  const myCourses = useMemo(() => {
    const courses = (data?.courses ?? []).filter((course) => course.authorId === myUserId)

    if (statusFilter === 'all') {
      return courses
    }

    return courses.filter((course) => course.status === statusFilter)
  }, [data?.courses, myUserId, statusFilter])

  return (
    <main className='my-courses-page'>
      <div className='my-courses-page__container'>
        <div className='my-courses-page__header'>
          <h1 className='my-courses-page__title'>Мої курси</h1>

          <div className='my-courses-page__top-row'>
            <AppNavigation
              role={role}
              showMyCourses
              showCreate
              className='my-courses-page__nav'
            />

            <div className='my-courses-page__filter'>
              <label htmlFor='my-course-status-filter'>Фільтр</label>
              <select
                id='my-course-status-filter'
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

        {!canManage ? (
          <p className='my-courses-page__message my-courses-page__message--error'>
            Ця сторінка доступна лише викладачу або адміністратору
          </p>
        ) : null}

        {isLoading ? <p className='my-courses-page__message'>Завантаження курсів...</p> : null}
        {isError ? (
          <p className='my-courses-page__message my-courses-page__message--error'>{error.message}</p>
        ) : null}

        {canManage && !isLoading && !isError ? (
          <section className='my-courses-page__list'>
            {myCourses.length ? (
              myCourses.map((course) => (
                <article key={course.id} className='my-courses-page__card'>
                  <div className='my-courses-page__card-top'>
                    <div>
                      <h3 className='my-courses-page__card-title'>{course.title}</h3>
                      <p className='my-courses-page__card-text'>{course.shortDescription}</p>
                    </div>

                    <div className='my-courses-page__badges'>
                      <span className='my-courses-page__status'>{course.status}</span>
                      <span className='my-courses-page__mine-badge'>Мій курс</span>
                    </div>
                  </div>

                  <p className='my-courses-page__card-text'>
                    Кількість модулів: {course.modules.length}
                  </p>

                  <Link className='my-courses-page__link' to={`/courses/${course.id}`}>
                    Відкрити курс
                  </Link>
                </article>
              ))
            ) : (
              <p className='my-courses-page__message'>У вас ще немає курсів за вибраним фільтром</p>
            )}
          </section>
        ) : null}
      </div>
    </main>
  )
}