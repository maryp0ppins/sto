import 'dotenv/config'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }

    // Подключаемся к базе данных
    await dbConnect()

    // Находим пользователя
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}