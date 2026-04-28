import type {
    SubmitQuestionAnswerRequest,
    SubmitQuestionAnswerResponse
} from '@interactive-video-platform/shared'
import { apiClient } from '../../../shared/api/client'

export const submitQuestionAnswer = (payload: SubmitQuestionAnswerRequest) => {
    return apiClient<SubmitQuestionAnswerResponse>('/api/question-attempts/answers', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}