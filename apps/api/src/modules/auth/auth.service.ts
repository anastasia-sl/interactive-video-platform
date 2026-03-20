import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  USER_ROLES,
  type AuthResponseDto,
  type AuthUserDto,
  type LoginRequestDto,
  type MeResponseDto,
  type RegisterRequestDto
} from '@interactive-video-platform/shared'
import { UserModel } from '../users/user.model'
import { HttpError } from '../../utils/http-error'
import { signAccessToken } from '../../utils/jwt'

const registerSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6).max(100),
  fullName: z.string().min(2).max(120).transform((value) => value.trim()),
  role: z.enum(USER_ROLES).optional()
})

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6).max(100)
})

const toAuthUserDto = (user: {
  _id: { toString(): string }
  email: string
  fullName: string
  role: AuthUserDto['role']
  createdAt: Date
  updatedAt: Date
}): AuthUserDto => ({
  id: user._id.toString(),
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
})

export class AuthService {
  static async register(payload: RegisterRequestDto): Promise<AuthResponseDto> {
    const data = registerSchema.parse(payload)

    const existingUser = await UserModel.findOne({ email: data.email })

    if (existingUser) {
      throw new HttpError(409, 'User with this email already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await UserModel.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role ?? 'student'
    })

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role
    })

    return {
      accessToken,
      user: toAuthUserDto(user)
    }
  }

  static async login(payload: LoginRequestDto): Promise<AuthResponseDto> {
    const data = loginSchema.parse(payload)

    const user = await UserModel.findOne({ email: data.email })

    if (!user) {
      throw new HttpError(401, 'Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password')
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role
    })

    return {
      accessToken,
      user: toAuthUserDto(user)
    }
  }

  static async me(userId: string): Promise<MeResponseDto> {
    const user = await UserModel.findById(userId)

    if (!user) {
      throw new HttpError(404, 'User not found')
    }

    return {
      user: toAuthUserDto(user)
    }
  }
}