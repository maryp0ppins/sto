import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  const cookieStore = cookies(); // ✅ synchronous
  const token = (await cookieStore).get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    return Response.json({ id: payload.id, role: payload.role });
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
}
