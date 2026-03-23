import './VideoPlayer.scss'
import { detectVideoSource } from './detectVideoSource'

type Props = {
  url: string
}

export const VideoPlayer = ({ url }: Props) => {
  const source = detectVideoSource(url)

  if (source.type === 'youtube') {
    return (
      <div className='video-player'>
        <div className='video-player__wrapper'>
          <iframe
            className='video-player__iframe'
            src={`https://www.youtube.com/embed/${source.id}`}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            title='YouTube відео'
          />
        </div>
      </div>
    )
  }

  if (source.type === 'vimeo') {
    return (
      <div className='video-player'>
        <div className='video-player__wrapper'>
          <iframe
            className='video-player__iframe'
            src={`https://player.vimeo.com/video/${source.id}`}
            allow='autoplay; fullscreen; picture-in-picture'
            allowFullScreen
            title='Vimeo відео'
          />
        </div>
      </div>
    )
  }

  if (source.type === 'loom') {
    return (
      <div className='video-player'>
        <div className='video-player__wrapper'>
          <iframe
            className='video-player__iframe'
            src={`https://www.loom.com/embed/${source.id}`}
            allowFullScreen
            title='Loom відео'
          />
        </div>
      </div>
    )
  }

  if (source.type === 'direct') {
    return (
      <div className='video-player'>
        <video
          className='video-player__native'
          src={url}
          controls
        />
      </div>
    )
  }

  return (
    <p className='video-player__unsupported'>
      Непідтримуване посилання. Використовуй YouTube, Vimeo, Loom або пряме .mp4 посилання.
    </p>
  )
}