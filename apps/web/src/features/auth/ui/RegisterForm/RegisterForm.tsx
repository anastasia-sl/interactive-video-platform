import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegister } from '../../hooks/useRegister.ts'
import type { UserRole } from '../../../../shared/types/auth.ts'
import './RegisterForm.scss'

export const RegisterForm = () => {
    const navigate = useNavigate()
    const registerMutation = useRegister()

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'student' as UserRole
    })

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await registerMutation.mutateAsync(form)
        navigate('/me')
    }

    return (
        <form className="register-form" onSubmit={onSubmit}>
            <div className="register-form__header">
                <p className="register-form__eyebrow">Створення облікового запису</p>
                <h2 className="register-form__title">Реєстрація</h2>
                <p className="register-form__description">
                    Заповніть дані, щоб отримати доступ до платформи інтерактивних відеокурсів.
                </p>
            </div>

            <div className="register-form__fields">
                <label className="register-form__field">
                    <span>ПІБ</span>
                    <input
                        placeholder="Введіть повне ім’я"
                        value={form.fullName}
                        onChange={(event) => setForm((prev) => ({...prev, fullName: event.target.value}))}
                    />
                </label>

                <label className="register-form__field">
                    <span>Email</span>
                    <input
                        placeholder="example@email.com"
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((prev) => ({...prev, email: event.target.value}))}
                    />
                </label>

                <label className="register-form__field">
                    <span>Пароль</span>
                    <input
                        placeholder="Створіть пароль"
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((prev) => ({...prev, password: event.target.value}))}
                    />
                </label>

                <label className="register-form__field">
                    <span>Роль</span>
                    <select
                        value={form.role}
                        onChange={(event) => setForm((prev) => ({...prev, role: event.target.value as UserRole}))}
                    >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                    </select>
                </label>
            </div>

            <button className="register-form__submit" type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Створення акаунта...' : 'Зареєструватися'}
            </button>

            {registerMutation.isError ? (
                <p className="register-form__error">{registerMutation.error.message}</p>
            ) : null}
        </form>
    )
}