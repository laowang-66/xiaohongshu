'use client';

import React, { useState, useEffect, useRef } from 'react';
import { coverSizes, cardTemplates, exampleTexts } from '../config/constants';
import { ENHANCED_TEMPLATES } from '../utils/enhancedTemplates';
import { analyzeContentAndRecommend } from '../utils/aiContentAnalyzer';
import { apiCall, isAuthenticated } from '../lib/auth';
import CoverTemplatePreview from './CoverTemplatePreview';
import EditableCard from './EditableCard';
import CoverContentExtractor from './ContentOptimizer';
import { 
  UNIFIED_TEMPLATE_CONFIG, 
  getActualTemplateKey, 
  getPlatformRecommendedTemplates,
  sortTemplatesByPlatform 
} from '../config/templateMapping';

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
    // 统一colorPalette格式
    colorPalette: Array.isArray(template.colorPalette) 
      ? template.colorPalette 
      : [template.colorPalette.primary, template.colorPalette.secondary, template.colorPalette.accent || '#ffffff']
  }))
];

interface CoverGeneratorProps {
  isLoggedIn: boolean;
  onShowLogin: () => void;
}

export default function CoverGenerator({ isLoggedIn, onShowLogin }: CoverGeneratorProps) {
  // 封面生成专用状态
  const [cardInput, setCardInput] = useState('');
  const [cardTemplate, setCardTemplate] = useState('scene_photo_xiaohongshu');
  const [cardSize, setCardSize] = useState('xiaohongshu');
  const [cardResult, setCardResult] = useState('');
  const [cardResultInfo, setCardResultInfo] = useState<any>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardCopied, setCardCopied] = useState(false);
  const [editedCardContent, setEditedCardContent] = useState('');
  
  // 内容优化专用
  const [optimizedContent, setOptimizedContent] = useState('');
  const [showContentOptimizer, setShowContentOptimizer] = useState(false);
  
  // AI智能推荐
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // 使用统一的模板配置
  const allCardTemplates = UNIFIED_TEMPLATE_CONFIG;

  // AI智能分析和推荐 - 增强版本
  const handleAiAnalysis = () => {
    if (!cardInput.trim()) return;
    
    const recommendation = analyzeContentAndRecommend(cardInput, cardSize);
    setAiRecommendation(recommendation);
    setShowAiSuggestion(true);
    
    // 自动应用推荐的模板
    if (recommendation.confidence > 0.6) {
      setCardTemplate(recommendation.templateKey);
      // 清空之前的生成结果，避免显示不一致
      setCardResult('');
      setCardResultInfo(null);
      setCardError('');
      setEditedCardContent('');
    }
  };

  // 智能平台模板推荐 - 使用新的配置
  const getRecommendedTemplatesForPlatform = (platform: string) => {
    return getPlatformRecommendedTemplates(platform);
  };

  // 根据平台获取排序后的模板列表
  const getSortedTemplates = () => {
    return sortTemplatesByPlatform(cardSize);
  };

  // 处理平台切换时的智能推荐
  const handlePlatformChange = (newPlatform: string) => {
    setCardSize(newPlatform);
    
    // 清空之前的生成结果，避免平台切换后显示不一致
    setCardResult('');
    setCardResultInfo(null);
    setCardError('');
    setEditedCardContent('');
    
    // 自动推荐适合的模板
    const recommendedTemplates = getRecommendedTemplatesForPlatform(newPlatform);
    if (recommendedTemplates.length > 0 && !recommendedTemplates.includes(cardTemplate)) {
      setCardTemplate(recommendedTemplates[0]);
    }
    
    // 如果有输入内容，重新分析推荐
    if (cardInput.trim()) {
      setTimeout(handleAiAnalysis, 100);
    }
  };

  // 处理内容优化选择
  const handleOptimizedContentSelect = (content: string) => {
    setOptimizedContent(content);
    setCardInput(content); // 更新输入框内容
  };

  // 处理内容优化结果
  const handleOptimizationResult = (result: any) => {
    // 处理封面内容提取结果
    console.log('封面内容提取结果:', result);
  };

  // 处理文案输入变化
  const handleCardInputChange = (newInput: string) => {
    setCardInput(newInput);
    
    // 显示/隐藏内容优化器
    const shouldShow = newInput.trim().length > 5;
    setShowContentOptimizer(shouldShow);
    
    // 如果用户手动修改了输入，清除已选择的优化内容
    if (newInput !== optimizedContent) {
      setOptimizedContent('');
    }
  };
  
  // 监听文案输入变化，自动进行AI分析
  useEffect(() => {
    if (cardInput.trim().length > 5) {
      const timer = setTimeout(() => {
        handleAiAnalysis();
      }, 1000); // 延迟1秒执行，避免频繁调用
      
      return () => clearTimeout(timer);
    } else {
      setShowAiSuggestion(false);
    }
  }, [cardInput, cardSize]);

  // 封面生成
  const handleCardGenerate = async () => {
    // 检查登录状态
    if (!isLoggedIn) {
      setCardError('请先登录后使用此功能');
      onShowLogin();
      return;
    }

    if (cardLoading) {
      setCardError('正在生成中，请稍候...');
      return;
    }

    // 使用优化后的内容或原始输入
    const contentToUse = optimizedContent || cardInput;
    
    if (!contentToUse.trim()) {
      setCardError('请输入要生成封面的内容');
      return;
    }

    setCardLoading(true);
    setCardError('');
    setCardResult('');
    setCardResultInfo(null);

    // ⚡ 智能预估生成时间
    const hasNumbers = /\d+/.test(contentToUse);
    const isLongText = contentToUse.length > 30;
    const hasEmojis = contentToUse.includes('😀') || contentToUse.includes('🎉') || contentToUse.includes('❤️');
    
    // ⚡ 性能优化：智能进度提示系统
    const estimatedTime = Math.max(8, Math.min(15, contentToUse.length * 0.3)); // 智能预估时间 8-15秒
    let progressInterval: NodeJS.Timeout;
    let currentProgress = 0;
    let elapsedTime = 0;
    
    // 动态进度消息（基于内容特征）
    const progressMessages = [
      '🎨 正在分析内容特征...',
      hasNumbers ? '📊 检测到数据元素，优化数字展示...' : '✏️ 分析文本结构...',
      isLongText ? '📝 内容较多，精心设计布局...' : '🎯 快速生成设计方案...',
      hasEmojis ? '😊 处理表情符号，优化视觉效果...' : '🌈 选择最佳配色方案...',
      '✨ 最后的细节优化...',
      '🚀 即将完成...'
    ];
    
    // ⚡ 支持取消操作
    let abortController = new AbortController();
    
    const updateProgress = () => {
      elapsedTime += 2;
      const progressPercent = Math.min(95, (elapsedTime / estimatedTime) * 100);
      
      if (currentProgress < progressMessages.length - 1) {
        const message = progressMessages[currentProgress];
        const timeLeft = Math.max(0, estimatedTime - elapsedTime);
        setCardError(`${message} (${Math.round(progressPercent)}%, 预计还需${Math.round(timeLeft)}秒)`);
        currentProgress++;
      } else {
        // 后期阶段，显示更精确的进度
        setCardError(`🔄 AI处理中... (${Math.round(progressPercent)}%)`);
      }
    };
    
    // 每2秒更新一次进度
    progressInterval = setInterval(updateProgress, 2000);
    setCardError(progressMessages[0] + ` (预计${Math.round(estimatedTime)}秒)`);
    
    // ⚡ 智能超时处理 - 基于内容复杂度
    const timeoutDuration = Math.max(120000, estimatedTime * 1000 + 10000); // 预估时间 + 10秒缓冲，最少2分钟
    const timeoutId = setTimeout(() => {
      clearInterval(progressInterval);
      abortController.abort();
      setCardError('⏰ 生成超时，请尝试简化内容或重试');
      setCardLoading(false);
    }, timeoutDuration);
    
    try {
      const startTime = Date.now();
      
      const res = await fetch('/api/generate-card', {
        method: 'POST',
        body: JSON.stringify({
          text: contentToUse,
          template: getActualTemplateKey(cardTemplate),
          size: cardSize,
        }),
        signal: abortController.signal, // ⚡ 支持取消请求
      });
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);
      
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        // ⚡ 智能错误分析和建议
        let errorMessage = data.error || '封面生成失败，请稍后重试';
        let suggestion = '';
        
        if (errorMessage.includes('超时')) {
          errorMessage = '⏰ AI处理超时';
          suggestion = contentToUse.length > 50 ? '建议简化文案内容' : '请稍后重试';
        } else if (errorMessage.includes('API') || errorMessage.includes('调用失败')) {
          errorMessage = '🔧 服务暂时不可用';
          suggestion = '请稍后重试，或选择其他模板';
        } else if (errorMessage.includes('模板') || errorMessage.includes('template')) {
          errorMessage = '🎨 当前模板不可用';
          suggestion = '请选择其他模板重试';
        } else if (errorMessage.includes('内容') || errorMessage.includes('text')) {
          errorMessage = '📝 内容格式问题';
          suggestion = '请检查输入内容格式';
        }
        
        setCardError(`${errorMessage}${suggestion ? ` - ${suggestion}` : ''}`);
        
        // ⚡ 降级处理：如果有降级HTML，仍然显示结果
        if (data.html) {
          setCardResult(data.html);
          setCardResultInfo({
            ...data,
            coverSize: data.sizeConfig?.name || '未知尺寸',
            template: data.templateName || '未知模板',
            dimensions: {
              width: data.sizeConfig?.width || 900,
              height: data.sizeConfig?.height || 1200,
              ratio: data.sizeConfig?.ratio || '3:4',
              name: data.sizeConfig?.name || '封面'
            }
          });
          setCardError(`⚠️ ${errorMessage}（已生成降级版本）`);
        }
      } else {
        // ⚡ 成功处理
        setCardResult(data.html);
        setCardResultInfo({
          ...data,
          coverSize: data.sizeConfig?.name || '未知尺寸',
          template: data.templateName || '未知模板',
          dimensions: {
            width: data.sizeConfig?.width || 900,
            height: data.sizeConfig?.height || 1200,
            ratio: data.sizeConfig?.ratio || '3:4',
            name: data.sizeConfig?.name || '封面'
          }
        });
        
        // ⚡ 智能成功提示
        const speedLevel = parseFloat(duration) < 8 ? '⚡超快' : 
                          parseFloat(duration) < 12 ? '🚀很快' : 
                          parseFloat(duration) < 20 ? '✅正常' : '⏰较慢';
        
        const optimizedTip = data.optimized ? '（已优化）' : '';
        const cachedTip = data.cached ? '（缓存加速）' : '';
        const pregenTip = data.pregenerated ? '（预生成）' : '';
        
        setCardError(`✅ 封面生成成功！${speedLevel} ${duration}秒 ${optimizedTip}${cachedTip}${pregenTip}`);
        setTimeout(() => setCardError(''), 4000);
        
        // ⚡ 性能统计（开发环境）
        if (data.debug && process.env.NODE_ENV === 'development') {
          console.log('🔍 生成性能统计:', {
            实际耗时: `${duration}秒`,
            预估耗时: `${estimatedTime}秒`,
            预估准确度: `${Math.abs(parseFloat(duration) - estimatedTime) < 3 ? '✅准确' : '⚠️偏差较大'}`,
            原始长度: data.debug.originalLength,
            处理后长度: data.debug.cleanedLength,
            验证通过: data.debug.validationPassed,
            错误信息: data.debug.errors
          });
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      console.error('封面生成错误:', e);
      
      // ⚡ 智能错误处理
      let errorMessage = '封面生成失败，请稍后重试';
      let suggestion = '';
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          errorMessage = '🛑 用户取消了生成';
          suggestion = '您可以重新尝试生成';
        } else if (e.message.includes('fetch') || e.message.includes('network')) {
          errorMessage = '🌐 网络连接问题';
          suggestion = '请检查网络后重试';
        } else if (e.message.includes('timeout')) {
          errorMessage = '⏰ 请求超时';
          suggestion = contentToUse.length > 50 ? '建议简化内容' : '请稍后重试';
        } else {
          errorMessage = '🔧 系统错误';
          suggestion = e.message.length < 50 ? e.message : '请稍后重试';
        }
      }
      
      setCardError(`${errorMessage}${suggestion ? ` - ${suggestion}` : ''}`);
      
      // ⚡ 自动重试提示（仅特定错误）
      if (e instanceof Error && (e.message.includes('network') || e.message.includes('timeout'))) {
        setTimeout(() => {
          setCardError(prev => prev + ' | 💡 可点击重新生成');
        }, 2000);
      }
    } finally {
      setCardLoading(false);
    }
  };

  // 处理编辑内容变化
  const handleCardContentChange = (newContent: string) => {
    setEditedCardContent(newContent);
  };

  const handleCardCopy = () => {
    const contentToCopy = editedCardContent || cardResult;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 1500);
    }
  };

  // 封面下载图片 - 修复版本，确保预览与下载完全一致
  const handleCardDownload = async () => {
    if (!cardResultInfo?.dimensions) {
      setCardError('没有可下载的内容');
      return;
    }

    try {
      setCardError('🚀 正在准备下载...');
      console.log('📋 开始下载流程 - 修复版本');
      
      const { downloadCoverImage, generateFileName } = await import('../utils/downloadHelper');
      
      const dimensions = cardResultInfo.dimensions;
      const filename = generateFileName(
        dimensions.name.replace(/[\s\/]/g, '_'),
        dimensions.width,
        dimensions.height
      );

      console.log('📏 下载参数:', {
        尺寸: `${dimensions.width}x${dimensions.height}`,
        文件名: filename
      });

      setCardError('🖼️ 正在生成图片...');

      // 智能容器查找策略 - 优先使用下载专用容器
      let targetContainer: HTMLElement | null = null;
      
      // 策略1：优先查找下载专用容器（来自 EditableCard）
      targetContainer = document.querySelector('[data-download-container]') as HTMLElement;
      if (targetContainer) {
        console.log('✅ 找到下载专用容器');
        
        // 验证下载容器内容是否为空或过时
        const hasValidContent = targetContainer.innerHTML.trim().length > 100;
        if (!hasValidContent) {
          console.log('⚠️ 下载容器内容为空，尝试强制同步');
          
          // 查找预览容器并强制同步
          const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement;
          if (previewContainer && previewContainer.innerHTML.trim()) {
            console.log('🔄 从预览容器同步内容到下载容器');
            targetContainer.innerHTML = previewContainer.innerHTML;
            
            // 重置下载容器样式
            const downloadContent = targetContainer.firstElementChild as HTMLElement;
            if (downloadContent) {
              downloadContent.style.cssText = `
                width: ${dimensions.width}px !important;
                height: ${dimensions.height}px !important;
                position: relative !important;
                overflow: hidden !important;
                transform: none !important;
                scale: 1 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-sizing: border-box !important;
                font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif !important;
              `;
              
              // 清理编辑痕迹
              const cleanElement = (el: HTMLElement) => {
                el.removeAttribute('data-editable-id');
                el.removeAttribute('contenteditable');
                el.classList.remove('editable-element', 'editable-hint');
                el.style.removeProperty('cursor');
                el.style.removeProperty('outline');
                el.style.removeProperty('transition');
                el.style.removeProperty('box-shadow');
                
                Array.from(el.children).forEach(child => {
                  cleanElement(child as HTMLElement);
                });
              };
              
              cleanElement(downloadContent);
            }
          }
        }
      } else {
        // 策略2：查找预览容器并创建下载版本
        const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement;
        if (previewContainer) {
          console.log('📋 找到预览容器，创建下载版本');
          
          // 创建临时下载容器
          targetContainer = document.createElement('div');
          targetContainer.setAttribute('data-download-container', 'true');
          targetContainer.style.cssText = `
            position: absolute !important;
            left: -99999px !important;
            top: -99999px !important;
            visibility: hidden !important;
            pointer-events: none !important;
            z-index: -9999 !important;
          `;
          
          // 复制预览内容
          targetContainer.innerHTML = previewContainer.innerHTML;
          document.body.appendChild(targetContainer);
          
          // 应用下载专用样式
          const downloadContent = targetContainer.firstElementChild as HTMLElement;
          if (downloadContent) {
            downloadContent.style.cssText = `
              width: ${dimensions.width}px !important;
              height: ${dimensions.height}px !important;
              position: relative !important;
              overflow: hidden !important;
              transform: none !important;
              scale: 1 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-sizing: border-box !important;
              font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif !important;
            `;
          }
          
          // 清理编辑相关元素
          const allElements = targetContainer.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            element.removeAttribute('data-editable-id');
            element.removeAttribute('contenteditable');
            element.classList.remove('editable-element', 'editable-hint');
            element.style.removeProperty('cursor');
            element.style.removeProperty('outline');
            element.style.removeProperty('transition');
            element.style.removeProperty('box-shadow');
          });
        }
      }

      // 策略3：如果还是找不到，使用通用查找
      if (!targetContainer) {
        console.log('🔍 使用通用容器查找策略');
        const candidates = document.querySelectorAll('div[style*="width"][style*="height"]');
        for (const candidate of Array.from(candidates)) {
          const element = candidate as HTMLElement;
          const width = element.offsetWidth;
          const height = element.offsetHeight;
          
          if ((width >= 300 && height >= 200) || element.innerHTML.includes('封面')) {
            targetContainer = element;
            console.log('✅ 找到候选容器:', { width, height });
            break;
          }
        }
      }

      if (!targetContainer) {
        throw new Error('无法找到任何可下载的内容容器');
      }

      console.log('🎯 使用容器:', targetContainer.tagName, targetContainer.className);
      console.log('📄 容器内容长度:', targetContainer.innerHTML.length);

      // 执行下载
      const success = await downloadCoverImage(targetContainer, {
        width: dimensions.width,
        height: dimensions.height,
        filename: filename,
        backgroundColor: null,
        scale: 2
      });

      // 清理临时容器
      if (targetContainer.hasAttribute('data-download-container') && 
          targetContainer.style.position === 'absolute') {
        try {
          document.body.removeChild(targetContainer);
        } catch (e) {
          console.log('临时容器清理失败，可能已被移除');
        }
      }

      if (success) {
        setCardError('✅ 下载成功！');
        setTimeout(() => setCardError(''), 2000);
      } else {
        setCardError('❌ 下载失败，请重试');
      }

    } catch (error) {
      console.error('❌ 下载过程出错:', error);
      setCardError('❌ 下载失败: ' + (error as Error).message);
    }
  };

  // 处理内容优化结果
  const handleExtractionResult = (result: any) => {
    // 处理封面内容提取结果
    console.log('封面内容提取结果:', result);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          选择封面尺寸
          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            ✨ 智能适配设计模板
          </span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {coverSizes.map(size => (
            <div
              key={size.key}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                cardSize === size.key
                  ? 'border-primary shadow-xl bg-blue-50 ring-2 ring-primary ring-opacity-30 transform scale-105'
                  : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:scale-102'
              }`}
              onClick={() => handlePlatformChange(size.key)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{size.icon}</div>
                <div className="font-bold text-sm text-gray-800 mb-1">
                  {size.label}
                </div>
                <div className="text-xs text-primary font-medium mb-2">
                  {size.ratio} • {size.size}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {size.description}
                </p>
                {cardSize === size.key && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✅ 已选择，将智能匹配设计风格
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 平台特色说明 */}
        {cardSize && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">🎯</span>
              <span className="font-medium text-blue-800">
                {cardSize === 'xiaohongshu' && '小红书特色：活泼友好、圆角设计、明亮色彩'}
                {cardSize === 'video' && '短视频特色：极简冲击、超大字体、3秒抓眼球'}
                {cardSize === 'wechat' && '公众号特色：专业权威、商务配色、严谨布局'}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {cardSize === 'xiaohongshu' && '💡 建议使用种草、测评、攻略类关键词，字体建议40-50px主标题'}
              {cardSize === 'video' && '💡 建议使用震撼、爆料、必看类关键词，字体建议70-90px超大标题'}
              {cardSize === 'wechat' && '💡 建议使用深度、权威、专业类关键词，字体建议30-38px商务标题'}
            </div>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">
          输入封面文案内容
          <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            🤖 AI智能优化
          </span>
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
          placeholder={`请输入${cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}封面的核心文案内容...`}
          value={cardInput}
          onChange={e => handleCardInputChange(e.target.value)}
          disabled={cardLoading}
        />
        <div className="text-xs text-gray-400 mt-1">
          💡 系统将根据选择的平台自动优化文案结构和设计风格，确保符合{cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}规范
        </div>

        {/* 示例文案 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="text-xs font-medium text-gray-700 mb-2">💡 文案示例（点击快速使用）：</div>
          <div className="flex flex-wrap gap-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors"
                onClick={() => handleCardInputChange(example)}
                disabled={cardLoading}
              >
                {example.length > 25 ? example.substring(0, 25) + '...' : example}
              </button>
            ))}
          </div>
        </div>

        {/* 封面内容智能提取组件 */}
        <CoverContentExtractor
          originalContent={cardInput}
          selectedPlatform={cardSize}
          onContentSelect={handleOptimizedContentSelect}
          onExtractionResult={handleExtractionResult}
          isVisible={showContentOptimizer}
        />
      </div>

      {/* AI智能推荐区域 */}
      {showAiSuggestion && aiRecommendation && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold text-purple-800">AI智能推荐</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              aiRecommendation.confidence > 0.8 
                ? 'bg-green-100 text-green-800' 
                : aiRecommendation.confidence > 0.6
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              匹配度 {Math.round(aiRecommendation.confidence * 100)}%
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 分析结果</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {aiRecommendation.reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🎨 推荐方案</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: aiRecommendation.colorScheme.primary }}></span>
                  <span>主色调: {aiRecommendation.colorScheme.primary}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: aiRecommendation.colorScheme.secondary }}></span>
                  <span>辅助色: {aiRecommendation.colorScheme.secondary}</span>
                </div>
                <div className="text-gray-600">
                  <span>字体建议: {aiRecommendation.typography.titleSize}px {aiRecommendation.typography.fontWeight === 'bold' ? '加粗' : '正常'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setCardTemplate(aiRecommendation.templateKey);
                // 清空之前的生成结果，避免显示不一致
                setCardResult('');
                setCardResultInfo(null);
                setCardError('');
                setEditedCardContent('');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              ✨ 应用推荐模板
            </button>
            <button
              onClick={() => setShowAiSuggestion(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              隐藏建议
            </button>
          </div>
        </div>
      )}

      {/* 模板选择区域优化 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          选择封面设计风格
          <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            🎨 平台智能推荐
          </span>
        </label>
        
        {/* 推荐模板区域 */}
        {cardSize && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <span className="font-medium">✨ 为{cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}推荐:</span>
              {getRecommendedTemplatesForPlatform(cardSize).slice(0, 2).map((templateKey, index) => {
                const template = allCardTemplates.find(t => t.key === templateKey);
                return template ? (
                  <span key={templateKey} className="ml-2">
                    {index > 0 && '、'}{template.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getSortedTemplates().map(template => {
            const isRecommended = getRecommendedTemplatesForPlatform(cardSize).includes(template.key);
            
            return (
              <div
                key={template.key}
                className={`rounded-xl border cursor-pointer transition-all duration-300 ${
                  cardTemplate === template.key
                    ? 'border-primary shadow-xl bg-blue-50 ring-2 ring-primary ring-opacity-30 transform scale-105'
                    : isRecommended
                    ? 'border-yellow-300 bg-yellow-50 hover:shadow-lg hover:border-yellow-400 hover:scale-102'
                    : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:scale-102'
                }`}
                onClick={() => {
                  setCardTemplate(template.key);
                  // 清空之前的生成结果，避免显示不一致
                  setCardResult('');
                  setCardResultInfo(null);
                  setCardError('');
                  setEditedCardContent('');
                }}
              >
                {/* 推荐标识 */}
                {isRecommended && cardTemplate !== template.key && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-tl-xl rounded-br-xl font-medium">
                    推荐
                  </div>
                )}
                
                {/* 预览区域 */}
                <div className="p-4 flex justify-center">
                  <CoverTemplatePreview 
                    templateKey={template.key} 
                    isSelected={cardTemplate === template.key}
                    platform={cardSize}
                  />
                </div>
                
                {/* 信息区域 */}
                <div className="px-4 pb-4">
                  <div className="text-center mb-2">
                    <div className="font-bold text-sm text-gray-800 mb-1">
                      {template.label}
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                      isRecommended ? 'bg-yellow-100 text-yellow-700' : 'bg-primary bg-opacity-10 text-primary'
                    }`}>
                      {template.category}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center leading-relaxed">
                    {template.description}
                  </p>
                  {isRecommended && (
                    <div className="mt-2 text-xs text-yellow-700 text-center font-medium">
                      ⭐ 最适合当前平台
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className={`w-full max-w-xl py-4 text-lg font-medium rounded-lg transition-all duration-300 ${
            cardLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
          onClick={handleCardGenerate}
          disabled={cardLoading}
        >
          {cardLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ⚡ AI设计中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {optimizedContent ? (
                <>
                  ✨ 生成{cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}专业封面
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">优化内容</span>
                </>
              ) : (
                <>🎨 生成{cardSize === 'xiaohongshu' ? '小红书' : cardSize === 'video' ? '短视频' : '公众号'}专业封面</>
              )}
            </span>
          )}
        </button>
      </div>

      {/* 显示当前使用的内容 */}
      {optimizedContent && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <span className="font-medium">✨ 当前使用优化内容：</span>
            <div className="mt-1 text-blue-600 font-medium">{optimizedContent}</div>
          </div>
        </div>
      )}

      {cardError && (
        <div className={`mt-4 p-4 border rounded-lg ${
          cardError.includes('✅') || cardError.includes('成功') 
            ? 'bg-green-50 border-green-200' 
            : cardError.includes('⚠️') || cardError.includes('已生成降级版本')
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-center ${
            cardError.includes('✅') || cardError.includes('成功')
              ? 'text-green-700'
              : cardError.includes('⚠️') || cardError.includes('已生成降级版本')
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>
            {cardError.includes('✅') || cardError.includes('成功') ? (
              <span>{cardError}</span>
            ) : (
              <span><span className="font-medium">生成状态：</span>{cardError}</span>
            )}
          </div>
        </div>
      )}

      {cardResult && (
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 头部信息区域 */}
            <div className="bg-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      🎨 {cardResultInfo?.coverSize}生成完成
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📐 尺寸: {cardResultInfo?.dimensions.width}×{cardResultInfo?.dimensions.height}
                      </span>
                      <span className="flex items-center gap-1">
                        📏 比例: {cardResultInfo?.dimensions.ratio}
                      </span>
                      <span className="flex items-center gap-1">
                        🎯 模板: {cardResultInfo?.template}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                    onClick={handleCardCopy}
                  >
                    {cardCopied ? '✅ 已复制' : '📋 复制代码'}
                  </button>
                  {/* 调试验证按钮 - 帮助检查内容一致性 */}
                  <button
                    className="px-4 py-2 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                    onClick={() => {
                      // 内容一致性检查 + 可见性检查
                      const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement;
                      const downloadContainer = document.querySelector('[data-download-container]') as HTMLElement;
                      
                      if (previewContainer && downloadContainer) {
                        const previewText = previewContainer.textContent?.trim() || '';
                        const downloadText = downloadContainer.textContent?.trim() || '';
                        const isConsistent = previewText === downloadText;
                        
                        // 检查下载容器的可见性状态
                        const containerStyle = window.getComputedStyle(downloadContainer);
                        const isVisible = containerStyle.visibility !== 'hidden' && containerStyle.opacity !== '0';
                        const hasContent = downloadContainer.innerHTML.length > 100;
                        
                        console.log('🔍 完整状态检查:', {
                          预览文本: previewText,
                          下载文本: downloadText,
                          内容一致: isConsistent,
                          下载容器可见: isVisible,
                          有内容: hasContent,
                          容器visibility: containerStyle.visibility,
                          容器opacity: containerStyle.opacity,
                          容器位置: `${containerStyle.left}, ${containerStyle.top}`,
                          容器尺寸: `${containerStyle.width}x${containerStyle.height}`,
                          预览HTML长度: previewContainer.innerHTML.length,
                          下载HTML长度: downloadContainer.innerHTML.length
                        });
                        
                        let message = '';
                        if (!hasContent) {
                          message = '❌ 下载容器没有内容';
                        } else if (!isVisible) {
                          message = '⚠️ 下载容器不可见 (可能导致空白图片)';
                        } else if (!isConsistent) {
                          message = `⚠️ 发现内容不一致:\n预览: "${previewText.slice(0, 50)}..."\n下载: "${downloadText.slice(0, 50)}..."`;
                        } else {
                          message = '✅ 所有检查通过，可以安全下载';
                        }
                        
                        setCardError(message);
                        setTimeout(() => setCardError(''), 5000);
                      } else {
                        setCardError('❌ 未找到预览或下载容器');
                        setTimeout(() => setCardError(''), 3000);
                      }
                    }}
                    title="检查预览与下载内容是否一致"
                  >
                    🔍 验证同步
                  </button>
                  <button
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    onClick={handleCardDownload}
                  >
                    💾 下载高清图片
                  </button>
                </div>
              </div>
            </div>

            {/* 预览区域 */}
            <div className="p-6">
              <EditableCard
                htmlContent={cardResult}
                dimensions={cardResultInfo.dimensions}
                cardSize={cardSize}
                onContentChange={handleCardContentChange}
              />
            </div>

            {/* 底部提示信息 */}
            <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>💡 提示：点击封面中的任意文字可以进行编辑，修改后的内容会自动应用到下载的图片中</span>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  AI智能生成 • 专业设计
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 