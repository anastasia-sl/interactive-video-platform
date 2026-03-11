import { authStorage } from '../shared/lib/auth-storage'
import { useMe } from '../features/auth/hooks/useMe'

export const MePage = () => {
  const { data, isLoading, isError, error, refetch } = useMe()

  if (isLoading) {
    return <p>Завантаження...</p>
  }

  if (isError) {
    return <p>{error.message}</p>
  }

  if (!data) {
    return <p>Користувача не знайдено</p>
  }

  return (
    <div>
      <h2>Мій профіль</h2>
      <p>ID: {data.user.id}</p>
      <p>ПІБ: {data.user.fullName}</p>
      <p>Email: {data.user.email}</p>
      <p>Role: {data.user.role}</p>
      <button onClick={() => void refetch()}>Оновити</button>
      <button
        onClick={() => {
          authStorage.clearToken()
          window.location.href = '/login'
        }}
      >
        Вийти
      </button>
    </div>
  )
}