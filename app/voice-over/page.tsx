'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'

export default function VoiceOverPage() {
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

    try {
      const response = await fetch('/api/generate-voice-over', {
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
      <Navigation />

      {/* Voice Over Script Generator Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">口播短视频脚本生成器</h1>
              <p className="text-xl text-gray-600">
                一键生成专业口播脚本，让你的内容更有吸引力
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
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
                    placeholder="例如：产品介绍、知识分享、故事讲述等"
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
                    口播风格
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">请选择口播风格</option>
                    <option value="professional">专业讲解</option>
                    <option value="casual">轻松自然</option>
                    <option value="energetic">活力四射</option>
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
                  {isLoading ? '生成中...' : '生成口播脚本'}
                </button>

                {error && (
                  <div className="text-red-500 text-center mt-4">
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Preview Section */}
            {script && (
              <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
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
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
} 