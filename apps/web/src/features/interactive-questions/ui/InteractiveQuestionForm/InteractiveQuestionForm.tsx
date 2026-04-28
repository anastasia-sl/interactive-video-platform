import { useMemo, useState } from 'react'
import type {
    CreateQuestionDto,
    InteractiveQuestionType,
    QuestionOptionDto,
    TeacherQuestionDto,
    UpdateQuestionDto
} from '@interactive-video-platform/shared'

type InteractiveQuestionFormValues = {
    timecodeSec: number
    order: number
    type: InteractiveQuestionType
    prompt: string
    description: string
    options: QuestionOptionDto[]
    correctOptionIds: string[]
    points: number
    isRequired: boolean
    explanation: string
}

type InteractiveQuestionFormProps = {
    lessonId: string
    durationSeconds?: number
    initialQuestion?: TeacherQuestionDto | null
    currentVideoTimeSec?: number
    isSubmitting: boolean
    onSubmit: (payload: CreateQuestionDto | UpdateQuestionDto) => void
    onCancel?: () => void
}

const createOptionId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
    }

    return `option-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const createEmptyOption = (order: number): QuestionOptionDto => ({
    id: createOptionId(),
    text: '',
    order
})

const createInitialValues = (
    initialQuestion?: TeacherQuestionDto | null
): InteractiveQuestionFormValues => {
    if (initialQuestion) {
        return {
            timecodeSec: initialQuestion.timecodeSec,
            order: initialQuestion.order,
            type: initialQuestion.type,
            prompt: initialQuestion.prompt,
            description: initialQuestion.description ?? '',
            options: initialQuestion.options,
            correctOptionIds: initialQuestion.correctOptionIds,
            points: initialQuestion.points,
            isRequired: initialQuestion.isRequired,
            explanation: initialQuestion.explanation ?? ''
        }
    }

    return {
        timecodeSec: 0,
        order: 1,
        type: 'single_choice',
        prompt: '',
        description: '',
        options: [createEmptyOption(1), createEmptyOption(2)],
        correctOptionIds: [],
        points: 1,
        isRequired: true,
        explanation: ''
    }
}

const validateForm = (
    values: InteractiveQuestionFormValues,
    durationSeconds?: number
) => {
    const errors: string[] = []
    const optionIds = values.options.map((option) => option.id)
    const uniqueOptionIds = new Set(optionIds)

    if (!values.prompt.trim()) {
        errors.push('Введіть текст питання.')
    }

    if (values.timecodeSec < 0) {
        errors.push('Таймкод не може бути меншим за 0.')
    }

    if (typeof durationSeconds === 'number' && values.timecodeSec > durationSeconds) {
        errors.push('Таймкод не може перевищувати тривалість відео.')
    }

    if (values.options.length < 2) {
        errors.push('Потрібно додати щонайменше два варіанти відповіді.')
    }

    if (values.options.some((option) => !option.text.trim())) {
        errors.push('Текст кожного варіанта відповіді має бути заповнений.')
    }

    if (uniqueOptionIds.size !== optionIds.length) {
        errors.push('Ідентифікатори варіантів відповіді мають бути унікальними.')
    }

    if (values.type === 'single_choice' && values.correctOptionIds.length !== 1) {
        errors.push('Для питання з однією правильною відповіддю потрібно вибрати рівно один правильний варіант.')
    }

    if (values.type === 'multiple_choice' && values.correctOptionIds.length < 1) {
        errors.push('Для питання з кількома правильними відповідями потрібно вибрати хоча б один правильний варіант.')
    }

    if (values.points < 1) {
        errors.push('Кількість балів має бути не меншою за 1.')
    }

    if (values.order < 1) {
        errors.push('Порядковий номер має бути не меншим за 1.')
    }

    return errors
}

export const InteractiveQuestionForm = ({
                                            lessonId,
                                            durationSeconds,
                                            initialQuestion,
                                            currentVideoTimeSec,
                                            isSubmitting,
                                            onSubmit,
                                            onCancel
                                        }: InteractiveQuestionFormProps) => {
    const [values, setValues] = useState<InteractiveQuestionFormValues>(() =>
        createInitialValues(initialQuestion)
    )

    const validationErrors = useMemo(
        () => validateForm(values, durationSeconds),
        [values, durationSeconds]
    )

    const updateOptionText = (optionId: string, text: string) => {
        setValues((current) => ({
            ...current,
            options: current.options.map((option) =>
                option.id === optionId ? { ...option, text } : option
            )
        }))
    }

    const addOption = () => {
        setValues((current) => ({
            ...current,
            options: [...current.options, createEmptyOption(current.options.length + 1)]
        }))
    }

    const removeOption = (optionId: string) => {
        setValues((current) => ({
            ...current,
            options: current.options
                .filter((option) => option.id !== optionId)
                .map((option, index) => ({ ...option, order: index + 1 })),
            correctOptionIds: current.correctOptionIds.filter((id) => id !== optionId)
        }))
    }

    const toggleCorrectOption = (optionId: string) => {
        setValues((current) => {
            if (current.type === 'single_choice') {
                return {
                    ...current,
                    correctOptionIds: [optionId]
                }
            }

            const isSelected = current.correctOptionIds.includes(optionId)

            return {
                ...current,
                correctOptionIds: isSelected
                    ? current.correctOptionIds.filter((id) => id !== optionId)
                    : [...current.correctOptionIds, optionId]
            }
        })
    }

    const changeType = (type: InteractiveQuestionType) => {
        setValues((current) => ({
            ...current,
            type,
            correctOptionIds:
                type === 'single_choice'
                    ? current.correctOptionIds.slice(0, 1)
                    : current.correctOptionIds
        }))
    }

    const useCurrentVideoTime = () => {
        if (typeof currentVideoTimeSec !== 'number') {
            return
        }

        setValues((current) => ({
            ...current,
            timecodeSec: Math.floor(currentVideoTimeSec)
        }))
    }

    const submitForm = () => {
        const errors = validateForm(values, durationSeconds)

        if (errors.length > 0) {
            return
        }

        const payload = {
            lessonId,
            timecodeSec: values.timecodeSec,
            order: values.order,
            type: values.type,
            prompt: values.prompt.trim(),
            description: values.description.trim() || undefined,
            options: values.options.map((option, index) => ({
                id: option.id,
                text: option.text.trim(),
                order: index + 1
            })),
            correctOptionIds: values.correctOptionIds,
            points: values.points,
            isRequired: values.isRequired,
            explanation: values.explanation.trim() || undefined
        }

        onSubmit(payload)
    }

    return (
        <section className="interactive-question-form">
            <h4>{initialQuestion ? 'Редагування питання' : 'Нове інтерактивне питання'}</h4>

            <label>
                Тип питання
                <select
                    value={values.type}
                    onChange={(event) => changeType(event.target.value as InteractiveQuestionType)}
                >
                    <option value="single_choice">Одна правильна відповідь</option>
                    <option value="multiple_choice">Кілька правильних відповідей</option>
                </select>
            </label>

            <label>
                Таймкод, сек
                <input
                    type="number"
                    min={0}
                    max={durationSeconds}
                    value={values.timecodeSec}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            timecodeSec: Number(event.target.value)
                        }))
                    }
                />
            </label>

            <button type="button" onClick={useCurrentVideoTime}>
                Використати поточний час відео
            </button>

            <label>
                Порядок
                <input
                    type="number"
                    min={1}
                    value={values.order}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            order: Number(event.target.value)
                        }))
                    }
                />
            </label>

            <label>
                Текст питання
                <textarea
                    value={values.prompt}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            prompt: event.target.value
                        }))
                    }
                />
            </label>

            <label>
                Опис
                <textarea
                    value={values.description}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            description: event.target.value
                        }))
                    }
                />
            </label>

            <div>
                <strong>Варіанти відповіді</strong>

                {values.options.map((option) => (
                    <div key={option.id}>
                        <input
                            type={values.type === 'single_choice' ? 'radio' : 'checkbox'}
                            checked={values.correctOptionIds.includes(option.id)}
                            onChange={() => toggleCorrectOption(option.id)}
                            name="correctOptionIds"
                        />

                        <input
                            value={option.text}
                            onChange={(event) => updateOptionText(option.id, event.target.value)}
                            placeholder={`Варіант ${option.order}`}
                        />

                        <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            disabled={values.options.length <= 2}
                        >
                            Видалити
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addOption}>
                    Додати варіант
                </button>
            </div>

            <label>
                Бали
                <input
                    type="number"
                    min={1}
                    value={values.points}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            points: Number(event.target.value)
                        }))
                    }
                />
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={values.isRequired}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            isRequired: event.target.checked
                        }))
                    }
                />
                Обов’язкове питання
            </label>

            <label>
                Пояснення після відповіді
                <textarea
                    value={values.explanation}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            explanation: event.target.value
                        }))
                    }
                />
            </label>

            {validationErrors.length > 0 && (
                <div>
                    {validationErrors.map((error) => (
                        <p key={error}>{error}</p>
                    ))}
                </div>
            )}

            <div>
                <button
                    type="button"
                    onClick={submitForm}
                    disabled={isSubmitting || validationErrors.length > 0}
                >
                    {isSubmitting ? 'Збереження...' : 'Зберегти питання'}
                </button>

                {onCancel && (
                    <button type="button" onClick={onCancel}>
                        Скасувати
                    </button>
                )}
            </div>
        </section>
    )
}