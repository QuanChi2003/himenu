'use client'

import { useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string
  order_type: string
  table_number: string
  total: number
  profit: number
  status: string
  created_at: string
  items: Array<{ item_name: string; quantity: number; sale_price: number }>
}

type Member = {
  phone: string
  name: string
  points: number
  tier: string
}

export default function AccountPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/account?phone=${phone}`)
      const data = await res.json()

      if (data.success) {
        setOrders(data.data.orders)
        setMember(data.data.member)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Tài Khoản</h1>
          <Link href="/" className="text-orange-600 hover:underline">← Về trang chủ</Link>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tra cứu đơn hàng</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input flex-1"
              placeholder="Nhập số điện thoại"
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>
        </div>

        {searched && member && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin thành viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên</p>
                <p className="text-lg font-semibold">{member.name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm tích lũy</p>
                <p className="text-lg font-semibold text-orange-600">{member.points.toLocaleString('vi-VN')} điểm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng thành viên</p>
                <span className={`badge badge-${member.tier.toLowerCase()}`}>{member.tier}</span>
              </div>
            </div>
          </div>
        )}

        {searched && orders.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lịch sử đơn hàng</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">Đơn #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {order.order_type === 'dine-in' ? `Tại quán - Bàn ${order.table_number}` : 'Giao hàng'}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600">
                        {order.total.toLocaleString('vi-VN')}đ
                      </p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {item.item_name} x{item.quantity} - {(item.sale_price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && orders.length === 0 && (
          <div className="card text-center text-gray-500">
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
