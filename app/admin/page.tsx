'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const router = useRouter()
  const [range, setRange] = useState('day')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [range])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`)
      const data = await res.json()
      
      if (!data.success) {
        router.push('/admin/login')
        return
      }
      
      setReportData(data.data)
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const chartData = {
    labels: reportData?.labels || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: reportData?.revenue || [],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
      {
        label: 'Lợi nhuận',
        data: reportData?.profit || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
    ],
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">Admin Dashboard</h1>
          
          <div className="flex gap-4 flex-wrap">
            <Link href="/admin/categories" className="btn btn-secondary">Quản lý danh mục</Link>
            <Link href="/admin/items" className="btn btn-secondary">Quản lý món ăn</Link>
            <Link href="/admin/coupons" className="btn btn-secondary">Quản lý mã giảm giá</Link>
            <Link href="/admin/members" className="btn btn-secondary">Quản lý thành viên</Link>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu & lợi nhuận</h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setRange('day')}
                className={`btn ${range === 'day' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Ngày
              </button>
              <button
                onClick={() => setRange('week')}
                className={`btn ${range === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Tuần
              </button>
              <button
                onClick={() => setRange('month')}
                className={`btn ${range === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Tháng
              </button>
              <button
                onClick={() => setRange('year')}
                className={`btn ${range === 'year' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Năm
              </button>
            </div>
          </div>

          <Line data={chartData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng doanh thu</h3>
            <p className="text-3xl font-bold text-orange-600">
              {(reportData?.totalRevenue || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng lợi nhuận</h3>
            <p className="text-3xl font-bold text-green-600">
              {(reportData?.totalProfit || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Số đơn hàng</h3>
            <p className="text-3xl font-bold text-blue-600">
              {reportData?.orderCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
