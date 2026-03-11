import type {
  AuthResponseDto,
  LoginRequestDto,
  MeResponseDto,
  RegisterRequestDto
} from '../../../shared/types/auth'
import { apiClient } from '../../../shared/api/client'

export const authApi = {
  register(payload: RegisterRequestDto) {
    return apiClient<AuthResponseDto>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  login(payload: LoginRequestDto) {
    return apiClient<AuthResponseDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  me() {
    return apiClient<MeResponseDto>('/api/auth/me')
  }
}