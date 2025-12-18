// ✅ الصيغة الصحيحة
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  const userData = JSON.stringify(body);

  const response = new NextResponse(JSON.stringify({ message: 'Cookie set successfully' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  response.cookies.set('user', userData, {
    // httpOnly: true, // إذا كنت تريد رؤيتها في المتصفح اجعلها false أو احذفها مؤقتًا
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // أسبوع
  });

  return response;
}
