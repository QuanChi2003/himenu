import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-orange-600 mb-2">
            Beer Cầu Gẫy
          </h1>
          <p className="text-sm text-gray-500">cre:Quân</p>
        </div>

        <p className="text-xl text-gray-700 mb-12">
          Đặt món trực tuyến - Giao hàng nhanh chóng
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/menu" className="card hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">🍺</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Menu</h3>
              <p className="text-gray-600">Xem thực đơn đầy đủ</p>
            </div>
          </Link>

          <Link href="/checkout" className="card hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đặt Hàng</h3>
              <p className="text-gray-600">Đặt món yêu thích</p>
            </div>
          </Link>

          <Link href="/account" className="card hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tài Khoản</h3>
              <p className="text-gray-600">Lịch sử & điểm thưởng</p>
            </div>
          </Link>
        </div>

        <div className="text-sm text-gray-500 bg-white/50 p-4 rounded-lg">
          <p className="font-medium">Lưu ý: Quán tính phí ship riêng tùy theo khu vực</p>
        </div>
      </div>
    </div>
  )
}
