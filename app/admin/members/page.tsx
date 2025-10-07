'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const res = await fetch('/api/admin/members')
    const data = await res.json()
    if (data.success) setMembers(data.data)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Quản lý thành viên</h1>
          <Link href="/admin" className="text-orange-600 hover:underline">← Dashboard</Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách thành viên</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên</th>
                  <th className="text-left py-3 px-4">Số điện thoại</th>
                  <th className="text-left py-3 px-4">Điểm</th>
                  <th className="text-left py-3 px-4">Hạng</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.phone} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{member.name || 'N/A'}</td>
                    <td className="py-3 px-4">{member.phone}</td>
                    <td className="py-3 px-4">{member.points.toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${member.tier.toLowerCase()}`}>
                        {member.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
