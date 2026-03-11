export const USER_ROLES = ['student', 'teacher', 'admin'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface RegisterRequestDto {
  email: string
  password: string
  fullName: string
  role?: UserRole
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface AuthUserDto {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthResponseDto {
  accessToken: string
  user: AuthUserDto
}

export interface MeResponseDto {
  user: AuthUserDto
}