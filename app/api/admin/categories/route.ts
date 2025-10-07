import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const result = await pool.query('SELECT * FROM categories ORDER BY pos, name')
  return NextResponse.json({ success: true, data: result.rows })
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, parent_id, pos } = await req.json()
    const id = nanoid()

    await pool.query(
      'INSERT INTO categories (id, name, parent_id, pos) VALUES ($1, $2, $3, $4)',
      [id, name, parent_id, pos || 0]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
