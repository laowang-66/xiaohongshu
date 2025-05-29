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
import { TEMPLATE_COMPONENTS } from './components/InfoCardTemplates';
import CoverGenerator from './components/CoverGenerator';
import { ENHANCED_TEMPLATES } from './utils/enhancedTemplates';
import { apiCall, isAuthenticated } from './lib/auth';
import {
  tabs,
  cardTemplates,
} from './config/constants';

// 整合原有模板和增强模板
const allCardTemplates = [
  ...cardTemplates,
  ...ENHANCED_TEMPLATES.map(template => ({
    key: template.key,
    label: template.name,
    description: template.description,
    preview: template.preview,
    category: template.category,
    features: template.features,
    colorPalette: template.colorPalette
  }))
];

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

  // 信息卡片专用
  const [infoCardInput, setInfoCardInput] = useState('');
  const [infoCardTemplate, setInfoCardTemplate] = useState('knowledge_summary');
  const [infoCardLoading, setInfoCardLoading] = useState(false);
  const [infoCardError, setInfoCardError] = useState('');
  const [infoCardResult, setInfoCardResult] = useState<any[]>([]);
  const [infoCardCopied, setInfoCardCopied] = useState(false);

  // 信息卡片生成
  const handleInfoCardGenerate = async () => {
    setInfoCardError('');
    setInfoCardCopied(false);
    
    // 检查认证和密钥
    if (!isAuthenticated()) {
      setInfoCardError('请先登录');
      return;
    }
    
    if (!infoCardInput.trim()) {
      setInfoCardError('请输入信息卡片内容');
      return;
    }
    setInfoCardLoading(true);
    try {
      const res = await apiCall('/api/generate-info-card', {
        method: 'POST',
        body: JSON.stringify({
          content: infoCardInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setInfoCardError(data.error || '信息卡片生成失败，请稍后重试');
      } else {
        setInfoCardResult(data.cards);
      }
    } catch (e) {
      setInfoCardError(e instanceof Error ? e.message : '信息卡片生成失败，请稍后重试');
    } finally {
      setInfoCardLoading(false);
    }
  };

  // 信息卡片复制（复制为JSON数据）
  const handleInfoCardCopy = () => {
    if (infoCardResult && infoCardResult.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(infoCardResult, null, 2));
      setInfoCardCopied(true);
      setTimeout(() => setInfoCardCopied(false), 1500);
    }
  };

  // 单张卡片下载
  const handleSingleCardDownload = async (cardIndex: number) => {
    const cardElement = document.getElementById(`info-card-preview-${cardIndex}`);
    if (!cardElement) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `信息卡片_${cardIndex + 1}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
      setInfoCardError('信息卡片下载失败，请稍后重试');
    }
  };

  // 批量下载所有卡片
  const handleBatchDownload = async () => {
    if (!infoCardResult || infoCardResult.length === 0) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      for (let i = 0; i < infoCardResult.length; i++) {
        const cardElement = document.getElementById(`info-card-preview-${i}`);
        if (cardElement) {
          const canvas = await html2canvas(cardElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
          });

          const link = document.createElement('a');
          link.download = `信息卡片_${i + 1}_${new Date().getTime()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          
          // 稍作延迟，避免浏览器阻止多次下载
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      setInfoCardError('批量下载失败，请稍后重试');
    }
  };

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
        <>
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">输入信息卡片内容</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
              placeholder="请输入您想要生成信息卡片的内容..."
              value={infoCardInput}
              onChange={e => setInfoCardInput(e.target.value)}
              disabled={infoCardLoading}
            />
            <div className="text-xs text-gray-400 mt-1">
              系统将根据您输入的内容自动生成符合所选模板的信息卡片
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className="w-full max-w-xl btn-primary py-4 text-lg font-medium"
              onClick={handleInfoCardGenerate}
              disabled={infoCardLoading}
            >
              {infoCardLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI设计中...
                </span>
              ) : (
                '🎨 生成信息卡片'
              )}
            </button>
          </div>

          {infoCardError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 text-center">
                <span className="font-medium">生成失败：</span>{infoCardError}
                </div>
            </div>
          )}

          {infoCardResult && infoCardResult.length > 0 && (
            <div className="mt-10 w-full max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="font-bold mb-6 text-primary flex items-center justify-between">
                  <span className="flex items-center">
                    ✨ 您的信息卡片已生成 ({infoCardResult.length}张)
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                      onClick={handleInfoCardCopy}
                    >
                      {infoCardCopied ? '✅ 已复制' : '📋 复制数据'}
                    </button>
                    <button
                      className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1"
                      onClick={handleBatchDownload}
                    >
                      💾 批量下载所有卡片
                    </button>
                  </div>
                </div>
                
                {/* 卡片网格布局 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
                  {infoCardResult.map((card, index) => {
                    const TemplateComponent = TEMPLATE_COMPONENTS[card.type as keyof typeof TEMPLATE_COMPONENTS];
                    if (!TemplateComponent) {
                      console.error(`Unknown template type: ${card.type}`);
                      return null;
                    }
                    return (
                      <div key={index} className="flex flex-col items-center space-y-4 w-full max-w-md">
                        <div id={`info-card-preview-${index}`} className="w-full">
                          <TemplateComponent data={card} />
                        </div>
                        <button
                          className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                          onClick={() => handleSingleCardDownload(index)}
                        >
                          📥 下载第{index + 1}张卡片
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-xs text-gray-500 text-center">
                  💡 提示：点击"下载第X张卡片"可下载单张卡片，点击"批量下载所有卡片"可下载所有卡片
                </div>
              </div>
            </div>
          )}
        </>
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
