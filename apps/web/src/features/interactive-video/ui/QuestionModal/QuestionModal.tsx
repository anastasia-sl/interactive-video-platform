import type { StudentQuestionDto } from '@interactive-video-platform/shared'
import './QuestionModal.scss'

type AnswerStatus = 'idle' | 'correct' | 'incorrect'

type QuestionModalProps = {
    question: StudentQuestionDto
    selectedOptionIds: string[]
    status: AnswerStatus
    isSubmitting: boolean
    errorMessage?: string
    onToggleOption: (optionId: string) => void
    onSubmit: () => void
    onContinue: () => void
}

export const QuestionModal = ({
                                  question,
                                  selectedOptionIds,
                                  status,
                                  isSubmitting,
                                  errorMessage,
                                  onToggleOption,
                                  onSubmit,
                                  onContinue
                              }: QuestionModalProps) => {
    const isAnswerDisabled =
        question.isRequired && selectedOptionIds.length === 0

    return (
        <div className="question-modal" role="dialog" aria-modal="true">
            <div className="question-modal__card">
                <div className="question-modal__header">
                    <p className="question-modal__label">
                        Інтерактивне питання
                    </p>
                    <p className="question-modal__points">
                        {question.points} балів
                    </p>
                </div>

                <h3 className="question-modal__title">{question.prompt}</h3>

                {question.description ? (
                    <p className="question-modal__description">{question.description}</p>
                ) : null}

                <div className="question-modal__options">
                    {question.options.map((option) => (
                        <label className="question-modal__option" key={option.id}>
                            <input
                                type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                                name={`question-${question.id}`}
                                checked={selectedOptionIds.includes(option.id)}
                                onChange={() => onToggleOption(option.id)}
                                disabled={status === 'correct' || isSubmitting}
                            />
                            <span>{option.text}</span>
                        </label>
                    ))}
                </div>

                {status === 'correct' ? (
                    <p className="question-modal__success">
                        Відповідь правильна. Результат збережено.
                    </p>
                ) : null}

                {status === 'incorrect' ? (
                    <p className="question-modal__error">
                        Відповідь неправильна. Спробуйте ще раз.
                    </p>
                ) : null}

                {errorMessage ? (
                    <p className="question-modal__error">{errorMessage}</p>
                ) : null}

                <div className="question-modal__actions">
                    {status === 'correct' ? (
                        <button
                            className="question-modal__button"
                            type="button"
                            onClick={onContinue}
                        >
                            Продовжити
                        </button>
                    ) : (
                        <button
                            className="question-modal__button"
                            type="button"
                            onClick={onSubmit}
                            disabled={isAnswerDisabled || isSubmitting}
                        >
                            {isSubmitting ? 'Перевірка...' : 'Відповісти'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}