import 'dotenv/config'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  await dbConnect()
  const { email, password } = await req.json()

  const user = await User.findOne({ email })

  const valid = user && user.password === password

  if (!valid) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  )

  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${
    60 * 60 * 24
  }; SameSite=Lax; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  })
}
