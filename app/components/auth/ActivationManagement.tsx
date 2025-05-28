'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { formatActivationCode, formatDaysLeft, formatCallsCount } from '../../lib/auth';

export default function ActivationManagement() {
  const { 
    activationInfo,
    localActivationState,
    isActivated, 
    useActivationCode, 
    refreshActivationStatus,
    checkActivationCode,
    getRemainingDays,
    getRemainingCalls,
    loading, 
    error, 
    clearError 
  } = useAuth();
  
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activateError, setActivateError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeInfo, setCodeInfo] = useState<any>(null);

  // 检查激活码信息
  const handleCheckCode = async (code: string) => {
    if (!code.trim()) {
      setCodeInfo(null);
      return;
    }

    setCheckingCode(true);
    try {
      const result = await checkActivationCode(code.trim());
      if (result.success && result.codeInfo) {
        setCodeInfo(result.codeInfo);
      } else {
        setCodeInfo(null);
      }
    } catch (error) {
      console.error('查询激活码失败:', error);
      setCodeInfo(null);
    } finally {
      setCheckingCode(false);
    }
  };

  // 防抖处理激活码输入
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCheckCode(activationCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [activationCode]);

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError('');
    clearError();

    if (!activationCode.trim()) {
      setActivateError('请输入激活码');
      return;
    }

    if (codeInfo && !codeInfo.isAvailable) {
      setActivateError('此激活码不可用');
      return;
    }

    try {
      const result = await useActivationCode(activationCode.trim());
      
      if (result.success) {
        setActivationCode('');
        setShowActivateForm(false);
        setCodeInfo(null);
        // 刷新激活状态
        await refreshActivationStatus();
      } else {
        setActivateError(result.message);
      }
    } catch (error) {
      console.error('使用激活码失败:', error);
    }
  };

  const getActivationStatusColor = () => {
    if (!activationInfo) return 'text-gray-500';
    if (!isActivated()) return 'text-red-500';
    if (getRemainingCalls() < 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getActivationStatusText = () => {
    if (!activationInfo) return '未激活';
    if (!isActivated()) return '已过期';
    return '已激活';
  };

  const getCodeStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">可用</span>;
      case 'used':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">已使用</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">已过期</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">未知</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">激活码管理</h2>
        <button
          onClick={() => refreshActivationStatus()}
          disabled={loading}
          className="text-sm text-pink-600 hover:text-pink-500 disabled:opacity-50"
        >
          刷新状态
        </button>
      </div>

      {/* 当前激活状态 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">当前激活状态</h3>
        
        {activationInfo ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">激活码:</span>
              <span className="text-sm font-mono text-gray-900">
                {formatActivationCode(activationInfo.activationCode)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">状态:</span>
              <span className={`text-sm font-medium ${getActivationStatusColor()}`}>
                {getActivationStatusText()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">剩余调用次数:</span>
              <span className="text-sm text-gray-900">
                {formatCallsCount(getRemainingCalls())} / 1000次
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">剩余天数:</span>
              <span className="text-sm text-gray-900">
                {formatDaysLeft(getRemainingDays())}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">激活时间:</span>
              <span className="text-sm text-gray-900">
                {new Date(activationInfo.activatedAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">过期时间:</span>
              <span className="text-sm text-gray-900">
                {new Date(activationInfo.expiresAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {/* 进度条 */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>使用进度</span>
                <span>{Math.round(((1000 - getRemainingCalls()) / 1000) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, ((1000 - getRemainingCalls()) / 1000) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              您还没有激活账户，请使用激活码激活后使用平台功能。
            </p>
          </div>
        )}
      </div>

      {/* 使用激活码 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">使用激活码</h3>
          <button
            onClick={() => setShowActivateForm(!showActivateForm)}
            className="text-sm bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700 transition-colors"
          >
            {showActivateForm ? '取消' : '使用激活码'}
          </button>
        </div>

        {showActivateForm && (
          <form onSubmit={handleActivateCode} className="space-y-4">
            <div>
              <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-1">
                激活码
              </label>
              <input
                id="activationCode"
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setActivateError('');
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  activateError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入激活码，例如：XHS-ABCD1234-1234567890-0"
                disabled={loading}
              />
              {activateError && (
                <p className="mt-1 text-sm text-red-600">{activateError}</p>
              )}
            </div>

            {/* 激活码信息预览 */}
            {activationCode && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">激活码信息</h4>
                {checkingCode ? (
                  <p className="text-sm text-gray-600">查询中...</p>
                ) : codeInfo ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">状态:</span>
                      {getCodeStatusBadge(codeInfo.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">描述:</span>
                      <span className="text-sm text-gray-900">{codeInfo.description}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">过期时间:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(codeInfo.expiresAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {codeInfo.usedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">使用者:</span>
                        <span className="text-sm text-gray-900 font-mono">{codeInfo.usedBy}</span>
                      </div>
                    )}
                    {codeInfo.usedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">使用时间:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(codeInfo.usedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">激活码不存在或格式错误</p>
                )}
              </div>
            )}

            {/* 全局错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !codeInfo?.isAvailable}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '激活中...' : '激活账户'}
            </button>
          </form>
        )}
      </div>

      {/* 激活说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">激活说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 每个激活码有效期为30天</li>
          <li>• 激活后可使用1000次API调用</li>
          <li>• 激活码只能使用一次，不能重复激活</li>
          <li>• 激活状态和剩余次数存储在本地，重新登录时会同步</li>
        </ul>
      </div>
    </div>
  );
} 