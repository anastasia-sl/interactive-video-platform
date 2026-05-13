import { Link } from 'react-router-dom'
import { useMe } from '../../features/auth/hooks/useMe'
import './HomePage.scss'

const benefits = [
    {
        title: 'Інтерактивні відеоуроки',
        text: 'Додавайте контрольні питання безпосередньо до відео та керуйте моментами їх появи.'
    },
    {
        title: 'Тестування під час перегляду',
        text: 'Студент відповідає на питання у процесі навчання, а система зберігає результат.'
    },
    {
        title: 'Керування курсами',
        text: 'Створюйте модулі, уроки, відеоматеріали та структуру курсу в одному інтерфейсі.'
    },
    {
        title: 'Сертифікати після проходження',
        text: 'Платформа закладає основу для формування сертифікатів після завершення навчання.'
    },
    {
        title: 'Ролі користувачів',
        text: 'Підтримуються ролі student, teacher та admin з різними правами доступу.'
    },
    {
        title: 'Хмарне зберігання відео',
        text: 'Відеофайли зберігаються у Cloudinary, а в MongoDB зберігаються тільки посилання.'
    }
]

const steps = [
    'Викладач створює курс',
    'Додає відеоуроки',
    'Вставляє питання у потрібні таймкоди',
    'Студент проходить урок і відповідає на питання',
    'Система зберігає результати'
]

export const HomePage = () => {
    const { data } = useMe()
    const role = data?.user.role
    const canCreateCourse = role === 'teacher' || role === 'admin'

    return (
        <div className="home-page">
            <section className="home-page__hero">
                <div className="home-page__hero-content">
                    <p className="home-page__eyebrow">EdTech платформа для відеонавчання</p>

                    <h1 className="home-page__title">
                        Платформа для інтерактивних відеокурсів
                    </h1>

                    <p className="home-page__description">
                        Створюйте відеоуроки з контрольними питаннями, перевіряйте знання студентів та формуйте навчальний прогрес в одному вебзастосунку.
                    </p>

                    <div className="home-page__actions">
                        <Link className="home-page__primary-button" to="/courses">
                            Переглянути курси
                        </Link>

                        {canCreateCourse ? (
                            <Link className="home-page__secondary-button" to="/courses/create">
                                Створити курс
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="home-page__preview" aria-label="Приклад інтерактивного відеоуроку">
                    <div className="home-page__video-card">
                        <div className="home-page__video-top">
                            <span />
                            <span />
                            <span />
                        </div>

                        <div className="home-page__video-screen">
                            <div className="home-page__play-button">▶</div>

                            <div className="home-page__question-card">
                                <p className="home-page__question-label">Питання на 01:25</p>
                                <h3>Що є основною перевагою інтерактивного відео?</h3>
                                <div className="home-page__answer home-page__answer--active">
                                    Активна перевірка знань
                                </div>
                                <div className="home-page__answer">
                                    Пасивний перегляд матеріалу
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-page__section">
                <div className="home-page__section-heading">
                    <p className="home-page__eyebrow">Можливості платформи</p>
                    <h2>Усе необхідне для створення сучасного відеонавчання</h2>
                </div>

                <div className="home-page__benefits">
                    {benefits.map((benefit) => (
                        <article className="home-page__benefit-card" key={benefit.title}>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-page__section home-page__workflow">
                <div className="home-page__section-heading">
                    <p className="home-page__eyebrow">Навчальний сценарій</p>
                    <h2>Як це працює</h2>
                </div>

                <div className="home-page__steps">
                    {steps.map((step, index) => (
                        <article className="home-page__step" key={step}>
                            <span>{index + 1}</span>
                            <p>{step}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-page__cta">
                <div>
                    <p className="home-page__eyebrow">Почніть роботу</p>
                    <h2>Перейдіть до каталогу курсів і протестуйте платформу</h2>
                    <p>
                        Перегляньте доступні курси або створіть власний навчальний матеріал з інтерактивними відеопитаннями.
                    </p>
                </div>

                <Link className="home-page__primary-button" to="/courses">
                    Перейти до курсів
                </Link>
            </section>
        </div>
    )
}