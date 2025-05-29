'use client';

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TabNavigation from './components/TabNavigation';
import FeatureDescription from './components/FeatureDescription';
import UserStatusBar from './components/UserStatusBar';
import AuthModals from './components/AuthModals';
import ContentExtractor from './components/ContentExtractor';
import { TEMPLATE_COMPONENTS } from './components/InfoCardTemplates';
import CoverGenerator from './components/CoverGenerator';
import { ENHANCED_TEMPLATES } from './utils/enhancedTemplates';
import { apiCall, isAuthenticated } from './lib/auth';
import {
  tabs,
  rewriteStyles,
  searchTypes,
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

  // 全网搜索专用
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('google');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchNote, setSearchNote] = useState('');
  const [searchNoteSource, setSearchNoteSource] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchCopied, setSearchCopied] = useState(false);

  // 单个URL生成笔记的状态
  const [urlGeneratingIndex, setUrlGeneratingIndex] = useState<number | null>(null);

  // 改写专用
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteStyle, setRewriteStyle] = useState('video');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteCopied, setRewriteCopied] = useState(false);

  // 信息卡片专用
  const [infoCardInput, setInfoCardInput] = useState('');
  const [infoCardTemplate, setInfoCardTemplate] = useState('knowledge_summary');
  const [infoCardLoading, setInfoCardLoading] = useState(false);
  const [infoCardError, setInfoCardError] = useState('');
  const [infoCardResult, setInfoCardResult] = useState<any[]>([]);
  const [infoCardCopied, setInfoCardCopied] = useState(false);

  // 全网搜索生成
  const handleSearch = async () => {
    setSearchError('');
    setSearchResult([]);
    setSearchNote('');
    setSearchNoteSource(null);
    setSearchCopied(false);
    
    // 检查认证和密钥
    if (!isAuthenticated()) {
      setSearchError('请先登录');
      return;
    }
    
    if (!searchInput.trim()) {
      setSearchError('请输入搜索关键词');
      return;
    }
    setSearchLoading(true);
    try {
      const res = await apiCall('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          query: searchInput,
          searchType: searchType,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSearchError(data.message || '搜索失败，请稍后重试');
      } else {
        setSearchNote(data.note || '');
        setSearchResult(data.searchResults || []);
        setSearchNoteSource({
          type: 'search',
          searchType: data.searchParameters?.searchTypeName || 'Google',
        });
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : '搜索失败，请稍后重试');
    } finally {
      setSearchLoading(false);
    }
  };

  // 全网搜索复制
  const handleSearchCopy = () => {
    if (searchNote) {
      navigator.clipboard.writeText(searchNote);
      setSearchCopied(true);
      setTimeout(() => setSearchCopied(false), 1500);
    }
  };

  // 基于单个URL生成笔记
  const handleGenerateFromUrl = async (item: any, index: number) => {
    setUrlGeneratingIndex(index);
    setSearchError('');

    // 检查认证和密钥
    if (!isAuthenticated()) {
      setSearchError('请先登录');
      return;
    }

    try {
      const res = await apiCall('/api/generate-from-url', {
        method: 'POST',
        body: JSON.stringify({
          url: item.link,
          title: item.title,
          searchType: searchType,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSearchError(data.message || '生成失败，请稍后重试');
      } else {
        // 替换原来的笔记
        setSearchNote(data.note);
        setSearchNoteSource({
          type: 'url',
          url: data.sourceUrl,
          title: data.sourceTitle,
          searchType: data.sourceType,
        });
        setSearchCopied(false);
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : '生成失败，请稍后重试');
    } finally {
      setUrlGeneratingIndex(null);
    }
  };

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
        <>
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择搜索类型</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {searchTypes.map(type => (
                <button
                  key={type.key}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    searchType === type.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSearchType(type.key)}
                  disabled={searchLoading}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入搜索关键词
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="请输入你想搜索的内容关键词..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          <div className="mt-6 flex justify-center">
            <button
              className="w-full max-w-xl btn-primary py-4 text-lg"
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? '搜索中...' : `搜索并生成小红书笔记`}
            </button>
          </div>
          {searchError && <div className="text-red-500 text-center mt-4">{searchError}</div>}
          {searchNote && (
            <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
              <div className="font-bold mb-2 text-primary flex items-center justify-between">
                生成的小红书笔记
                <button
                  className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                  onClick={handleSearchCopy}
                >
                  {searchCopied ? '已复制' : '复制'}
                </button>
              </div>

              {/* 来源信息 */}
              {searchNoteSource && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
                  <div className="text-xs text-gray-600">
                    {searchNoteSource.type === 'search' ? (
                      <span>
                        📊 基于{' '}
                        <span className="font-medium">{searchNoteSource.searchType}</span>{' '}
                        综合搜索结果生成
                      </span>
                    ) : (
                      <span>
                        📄 基于文章：
                        <a
                          href={searchNoteSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline ml-1"
                        >
                          {searchNoteSource.title}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="whitespace-pre-line">{searchNote}</div>
            </div>
          )}
          {searchResult.length > 0 && (
            <div className="mt-6 max-w-2xl mx-auto bg-gray-50 rounded-xl p-6">
              <div className="font-bold mb-2 text-gray-700">参考搜索结果</div>
              <ul className="space-y-4">
                {searchResult.map((item, idx) => (
                  <li key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-800 mb-2">{item.title}</div>
                    <div className="text-gray-600 text-sm mb-3">{item.snippet}</div>
                    <div className="flex items-center justify-between">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-xs hover:text-primary-dark"
                      >
                        {item.link}
                      </a>
                      <button
                        onClick={() => handleGenerateFromUrl(item, idx)}
                        disabled={urlGeneratingIndex === idx}
                        className="ml-4 px-3 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {urlGeneratingIndex === idx ? '生成中...' : '基于此内容生成笔记'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* 笔记改写Tab */}
      {activeTab === 'rewrite' && (
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
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${rewriteStyle === style.key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
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
