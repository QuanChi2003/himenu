import { NextResponse } from 'next/server'
import pool, { ensureSchema, seedDemoData } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    await ensureSchema()
    await seedDemoData()

    const categoriesResult = await pool.query(`
      SELECT * FROM categories ORDER BY pos, name
    `)

    const itemsResult = await pool.query(`
      SELECT * FROM items WHERE is_active = true ORDER BY name
    `)

    const categories = categoriesResult.rows
    const items = itemsResult.rows

    const parents = categories.filter(c => !c.parent_id)
    const menuData = parents.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parent_id === parent.id).map(child => ({
        ...child,
        items: items.filter(i => i.category_id === child.id)
      })),
      items: items.filter(i => i.category_id === parent.id)
    }))

    return NextResponse.json({ success: true, data: menuData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
