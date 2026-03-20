import { Link } from 'react-router-dom'

export const HomePage = () => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Interactive Video Platform</h1>
      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/register">Реєстрація</Link>
        <span> | </span>
        <Link to="/login">Вхід</Link>
        <span> | </span>
        <Link to="/me">Мій профіль</Link>
        <Link to='/courses'>Курси</Link>
      </nav>
    </div>
  )
}