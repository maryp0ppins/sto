// app/api/auth/me/route.ts - API для получения информации о пользователе
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string }
    
    await dbConnect()
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
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}