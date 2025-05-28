'use client';

import { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../lib/hooks/useAuth';
import AuthModal from './AuthModal';
import ActivationModal from './ActivationModal';

export default function UserStatus() {
  const { user, isActivated, getRemainingDays, getRemainingCalls, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleAuthSuccess = () => {
    // useAuth hook会自动更新状态
  };

  const handleActivationSuccess = () => {
    // useAuth hook会自动更新状态
  };

  const remainingCalls = getRemainingCalls();
  const daysLeft = getRemainingDays();
  const isLoggedIn = !!user;
  const activationValid = isActivated();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 登录状态 */}
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">
              {isLoggedIn ? '已登录' : '未登录'}
            </span>
            {isLoggedIn ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                在线
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                离线
              </span>
            )}
          </div>

          {/* 激活码状态 */}
          {isLoggedIn && (
            <div className="flex items-center space-x-2">
              <KeyIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">
                {activationValid ? '激活码有效' : '激活码无效'}
              </span>
              {activationValid ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {remainingCalls} 次剩余
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  需要激活
                </span>
              )}
            </div>
          )}

          {/* 过期时间 */}
          {isLoggedIn && activationValid && (
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {daysLeft} 天后过期
              </span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          {!isLoggedIn ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              登录/注册
            </button>
          ) : (
            <>
              {!activationValid && (
                <button
                  onClick={() => setShowActivationModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  激活激活码
                </button>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                登出
              </button>
            </>
          )}
        </div>
      </div>

      {/* 详细信息 */}
      {isLoggedIn && activationValid && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">剩余调用:</span>
              <span className="ml-1 font-medium">{remainingCalls}</span>
            </div>
            <div>
              <span className="text-gray-500">剩余天数:</span>
              <span className="ml-1 font-medium">{daysLeft} 天</span>
            </div>
            <div>
              <span className="text-gray-500">过期时间:</span>
              <span className="ml-1 font-medium">
                {daysLeft > 0 ? new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString() : '已过期'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onActivationSuccess={handleActivationSuccess}
      />
    </div>
  );
} 