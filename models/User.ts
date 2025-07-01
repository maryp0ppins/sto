// models/User.ts - Обновленная модель пользователя
import { Schema, model, models } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'mechanic'], default: 'mechanic' }
}, { timestamps: true })

export const User = models.User || model('User', userSchema)