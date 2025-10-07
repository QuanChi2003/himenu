import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC')
  return NextResponse.json({ success: true, data: result.rows })
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { code, discount_percent, expires_at } = await req.json()

    await pool.query(
      'INSERT INTO coupons (code, discount_percent, expires_at) VALUES ($1, $2, $3)',
      [code, discount_percent, expires_at]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
