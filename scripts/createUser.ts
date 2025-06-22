import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import readline from 'readline'
import { User } from '../models/User'
import 'dotenv/config'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())))
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)

  const email = await ask('Email: ')
  const name = await ask('Имя: ')
  const role = await ask('Роль (admin/mechanic): ')
  const password = await ask('Пароль: ')
  rl.close()

  const hashed = await bcrypt.hash(password, 10)

  await User.create({ email, name, role, password: hashed })

  console.log(`✅ Пользователь "${email}" создан`)
  process.exit()
}

run()
