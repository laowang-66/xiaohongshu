'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { checkActivationCode } from '../lib/auth';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivationSuccess: () => void;
}

export default function ActivationModal({ isOpen, onClose, onActivationSuccess }: ActivationModalProps) {
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode.trim()) {
      setError('请输入激活码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await checkActivationCode(activationCode.trim());
      
      if (!result.success) {
        throw new Error(result.message || '激活码验证失败');
      }

      // 激活成功
      setActivationCode('');
      onActivationSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '激活码验证失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            激活激活码
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-2">
              激活码
            </label>
            <input
              type="text"
              id="activationCode"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入您的激活码"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !activationCode.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '验证中...' : '激活激活码'}
          </button>

          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>• 激活码激活后可使用30天</p>
            <p>• 每个激活码包含1000次调用次数</p>
            <p>• 激活码过期后需要重新激活</p>
          </div>
        </form>
      </div>
    </div>
  );
} 