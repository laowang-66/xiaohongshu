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
 * 智能查找下载容器 - 多种策略组合
 */
function findDownloadContainer(): HTMLElement | null {
  // 策略1：查找专用下载容器
  let container = document.querySelector('[data-download-container]') as HTMLElement;
  if (container) {
    console.log('✅ 找到专用下载容器');
    return container;
  }

  // 策略2：查找可编辑卡片容器
  container = document.querySelector('[data-editable-card-container]') as HTMLElement;
  if (container) {
    console.log('✅ 找到可编辑卡片容器');
    return container;
  }

  // 策略3：查找包含封面内容的容器
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
      visibility: hidden !important;
      pointer-events: none !important;
      z-index: -9999 !important;
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
 * 主要下载函数 - 完全重写版本
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
    
    if (typeof containerInput === 'string') {
      if (containerInput === 'auto') {
        // 直接使用智能查找
        sourceContainer = findDownloadContainer();
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
    }

    if (!sourceContainer) {
      throw new Error('无法找到任何可用的源容器');
    }

    console.log('✅ 找到源容器:', sourceContainer.tagName, sourceContainer.className);

    // 第二步：强制同步下载容器（如果需要）
    let downloadContainer = sourceContainer;
    
    // 如果源容器有缩放变换，需要创建清洁版本
    const hasScale = sourceContainer.style.transform && sourceContainer.style.transform.includes('scale');
    const isEditableContainer = sourceContainer.hasAttribute('data-editable-card-container');
    
    if (hasScale || isEditableContainer) {
      console.log('🧹 检测到需要清理的容器，创建下载专用版本');
      downloadContainer = await forceSyncDownloadContainer(sourceContainer);
    }

    // 第三步：创建最终渲染容器
    const renderContainer = downloadContainer.cloneNode(true) as HTMLElement;
    
    // 应用渲染专用样式
    renderContainer.style.cssText = `
      position: absolute !important;
      left: -99999px !important;
      top: -99999px !important;
      width: ${options.width}px !important;
      height: ${options.height}px !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 99999 !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      overflow: hidden !important;
    `;

    // 获取实际内容元素
    const contentElement = renderContainer.firstElementChild as HTMLElement;
    if (contentElement) {
      deepCleanElement(contentElement, options.width, options.height);
    }

    // 添加到DOM并等待渲染
    document.body.appendChild(renderContainer);
    
    // 等待多个渲染周期确保完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100); // 额外等待确保字体加载
        });
      });
    });

    // 强制重排
    renderContainer.offsetHeight;
    renderContainer.offsetWidth;

    console.log('🖼️ 开始html2canvas渲染');
    console.log('📦 渲染容器尺寸:', renderContainer.offsetWidth, 'x', renderContainer.offsetHeight);

    // 第四步：使用html2canvas渲染
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(renderContainer, {
      backgroundColor: options.backgroundColor || null,
      width: options.width,
      height: options.height,
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 10000,
      removeContainer: false,
      windowWidth: options.width,
      windowHeight: options.height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      ignoreElements: (element) => {
        const classList = Array.from(element.classList || []);
        return classList.some(cls => cls.includes('editable-hint') || cls.includes('ring-'));
      },
      onclone: (clonedDoc) => {
        // 在克隆文档中最后一次清理
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          
          // 移除任何残留的编辑样式
          htmlEl.style.removeProperty('transition');
          htmlEl.style.removeProperty('animation');
          htmlEl.style.removeProperty('cursor');
          htmlEl.style.removeProperty('outline');
          htmlEl.style.removeProperty('box-shadow');
          
          if (htmlEl.style.transform && htmlEl.style.transform.includes('scale')) {
            htmlEl.style.transform = 'none';
          }
        });
        
        return clonedDoc;
      }
    });

    // 清理临时容器
    document.body.removeChild(renderContainer);

    console.log('🎨 渲染完成，画布尺寸:', canvas.width, 'x', canvas.height);

    // 验证渲染结果
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('生成的画布尺寸为零');
    }

    // 第五步：下载图片
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('无法生成图片blob'));
          return;
        }

        console.log('💾 开始下载，文件大小:', (blob.size / 1024).toFixed(2), 'KB');
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = options.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ 下载完成:', options.filename);
        resolve(true);
      }, 'image/png', 0.95);
    });

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