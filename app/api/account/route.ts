import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone')
    
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 })
    }

    const ordersResult = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object('item_name', oi.item_name, 'quantity', oi.quantity, 'sale_price', oi.sale_price)) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_phone = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [phone]
    )

    const memberResult = await pool.query(`SELECT * FROM members WHERE phone = $1`, [phone])

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersResult.rows,
        member: memberResult.rows[0] || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
