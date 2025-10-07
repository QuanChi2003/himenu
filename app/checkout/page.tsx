'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type CartItem = {
  id: string
  name: string
  image_url: string
  sale_price: number
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in')
  const [tableNumber, setTableNumber] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    if (orderType === 'dine-in' && !tableNumber) {
      toast.error('Vui lòng nhập số bàn')
      return
    }

    if (orderType === 'delivery' && (!name || !phone || !address)) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setLoading(true)

    const orderData = {
      order_type: orderType,
      items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
      table_number: orderType === 'dine-in' ? tableNumber : undefined,
      customer_name: orderType === 'delivery' ? name : undefined,
      customer_phone: orderType === 'delivery' ? phone : undefined,
      customer_address: orderType === 'delivery' ? address : undefined,
      coupon_code: couponCode || undefined
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Đặt hàng thành công!')
        localStorage.removeItem('cart')
        setTimeout(() => {
          router.push(`/account?phone=${phone || 'guest'}`)
        }, 1500)
      } else {
        toast.error(data.error || 'Đặt hàng thất bại')
      }
    } catch (error) {
      toast.error('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Giỏ Hàng & Thanh Toán</h1>
          <Link href="/menu" className="text-orange-600 hover:underline">← Tiếp tục đặt món</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Món đã chọn</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">Giỏ hàng trống</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-orange-600 font-bold">
                        {item.sale_price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-secondary px-2 py-1">-</button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-secondary px-2 py-1">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin đặt hàng</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại đơn hàng</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`btn flex-1 ${orderType === 'dine-in' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Tại quán
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`btn flex-1 ${orderType === 'delivery' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Giao hàng
                  </button>
                </div>
              </div>

              {orderType === 'dine-in' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số bàn *</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="input"
                    placeholder="Nhập số bàn"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="Nhập tên"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input"
                      placeholder="Nhập địa chỉ giao hàng"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá (nếu có)</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="input"
                  placeholder="Nhập mã giảm giá"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <strong>Lưu ý:</strong> Quán tính phí ship riêng tùy theo khu vực
                </p>
              </div>

              <button type="submit" disabled={loading || cart.length === 0} className="btn btn-primary w-full">
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
