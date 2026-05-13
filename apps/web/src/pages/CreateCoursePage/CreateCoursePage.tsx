import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks/useMe'
import { useCreateCourse } from '../../features/courses/hooks/useCreateCourse'
import { CourseForm } from '../../features/courses/ui/CourseForm/CourseForm'
import './CreateCoursePage.scss'

export const CreateCoursePage = () => {
  const navigate = useNavigate()
  const { data: meData } = useMe()
  const createCourseMutation = useCreateCourse()

  const role = meData?.user.role
  const canCreate = role === 'teacher' || role === 'admin'

  if (role && !canCreate) {
    return <Navigate to="/courses" replace />
  }

  return (
    <main className="create-course-page">
      <div className="create-course-page__container">

        <section className="create-course-page__section">
          <div className="create-course-page__section-header">
            <h1 className="create-course-page__title">Створення курсу</h1>
            <Link className="create-course-page__secondary-button" to="/courses">
              Скасувати
            </Link>
          </div>

          <CourseForm
            mode="create"
            submitLabel="Створити курс"
            isPending={createCourseMutation.isPending}
            onSubmit={(payload) =>
              createCourseMutation.mutate(payload, {
                onSuccess: (response) => {
                  navigate(`/courses/${response.course.id}?mode=edit-structure`)
                }
              })
            }
          />

          {createCourseMutation.isError ? (
            <p className="create-course-page__message create-course-page__message--error">
              {createCourseMutation.error.message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  )
}