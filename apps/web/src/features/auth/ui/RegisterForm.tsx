import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'
import type { UserRole } from '../../../shared/types/auth'

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
    <form onSubmit={onSubmit}>
      <h2>Реєстрація</h2>
      <input
        placeholder="ПІБ"
        value={form.fullName}
        onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
      />
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
      />
      <input
        placeholder="Пароль"
        type="password"
        value={form.password}
        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
      />
      <select
        value={form.role}
        onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
      >
        <option value="student">student</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
      </select>
      <button type="submit" disabled={registerMutation.isPending}>
        Зареєструватися
      </button>
      {registerMutation.isError ? <p>{registerMutation.error.message}</p> : null}
    </form>
  )
}