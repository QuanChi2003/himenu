import { Pool } from 'pg'

declare global {
  var pgPool: Pool | undefined
}

const pool =
  global.pgPool ||
  new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: process.env.SUPABASE_DB_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
  })

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool
}

export default pool

export async function ensureSchema() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        pos INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        sale_price NUMERIC NOT NULL,
        cost_price NUMERIC NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discount_percent INTEGER NOT NULL,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_type TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        customer_address TEXT,
        table_number TEXT,
        subtotal NUMERIC NOT NULL,
        discount NUMERIC DEFAULT 0,
        total NUMERIC NOT NULL,
        profit NUMERIC DEFAULT 0,
        coupon_code TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        sale_price NUMERIC NOT NULL,
        cost_price NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        phone TEXT PRIMARY KEY,
        name TEXT,
        points INTEGER DEFAULT 0,
        tier TEXT DEFAULT 'Regular',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function seedDemoData() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT COUNT(*) FROM categories')
    if (parseInt(rows[0].count) > 0) return

    await client.query('BEGIN')

    await client.query(`
      INSERT INTO categories (id, name, parent_id, pos) VALUES
      ('beer', 'Bia', NULL, 1),
      ('food', 'Đồ Ăn', NULL, 2),
      ('snacks', 'Đồ Nhắm', 'food', 1),
      ('main', 'Món Chính', 'food', 2)
    `)

    await client.query(`
      INSERT INTO items (id, name, description, image_url, category_id, sale_price, cost_price, is_active) VALUES
      ('tiger', 'Tiger Beer', 'Bia Tiger chai 330ml', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', 'beer', 25000, 15000, true),
      ('heineken', 'Heineken', 'Bia Heineken lon 330ml', 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400', 'beer', 30000, 18000, true),
      ('saigon', 'Sài Gòn Đỏ', 'Bia Sài Gòn Đỏ chai 450ml', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', 'beer', 22000, 13000, true),
      ('peanuts', 'Đậu Phộng Rang', 'Đậu phộng rang muối', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', 'snacks', 20000, 10000, true),
      ('squid', 'Mực Một Nắng', 'Mực một nắng nướng', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400', 'snacks', 50000, 30000, true),
      ('wings', 'Cánh Gà Chiên', 'Cánh gà chiên nước mắm (6 cái)', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', 'main', 60000, 35000, true),
      ('fries', 'Khoai Tây Chiên', 'Khoai tây chiên giòn', 'https://images.unsplash.com/photo-1630384082596-cc7ceab4e708?w=400', 'main', 40000, 20000, true)
    `)

    await client.query(`
      INSERT INTO coupons (code, discount_percent, expires_at) VALUES
      ('WELCOME10', 10, NOW() + INTERVAL '30 days'),
      ('VIP20', 20, NOW() + INTERVAL '60 days')
    `)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
