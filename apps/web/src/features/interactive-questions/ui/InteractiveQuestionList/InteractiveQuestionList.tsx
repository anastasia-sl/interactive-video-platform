import type { TeacherQuestionDto } from '@interactive-video-platform/shared'

type InteractiveQuestionListProps = {
    questions: TeacherQuestionDto[]
    isDeleting: boolean
    isReordering: boolean
    onEdit: (question: TeacherQuestionDto) => void
    onDelete: (questionId: string) => void
    onMoveUp: (questionId: string) => void
    onMoveDown: (questionId: string) => void
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const restSeconds = Math.floor(seconds % 60)

    return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

const getTypeLabel = (type: TeacherQuestionDto['type']) => {
    return type === 'single_choice'
        ? 'Одна правильна відповідь'
        : 'Кілька правильних відповідей'
}

export const InteractiveQuestionList = ({
                                            questions,
                                            isDeleting,
                                            isReordering,
                                            onEdit,
                                            onDelete,
                                            onMoveUp,
                                            onMoveDown
                                        }: InteractiveQuestionListProps) => {
    if (questions.length === 0) {
        return <p>Поки що для цього відеоуроку не створено інтерактивних питань.</p>
    }

    return (
        <section>
            <h4>Список інтерактивних питань</h4>

            {questions.map((question, index) => {
                const correctOptions = question.options.filter((option) =>
                    question.correctOptionIds.includes(option.id)
                )

                return (
                    <article key={question.id}>
                        <header>
                            <strong>{formatTime(question.timecodeSec)}</strong>
                            <span>{getTypeLabel(question.type)}</span>
                        </header>

                        <p>{question.prompt}</p>

                        {question.description && <p>{question.description}</p>}

                        <p>Варіантів відповіді: {question.options.length}</p>

                        <div>
                            <strong>Правильні відповіді:</strong>
                            {correctOptions.length > 0 ? (
                                <ul>
                                    {correctOptions.map((option) => (
                                        <li key={option.id}>{option.text}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Не визначено</p>
                            )}
                        </div>

                        <p>Бали: {question.points}</p>
                        <p>{question.isRequired ? 'Обов’язкове питання' : 'Необов’язкове питання'}</p>

                        {question.explanation && (
                            <p>Пояснення: {question.explanation}</p>
                        )}

                        <div>
                            <button
                                type="button"
                                onClick={() => onMoveUp(question.id)}
                                disabled={index === 0 || isReordering}
                            >
                                Вище
                            </button>

                            <button
                                type="button"
                                onClick={() => onMoveDown(question.id)}
                                disabled={index === questions.length - 1 || isReordering}
                            >
                                Нижче
                            </button>

                            <button type="button" onClick={() => onEdit(question)}>
                                Редагувати
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(question.id)}
                                disabled={isDeleting}
                            >
                                Видалити
                            </button>
                        </div>
                    </article>
                )
            })}
        </section>
    )
}