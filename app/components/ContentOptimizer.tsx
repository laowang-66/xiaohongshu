import React, { useState, useEffect } from 'react';
import { OptimizationResult } from '../utils/contentOptimizer';

interface ContentOptimizerProps {
  originalContent: string;
  selectedPlatform: string;
  onContentSelect: (content: string) => void;
  onOptimizationResult?: (result: OptimizationResult | null) => void;
  isVisible: boolean;
}

const ContentOptimizer: React.FC<ContentOptimizerProps> = ({
  originalContent,
  selectedPlatform,
  onContentSelect,
  onOptimizationResult,
  isVisible
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  // 自动触发优化
  useEffect(() => {
    if (isVisible && originalContent.trim() && originalContent.length > 5) {
      optimizeContent();
    }
  }, [originalContent, selectedPlatform, isVisible]);

  const optimizeContent = async () => {
    if (!originalContent.trim()) return;

    setIsLoading(true);
    setError('');
    setOptimizationResult(null);
    setSelectedVersion(null);

    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          platform: selectedPlatform
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setOptimizationResult(result);
      onOptimizationResult?.(result);
      
    } catch (err) {
      console.error('内容优化失败:', err);
      setError(err instanceof Error ? err.message : '内容优化失败，请稍后重试');
      onOptimizationResult?.(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = (version: OptimizationResult['optimizedVersions'][0], index: number) => {
    setSelectedVersion(index);
    const selectedContent = version.subtitle 
      ? `${version.mainTitle}\n${version.subtitle}`
      : version.mainTitle;
    onContentSelect(selectedContent);
  };

  const getPlatformName = (platform: string): string => {
    const platforms: Record<string, string> = {
      'xiaohongshu': '小红书',
      'video': '短视频',
      'wechat': '公众号'
    };
    return platforms[platform] || platform;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return '推荐';
    if (confidence >= 0.6) return '不错';
    return '一般';
  };

  if (!isVisible) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-bold text-blue-800">内容智能优化</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          {getPlatformName(selectedPlatform)}专用
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700 font-medium">AI正在优化内容...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="text-red-700 text-sm">
            <span className="font-medium">优化失败：</span>{error}
          </div>
          <button
            onClick={optimizeContent}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
          >
            重试
          </button>
        </div>
      )}

      {optimizationResult && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {optimizationResult.optimizedVersions.map((version, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedVersion === index
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => handleVersionSelect(version, index)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">版本 {version.version}</span>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getConfidenceColor(version.confidence)}`}>
                    {getConfidenceText(version.confidence)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="font-semibold text-gray-800 leading-tight">
                    {version.mainTitle}
                  </div>
                  
                  {version.subtitle && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {version.subtitle}
                    </div>
                  )}
                  
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {version.emotionalTone}
                  </div>
                  
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {version.reasoning}
                  </div>
                </div>
                
                {selectedVersion === index && (
                  <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                    <span>✓</span>
                    <span>已选择此版本</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 平台洞察 */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🎯</span>
              <span>平台优化洞察</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-2">内容类型</div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 inline-block">
                  {optimizationResult.platformInsights.contentType}
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-700 mb-2">推荐风格</div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 inline-block">
                  {optimizationResult.platformInsights.recommendedStyle}
                </div>
              </div>
            </div>
            
            {optimizationResult.platformInsights.keyOptimizations.length > 0 && (
              <div className="mt-4">
                <div className="font-medium text-gray-700 mb-2">优化建议</div>
                <ul className="space-y-1">
                  {optimizationResult.platformInsights.keyOptimizations.map((optimization, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{optimization}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => setSelectedVersion(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              使用原始内容
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentOptimizer; 