import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import 'dotenv/config'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)

  await User.deleteMany({})

  const adminHash = await bcrypt.hash('admin', 10)
  const mechHash = await bcrypt.hash('mech', 10)

  await User.create([
    {
      email: 'admin',
      password: adminHash,
      name: 'Админ',
      role: 'admin',
    },
    {
      email: 'mech',
      password: mechHash,
      name: 'Иван Мастер',
      role: 'mechanic',
    },
  ])

  console.log('✅ Admin and mechanic created')
  process.exit()
}

run()
