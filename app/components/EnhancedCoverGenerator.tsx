'use client';

import { useState, useEffect } from 'react';

// 🆕 内容质量评分系统
interface ContentQuality {
  score: number;
  improvements: string[];
  strengths: string[];
  optimizationSuggestions: string[];
}

// 🆕 创作流程状态
type CreationStep = 'platform' | 'content' | 'template' | 'preview' | 'result';

interface EnhancedCoverGeneratorProps {
  isLoggedIn: boolean;
  onShowLogin: () => void;
}

export default function EnhancedCoverGenerator({ isLoggedIn, onShowLogin }: EnhancedCoverGeneratorProps) {
  // 🎯 创作流程状态管理
  const [currentStep, setCurrentStep] = useState<CreationStep>('platform');
  const [completedSteps, setCompletedSteps] = useState<Set<CreationStep>>(new Set());
  
  // 基础状态
  const [cardInput, setCardInput] = useState('');
  const [cardSize, setCardSize] = useState('xiaohongshu');
  const [contentQuality, setContentQuality] = useState<ContentQuality | null>(null);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const [autoOptimizeMode, setAutoOptimizeMode] = useState(false);

  // 🆕 内容质量评分系统 - 三维度改进的核心
  const analyzeContentQuality = (content: string, platform: string): ContentQuality => {
    let score = 0;
    const improvements: string[] = [];
    const strengths: string[] = [];
    const optimizationSuggestions: string[] = [];

    // 1️⃣ 内容维度评分
    if (content.length > 10) {
      score += 20;
      strengths.push('✅ 内容长度适中');
    } else {
      improvements.push('🔧 内容过短，建议增加描述');
    }

    // 2️⃣ 平台特性适配评分
    const platformRules = {
      xiaohongshu: {
        keywords: ['种草', '实测', '推荐', '分享', '干货', '攻略', '必看', '真实', '体验', '好用'],
        maxLength: 50,
        tone: '活泼友好'
      },
      video: {
        keywords: ['震惊', '必看', '揭秘', '方法', '技巧', '绝了', '超级', '爆料'],
        maxLength: 30,
        tone: '冲击震撼'
      },
      wechat: {
        keywords: ['分析', '深度', '解读', '专业', '权威', '洞察', '思考', '价值'],
        maxLength: 80,
        tone: '专业权威'
      }
    };

    const rules = platformRules[platform as keyof typeof platformRules];
    if (rules) {
      const matchedKeywords = rules.keywords.filter(keyword => content.includes(keyword));
      if (matchedKeywords.length > 0) {
        score += matchedKeywords.length * 15;
        strengths.push(`✅ 包含${platform}优质关键词: ${matchedKeywords.join('、')}`);
      } else {
        improvements.push(`🎯 建议添加${platform}相关关键词`);
        optimizationSuggestions.push(`💡 推荐关键词：${rules.keywords.slice(0, 3).join('、')}`);
      }

      if (content.length <= rules.maxLength) {
        score += 15;
        strengths.push(`✅ 文案长度符合${rules.tone}风格`);
      } else {
        improvements.push(`📏 文案略长，建议控制在${rules.maxLength}字以内`);
      }
    }

    // 3️⃣ 吸引力元素评分
    const hasNumbers = /\d+/.test(content);
    if (hasNumbers) {
      score += 10;
      strengths.push('✅ 包含具体数字，增强可信度');
    } else {
      optimizationSuggestions.push('💡 添加具体数字可提升吸引力');
    }

    const emotionalWords = ['必看', '震撼', '实用', '干货', '秘诀', '技巧', '方法', '攻略', '爆款', '神器'];
    const hasEmotionalWords = emotionalWords.some(word => content.includes(word));
    if (hasEmotionalWords) {
      score += 10;
      strengths.push('✅ 包含情感触发词汇');
    } else {
      optimizationSuggestions.push('💡 添加情感词汇可增强吸引力');
    }

    // 确保分数在0-100范围内
    score = Math.min(100, Math.max(0, score));

    return { score, improvements, strengths, optimizationSuggestions };
  };

  // 🆕 更新流程状态
  const updateCreationStep = (step: CreationStep) => {
    setCurrentStep(step);
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  // 🆕 一键优化功能 - 流程体验改进的核心
  const handleOneClickOptimize = async () => {
    if (!cardInput.trim()) return;
    
    setAutoOptimizeMode(true);
    
    try {
      // 1. 内容质量分析
      const quality = analyzeContentQuality(cardInput, cardSize);
      setContentQuality(quality);
      
      // 2. 自动跳转到合适的步骤
      if (quality.score >= 80) {
        updateCreationStep('template');
        setTimeout(() => updateCreationStep('preview'), 500);
      } else {
        setShowQualityPanel(true);
        updateCreationStep('content');
      }
      
    } catch (error) {
      console.error('一键优化失败:', error);
    } finally {
      setAutoOptimizeMode(false);
    }
  };

  // 监听输入变化，实时评分
  useEffect(() => {
    if (cardInput.trim().length > 5) {
      const quality = analyzeContentQuality(cardInput, cardSize);
      setContentQuality(quality);
      
      // 自动更新步骤
      if (quality.score >= 70) {
        updateCreationStep('template');
      }
    } else {
      setContentQuality(null);
    }
  }, [cardInput, cardSize]);

  return (
    <div className="space-y-8">
      {/* 🆕 创作流程进度条 - 视觉改进的核心 */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            AI智能封面创作流程
          </h2>
          <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
            {completedSteps.size}/5 步骤完成
          </div>
        </div>
        
        {/* 🎯 视觉引导流程指示器 */}
        <div className="relative">
          <div className="flex items-center justify-between relative z-10">
            {[
              { key: 'platform', label: '选择平台', icon: '📱', desc: '确定发布渠道' },
              { key: 'content', label: '输入内容', icon: '✏️', desc: 'AI智能分析' },
              { key: 'template', label: '选择模板', icon: '🎨', desc: '匹配设计风格' },
              { key: 'preview', label: '预览调整', icon: '👀', desc: '实时编辑优化' },
              { key: 'result', label: '生成完成', icon: '✨', desc: '导出使用' }
            ].map((step, index) => {
              const isCompleted = completedSteps.has(step.key as CreationStep);
              const isCurrent = currentStep === step.key;
              
              return (
                <div key={step.key} className="flex flex-col items-center group">
                  {/* 步骤圆圈 */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-110' 
                      : isCurrent 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl ring-4 ring-blue-200 animate-pulse transform scale-110' 
                      : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                  }`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  
                  {/* 步骤信息 */}
                  <div className="mt-3 text-center">
                    <div className={`font-bold text-sm ${
                      isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 max-w-20 leading-tight">
                      {step.desc}
                    </div>
                  </div>
                  
                  {/* 进度连接线 */}
                  {index < 4 && (
                    <div className={`absolute top-8 w-20 h-1 transition-all duration-500 ${
                      completedSteps.has(['platform', 'content', 'template', 'preview'][index] as CreationStep)
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : 'bg-gray-200'
                    }`} style={{ left: `${20 + index * 24}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🆕 智能操作建议 */}
        <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="font-medium text-gray-800">
                {currentStep === 'platform' && '请先选择发布平台，系统将智能匹配设计风格'}
                {currentStep === 'content' && '输入您的内容，AI将实时评分并提供优化建议'}
                {currentStep === 'template' && '根据内容特点，我们为您推荐了最适合的模板'}
                {currentStep === 'preview' && '可点击封面文字进行编辑，预览最终效果'}
                {currentStep === 'result' && '封面生成完成！可以下载或复制代码使用'}
              </div>
              <div className="text-sm text-gray-500">
                {currentStep === 'platform' && '💡 不同平台有不同的设计规范和用户偏好'}
                {currentStep === 'content' && '💡 质量评分高于70分将自动推荐最佳模板'}
                {currentStep === 'template' && '💡 可尝试不同风格，实时预览效果'}
                {currentStep === 'preview' && '💡 支持文字编辑、颜色调整等个性化定制'}
                {currentStep === 'result' && '💡 生成的封面已针对平台特性优化'}
              </div>
            </div>
          </div>
          
          {/* 一键优化按钮 */}
          {cardInput.trim().length > 5 && currentStep !== 'result' && (
            <button
              onClick={handleOneClickOptimize}
              disabled={autoOptimizeMode}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                autoOptimizeMode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {autoOptimizeMode ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  AI优化中...
                </>
              ) : (
                <>
                  🚀 一键AI优化
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    省时80%
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 🆕 内容质量评分面板 - 内容改进的核心 */}
      {contentQuality && showQualityPanel && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              内容质量智能分析
            </h3>
            <button
              onClick={() => setShowQualityPanel(false)}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 质量评分可视化 */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={contentQuality.score >= 80 ? '#10B981' : contentQuality.score >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={`${contentQuality.score}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{contentQuality.score}</span>
                  <span className="text-xs text-gray-500">分</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className={`text-xl font-bold mb-2 ${
                contentQuality.score >= 80 ? 'text-green-600' : 
                contentQuality.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {contentQuality.score >= 80 ? '🎉 内容优秀！' : 
                 contentQuality.score >= 60 ? '👍 内容良好，有优化空间' : '📈 内容需要优化'}
              </div>
              <div className="text-gray-600 mb-4">
                基于{cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}平台特性的专业评分
              </div>
              
              {/* 分数等级指示器 */}
              <div className="flex items-center gap-1 text-xs">
                <div className={`px-2 py-1 rounded ${contentQuality.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  80-100 优秀
                </div>
                <div className={`px-2 py-1 rounded ${contentQuality.score >= 60 && contentQuality.score < 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  60-79 良好
                </div>
                <div className={`px-2 py-1 rounded ${contentQuality.score < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                  0-59 待优化
                </div>
              </div>
            </div>
          </div>

          {/* 详细分析结果 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 优点展示 */}
            {contentQuality.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  内容优点
                </h4>
                <ul className="space-y-2">
                  {contentQuality.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1 flex-shrink-0">▪</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改进建议 */}
            {(contentQuality.improvements.length > 0 || contentQuality.optimizationSuggestions.length > 0) && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  优化建议
                </h4>
                <div className="space-y-3">
                  {contentQuality.improvements.map((improvement, index) => (
                    <div key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1 flex-shrink-0">▪</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                  {contentQuality.optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm text-blue-600 flex items-start gap-2 bg-blue-100 rounded-lg p-2">
                      <span className="text-blue-500 mt-1 flex-shrink-0">💡</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex gap-3 justify-center">
            {contentQuality.score < 70 && (
              <button
                onClick={() => {/* 触发内容优化 */}}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🤖 AI自动优化
              </button>
            )}
            <button
              onClick={() => setShowQualityPanel(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              继续创作
            </button>
          </div>
        </div>
      )}

      {/* 内容输入区域 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border">
        <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
          <span className="text-2xl">✏️</span>
          输入封面文案内容
          {contentQuality && (
            <span className={`text-sm px-3 py-1 rounded-full ${
              contentQuality.score >= 80 ? 'bg-green-100 text-green-700' :
              contentQuality.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              质量评分: {contentQuality.score}/100
            </span>
          )}
        </label>
        
        <textarea
          className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-40 text-lg resize-none"
          placeholder="请输入您的封面文案内容，AI将实时分析并提供优化建议..."
          value={cardInput}
          onChange={e => setCardInput(e.target.value)}
        />
        
        {/* 实时提示 */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            💡 系统将根据平台特性自动优化您的内容
          </div>
          <div className={`font-medium ${
            cardInput.length > 50 ? 'text-orange-600' : 'text-gray-400'
          }`}>
            {cardInput.length} 字符
          </div>
        </div>
      </div>

      {/* 平台选择区域 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border">
        <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
          <span className="text-2xl">📱</span>
          选择发布平台
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'xiaohongshu', label: '小红书', icon: '📱', ratio: '3:4', description: '种草分享，活泼友好' },
            { key: 'video', label: '短视频', icon: '📺', ratio: '9:16', description: '冲击视觉，快速吸睛' },
            { key: 'wechat', label: '公众号', icon: '📰', ratio: '3.35:1', description: '专业权威，深度内容' }
          ].map(platform => (
            <div
              key={platform.key}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                cardSize === platform.key
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => {
                setCardSize(platform.key);
                updateCreationStep('content');
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{platform.icon}</div>
                <div className="font-bold text-gray-800 mb-1">{platform.label}</div>
                <div className="text-sm text-blue-600 font-medium mb-2">{platform.ratio}</div>
                <p className="text-xs text-gray-600">{platform.description}</p>
                {cardSize === platform.key && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✅ 已选择
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 