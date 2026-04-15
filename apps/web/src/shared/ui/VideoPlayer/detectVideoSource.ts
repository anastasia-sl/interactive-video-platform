type VideoSource =
    | { type: 'youtube'; id: string }
    | { type: 'vimeo'; id: string }
    | { type: 'loom'; id: string }
    | { type: 'direct' }
    | { type: 'unsupported' }

const isDirectVideoUrl = (url: URL) => {
  const href = url.href.toLowerCase()
  const pathname = url.pathname.toLowerCase()

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(href)) {
    return true
  }

  if (
      url.hostname.includes('res.cloudinary.com') &&
      pathname.includes('/video/')
  ) {
    return true
  }

  return false
}

export const detectVideoSource = (url: string): VideoSource => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    return { type: 'unsupported' }
  }

  const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) {
    return { type: 'youtube', id: youtubeMatch[1] }
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', id: vimeoMatch[1] }
  }

  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loomMatch) {
    return { type: 'loom', id: loomMatch[1] }
  }

  if (isDirectVideoUrl(parsedUrl)) {
    return { type: 'direct' }
  }

  return { type: 'unsupported' }
}