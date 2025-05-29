'use client';

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TabNavigation from './components/TabNavigation';
import FeatureDescription from './components/FeatureDescription';
import UserStatusBar from './components/UserStatusBar';
import AuthModals from './components/AuthModals';
import ContentExtractor from './components/ContentExtractor';
import SearchGenerator from './components/SearchGenerator';
import ContentRewriter from './components/ContentRewriter';
import InfoCardGenerator from './components/InfoCardGenerator';
import CoverGenerator from './components/CoverGenerator';
import { apiCall, isAuthenticated } from './lib/auth';
import {
  tabs,
} from './config/constants';

export default function Home() {
  // ==================== 认证状态管理 ====================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showActivationManagement, setShowActivationManagement] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 检查登录状态
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        // 获取用户信息
        const { getCurrentUser } = require('./lib/auth');
        const user = getCurrentUser();
        setCurrentUser(user);
      }
    };
    
    checkAuthStatus();
  }, []);

  // 登录成功处理
  const handleLoginSuccess = () => {
    const { getCurrentUser } = require('./lib/auth');
    const user = getCurrentUser();
    setIsLoggedIn(true);
    setCurrentUser(user);
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  // 注册成功处理
  const handleRegisterSuccess = () => {
    // 注册成功后不自动登录，让用户手动登录
    setShowRegisterForm(false);
    setShowLoginForm(true); // 切换到登录模态框
  };

  // 登出处理
  const handleLogout = () => {
    const { logout } = require('./lib/auth');
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowActivationManagement(false);
  };

  // ==================== 原有状态管理 ====================
  const [activeTab, setActiveTab] = useState('extract');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 认证模态框 */}
      <AuthModals
        showLoginForm={showLoginForm}
        showRegisterForm={showRegisterForm}
        showActivationManagement={showActivationManagement}
        onCloseLogin={() => setShowLoginForm(false)}
        onCloseRegister={() => setShowRegisterForm(false)}
        onCloseActivationManagement={() => setShowActivationManagement(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToRegister={() => {
          setShowLoginForm(false);
          setShowRegisterForm(true);
        }}
        onSwitchToLogin={() => {
          setShowRegisterForm(false);
          setShowLoginForm(true);
        }}
      />

      {/* 导航栏 */}
      <Navigation />

      {/* 用户状态栏 */}
      <UserStatusBar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onShowLogin={() => setShowLoginForm(true)}
        onShowRegister={() => setShowRegisterForm(true)}
        onShowActivationManagement={() => setShowActivationManagement(true)}
        onLogout={handleLogout}
      />

      {/* 功能介绍标题 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">老旺AI - 小红书智能运营助手</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI驱动的内容创作平台，一键生成爆款小红书笔记、专业封面设计，让您的内容创作更高效
        </p>
      </div>

      {/* Tabs */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 功能说明 */}
      <FeatureDescription activeTab={activeTab} />

      {/* 内容提炼Tab */}
      {activeTab === 'extract' && (
        <ContentExtractor onShowLogin={() => setShowLoginForm(true)} />
      )}

      {/* 全网搜索Tab */}
      {activeTab === 'search' && (
        <SearchGenerator onShowLogin={() => setShowLoginForm(true)} />
      )}

      {/* 笔记改写Tab */}
      {activeTab === 'rewrite' && (
        <ContentRewriter onShowLogin={() => setShowLoginForm(true)} />
      )}

      {/* 封面生成Tab */}
      {activeTab === 'card' && (
        <CoverGenerator 
          isLoggedIn={isLoggedIn}
          onShowLogin={() => setShowLoginForm(true)}
        />
      )}

      {/* 信息卡片Tab */}
      {activeTab === 'info-card' && (
        <InfoCardGenerator onShowLogin={() => setShowLoginForm(true)} />
      )}

      {/* AI图片生成Tab */}
      {activeTab === 'image' && (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">AI图片生成</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              我们正在开发强大的AI图片生成功能，将为您提供：
            </p>
            <div className="text-left bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>文字转图片生成</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>小红书风格配图</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>多种艺术风格选择</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>高清图片输出</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              🎉 即将上线，敬请期待！
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
