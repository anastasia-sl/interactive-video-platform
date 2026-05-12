import './VideoControls.scss'

type VideoControlsProps = {
    isPlaying: boolean
    currentTime: number
    duration: number
    isFullscreen: boolean
    disabled?: boolean
    onTogglePlay: () => void
    onSeek: (progressPercent: number) => void
    onToggleFullscreen: () => void
}

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
        return '00:00'
    }

    const minutes = Math.floor(seconds / 60)
    const restSeconds = Math.floor(seconds % 60)

    return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

export const VideoControls = ({
                                  isPlaying,
                                  currentTime,
                                  duration,
                                  isFullscreen,
                                  disabled = false,
                                  onTogglePlay,
                                  onSeek,
                                  onToggleFullscreen
                              }: VideoControlsProps) => {
    const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className="video-controls">
            <button
                className="video-controls__button"
                type="button"
                onClick={onTogglePlay}
                disabled={disabled}
            >
                {isPlaying ? 'Пауза' : 'Відтворити'}
            </button>

            <span className="video-controls__time">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <input
                className="video-controls__progress"
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressValue}
                onChange={(event) => onSeek(Number(event.target.value))}
                disabled={disabled || duration <= 0}
            />

            <button
                className="video-controls__button"
                type="button"
                onClick={onToggleFullscreen}
                disabled={disabled}
            >
                {isFullscreen ? 'Вийти' : 'На весь екран'}
            </button>
        </div>
    )
}