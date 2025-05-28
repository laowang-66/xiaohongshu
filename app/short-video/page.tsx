'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import UserStatus from '../components/UserStatus'
import { apiCall, isAuthenticated, isActivated } from '../lib/auth'

export default function ShortVideoPage() {
  const [formData, setFormData] = useState({
    topic: '',
    platform: '',
    style: '',
    duration: '',
    additionalRequirements: ''
  })
  const [script, setScript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 检查认证和密钥
    if (!isAuthenticated()) {
      setError('请先登录')
      setIsLoading(false)
      return
    }
    
    if (!isActivated()) {
      setError('激活码已过期或次数已用完，请激活新激活码')
      setIsLoading(false)
      return
    }

    try {
      const response = await apiCall('/api/generate-short-video', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('生成脚本失败')
      }

      const data = await response.json()
      setScript(data.script)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成脚本时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <UserStatus />

      {/* Short Video Script Generator Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold mb-4">短视频脚本生成器</h1>
              <p className="text-xl text-gray-600">
                一键生成爆款短视频脚本，让你的内容更有吸引力
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频主题
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="例如：生活小妙招、美食制作、旅行vlog等"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    发布平台
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">请选择发布平台</option>
                    <option value="douyin">抖音</option>
                    <option value="kuaishou">快手</option>
                    <option value="xiaohongshu">小红书</option>
                    <option value="bilibili">B站</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频风格
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">请选择视频风格</option>
                    <option value="trendy">潮流时尚</option>
                    <option value="funny">搞笑幽默</option>
                    <option value="educational">知识科普</option>
                    <option value="lifestyle">生活方式</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频时长
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">请选择视频时长</option>
                    <option value="15s">15秒</option>
                    <option value="30s">30秒</option>
                    <option value="60s">60秒</option>
                    <option value="90s">90秒</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    额外要求（选填）
                  </label>
                  <textarea
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleChange}
                    placeholder="请输入其他特殊要求，如：需要加入特效、需要强调某些重点等"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '生成中...' : '生成短视频脚本'}
                </button>

                {error && (
                  <div className="text-red-500 text-center mt-4">
                    {error}
                  </div>
                )}
              </form>
            </motion.div>

            {/* Preview Section */}
            {script && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 bg-white rounded-xl shadow-sm p-8"
              >
                <h2 className="text-2xl font-bold mb-6">脚本预览</h2>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {script}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => navigator.clipboard.writeText(script)}
                    className="btn-primary"
                  >
                    复制脚本
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
} 