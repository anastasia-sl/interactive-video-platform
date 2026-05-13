import { RegisterForm } from '../../features/auth/ui/RegisterForm/RegisterForm.tsx'
import './RegisterPage.scss'

export const RegisterPage = () => {
  return (
      <main className="register-page">
        <div className="register-page__container">
          <section className="register-page__info">
            <p className="register-page__eyebrow">Interactive Video Platform</p>
            <h1 className="register-page__title">Створіть профіль для навчання або викладання</h1>
            <p className="register-page__description">
              Зареєструйтеся, щоб працювати з курсами, інтерактивними відеоуроками, тестуванням і навчальним прогресом.
            </p>

            <div className="register-page__features">
              <div className="register-page__feature">Ролі student, teacher, admin</div>
              <div className="register-page__feature">Інтерактивні питання у відео</div>
              <div className="register-page__feature">Керування курсами та уроками</div>
            </div>
          </section>

          <RegisterForm />
        </div>
      </main>
  )
}