import { useMutation } from '@tanstack/react-query'
import { submitQuestionAnswer } from '../../interactive-questions/api/questionAttemptsApi.ts'

export const useSubmitQuestionAnswer = () => {
    return useMutation({
        mutationFn: submitQuestionAnswer
    })
}