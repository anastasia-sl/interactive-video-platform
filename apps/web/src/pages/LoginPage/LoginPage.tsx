import { LoginForm } from '../../features/auth/ui/LoginForm/LoginForm.tsx'
import './LoginPage.scss'

export const LoginPage = () => {
  return (
      <main className="login-page">
        <div className="login-page__container">
          <section className="login-page__info">
            <p className="login-page__eyebrow">Interactive Video Platform</p>
            <h1 className="login-page__title">Поверніться до навчання</h1>
            <p className="login-page__description">
              Авторизуйтеся, щоб переглядати курси, проходити інтерактивні відеоуроки та працювати з навчальним прогресом.
            </p>
          </section>

          <LoginForm />
        </div>
      </main>
  )
}