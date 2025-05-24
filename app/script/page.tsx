'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ScriptPage() {
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
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

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">小红助手</div>
            <div className="space-x-4">
              <a href="/" className="text-gray-600 hover:text-primary">首页</a>
              <a href="#" className="text-gray-600 hover:text-primary">笔记挖掘</a>
              <a href="#" className="text-gray-600 hover:text-primary">实用工具</a>
              <a href="#" className="text-gray-600 hover:text-primary">今日热榜</a>
              <button className="btn-primary">登录/注册</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Script Generator Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold mb-4">口播脚本生成器</h1>
              <p className="text-xl text-gray-600">
                一键生成专业口播脚本，让你的视频更有吸引力
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
                    placeholder="例如：护肤心得、美食探店、旅行攻略等"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标受众
                  </label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">请选择目标受众</option>
                    <option value="young">年轻女性</option>
                    <option value="middle">中年女性</option>
                    <option value="all">全年龄段</option>
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
                    <option value="casual">轻松自然</option>
                    <option value="professional">专业讲解</option>
                    <option value="funny">幽默搞笑</option>
                    <option value="emotional">情感共鸣</option>
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
                    <option value="short">1-3分钟</option>
                    <option value="medium">3-5分钟</option>
                    <option value="long">5-10分钟</option>
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
                    placeholder="请输入其他特殊要求，如：需要加入互动环节、需要强调某些重点等"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '生成中...' : '生成口播脚本'}
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