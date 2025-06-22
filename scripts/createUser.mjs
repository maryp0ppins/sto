// createUser.mjs
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
})

const User = mongoose.model('User', userSchema)

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI)

  await User.deleteMany()

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

  console.log('✅ Users created')
  process.exit()
}

run()
