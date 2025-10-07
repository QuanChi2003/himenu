'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [pos, setPos] = useState('0')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    if (data.success) setCategories(data.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id: parentId || null, pos: parseInt(pos) })
    })

    const data = await res.json()
    
    if (data.success) {
      toast.success('Đã thêm danh mục')
      setName('')
      setParentId('')
      setPos('0')
      fetchCategories()
    } else {
      toast.error(data.error)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Quản lý danh mục</h1>
          <Link href="/admin" className="text-orange-600 hover:underline">← Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm danh mục mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục cha</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="input">
                  <option value="">Không có (danh mục gốc)</option>
                  {categories.filter(c => !c.parent_id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí</label>
                <input type="number" value={pos} onChange={(e) => setPos(e.target.value)} className="input" />
              </div>
              <button type="submit" className="btn btn-primary w-full">Thêm danh mục</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách danh mục</h2>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 border rounded-lg">
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-gray-600">
                    {cat.parent_id ? `Thuộc: ${categories.find(c => c.id === cat.parent_id)?.name}` : 'Danh mục gốc'}
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
