'use client'

import React, { useRef, useEffect, useState } from 'react';
import EditModal from './EditModal';
import { TextParser, addEditableHints, removeEditableHints } from '../utils/textParser';

interface EditableCardProps {
  htmlContent: string;
  dimensions: {
    width: number;
    height: number;
    ratio: string;
  };
  cardSize: string;
  onContentChange?: (newContent: string) => void;
}

interface EditingElement {
  id: string;
  text: string;
  style: {
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
}

const EditableCard: React.FC<EditableCardProps> = ({ 
  htmlContent, 
  dimensions, 
  cardSize, 
  onContentChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadContainerRef = useRef<HTMLDivElement>(null);
  const textParserRef = useRef<TextParser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [editingElement, setEditingElement] = useState<EditingElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Unicode 解码函数
  const decodeUnicode = (str: string): string => {
    try {
      return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
    } catch (error) {
      console.warn('Unicode decode error:', error);
      return str;
    }
  };

  // 计算缩放比例和容器尺寸
  const getScaleAndContainerStyle = () => {
    // 安全检查：确保 dimensions 存在且有效
    if (!dimensions || typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
      console.warn('dimensions 未定义或无效，使用默认值:', dimensions);
      // 提供默认的安全值
      const defaultDimensions = { width: 400, height: 300 };
      const { width, height } = defaultDimensions;
      
      return {
        containerStyle: {
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        },
        contentStyle: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        scale: 1
      };
    }

    const { width, height } = dimensions;
    
    // 定义最大显示尺寸
    const maxDisplayWidth = 400;
    const maxDisplayHeight = 500;
    
    // 计算缩放比例，确保内容完全在容器内
    const scaleX = maxDisplayWidth / width;
    const scaleY = maxDisplayHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // 取最小值确保不超出边界
    
    // 计算缩放后的实际显示尺寸
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    return {
      containerStyle: {
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      },
      contentStyle: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      scale
    };
  };

  // 设置可编辑功能
  const setupEditableFeatures = () => {
    if (!containerRef.current) return;

    // 初始化文本解析器
    textParserRef.current = new TextParser(containerRef.current);
    const textElements = textParserRef.current.parseTextElements();
    
    if (textElements.length === 0) {
      console.warn('No editable text elements found');
      setIsReady(true); // 即使没有可编辑元素，也设置为ready状态
      return;
    }

    console.log(`Found ${textElements.length} editable text elements`);

    // 添加可视化提示
    addEditableHints(textElements);

    // 添加点击事件监听器
    textElements.forEach(textElement => {
      const { element, id, text, style } = textElement;
      
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        setEditingElement({
          id,
          text,
          style
        });
        setIsModalOpen(true);
      };

      element.addEventListener('click', handleClick);
      
      // 保存清理函数
      (element as any).__removeClickHandler = () => {
        element.removeEventListener('click', handleClick);
      };
    });

    setIsReady(true);
  };

  // 清理编辑功能 - 更新版本
  const cleanupEditableFeatures = () => {
    if (containerRef.current) {
      // 移除可视化提示
      removeEditableHints(containerRef.current);
      
      // 移除点击事件监听器
      const elements = containerRef.current.querySelectorAll('*');
      elements.forEach(element => {
        const cleanupFn = (element as any).__removeClickHandler;
        if (cleanupFn) {
          cleanupFn();
        }
      });
    }

    // 清理内容监控器
    cleanupContentWatcher();

    if (textParserRef.current) {
      textParserRef.current.reset();
      textParserRef.current = null;
    }
    
    setIsReady(false);
  };

  // 同步下载容器内容 - 改进版本
  const syncDownloadContainer = () => {
    if (containerRef.current && downloadContainerRef.current) {
      // 安全检查 dimensions
      const safeDimensions = dimensions && typeof dimensions.width === 'number' && typeof dimensions.height === 'number' 
        ? dimensions 
        : { width: 400, height: 300 };

      // 获取当前预览容器的实际渲染内容
      const previewContent = containerRef.current.innerHTML;
      
      // 创建完全一致的下载版本
      downloadContainerRef.current.innerHTML = previewContent;
      
      // 应用原始尺寸和样式重置
      const downloadContent = downloadContainerRef.current.firstElementChild as HTMLElement;
      if (downloadContent) {
        // 重置所有样式为下载专用
        downloadContent.style.cssText = `
          width: ${safeDimensions.width}px !important;
          height: ${safeDimensions.height}px !important;
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
        
        // 简化清理函数 - 只处理核心差异
        const quickCleanForDownload = (element: HTMLElement) => {
          // 移除编辑相关标识
          element.removeAttribute('data-editable-id');
          element.removeAttribute('data-text-element');
          element.removeAttribute('contenteditable');
          element.classList.remove('editable-element', 'editable-hint');
          
          // 移除可能影响渲染的样式
          const problematicStyles = ['cursor', 'outline', 'transition', 'box-shadow'];
          problematicStyles.forEach(style => {
            element.style.removeProperty(style);
          });
          
          // 递归处理子元素
          Array.from(element.children).forEach(child => {
            quickCleanForDownload(child as HTMLElement);
          });
        };
        
        quickCleanForDownload(downloadContent);
      }
    }
  };

  // 强制同步下载容器 - 改进版本，确保实时同步
  const forceSyncDownloadContainer = () => {
    if (!containerRef.current || !downloadContainerRef.current) return;
    
    // 安全检查 dimensions
    const safeDimensions = dimensions && typeof dimensions.width === 'number' && typeof dimensions.height === 'number' 
      ? dimensions 
      : { width: 400, height: 300 };
    
    const attemptSync = () => {
      try {
        // 获取当前预览容器的最新内容（包括所有编辑）
        const currentContent = containerRef.current!.innerHTML;
        console.log('🔄 同步内容长度:', currentContent.length);
        
        // 完全同步到下载容器
        downloadContainerRef.current!.innerHTML = currentContent;
        
        // 等待DOM更新后应用下载专用样式
        requestAnimationFrame(() => {
          const downloadElement = downloadContainerRef.current!.firstElementChild as HTMLElement;
          if (downloadElement) {
            // 重置为原始尺寸，移除所有变换
            downloadElement.style.cssText = `
              width: ${safeDimensions.width}px !important;
              height: ${safeDimensions.height}px !important;
              position: relative !important;
              overflow: hidden !important;
              transform: none !important;
              transform-origin: initial !important;
              scale: 1 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-sizing: border-box !important;
              font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif !important;
              background: transparent !important;
            `;
            
            // 深度清理所有编辑痕迹，确保下载版本干净
            const deepClean = (el: HTMLElement) => {
              // 移除编辑相关属性
              el.removeAttribute('data-editable-id');
              el.removeAttribute('data-text-element');
              el.removeAttribute('contenteditable');
              
              // 移除编辑相关类名
              el.classList.remove('editable-element', 'editable-hint', 'ring-2', 'ring-blue-500');
              
              // 移除编辑相关样式
              const editingStyles = [
                'cursor', 'outline', 'outline-offset', 'transition',
                'user-select', 'pointer-events', 'box-shadow',
                'animation', 'transition-property', 'transition-duration',
                'border', 'border-radius'
              ];
              
              editingStyles.forEach(style => {
                el.style.removeProperty(style);
              });
              
              // 确保元素可见
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              
              // 确保字体统一
              if (!el.style.fontFamily || el.style.fontFamily.includes('system-ui')) {
                el.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
              }
              
              // 递归处理所有子元素
              Array.from(el.children).forEach(child => {
                deepClean(child as HTMLElement);
              });
            };
            
            deepClean(downloadElement);
            
            console.log('✅ 下载容器深度清理和同步完成');
          }
        });
        
      } catch (error) {
        console.warn('⚠️ 下载容器同步失败:', error);
      }
    };

    // 立即同步
    attemptSync();
    
    // 双重保险：延迟同步确保完整性
    setTimeout(attemptSync, 50);
  };

  // 实时监控预览内容变化，自动同步到下载容器 - 优化版本
  const setupContentWatcher = () => {
    if (!containerRef.current) return;

    let syncTimer: NodeJS.Timeout | undefined;
    
    // 防抖同步函数，避免过度触发
    const debouncedSync = () => {
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
      syncTimer = setTimeout(() => {
        console.log('🔍 防抖同步触发');
        forceSyncDownloadContainer();
      }, 300); // 300ms防抖
    };

    // 使用 MutationObserver 监控内容变化 - 优化配置
    const observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      let changeDetails: string[] = [];
      
      mutations.forEach(mutation => {
        // 监控文本内容变化（最重要）
        if (mutation.type === 'characterData') {
          const newText = mutation.target.textContent?.trim();
          const oldText = mutation.oldValue?.trim();
          if (newText !== oldText) {
            shouldSync = true;
            changeDetails.push(`文本变化: "${oldText}" → "${newText}"`);
          }
        }
        
        // 监控子节点变化（元素添加/删除）
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            shouldSync = true;
            changeDetails.push(`子节点变化: +${mutation.addedNodes.length} -${mutation.removedNodes.length}`);
          }
        }
        
        // 监控关键属性变化（样式等）
        if (mutation.type === 'attributes') {
          const attributeName = mutation.attributeName;
          if (['style', 'class', 'data-editable-id'].includes(attributeName || '')) {
            const element = mutation.target as HTMLElement;
            const newValue = element.getAttribute(attributeName || '');
            const oldValue = mutation.oldValue;
            if (newValue !== oldValue) {
              shouldSync = true;
              changeDetails.push(`属性变化 ${attributeName}: "${oldValue}" → "${newValue}"`);
            }
          }
        }
      });
      
      if (shouldSync) {
        console.log('🔍 检测到重要内容变化，准备同步:', changeDetails);
        debouncedSync();
      }
    });

    // 优化的观察配置
    observer.observe(containerRef.current, {
      childList: true,        // 监控子节点变化
      subtree: true,          // 监控所有后代节点
      characterData: true,    // 监控文本内容变化
      characterDataOldValue: true, // 记录文本旧值
      attributes: true,       // 监控属性变化
      attributeOldValue: true, // 记录属性旧值
      attributeFilter: ['style', 'class', 'data-editable-id'] // 只监控关键属性
    });

    // 保存清理函数
    (containerRef.current as any).__contentObserver = observer;
    (containerRef.current as any).__syncTimer = syncTimer;
    
    console.log('🎯 内容监控器已启动，配置优化版本');
  };

  // 清理内容监控器 - 改进版本
  const cleanupContentWatcher = () => {
    if (containerRef.current) {
      const observer = (containerRef.current as any).__contentObserver;
      const syncTimer = (containerRef.current as any).__syncTimer;
      
      if (observer) {
        observer.disconnect();
        delete (containerRef.current as any).__contentObserver;
        console.log('🧹 内容监控器已清理');
      }
      
      if (syncTimer) {
        clearTimeout(syncTimer);
        delete (containerRef.current as any).__syncTimer;
        console.log('🧹 同步定时器已清理');
      }
    }
  };

  // 处理编辑保存 - 改进版本，增强可靠性
  const handleEditSave = async (newText: string, newStyle: any) => {
    if (!editingElement || !textParserRef.current) return;

    console.log('🎨 开始保存编辑:', {
      文本: newText,
      样式: newStyle,
      元素ID: editingElement.id
    });

    try {
      // 更新文本元素
      const success = textParserRef.current.updateTextElement(
        editingElement.id,
        newText,
        newStyle
      );

      if (success) {
        console.log('✅ 文本更新成功，开始同步流程');
        
        // 验证预览容器内容已更新
        if (containerRef.current) {
          const previewContent = containerRef.current.innerHTML;
          const containsNewText = previewContent.includes(newText);
          console.log('🔍 预览容器验证:', {
            包含新文本: containsNewText,
            内容长度: previewContent.length
          });
        }
        
        // 立即强制同步下载容器
        forceSyncDownloadContainer();
        
        // 多重验证和重试机制
        let retryCount = 0;
        const maxRetries = 3;
        
        const verifySyncAndCallback = () => {
          if (!downloadContainerRef.current) {
            console.warn('⚠️ 下载容器不存在');
            return;
          }
          
          const syncedContent = downloadContainerRef.current.innerHTML;
          const syncSuccess = syncedContent.includes(newText);
          
          console.log(`🔍 同步验证 (尝试 ${retryCount + 1}/${maxRetries}):`, {
            同步成功: syncSuccess,
            内容长度: syncedContent.length,
            包含新文本: syncedContent.includes(newText)
          });
          
          if (syncSuccess) {
            // 同步成功，触发回调
            if (onContentChange) {
              console.log('📤 触发内容变化回调，内容长度:', syncedContent.length);
              onContentChange(syncedContent);
            }
            console.log('🎯 编辑保存流程完成');
          } else if (retryCount < maxRetries - 1) {
            // 同步失败，重试
            retryCount++;
            console.log(`🔄 同步验证失败，准备重试 ${retryCount}/${maxRetries}`);
            
            // 重新强制同步
            setTimeout(() => {
              forceSyncDownloadContainer();
              setTimeout(verifySyncAndCallback, 100);
            }, 200);
          } else {
            // 达到最大重试次数
            console.error('❌ 达到最大重试次数，同步可能失败');
            if (onContentChange && downloadContainerRef.current) {
              // 仍然尝试触发回调，使用当前内容
              onContentChange(downloadContainerRef.current.innerHTML);
            }
          }
        };
        
        // 延迟验证，给DOM更新时间
        setTimeout(verifySyncAndCallback, 150);
        
      } else {
        console.error('❌ 文本元素更新失败');
        // 可以在这里添加用户提示
      }
    } catch (error) {
      console.error('❌ 编辑保存过程中出错:', error);
      // 可以在这里添加错误提示给用户
    }

    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 处理编辑取消
  const handleEditCancel = () => {
    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 重置到原始内容 - 改进版本
  const resetContent = async () => {
    if (containerRef.current) {
      console.log('🔄 开始重置内容');
      
      cleanupEditableFeatures();
      const decodedContent = decodeUnicode(htmlContent);
      containerRef.current.innerHTML = decodedContent;
      
      // 立即同步到下载容器
      if (downloadContainerRef.current) {
        downloadContainerRef.current.innerHTML = decodedContent;
        console.log('📄 重置时同步下载容器');
      }
      
      // 重新设置编辑功能和内容监控
      setTimeout(async () => {
        setupEditableFeatures();
        setupContentWatcher(); // 重新启动内容监控
        // 编辑功能设置完成后，强制同步下载容器
        await forceSyncDownloadContainer();
        console.log('✅ 重置完成并重新同步');
      }, 100);
    }
  };

  // 初始化内容 - 改进版本，集成内容监控
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('🚀 开始初始化EditableCard内容');
    
    // 清理之前的状态
    cleanupEditableFeatures();
    
    // 解码并设置新内容
    const decodedContent = decodeUnicode(htmlContent);
    containerRef.current.innerHTML = decodedContent;
    
    // 立即同步到下载容器（使用清理后的内容）
    if (downloadContainerRef.current) {
      downloadContainerRef.current.innerHTML = decodedContent;
      console.log('📄 初始化时同步下载容器, 内容长度:', decodedContent.length);
    }
    
    // 短暂延迟后设置编辑功能和内容监控
    const timer = setTimeout(async () => {
      setupEditableFeatures();
      setupContentWatcher(); // 启动实时内容监控
      // 编辑功能设置完成后，使用强制同步确保稳定性
      await forceSyncDownloadContainer();
      console.log('✅ 初始化完成：编辑功能已启用，内容监控已激活，下载容器已同步');
    }, 200);
    
    return () => {
      clearTimeout(timer);
      cleanupEditableFeatures();
    };
  }, [htmlContent]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupEditableFeatures();
    };
  }, []);

  const processedContent = decodeUnicode(htmlContent);
  const { containerStyle, contentStyle, scale } = getScaleAndContainerStyle();

  // 安全检查 dimensions 用于渲染
  const safeDimensions = dimensions && typeof dimensions.width === 'number' && typeof dimensions.height === 'number' 
    ? dimensions 
    : { width: 400, height: 300 };

  return (
    <>
      <div className="space-y-4">
        {/* 编辑工具栏 */}
        <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            {isReady ? (
              <>
                <div className="flex items-center gap-2 text-green-700">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">编辑模式已激活</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="text-gray-600">点击任意文字进行编辑</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-yellow-700">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">正在准备编辑功能...</span>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={resetContent}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!isReady}
          >
            🔄 重置内容
          </button>
        </div>

        {/* 可编辑封面内容 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div style={containerStyle}>
              <div
                ref={containerRef}
                className="block"
                style={contentStyle}
                data-editable-card-container="true"
                data-preview-container="true"
              >
                {/* 内容将通过 innerHTML 动态设置 */}
              </div>
            </div>
          </div>
          
          {/* 隐藏的原尺寸版本，专门用于下载 */}
          <div
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: `${safeDimensions.width}px`,
              height: `${safeDimensions.height}px`,
              fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
              visibility: 'visible',
              opacity: '1',
              zIndex: '-1',
              overflow: 'hidden',
              backgroundColor: 'transparent'
            }}
            data-download-container
            ref={downloadContainerRef}
          />
        </div>

        {/* 状态提示 */}
        <div className={`text-xs text-center p-3 rounded-lg ${
          isReady 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {isReady 
            ? `🎨 编辑模式已启用：点击任何文字打开专业编辑器，支持实时修改内容和样式，下载时会自动应用您的编辑 (缩放比例: ${Math.round(scale * 100)}%)`
            : '⏳ 正在初始化编辑功能，请稍候...'
          }
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editingElement && (
        <EditModal
          isOpen={isModalOpen}
          value={editingElement.text}
          style={editingElement.style}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          maxLength={150}
        />
      )}
    </>
  );
};

export default EditableCard; 