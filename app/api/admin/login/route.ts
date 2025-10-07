import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const ADMIN_USER = process.env.ADMIN_USER || 'admin'
    const ADMIN_PASS = process.env.ADMIN_PASS || 'admin'

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = createAdminToken()
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400
      })

      return response
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
