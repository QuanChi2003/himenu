import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const range = req.nextUrl.searchParams.get('range') || 'day'

    let interval = '1 hour'
    let format = 'HH24:00'
    let limit = 24

    if (range === 'week') {
      interval = '1 day'
      format = 'DD/MM'
      limit = 7
    } else if (range === 'month') {
      interval = '1 day'
      format = 'DD/MM'
      limit = 30
    } else if (range === 'year') {
      interval = '1 month'
      format = 'MM/YYYY'
      limit = 12
    }

    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, $1) as label,
        SUM(total)::float as revenue,
        SUM(profit)::float as profit
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${limit} ${interval.split(' ')[1]}'
      GROUP BY label
      ORDER BY MIN(created_at)
    `, [format])

    const statsResult = await pool.query(`
      SELECT 
        SUM(total)::float as total_revenue,
        SUM(profit)::float as total_profit,
        COUNT(*) as order_count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${limit} ${interval.split(' ')[1]}'
    `)

    const stats = statsResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        labels: result.rows.map(r => r.label),
        revenue: result.rows.map(r => r.revenue || 0),
        profit: result.rows.map(r => r.profit || 0),
        totalRevenue: stats.total_revenue || 0,
        totalProfit: stats.total_profit || 0,
        orderCount: parseInt(stats.order_count) || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
