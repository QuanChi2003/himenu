import { NextResponse } from 'next/server'
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

  const result = await pool.query('SELECT * FROM members ORDER BY points DESC')
  return NextResponse.json({ success: true, data: result.rows })
}
