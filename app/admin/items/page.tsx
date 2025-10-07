'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [costPrice, setCostPrice] = useState('')

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/admin/items')
    const data = await res.json()
    if (data.success) setItems(data.data)
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    if (data.success) setCategories(data.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        image_url: imageUrl,
        category_id: categoryId,
        sale_price: parseFloat(salePrice),
        cost_price: parseFloat(costPrice)
      })
    })

    const data = await res.json()
    
    if (data.success) {
      toast.success('Đã thêm món ăn')
      setName('')
      setDescription('')
      setImageUrl('')
      setCategoryId('')
      setSalePrice('')
      setCostPrice('')
      fetchItems()
    } else {
      toast.error(data.error)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Quản lý món ăn</h1>
          <Link href="/admin" className="text-orange-600 hover:underline">← Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm món ăn mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên món</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá vốn</label>
                <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="input" required />
              </div>
              <button type="submit" className="btn btn-primary w-full">Thêm món ăn</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách món ăn</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-orange-600">Giá bán: {parseFloat(item.sale_price).toLocaleString('vi-VN')}đ</p>
                  <p className="text-sm text-gray-500">Giá vốn: {parseFloat(item.cost_price).toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
