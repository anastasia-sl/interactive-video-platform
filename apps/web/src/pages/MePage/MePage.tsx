import { authStorage } from '../../shared/lib/auth-storage.ts'
import { Link } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks/useMe.ts'
import './MePage.scss'

export const MePage = () => {
    const { data, isLoading, isError, error, /*refetch*/ } = useMe()

    if (isLoading) {
        return (
            <main className="me-page">
                <div className="me-page__container">
                    <p className="me-page__message">Завантаження профілю...</p>
                </div>
            </main>
        )
    }

    if (isError) {
        return (
            <main className="me-page">
                <div className="me-page__container">
                    <p className="me-page__message me-page__message--error">{error.message}</p>
                </div>
            </main>
        )
    }

    if (!data) {
        return (
            <main className="me-page">
                <div className="me-page__container">
                    <p className="me-page__message">Користувача не знайдено</p>
                </div>
            </main>
        )
    }

    const initials = data.user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <main className="me-page">
            <div className="me-page__container">
                <section className="me-page__hero">
                    <div className="me-page__avatar">
                        {initials || 'U'}
                    </div>

                    <div className="me-page__hero-content">
                        <p className="me-page__eyebrow">Особистий кабінет</p>
                        <h1 className="me-page__title">Мій профіль</h1>
                        <p className="me-page__description">
                            Тут зібрано основну інформацію про ваш обліковий запис та роль у системі інтерактивних відеокурсів.
                        </p>
                    </div>

                    <div className="me-page__role-card">
                        <span className="me-page__role-label">Роль</span>
                        <strong>{data.user.role}</strong>
                    </div>
                </section>

                <section className="me-page__content">
                    <article className="me-page__card">
                        <div className="me-page__card-header">
                            <div>
                                <p className="me-page__eyebrow">Дані користувача</p>
                                <h2 className="me-page__subtitle">Обліковий запис</h2>
                            </div>

                            {/*<button*/}
                            {/*    className="me-page__secondary-button"*/}
                            {/*    type="button"*/}
                            {/*    onClick={() => void refetch()}*/}
                            {/*>*/}
                            {/*    Оновити*/}
                            {/*</button>*/}
                        </div>

                        <div className="me-page__info-grid">
                            <div className="me-page__info-item">
                                <span>ID користувача</span>
                                <strong>{data.user.id}</strong>
                            </div>

                            <div className="me-page__info-item">
                                <span>ПІБ</span>
                                <strong>{data.user.fullName}</strong>
                            </div>

                            <div className="me-page__info-item">
                                <span>Email</span>
                                <strong>{data.user.email}</strong>
                            </div>

                            <div className="me-page__info-item">
                                <span>Роль у системі</span>
                                <strong>{data.user.role}</strong>
                            </div>
                        </div>
                    </article>

                    <aside className="me-page__side-card">
                        <p className="me-page__eyebrow">Швидкі дії</p>
                        <h2 className="me-page__subtitle">Навігація</h2>

                        <div className="me-page__actions">
                            <Link className="me-page__primary-link" to="/courses">
                                Перейти до курсів
                            </Link>

                            <Link className="me-page__secondary-link" to="/">
                                На головну
                            </Link>

                            <button
                                className="me-page__logout-button"
                                type="button"
                                onClick={() => {
                                    authStorage.clearToken()
                                    window.location.href = '/login'
                                }}
                            >
                                Вийти
                            </button>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    )
}