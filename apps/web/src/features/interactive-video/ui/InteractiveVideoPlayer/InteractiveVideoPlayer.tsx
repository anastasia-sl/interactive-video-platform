import { useEffect, useMemo, useRef, useState } from 'react'
import type { StudentQuestionDto } from '@interactive-video-platform/shared'
import { useStudentQuestions } from '../../../interactive-questions/hooks/useInteractiveQuestions'
import { useSubmitQuestionAnswer } from '../../hooks/useSubmitQuestionAnswer'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import { VideoControls } from '../VideoControls/VideoControls'
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
    const playerRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [activeQuestion, setActiveQuestion] = useState<StudentQuestionDto | null>(null)
    const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([])
    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
    const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const questionsQuery = useStudentQuestions(lessonId)
    const submitAnswerMutation = useSubmitQuestionAnswer()

    const questions = useMemo(() => {
        return sortQuestions(questionsQuery.data ?? [])
    }, [questionsQuery.data])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === playerRef.current)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const syncVideoState = () => {
        const video = videoRef.current

        if (!video) {
            return
        }

        setCurrentTime(video.currentTime)
        setDuration(Number.isFinite(video.duration) ? video.duration : 0)
        setIsPlaying(!video.paused)
    }

    const activateQuestion = (question: StudentQuestionDto) => {
        const video = videoRef.current

        if (video) {
            video.pause()
        }

        setIsPlaying(false)
        setActiveQuestion(question)
        setSelectedOptionIds([])
        setAnswerStatus('idle')
        setErrorMessage('')
    }

    const handleTimeUpdate = () => {
        const video = videoRef.current

        if (!video) {
            return
        }

        setCurrentTime(video.currentTime)

        if (activeQuestion || questions.length === 0) {
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

        const togglePlay = async () => {
            const video = videoRef.current

            if (!video || activeQuestion) {
                return
            }

            if (video.paused) {
                await video.play()
                setIsPlaying(true)
                return
            }

            video.pause()
            setIsPlaying(false)
        }

        const handleSeek = (progressPercent: number) => {
            const video = videoRef.current

            if (!video || duration <= 0 || activeQuestion) {
                return
            }

            const nextTime = (progressPercent / 100) * duration
            video.currentTime = nextTime
            setCurrentTime(nextTime)
        }

        const toggleFullscreen = async () => {
            const player = playerRef.current

            if (!player) {
                return
            }

            if (!document.fullscreenElement) {
                await player.requestFullscreen()
                setIsFullscreen(true)
                return
            }

            await document.exitFullscreen()
            setIsFullscreen(false)
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
            setIsPlaying(true)
        }, 100)

    }

    return (
        <div className="interactive-video-player" ref={playerRef}>
            <video
                ref={videoRef}
                className="interactive-video-player__video"
                src={videoUrl}
                preload="metadata"
                onLoadedMetadata={syncVideoState}
                onTimeUpdate={handleTimeUpdate}
                onPlay={syncVideoState}
                onPause={syncVideoState}
                onEnded={syncVideoState}
            />

            {!activeQuestion ? (
                <VideoControls
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    isFullscreen={isFullscreen}
                    onTogglePlay={togglePlay}
                    onSeek={handleSeek}
                    onToggleFullscreen={toggleFullscreen}
                />
            ) : null}

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