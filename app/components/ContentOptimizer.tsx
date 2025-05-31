'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface CoverContentVersion {
  version: number;
  mainTitle: string;
  subTitle?: string;
  tags?: string;
  emotionWords?: string;
  numbers?: string;
  coreValue?: string;
  reason?: string;
}

interface CoverExtractorProps {
  originalContent: string;
  selectedPlatform: string;
  onContentSelect: (content: string) => void;
  onExtractionResult?: (result: any) => void;
  isVisible: boolean;
}

export default function CoverContentExtractor({
  originalContent,
  selectedPlatform,
  onContentSelect,
  onExtractionResult,
  isVisible
}: CoverExtractorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedVersions, setExtractedVersions] = useState<CoverContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<CoverContentVersion | null>(null);
  const [error, setError] = useState<string>('');
  
  // 添加防抖和去重机制
  const lastRequestRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 平台配置
  const platformConfig = {
    xiaohongshu: { name: '小红书封面', icon: '📱', color: 'bg-red-50 border-red-200' },
    video: { name: '短视频封面', icon: '📺', color: 'bg-purple-50 border-purple-200' },
    wechat: { name: '公众号封面', icon: '📰', color: 'bg-green-50 border-green-200' }
  };

  // 防抖延迟提取
  const debouncedExtract = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isVisible && originalContent.trim().length > 5) {
        extractCoverContent();
      }
    }, 800); // 800ms防抖延迟
  }, [originalContent, selectedPlatform, isVisible]);

  useEffect(() => {
    // 检查是否需要重新提取
    const currentRequest = `${originalContent.trim()}_${selectedPlatform}`;
    
    if (currentRequest !== lastRequestRef.current) {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 清空之前的结果
      setExtractedVersions([]);
      setSelectedVersion(null);
      setError('');
      
      // 启动防抖提取
      debouncedExtract();
      
      lastRequestRef.current = currentRequest;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [originalContent, selectedPlatform, isVisible, debouncedExtract]);

  const extractCoverContent = async () => {
    // 避免重复请求
    if (isLoading) {
      console.log('🔄 提取正在进行中，跳过重复请求');
      return;
    }

    // 内容长度检查
    if (originalContent.trim().length < 5) {
      setError('内容太短，请输入至少5个字符');
      return;
    }

    setIsLoading(true);
    setError('');

    // 创建新的AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      console.log('🚀 开始智能提取 - 平台:', selectedPlatform, '内容长度:', originalContent.length);
      
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          content: originalContent,
          platform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        throw new Error(`提取失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.versions) {
        // 转换新的数据结构为前端期望的格式
        const convertedVersions = data.versions.map((version: any, index: number) => ({
          version: index + 1,
          mainTitle: version.title || version.主标题 || version.核心标题 || '',
          subTitle: version.subtitle || version.副标题 || '',
          tags: version.type || version.标题类型 || version.情感标签 || '',
          emotionWords: version.emotion || version.情绪强度 || version.情感词汇 || '',
          numbers: version.hook || version.核心钩子 || version.关键数字 || '',
          coreValue: version.value || version.价值定位 || version.核心卖点 || '',
          reason: version.effect || version.适用场景 || version.预期效果 || ''
        }));
        
        setExtractedVersions(convertedVersions);
        onExtractionResult?.(data);
        
        console.log('✅ 智能提取成功，生成版本数:', convertedVersions.length);
      } else {
        throw new Error(data.error || '提取失败');
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 请求被取消');
        return;
      }
      
      console.error('❌ 封面内容提取错误:', error);
      setError(error instanceof Error ? error.message : '提取失败，请重试');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleVersionSelect = (version: CoverContentVersion) => {
    setSelectedVersion(version);
    
    // 根据不同平台构造适合封面的内容
    let coverContent = '';
    
    if (selectedPlatform === 'xiaohongshu') {
      coverContent = version.mainTitle || '';
      if (version.subTitle) coverContent += '\n' + version.subTitle;
      if (version.tags) coverContent += '\n' + version.tags;
    } else if (selectedPlatform === 'video') {
      coverContent = version.mainTitle || '';
      if (version.numbers) coverContent += ' ' + version.numbers;
      if (version.emotionWords) coverContent += ' ' + version.emotionWords;
    } else if (selectedPlatform === 'wechat') {
      coverContent = version.mainTitle || '';
      if (version.subTitle) coverContent += ' - ' + version.subTitle;
    }
    
    console.log('👆 用户选择版本:', version.version, '内容:', coverContent);
    onContentSelect(coverContent);
  };

  // 手动重新提取
  const handleManualRetry = () => {
    lastRequestRef.current = ''; // 清空缓存
    extractCoverContent();
  };

  if (!isVisible) return null;

  const currentPlatform = platformConfig[selectedPlatform as keyof typeof platformConfig] || platformConfig.xiaohongshu;

  return (
    <div className={`mt-6 p-6 rounded-xl border-2 transition-all duration-300 ${currentPlatform.color}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{currentPlatform.icon}</span>
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            🎯 封面内容智能提取
          </h3>
          <p className="text-sm text-gray-600">
            为{currentPlatform.name}提取最适合的封面元素
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600">🤖 AI正在分析内容...</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            智能提取需要几秒时间，请稍候
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 font-medium">提取失败</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleManualRetry}
            className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            重新提取
          </button>
        </div>
      )}

      {extractedVersions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✨ 已提取 {extractedVersions.length} 个封面版本，点击选择最适合的：</span>
          </div>
          
          <div className="grid gap-4">
            {extractedVersions.map((version, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedVersion?.version === version.version
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleVersionSelect(version)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    版本 {version.version}
                  </span>
                  {selectedVersion?.version === version.version && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                      ✓ 已选择
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {version.mainTitle && (
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {selectedPlatform === 'video' ? '核心标题' : '主标题'}:
                      </span>
                      <span className="font-bold text-gray-800 block">{version.mainTitle}</span>
                    </div>
                  )}
                  
                  {version.subTitle && (
                    <div>
                      <span className="text-xs text-gray-500 block">副标题:</span>
                      <span className="text-gray-700 block">{version.subTitle}</span>
                    </div>
                  )}
                  
                  {version.tags && (
                    <div>
                      <span className="text-xs text-gray-500 block">标签:</span>
                      <span className="text-blue-600 text-sm block">{version.tags}</span>
                    </div>
                  )}
                  
                  {version.emotionWords && (
                    <div>
                      <span className="text-xs text-gray-500 block">情感词汇:</span>
                      <span className="text-orange-600 font-medium text-sm block">{version.emotionWords}</span>
                    </div>
                  )}
                  
                  {version.numbers && (
                    <div>
                      <span className="text-xs text-gray-500 block">数字亮点:</span>
                      <span className="text-green-600 font-medium text-sm block">{version.numbers}</span>
                    </div>
                  )}
                  
                  {version.coreValue && (
                    <div>
                      <span className="text-xs text-gray-500 block">核心价值:</span>
                      <span className="text-purple-600 text-sm block">{version.coreValue}</span>
                    </div>
                  )}
                  
                  {version.reason && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block">适用理由:</span>
                      <span className="text-gray-600 text-xs block leading-relaxed">{version.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedVersion && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 font-medium">✨ 已选择版本 {selectedVersion.version}</span>
              </div>
              <div className="text-sm text-blue-700">
                该版本的封面内容已自动填入生成框，点击"生成专业封面"即可使用优化后的内容。
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 