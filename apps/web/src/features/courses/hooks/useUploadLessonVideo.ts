import { useMutation } from '@tanstack/react-query'
import { uploadLessonVideo } from '../api/uploadLessonVideo'

export const useUploadLessonVideo = () => {
    return useMutation({
        mutationFn: uploadLessonVideo
    })
}