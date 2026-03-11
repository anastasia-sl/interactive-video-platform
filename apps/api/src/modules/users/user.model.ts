import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import { USER_ROLES } from '@interactive-video-platform/shared'

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
      required: true
    }
  },
  {
    timestamps: true
  }
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
}

export const UserModel = mongoose.model('User', userSchema)