import { Schema, model, models } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  role: { type: String, enum: ['admin', 'mechanic'], default: 'mechanic' }
})

export const User = models.User || model('User', userSchema)
