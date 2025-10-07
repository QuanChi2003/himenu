import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type ItemRow = {
  id: string
  name: string
  sale_price: number
  cost_price: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_type, items, table_number, customer_name, customer_phone, customer_address, coupon_code } = body

    if (!order_type || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    if (order_type === 'dine-in' && !table_number) {
      return NextResponse.json({ success: false, error: 'Table number required for dine-in' }, { status: 400 })
    }

    if (order_type === 'delivery' && (!customer_name || !customer_phone || !customer_address)) {
      return NextResponse.json({ success: false, error: 'Customer info required for delivery' }, { status: 400 })
    }

    const ids = items.map((it: any) => it.id)
    const q = await pool.query<ItemRow>(
      `SELECT id, name, sale_price::float, cost_price::float FROM items WHERE id = ANY($1) AND is_active = true`,
      [ids]
    )
    
    const dict = new Map<string, ItemRow>(q.rows.map(r => [r.id, r]))

    let subtotal = 0
    let totalProfit = 0
    const orderItems = []

    for (const it of items) {
      const m = dict.get(it.id) as ItemRow | undefined
      if (!m) throw new Error('Item not found: ' + it.id)
      
      const itemSubtotal = m.sale_price * it.quantity
      const itemProfit = (m.sale_price - m.cost_price) * it.quantity
      
      subtotal += itemSubtotal
      totalProfit += itemProfit
      
      orderItems.push({
        item_id: m.id,
        item_name: m.name,
        quantity: it.quantity,
        sale_price: m.sale_price,
        cost_price: m.cost_price
      })
    }

    let discount = 0
    if (coupon_code) {
      const couponResult = await pool.query(
        `SELECT * FROM coupons WHERE code = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
        [coupon_code]
      )
      
      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0]
        discount = Math.round(subtotal * coupon.discount_percent / 100)
      }
    }

    const total = subtotal - discount
    const profit = totalProfit - discount

    const orderId = nanoid()

    await pool.query(
      `INSERT INTO orders (id, order_type, customer_name, customer_phone, customer_address, table_number, subtotal, discount, total, profit, coupon_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [orderId, order_type, customer_name, customer_phone, customer_address, table_number, subtotal, discount, total, profit, coupon_code, 'pending']
    )

    for (const oi of orderItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, item_id, item_name, quantity, sale_price, cost_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, oi.item_id, oi.item_name, oi.quantity, oi.sale_price, oi.cost_price]
      )
    }

    if (customer_phone) {
      const points = Math.round(total / 1000)
      
      const memberResult = await pool.query(`SELECT * FROM members WHERE phone = $1`, [customer_phone])
      
      if (memberResult.rows.length > 0) {
        const newPoints = memberResult.rows[0].points + points
        let tier = 'Regular'
        if (newPoints >= 10000) tier = 'Platinum'
        else if (newPoints >= 5000) tier = 'Gold'
        else if (newPoints >= 1000) tier = 'Silver'
        
        await pool.query(
          `UPDATE members SET points = $1, tier = $2, name = COALESCE(name, $3), updated_at = NOW() WHERE phone = $4`,
          [newPoints, tier, customer_name, customer_phone]
        )
      } else {
        let tier = 'Regular'
        if (points >= 10000) tier = 'Platinum'
        else if (points >= 5000) tier = 'Gold'
        else if (points >= 1000) tier = 'Silver'
        
        await pool.query(
          `INSERT INTO members (phone, name, points, tier) VALUES ($1, $2, $3, $4)`,
          [customer_phone, customer_name, points, tier]
        )
      }
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const itemsList = orderItems.map(oi => `  • ${oi.item_name} x${oi.quantity} = ${(oi.sale_price * oi.quantity).toLocaleString('vi-VN')}đ`).join('\n')
      
      let orderInfo = `🍺 *Đơn hàng mới #${orderId}*\n\n`
      orderInfo += `*Loại:* ${order_type === 'dine-in' ? 'Tại quán' : 'Giao hàng'}\n`
      
      if (order_type === 'dine-in') {
        orderInfo += `*Bàn số:* ${table_number}\n`
      } else {
        orderInfo += `*Khách:* ${customer_name}\n`
        orderInfo += `*SĐT:* ${customer_phone}\n`
        orderInfo += `*Địa chỉ:* ${customer_address}\n`
      }
      
      orderInfo += `\n*Món đặt:*\n${itemsList}\n`
      orderInfo += `\n*Tạm tính:* ${subtotal.toLocaleString('vi-VN')}đ`
      
      if (discount > 0) {
        orderInfo += `\n*Giảm giá:* -${discount.toLocaleString('vi-VN')}đ (${coupon_code})`
      }
      
      orderInfo += `\n*Tổng:* ${total.toLocaleString('vi-VN')}đ`
      orderInfo += `\n*Lợi nhuận:* ${profit.toLocaleString('vi-VN')}đ`

      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: orderInfo,
            parse_mode: 'Markdown'
          })
        })
      } catch (telegramError) {
        console.error('Telegram error:', telegramError)
      }
    }

    return NextResponse.json({
      success: true,
      data: { orderId, subtotal, discount, total, profit }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
