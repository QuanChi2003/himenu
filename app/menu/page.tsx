'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Item = {
  id: string
  name: string
  description: string
  image_url: string
  sale_price: string
}

export default function MenuPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch('/api/public/menu')
        const data = await res.json()
        
        if (data.success && data.data) {
          const allItems: Item[] = []
          data.data.forEach((cat: any) => {
            allItems.push(...cat.items)
            if (cat.children) {
              cat.children.forEach((child: any) => {
                if (child.items) allItems.push(...child.items)
              })
            }
          })
          setItems(allItems)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [])

  const addToCart = (item: Item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((i: any) => i.id === item.id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ ...item, quantity: 1, sale_price: Number(item.sale_price) })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Đang tải menu...</div></div>

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">Thực Đơn</h1>
            <Link href="/" className="text-orange-600 hover:underline">← Về trang chủ</Link>
          </div>
          <Link href="/checkout" className="btn btn-primary">Giỏ Hàng 🛒</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="relative w-full h-48 mb-4">
                <Image src={item.image_url} alt={item.name} fill className="object-cover rounded-lg" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange-600">{Number(item.sale_price).toLocaleString('vi-VN')}đ</span>
                <button onClick={() => addToCart(item)} className="btn btn-primary">Thêm +</button>
              </div>
            </div>
          ))}
        </div>

        <footer className="text-center text-gray-500 mt-16"><p>cre:Quân</p></footer>
      </div>
    </div>
  )
}
