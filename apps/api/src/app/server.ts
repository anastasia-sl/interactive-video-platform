import { createApp } from './app'
import { env } from '../config/env'
import { connectToDatabase } from '../database/mongoose'

export const startServer = async () => {
  await connectToDatabase()

  const app = createApp()

  app.listen(env.PORT, () => {
    console.log(`API started on http://localhost:${env.PORT}`)
  })
}