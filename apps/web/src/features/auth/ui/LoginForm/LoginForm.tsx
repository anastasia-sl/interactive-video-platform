import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin.ts'
import './LoginForm.scss'

export const LoginForm = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loginMutation.mutateAsync(form)
    navigate('/me')
  }

  return (
        <form className="login-form" onSubmit={onSubmit}>
            <div className="login-form__header">
                <p className="login-form__eyebrow">Авторизація</p>
                <h2 className="login-form__title">Вхід</h2>
                <p className="login-form__description">
                    Увійдіть до свого облікового запису, щоб продовжити роботу з інтерактивними відеокурсами.
                </p>
            </div>

            <div className="login-form__fields">
                <label className="login-form__field">
                    <span>Email</span>
                    <input
                        placeholder="example@email.com"
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                </label>

                <label className="login-form__field">
                    <span>Пароль</span>
                    <input
                        placeholder="Введіть пароль"
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    />
                </label>
            </div>

            <button className="login-form__submit" type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Вхід...' : 'Увійти'}
            </button>

            {loginMutation.isError ? (
                <p className="login-form__error">{loginMutation.error.message}</p>
            ) : null}
        </form>
    )
}