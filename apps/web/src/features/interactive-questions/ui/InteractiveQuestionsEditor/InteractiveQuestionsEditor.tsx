import { useMemo, useRef, useState } from 'react'
import type {
    CreateQuestionDto,
    TeacherQuestionDto,
    UpdateQuestionDto
} from '@interactive-video-platform/shared'
import {
    useCreateInteractiveQuestion,
    useDeleteInteractiveQuestion,
    useReorderInteractiveQuestions,
    useTeacherQuestions,
    useUpdateInteractiveQuestion
} from '../../hooks/useInteractiveQuestions'
import { InteractiveQuestionForm } from '../InteractiveQuestionForm/InteractiveQuestionForm'
import { InteractiveQuestionList } from '../InteractiveQuestionList/InteractiveQuestionList'
import './InteractiveQuestionsEditor.scss'

type InteractiveQuestionsEditorProps = {
    lessonId: string
    videoUrl: string
    durationSeconds?: number
}

const sortQuestions = (questions: TeacherQuestionDto[]) => {
    return [...questions].sort((first, second) => {
        if (first.timecodeSec !== second.timecodeSec) {
            return first.timecodeSec - second.timecodeSec
        }

        return first.order - second.order
    })
}

export const InteractiveQuestionsEditor = ({
                                               lessonId,
                                               videoUrl,
                                               durationSeconds
                                           }: InteractiveQuestionsEditorProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<TeacherQuestionDto | null>(null)

    const questionsQuery = useTeacherQuestions(lessonId)
    const createQuestionMutation = useCreateInteractiveQuestion(lessonId)
    const updateQuestionMutation = useUpdateInteractiveQuestion(lessonId)
    const deleteQuestionMutation = useDeleteInteractiveQuestion(lessonId)
    const reorderQuestionsMutation = useReorderInteractiveQuestions(lessonId)

    const questions = useMemo(
        () => sortQuestions(questionsQuery.data ?? []),
        [questionsQuery.data]
    )

    const [currentVideoTimeSec, setCurrentVideoTimeSec] = useState(0)

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingQuestion(null)
    }

    const openCreateForm = () => {
        syncCurrentVideoTime()
        setEditingQuestion(null)
        setIsFormOpen(true)
    }

    const openEditForm = (question: TeacherQuestionDto) => {
        syncCurrentVideoTime()
        setEditingQuestion(question)
        setIsFormOpen(true)
    }

    const syncCurrentVideoTime = () => {
        setCurrentVideoTimeSec(videoRef.current?.currentTime ?? 0)
    }

    const submitQuestion = (payload: CreateQuestionDto | UpdateQuestionDto) => {
        if (editingQuestion) {
            updateQuestionMutation.mutate(
                {
                    questionId: editingQuestion.id,
                    payload
                },
                {
                    onSuccess: closeForm
                }
            )

            return
        }

        createQuestionMutation.mutate(payload as CreateQuestionDto, {
            onSuccess: closeForm
        })
    }

    const deleteQuestion = (questionId: string) => {
        const shouldDelete = window.confirm('Видалити це інтерактивне питання?')

        if (!shouldDelete) {
            return
        }

        deleteQuestionMutation.mutate(questionId)
    }

    const reorderQuestions = (orderedQuestions: TeacherQuestionDto[]) => {
        reorderQuestionsMutation.mutate({
            lessonId,
            items: orderedQuestions.map((question, index) => ({
                id: question.id,
                order: index
            }))
        })
    }

    const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
        const currentIndex = questions.findIndex((question) => question.id === questionId)

        if (currentIndex === -1) {
            return
        }

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= questions.length) {
            return
        }

        const reorderedQuestions = [...questions]
        const currentQuestion = reorderedQuestions[currentIndex]
        const targetQuestion = reorderedQuestions[targetIndex]

        reorderedQuestions[currentIndex] = targetQuestion
        reorderedQuestions[targetIndex] = currentQuestion

        reorderQuestions(reorderedQuestions)
    }

    return (
        <section>
            <h3>Інтерактивні питання до відеоуроку</h3>

            <video
                ref={videoRef}
                src={videoUrl}
                controls
                width="100%"
                onTimeUpdate={syncCurrentVideoTime}
                onPause={syncCurrentVideoTime}
                onSeeking={syncCurrentVideoTime}
            />
            <div>
                <button type="button" onClick={openCreateForm}>
                    Додати питання
                </button>
            </div>

            {questionsQuery.isLoading && <p>Завантаження інтерактивних питань...</p>}

            {questionsQuery.isError && (
                <p>
                    Не вдалося завантажити інтерактивні питання:
                    {' '}
                    {questionsQuery.error instanceof Error ? questionsQuery.error.message : 'невідома помилка'}
                </p>
            )}

            {!questionsQuery.isLoading && !questionsQuery.isError && (
                <InteractiveQuestionList
                    questions={questions}
                    isDeleting={deleteQuestionMutation.isPending}
                    isReordering={reorderQuestionsMutation.isPending}
                    onEdit={openEditForm}
                    onDelete={deleteQuestion}
                    onMoveUp={(questionId) => moveQuestion(questionId, 'up')}
                    onMoveDown={(questionId) => moveQuestion(questionId, 'down')}
                />
            )}

            {isFormOpen && (
                <InteractiveQuestionForm
                    lessonId={lessonId}
                    durationSeconds={durationSeconds}
                    initialQuestion={editingQuestion}
                    currentVideoTimeSec={currentVideoTimeSec}
                    isSubmitting={
                        createQuestionMutation.isPending || updateQuestionMutation.isPending
                    }
                    onSubmit={submitQuestion}
                    onCancel={closeForm}
                />
            )}
        </section>
    )
}