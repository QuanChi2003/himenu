'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Item = {
  id: string
  name: string
  description: string
  image_url: string
  sale_price: number | string
  category_id?: string
}

type Category = {
  id: string
  name: string
  children: any[]
  items: Item[]
}

export default function MenuPage() {
  const [menu, setMenu] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMenu(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (item: Item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((i: any) => i.id === item.id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải menu...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">Thực Đơn</h1>
            <Link href="/" className="text-orange-600 hover:underline">← Về trang chủ</Link>
          </div>
          <Link href="/checkout" className="btn btn-primary">
            Giỏ Hàng 🛒
          </Link>
        </div>

        {menu.map(category => (
          <div key={category.id} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{category.name}</h2>
            
            {category.children.map((child: any) => {
              if (!child.items || child.items.length === 0) return null
              
              return (
                <div key={child.id} className="mb-8">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">{child.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {child.items.map((item: Item) => (
                      <ItemCard key={item.id} item={item} onAdd={addToCart} />
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map(item => (
                <ItemCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, onAdd }: { item: Item, onAdd: (item: Item) => void }) {
  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h4>
      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-orange-600">
          {Number(item.sale_price).toLocaleString('vi-VN')}đ
        </span>
        <button onClick={() => onAdd(item)} className="btn btn-primary">
          Thêm +
        </button>
      </div>
    </div>
  )
}
