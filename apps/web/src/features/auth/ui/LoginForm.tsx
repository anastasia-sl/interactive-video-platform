import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'

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
    <form onSubmit={onSubmit}>
      <h2>Вхід</h2>
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
      <button type="submit" disabled={loginMutation.isPending}>
        Увійти
      </button>
      {loginMutation.isError ? <p>{loginMutation.error.message}</p> : null}
    </form>
  )
}