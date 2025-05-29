'use client';

import { useState } from 'react';
import { apiCall, isAuthenticated } from '../lib/auth';
import { rewriteStyles } from '../config/constants';

interface ContentRewriterProps {
  onShowLogin: () => void;
}

export default function ContentRewriter({ onShowLogin }: ContentRewriterProps) {
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteStyle, setRewriteStyle] = useState('video');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteCopied, setRewriteCopied] = useState(false);

  // 改写生成
  const handleRewrite = async () => {
    setRewriteError('');
    setRewriteResult('');
    setRewriteCopied(false);
    
    // 检查认证和密钥
    if (!isAuthenticated()) {
      setRewriteError('请先登录');
      return;
    }
    
    if (!rewriteInput.trim()) {
      setRewriteError('请输入需要改写的内容');
      return;
    }
    setRewriteLoading(true);
    try {
      const res = await apiCall('/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          text: rewriteInput,
          style: rewriteStyles.find(s => s.key === rewriteStyle)?.label || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setRewriteError(data.message || '改写失败，请稍后重试');
      } else {
        setRewriteResult(data.result);
      }
    } catch (e) {
      setRewriteError(e instanceof Error ? e.message : '改写失败，请稍后重试');
    } finally {
      setRewriteLoading(false);
    }
  };

  // 改写复制
  const handleRewriteCopy = () => {
    if (rewriteResult) {
      navigator.clipboard.writeText(rewriteResult);
      setRewriteCopied(true);
      setTimeout(() => setRewriteCopied(false), 1500);
    }
  };

  return (
    <>
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          输入需要改写的内容
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
          placeholder="请输入你想改写的内容..."
          value={rewriteInput}
          onChange={e => setRewriteInput(e.target.value)}
          disabled={rewriteLoading}
        />
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择改写风格</label>
        <div className="flex gap-4 flex-wrap">
          {rewriteStyles.map(style => (
            <button
              key={style.key}
              className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                rewriteStyle === style.key 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setRewriteStyle(style.key)}
              disabled={rewriteLoading}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          className="w-full max-w-xl btn-primary py-4 text-lg"
          onClick={handleRewrite}
          disabled={rewriteLoading}
        >
          {rewriteLoading ? '生成中...' : '生成改写内容'}
        </button>
      </div>
      
      {rewriteError && <div className="text-red-500 text-center mt-4">{rewriteError}</div>}
      
      {rewriteResult && (
        <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6 whitespace-pre-line">
          <div className="font-bold mb-2 text-primary flex items-center justify-between">
            改写结果
            <button
              className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
              onClick={handleRewriteCopy}
            >
              {rewriteCopied ? '已复制' : '复制'}
            </button>
          </div>
          <div>{rewriteResult}</div>
        </div>
      )}
    </>
  );
} 