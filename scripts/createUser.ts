import mongoose from 'mongoose'
import { User } from '../models/User'
import 'dotenv/config'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)
  await User.deleteMany({ email: 'admin' }) // очищаем, если есть
  await User.create({
    email: 'admin',
    password: 'admin',
    role: 'admin',
  })
  console.log('✅ User created (без хэша)')
  process.exit()
}

run()
