'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            老旺AI
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium ${
                isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              首页
            </Link>
            <Link
              href="/script"
              className={`text-sm font-medium ${
                isActive('/script') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              脚本生成
            </Link>
            <Link
              href="/short-video"
              className={`text-sm font-medium ${
                isActive('/short-video') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              短视频脚本
            </Link>
            <Link
              href="/voice-over"
              className={`text-sm font-medium ${
                isActive('/voice-over') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              口播脚本
            </Link>
            <Link
              href="/tools"
              className={`text-sm font-medium ${
                isActive('/tools') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              实用工具
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="btn-primary">
              登录/注册
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 