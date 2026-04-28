import { useMemo, useRef, useState } from 'react'
import type { StudentQuestionDto } from '@interactive-video-platform/shared'
import { useStudentQuestions } from '../../../interactive-questions/hooks/useInteractiveQuestions'
import { useSubmitQuestionAnswer } from '../../hooks/useSubmitQuestionAnswer'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import './InteractiveVideoPlayer.scss'

type InteractiveVideoPlayerProps = {
    lessonId: string
    videoUrl: string
}

type AnswerStatus = 'idle' | 'correct' | 'incorrect'

const sortQuestions = (questions: StudentQuestionDto[]) => {
    return questions.slice().sort((first, second) => {
        if (first.timecodeSec !== second.timecodeSec) {
            return first.timecodeSec - second.timecodeSec
        }

        return first.order - second.order
    })
}

const findQuestionsAtCurrentTime = (
    questions: StudentQuestionDto[],
    answeredQuestionIds: string[],
    currentTime: number
) => {
    return questions.filter((question) => {
        const isAnswered = answeredQuestionIds.includes(question.id)
        return !isAnswered && Math.floor(currentTime) >= question.timecodeSec
    })
}

export const InteractiveVideoPlayer = ({
                                           lessonId,
                                           videoUrl
                                       }: InteractiveVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [activeQuestion, setActiveQuestion] = useState<StudentQuestionDto | null>(null)
    const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([])
    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
    const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const questionsQuery = useStudentQuestions(lessonId)
    const submitAnswerMutation = useSubmitQuestionAnswer()

    const questions = useMemo(() => {
        return sortQuestions(questionsQuery.data ?? [])
    }, [questionsQuery.data])

    const activateQuestion = (question: StudentQuestionDto) => {
        videoRef.current?.pause()
        setActiveQuestion(question)
        setSelectedOptionIds([])
        setAnswerStatus('idle')
        setErrorMessage('')
    }

    const handleTimeUpdate = () => {
        const video = videoRef.current

        if (!video || activeQuestion || questions.length === 0) {
            return
        }

        const nextQuestions = findQuestionsAtCurrentTime(
            questions,
            answeredQuestionIds,
            video.currentTime
        )

        if (nextQuestions.length === 0) {
            return
        }

        activateQuestion(nextQuestions[0])
    }

    const toggleOption = (optionId: string) => {
        if (!activeQuestion || answerStatus === 'correct') {
            return
        }

        if (activeQuestion.type === 'single_choice') {
            setSelectedOptionIds([optionId])
            return
        }

        setSelectedOptionIds((current) =>
            current.includes(optionId)
                ? current.filter((id) => id !== optionId)
                : [...current, optionId]
        )
    }

    const submitAnswer = () => {
        const video = videoRef.current

        if (!activeQuestion || !video) {
            return
        }

        if (activeQuestion.isRequired && selectedOptionIds.length === 0) {
            setErrorMessage('Оберіть відповідь перед продовженням.')
            return
        }

        submitAnswerMutation.mutate(
            {
                lessonId,
                questionId: activeQuestion.id,
                selectedOptionIds,
                answeredAtPlaybackSec: Math.floor(video.currentTime)
            },
            {
                onSuccess: (response) => {
                    if (response.questionAttempt.isCorrect) {
                        setAnswerStatus('correct')
                        setErrorMessage('')
                        return
                    }

                    setAnswerStatus('incorrect')
                    setErrorMessage('')
                },
                onError: (error) => {
                    setAnswerStatus('idle')
                    setErrorMessage(error instanceof Error ? error.message : 'Не вдалося зберегти відповідь.')
                }
            }
        )
    }

    const continueVideo = () => {
        if (!activeQuestion) {
            return
        }

        const answeredId = activeQuestion.id

        setAnsweredQuestionIds((current) =>
            current.includes(answeredId) ? current : [...current, answeredId]
        )

        const remainingQuestionsAtSameTime = questions.filter((question) => {
            return (
                question.id !== answeredId &&
                !answeredQuestionIds.includes(question.id) &&
                question.timecodeSec === activeQuestion.timecodeSec
            )
        })

        if (remainingQuestionsAtSameTime.length > 0) {
            setActiveQuestion(remainingQuestionsAtSameTime[0])
            setSelectedOptionIds([])
            setAnswerStatus('idle')
            setErrorMessage('')
            return
        }

        setActiveQuestion(null)
        setSelectedOptionIds([])
        setAnswerStatus('idle')
        setErrorMessage('')

        window.setTimeout(() => {
            videoRef.current?.play()
        }, 100)
    }

    return (
        <div className="interactive-video-player">
            <video
                ref={videoRef}
                className="interactive-video-player__video"
                src={videoUrl}
                controls={!activeQuestion}
                onTimeUpdate={handleTimeUpdate}
            />

            {questionsQuery.isLoading ? (
                <p className="interactive-video-player__message">
                    Завантаження інтерактивних питань...
                </p>
            ) : null}

            {questionsQuery.isError ? (
                <p className="interactive-video-player__message interactive-video-player__message--error">
                    Не вдалося завантажити інтерактивні питання. Відео доступне без інтерактивного режиму.
                </p>
            ) : null}

            {activeQuestion ? (
                <QuestionModal
                    question={activeQuestion}
                    selectedOptionIds={selectedOptionIds}
                    status={answerStatus}
                    isSubmitting={submitAnswerMutation.isPending}
                    errorMessage={errorMessage}
                    onToggleOption={toggleOption}
                    onSubmit={submitAnswer}
                    onContinue={continueVideo}
                />
            ) : null}
        </div>
    )
}