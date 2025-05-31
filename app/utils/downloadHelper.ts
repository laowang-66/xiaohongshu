/**
 * 改进的下载助手 - 彻底解决预览与下载不一致问题
 * 
 * 核心改进：
 * 1. 智能容器查找策略
 * 2. 强化的内容同步机制
 * 3. 完善的样式清理和一致性保证
 * 4. 多种回退方案
 */

export interface DownloadOptions {
  width: number;
  height: number;
  filename: string;
  backgroundColor?: string | null;
  scale?: number;
}

/**
 * 智能查找下载容器 - 改进版本，优先最新内容
 */
function findDownloadContainer(): HTMLElement | null {
  // 策略1：查找专用下载容器（最优先）
  let container = document.querySelector('[data-download-container]') as HTMLElement;
  if (container) {
    console.log('✅ 找到专用下载容器');
    
    // 验证容器内容是否有效且是最新的
    const contentLength = container.innerHTML.trim().length;
    const hasValidContent = contentLength > 100;
    
    if (hasValidContent) {
      console.log('✅ 下载容器内容有效，长度:', contentLength);
      return container;
    } else {
      console.log('⚠️ 下载容器内容可能过时，尝试强制同步');
      
      // 查找预览容器并同步
      const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement;
      if (previewContainer && previewContainer.innerHTML.trim().length > contentLength) {
        console.log('🔄 从预览容器同步最新内容');
        container.innerHTML = previewContainer.innerHTML;
        
        // 立即应用下载样式清理
        const downloadContent = container.firstElementChild as HTMLElement;
        if (downloadContent) {
          // 获取尺寸信息
          const computedStyle = window.getComputedStyle(downloadContent);
          const width = parseInt(computedStyle.width) || 900;
          const height = parseInt(computedStyle.height) || 1200;
          
          downloadContent.style.cssText = `
            width: ${width}px !important;
            height: ${height}px !important;
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
        
        return container;
      }
    }
  }

  // 策略2：查找可编辑卡片容器（预览容器）
  container = document.querySelector('[data-preview-container]') as HTMLElement;
  if (container) {
    console.log('✅ 找到预览容器，创建下载副本');
    
    // 创建下载专用副本
    const downloadCopy = document.createElement('div');
    downloadCopy.setAttribute('data-download-container', 'temp');
    downloadCopy.style.cssText = `
      position: absolute !important;
      left: -99999px !important;
      top: -99999px !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: none !important;
      z-index: -9999 !important;
      overflow: hidden !important;
      background-color: transparent !important;
    `;
    
    // 复制内容并清理
    downloadCopy.innerHTML = container.innerHTML;
    
    // 应用下载样式
    const content = downloadCopy.firstElementChild as HTMLElement;
    if (content) {
      // 获取原始尺寸
      const computedStyle = window.getComputedStyle(content);
      const width = parseInt(computedStyle.width) || 900;
      const height = parseInt(computedStyle.height) || 1200;
      
      content.style.cssText = `
        width: ${width}px !important;
        height: ${height}px !important;
        position: relative !important;
        overflow: hidden !important;
        transform: none !important;
        scale: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-sizing: border-box !important;
        font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      // 清理编辑标记，但保持内容可见
      const cleanEditingMarks = (el: HTMLElement) => {
        el.removeAttribute('data-editable-id');
        el.removeAttribute('contenteditable');
        el.classList.remove('editable-element', 'editable-hint');
        el.style.removeProperty('cursor');
        el.style.removeProperty('outline');
        
        // 确保所有子元素也是可见的
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        
        Array.from(el.children).forEach(child => {
          cleanEditingMarks(child as HTMLElement);
        });
      };
      
      cleanEditingMarks(content);
    }
    
    document.body.appendChild(downloadCopy);
    return downloadCopy;
  }

  // 策略3：查找包含封面内容的容器（兜底方案）
  const candidates = document.querySelectorAll('div[style*="width"][style*="height"]');
  for (const candidate of Array.from(candidates)) {
    const element = candidate as HTMLElement;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    // 检查是否是合理的封面尺寸
    if ((width >= 900 && height >= 268) || (width >= 360 && height >= 107)) {
      console.log('✅ 找到候选封面容器:', { width, height });
      return element;
    }
  }

  console.log('❌ 未找到合适的下载容器');
  return null;
}

/**
 * 强制同步下载容器内容 - 确保与预览完全一致
 */
async function forceSyncDownloadContainer(originalContainer: HTMLElement): Promise<HTMLElement> {
  console.log('🔄 开始强制同步下载容器...');

  // 查找或创建下载容器
  let downloadContainer = document.querySelector('[data-download-container]') as HTMLElement;
  
  if (!downloadContainer) {
    console.log('📦 创建新的下载容器');
    downloadContainer = document.createElement('div');
    downloadContainer.setAttribute('data-download-container', 'true');
    downloadContainer.style.cssText = `
      position: absolute !important;
      left: -99999px !important;
      top: -99999px !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: none !important;
      z-index: -9999 !important;
      overflow: hidden !important;
      background-color: transparent !important;
    `;
    document.body.appendChild(downloadContainer);
  }

  // 获取原始内容
  const originalContent = originalContainer.innerHTML;
  console.log('📋 获取原始内容长度:', originalContent.length);

  // 设置下载容器内容
  downloadContainer.innerHTML = originalContent;

  // 等待DOM更新
  await new Promise(resolve => requestAnimationFrame(resolve));

  console.log('✅ 下载容器同步完成');
  return downloadContainer;
}

/**
 * 深度清理元素样式 - 移除所有编辑和缩放相关样式
 */
function deepCleanElement(element: HTMLElement, targetWidth: number, targetHeight: number): void {
  // 设置目标容器尺寸和基础样式
  element.style.cssText = `
    width: ${targetWidth}px !important;
    height: ${targetHeight}px !important;
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

  // 递归清理所有子元素
  const cleanAllChildren = (parent: HTMLElement) => {
    Array.from(parent.children).forEach(child => {
      const childElement = child as HTMLElement;
      
      // 移除编辑相关的类名和属性
      childElement.classList.remove('editable-element', 'editable-hint', 'ring-2', 'ring-blue-500');
      childElement.removeAttribute('data-editable-id');
      childElement.removeAttribute('data-text-element');
      childElement.removeAttribute('contenteditable');
      childElement.removeAttribute('data-editable-card-container');
      childElement.removeAttribute('data-download-container');

      // 移除编辑状态样式
      const editingStyles = [
        'cursor', 'outline', 'outline-offset', 'transition', 
        'user-select', 'pointer-events', 'box-shadow',
        'animation', 'transition-property', 'transition-duration'
      ];
      
      editingStyles.forEach(style => {
        childElement.style.removeProperty(style);
      });

      // 特别处理transform相关
      if (childElement.style.transform && childElement.style.transform.includes('scale')) {
        childElement.style.transform = 'none';
      }
      childElement.style.transformOrigin = 'initial';

      // 确保字体一致性
      if (!childElement.style.fontFamily || childElement.style.fontFamily === '') {
        childElement.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
      }

      // 递归处理
      cleanAllChildren(childElement);
    });
  };

  cleanAllChildren(element);
}

/**
 * 主要下载函数 - 完全重写版本，增强调试和验证
 */
export async function downloadCoverImage(
  containerInput: string | HTMLElement,
  options: DownloadOptions
): Promise<boolean> {
  try {
    console.log('🚀 开始下载流程 - 改进版本');
    console.log('📏 目标尺寸:', options.width, 'x', options.height);
    
    // 第一步：智能获取源容器
    let sourceContainer: HTMLElement | null = null;
    let isTemporaryContainer = false;
    
    if (typeof containerInput === 'string') {
      if (containerInput === 'auto') {
        // 直接使用智能查找
        sourceContainer = findDownloadContainer();
        isTemporaryContainer = sourceContainer?.hasAttribute('data-download-container') === true &&
                               sourceContainer?.getAttribute('data-download-container') === 'temp';
      } else {
        sourceContainer = document.querySelector(containerInput);
      }
    } else {
      sourceContainer = containerInput;
    }

    // 如果没找到源容器，使用智能查找
    if (!sourceContainer) {
      console.log('🔍 使用智能查找策略...');
      sourceContainer = findDownloadContainer();
      isTemporaryContainer = sourceContainer?.hasAttribute('data-download-container') === true &&
                             sourceContainer?.getAttribute('data-download-container') === 'temp';
    }

    if (!sourceContainer) {
      throw new Error('无法找到任何可用的源容器');
    }

    console.log('✅ 找到源容器:', sourceContainer.tagName, sourceContainer.className);
    console.log('📄 容器内容预览:', sourceContainer.innerHTML.slice(0, 200) + '...');
    console.log('📏 容器实际尺寸:', sourceContainer.offsetWidth, 'x', sourceContainer.offsetHeight);

    // 内容一致性验证 - 新增
    const validateContentConsistency = () => {
      const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement;
      const downloadContainer = document.querySelector('[data-download-container]') as HTMLElement;
      
      if (previewContainer && downloadContainer) {
        const previewText = previewContainer.textContent?.trim() || '';
        const downloadText = downloadContainer.textContent?.trim() || '';
        const isConsistent = previewText === downloadText;
        
        console.log('🔍 内容一致性验证:', {
          预览内容长度: previewText.length,
          下载内容长度: downloadText.length,
          内容一致: isConsistent,
          预览文本片段: previewText.slice(0, 50) + '...',
          下载文本片段: downloadText.slice(0, 50) + '...'
        });
        
        if (!isConsistent && previewText.length > 0) {
          console.warn('⚠️ 检测到内容不一致，尝试强制同步');
          downloadContainer.innerHTML = previewContainer.innerHTML;
          
          // 重新应用下载样式
          const content = downloadContainer.firstElementChild as HTMLElement;
          if (content) {
            content.style.cssText = `
              width: ${options.width}px !important;
              height: ${options.height}px !important;
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
          
          console.log('🔄 内容同步完成，重新验证');
          const newDownloadText = downloadContainer.textContent?.trim() || '';
          const newIsConsistent = previewText === newDownloadText;
          console.log('✅ 同步后一致性:', newIsConsistent);
        }
      }
    };

    // 执行内容一致性验证
    validateContentConsistency();

    // 第二步：强制同步下载容器（如果需要）
    let downloadContainer = sourceContainer;
    
    // 如果源容器有缩放变换，需要创建清洁版本
    const hasScale = sourceContainer.style.transform && sourceContainer.style.transform.includes('scale');
    const isEditableContainer = sourceContainer.hasAttribute('data-editable-card-container') || 
                               sourceContainer.hasAttribute('data-preview-container');
    
    if (hasScale || isEditableContainer) {
      console.log('🧹 检测到需要清理的容器，创建下载专用版本');
      downloadContainer = await forceSyncDownloadContainer(sourceContainer);
    }

    // 第三步：最终内容验证
    console.log('📊 最终下载容器状态:', {
      内容长度: downloadContainer.innerHTML.length,
      文本内容: downloadContainer.textContent?.slice(0, 100) + '...',
      容器属性: downloadContainer.hasAttribute('data-download-container'),
      实际尺寸: `${downloadContainer.offsetWidth}x${downloadContainer.offsetHeight}`
    });

    // 第四步：尝试下载
    try {
      // 动态导入html2canvas以优化加载性能
      const html2canvas = (await import('html2canvas')).default;
      
      console.log('🖼️ 开始截图转换...');
      
      const canvas = await html2canvas(downloadContainer, {
        width: options.width,
        height: options.height,
        scale: options.scale || 2,
        backgroundColor: options.backgroundColor || '#ffffff',
        useCORS: true,
        allowTaint: false,
        removeContainer: false,
        logging: false,
        imageTimeout: 10000, // 10秒图片超时
        foreignObjectRendering: false, // 禁用foreignObject渲染，提高兼容性
        ignoreElements: (element) => {
          // 忽略不可见或编辑相关的元素
          const style = window.getComputedStyle(element);
          return style.visibility === 'hidden' || 
                 style.opacity === '0' || 
                 element.hasAttribute('contenteditable') ||
                 element.classList.contains('editable-hint');
        },
        onclone: (clonedDoc, element) => {
          // 确保克隆文档中的所有元素都是可见的
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              htmlEl.style.visibility = 'visible';
              htmlEl.style.opacity = '1';
              // 确保字体正确设置
              if (!htmlEl.style.fontFamily || htmlEl.style.fontFamily.includes('system-ui')) {
                htmlEl.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
              }
            }
          });
          
          // 设置根容器样式
          if (element) {
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
          }
          
          console.log('🔄 DOM克隆完成，已优化所有元素可见性和字体');
        }
      });

      console.log('📸 截图完成，画布尺寸:', canvas.width, 'x', canvas.height);
      console.log('📥 开始下载...');
      
      // 验证画布内容
      const canvasData = canvas.toDataURL('image/png');
      console.log('🎨 画布数据大小:', Math.round(canvasData.length / 1024), 'KB');
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = options.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ 下载完成，文件大小:', Math.round(blob.size / 1024), 'KB');
        } else {
          throw new Error('生成图片失败');
        }
      }, 'image/png', 0.95);

      // 清理临时容器
      if (isTemporaryContainer && sourceContainer.parentNode) {
        console.log('🗑️ 清理临时下载容器');
        sourceContainer.parentNode.removeChild(sourceContainer);
      }

      return true;

    } catch (error) {
      console.error('❌ 下载过程出错:', error);
      
      // 回退方案：尝试使用简化的配置重新下载
      try {
        console.log('🔄 尝试回退方案...');
        const html2canvas = (await import('html2canvas')).default;
        
        const canvas = await html2canvas(downloadContainer, {
          width: options.width,
          height: options.height,
          scale: 1, // 降低缩放避免内存问题
          backgroundColor: '#ffffff',
          useCORS: false,
          allowTaint: true,
          removeContainer: false,
          logging: false
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = options.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('✅ 回退下载完成');
          }
        }, 'image/png', 0.9);

        // 清理临时容器
        if (isTemporaryContainer && sourceContainer.parentNode) {
          console.log('🗑️ 清理临时下载容器');
          sourceContainer.parentNode.removeChild(sourceContainer);
        }

        return true;
      } catch (fallbackError) {
        console.error('❌ 回退方案也失败了:', fallbackError);
        
        // 确保清理临时容器
        if (isTemporaryContainer && sourceContainer.parentNode) {
          try {
            sourceContainer.parentNode.removeChild(sourceContainer);
          } catch (e) {
            console.warn('清理临时容器失败:', e);
          }
        }
        
        throw new Error(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

  } catch (error) {
    console.error('❌ 下载失败:', error);
    return false;
  }
}

/**
 * 生成文件名
 */
export function generateFileName(sizeLabel: string, width: number, height: number): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${sizeLabel}_${width}x${height}_${timestamp}.png`;
}

/**
 * 从HTML字符串下载 - 备用方法
 */
export async function downloadFromHtml(
  htmlContent: string,
  options: DownloadOptions
): Promise<boolean> {
  try {
    console.log('🔄 使用HTML字符串下载方法');
    
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.width = `${options.width}px`;
    tempContainer.style.height = `${options.height}px`;
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.visibility = 'visible';
    tempContainer.style.opacity = '1';
    
    document.body.appendChild(tempContainer);
    
    const result = await downloadCoverImage(tempContainer, options);
    
    document.body.removeChild(tempContainer);
    
    return result;
  } catch (error) {
    console.error('❌ HTML字符串下载失败:', error);
    return false;
  }
} 