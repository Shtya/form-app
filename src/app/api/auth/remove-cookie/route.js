// app/api/auth/remove-cookie/route.js
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Cookie removed successfully' })

  response.cookies.set('user', '', {
    maxAge: 0,
    path: '/',
  })

  return response
}
