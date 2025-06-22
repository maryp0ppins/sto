// createUser.mjs
import mongoose from 'mongoose'
import 'dotenv/config'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  name: String,
  role: String,
})

const User = mongoose.model('User', userSchema)

const run = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGODB_URI не указан в .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('🔌 Подключено к MongoDB')

    await User.deleteMany()
    console.log('🧹 Все пользователи удалены')

    const users = [
      {
        email: 'admin',
        password: 'admin', // пароль без хеша
        name: 'Админ',
        role: 'admin',
      },
      {
        email: 'mech',
        password: 'mech', // пароль без хеша
        name: 'Иван Мастер',
        role: 'mechanic',
      },
    ]

    await User.create(users)

    console.log('✅ Пользователи созданы:')
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}), пароль: ${u.password}`)
    })

    process.exit()
  } catch (err) {
    console.error('❌ Ошибка:', err)
    process.exit(1)
  }
}

run()
