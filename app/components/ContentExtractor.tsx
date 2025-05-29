'use client';

import { useState } from 'react';
import { apiCall, isAuthenticated } from '../lib/auth';
import { noteStyles } from '../config/constants';

interface ContentExtractorProps {
  onShowLogin: () => void;
}

export default function ContentExtractor({ onShowLogin }: ContentExtractorProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [generateMode, setGenerateMode] = useState<'preset' | 'reference'>('preset');
  const [referenceContent, setReferenceContent] = useState('');

  // 内容提炼生成
  const handleGenerate = async () => {
    setError('');
    setResult('');
    setCopied(false);
    
    // 检查认证和密钥
    if (!isAuthenticated()) {
      setError('请先登录');
      return;
    }
    
    if (!input.trim()) {
      setError('请输入内容链接');
      return;
    }

    // 根据模式验证必要参数
    if (generateMode === 'reference' && !referenceContent.trim()) {
      setError('请输入参考爆款内容');
      return;
    }

    setLoading(true);
    try {
      const res = await apiCall('/api/extract-and-generate', {
        method: 'POST',
        body: JSON.stringify({
          link: input,
          mode: generateMode,
          style:
            generateMode === 'preset'
              ? noteStyles.find(s => s.key === selectedStyle)?.label || ''
              : undefined,
          referenceContent: generateMode === 'reference' ? referenceContent : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.message || '生成失败，请稍后重试');
      } else {
        setResult(data.note);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 内容提炼复制
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <>
      {/* Input area */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">输入内容链接</label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="支持多条链接，支持微信公众号、知乎、头条、推特、YouTube 等各个平台..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <div className="text-xs text-gray-400 mt-1">
          粘贴链接会自动识别，如果选择手动输入，请输入有效链接后按 Enter 或逗号添加
        </div>
      </div>

      {/* 生成模式切换 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">选择生成模式</label>
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
              generateMode === 'preset'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setGenerateMode('preset')}
            disabled={loading}
          >
            <div className="font-medium mb-1">预设风格</div>
            <div className="text-sm opacity-80">从预设模板中选择风格</div>
          </button>
          <button
            className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
              generateMode === 'reference'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setGenerateMode('reference')}
            disabled={loading}
          >
            <div className="font-medium mb-1">参考爆款</div>
            <div className="text-sm opacity-80">输入参考的爆款内容</div>
          </button>
        </div>
      </div>

      {/* 根据模式显示不同内容 */}
      {generateMode === 'preset' ? (
        // 预设风格模式
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            选择预设风格
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {noteStyles.map(style => (
              <div
                key={style.key}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedStyle === style.key
                    ? 'border-primary shadow-lg bg-red-50'
                    : 'border-gray-200 bg-white hover:shadow'
                  }`}
                onClick={() => setSelectedStyle(style.key)}
              >
                <div className="font-bold mb-2">{style.label}</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {style.content.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 参考爆款模式
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            输入参考爆款内容
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-40"
            placeholder="请粘贴您想要参考的爆款小红书笔记内容..."
            value={referenceContent}
            onChange={e => setReferenceContent(e.target.value)}
            disabled={loading}
          />
          <div className="text-xs text-gray-400 mt-1">
            系统将基于您提供的参考内容风格来生成新的笔记
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="mt-10 flex justify-center">
        <button
          className="w-full max-w-xl btn-primary py-4 text-lg"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? '生成中...' : '生成小红书笔记'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && <div className="text-red-500 text-center mt-4">{error}</div>}

      {/* 生成结果 */}
      {result && (
        <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6 whitespace-pre-line">
          <div className="font-bold mb-2 text-primary flex items-center justify-between">
            生成结果
            <button
              className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
              onClick={handleCopy}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div>{result}</div>
        </div>
      )}
    </>
  );
} 