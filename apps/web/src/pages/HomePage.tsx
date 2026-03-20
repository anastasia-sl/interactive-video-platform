import { Link } from 'react-router-dom'

export const HomePage = () => {
  return (
    <div>
      <h1>Interactive Video Platform</h1>
      <nav>
        <Link to="/register">Реєстрація</Link>
        <span> | </span>
        <Link to="/login">Вхід</Link>
        <span> | </span>
        <Link to="/me">Мій профіль</Link>
      </nav>
    </div>
  )
}