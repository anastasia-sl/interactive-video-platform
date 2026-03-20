import express from 'express'
import cors from 'cors'
import { env } from '../config/env'
import { authRouter } from '../modules/auth/auth.routes'
import { coursesRouter } from '../modules/courses/course.routes'
import { errorMiddleware } from '../middlewares/error.middleware'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: env.CLIENT_URL
    })
  )

  app.use(express.json())

  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'API is running'
    })
  })

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok'
    })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/courses', coursesRouter)

  app.use(errorMiddleware)

  return app
}