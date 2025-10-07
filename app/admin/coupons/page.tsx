'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [code, setCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    if (data.success) setCoupons(data.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.toUpperCase(),
        discount_percent: parseInt(discountPercent),
        expires_at: expiresAt || null
      })
    })

    const data = await res.json()
    
    if (data.success) {
      toast.success('Đã thêm mã giảm giá')
      setCode('')
      setDiscountPercent('')
      setExpiresAt('')
      fetchCoupons()
    } else {
      toast.error(data.error)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Quản lý mã giảm giá</h1>
          <Link href="/admin" className="text-orange-600 hover:underline">← Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm mã giảm giá mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm giảm (%)</label>
                <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="input" required min="1" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn (tùy chọn)</label>
                <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input" />
              </div>
              <button type="submit" className="btn btn-primary w-full">Thêm mã giảm giá</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách mã giảm giá</h2>
            <div className="space-y-2">
              {coupons.map(coupon => (
                <div key={coupon.code} className="p-3 border rounded-lg">
                  <p className="font-semibold text-orange-600">{coupon.code}</p>
                  <p className="text-sm text-gray-600">Giảm: {coupon.discount_percent}%</p>
                  <p className="text-xs text-gray-500">
                    {coupon.expires_at ? `Hết hạn: ${new Date(coupon.expires_at).toLocaleString('vi-VN')}` : 'Không giới hạn'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
