/**
 * 下载辅助工具 - 专门处理编辑后内容的下载
 */

export interface DownloadOptions {
  width: number;
  height: number;
  filename: string;
  backgroundColor?: string | null;
  scale?: number;
}

/**
 * 清理HTML内容中的编辑提示样式
 */
export function cleanEditingStyles(htmlContent: string): string {
  return htmlContent
    // 移除编辑相关的内联样式
    .replace(/cursor:\s*pointer;?/g, '')
    .replace(/transition:\s*[^;]+;?/g, '')
    .replace(/background-color:\s*rgba\(59,\s*130,\s*246[^)]*\);?/g, '')
    .replace(/outline:\s*[^;]+rgba\(59,\s*130,\s*246[^)]*\)[^;]*;?/g, '')
    .replace(/outline-offset:\s*[^;]+;?/g, '')
    .replace(/border:\s*[^;]*rgba\(59,\s*130,\s*246[^)]*\)[^;]*;?/g, '')
    .replace(/box-shadow:\s*[^;]*rgba\(59,\s*130,\s*246[^)]*\)[^;]*;?/g, '')
    // 移除编辑相关的类名
    .replace(/class="[^"]*editable-[^"]*"/g, '')
    .replace(/data-editable-[^=]*="[^"]*"/g, '')
    .replace(/data-text-element="[^"]*"/g, '')
    // 清理空的style属性
    .replace(/\s*style=""\s*/g, '')
    .replace(/\s*style=";\s*"/g, '')
    .replace(/\s*style="\s*;\s*"/g, '');
}

/**
 * 清理DOM元素的编辑样式
 */
export function cleanElementStyles(element: HTMLElement): void {
  // 移除编辑提示样式
  element.style.cursor = '';
  element.style.transition = '';
  element.style.backgroundColor = '';
  element.style.outline = '';
  element.style.outlineOffset = '';
  element.style.border = '';
  element.style.borderRadius = '';
  element.style.boxShadow = '';
  
  // 移除编辑相关的类名
  element.classList.remove('editable-element', 'editable-hint');
  
  // 移除data属性
  element.removeAttribute('data-editable-id');
  element.removeAttribute('data-text-element');
  
  // 递归清理子元素
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    cleanElementStyles(children[i] as HTMLElement);
  }
}

/**
 * 使用html2canvas下载封面图片 - 改进版本
 */
export async function downloadCoverImage(
  htmlContent: string, 
  options: DownloadOptions
): Promise<boolean> {
  try {
    console.log('🚀 开始下载流程');
    console.log('📏 目标尺寸:', options.width, 'x', options.height);
    console.log('📄 内容长度:', htmlContent.length);
    console.log('🔍 内容预览:', htmlContent.substring(0, 300) + '...');
    
    if (!htmlContent || htmlContent.trim().length === 0) {
      console.error('❌ HTML内容为空，无法下载');
      throw new Error('HTML内容为空');
    }

    // 先清理内容中的编辑样式
    const cleanedContent = cleanEditingStyles(htmlContent);
    console.log('✅ 内容清理完成，长度:', cleanedContent.length);

    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.zIndex = '-9999';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.overflow = 'hidden';
    
    // 设置内容
    tempContainer.innerHTML = cleanedContent;
    document.body.appendChild(tempContainer);
    console.log('📦 临时容器已创建并添加到DOM');

    const tempElement = tempContainer.firstChild as HTMLElement;
    
    if (!tempElement) {
      document.body.removeChild(tempContainer);
      console.error('❌ 无法创建临时元素');
      throw new Error('无法创建临时元素');
    }
    
    console.log('🎯 临时元素类型:', tempElement.tagName);
    
    // 再次清理编辑样式
    cleanElementStyles(tempElement);
    
    // 设置原始尺寸和关键样式
    tempElement.style.width = `${options.width}px`;
    tempElement.style.height = `${options.height}px`;
    tempElement.style.transform = 'none';
    tempElement.style.transformOrigin = 'initial';
    tempElement.style.margin = '0';
    tempElement.style.padding = '0';
    tempElement.style.position = 'relative';
    tempElement.style.display = 'block';
    tempElement.style.visibility = 'visible';
    tempElement.style.overflow = 'hidden';
    tempElement.style.boxSizing = 'border-box';
    
    // 确保字体渲染
    tempElement.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif";
    (tempElement.style as any).fontSmooth = 'antialiased';
    (tempElement.style as any).webkitFontSmoothing = 'antialiased';
    
    console.log('🎨 元素样式已设置，准备渲染');

    // 等待字体和样式完全加载
    await new Promise(resolve => setTimeout(resolve, 300));

    // 动态导入html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    console.log('🖼️ 开始html2canvas渲染...');
    
    // 改进的html2canvas配置
    const canvas = await html2canvas(tempElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      width: options.width,
      height: options.height,
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      logging: false,
      removeContainer: false,
      windowWidth: options.width,
      windowHeight: options.height,
      scrollX: 0,
      scrollY: 0,
      // 增强对CSS3特性的支持
      ignoreElements: (element) => {
        // 忽略一些可能导致问题的元素
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'noscript') {
          return true;
        }
        // 忽略编辑相关的元素
        if (element.getAttribute('data-editable-id') || 
            element.classList.contains('editable-element') ||
            element.classList.contains('editable-hint')) {
          console.log('🚫 忽略编辑元素:', element);
          return true;
        }
        return false;
      },
      onclone: (clonedDoc, element) => {
        console.log('🔄 onclone回调开始');
        
        // 在克隆的文档中应用更全面的样式清理
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            // 移除编辑相关样式
            const editingStyles = [
              'cursor', 'transition', 'outline', 'outlineOffset', 
              'boxShadow', 'border', 'borderRadius'
            ];
            editingStyles.forEach(prop => {
              if (el.style[prop] && 
                  (el.style[prop].includes('rgba(59, 130, 246') || 
                   el.style[prop].includes('pointer'))) {
                el.style.removeProperty(prop);
              }
            });
          }
          
          // 移除编辑相关的类名和属性
          el.classList.remove('editable-element', 'editable-hint');
          el.removeAttribute('data-editable-id');
          el.removeAttribute('data-text-element');
        });
        
        // 确保根元素有正确的尺寸
        element.style.width = `${options.width}px`;
        element.style.height = `${options.height}px`;
        element.style.overflow = 'hidden';
        element.style.position = 'relative';
        
        console.log('✅ onclone回调完成，清理了', allElements.length, '个元素');
      }
    });

    console.log('🎨 html2canvas渲染完成');
    console.log('📐 画布尺寸:', canvas.width, 'x', canvas.height);
    console.log('📊 画布数据:', canvas.toDataURL().length, '字节');

    // 验证画布内容
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('❌ 生成的画布尺寸异常');
      throw new Error('生成的画布尺寸异常');
    }

    // 创建下载链接
    const dataURL = canvas.toDataURL('image/png', 1.0);
    console.log('🔗 DataURL生成完成，长度:', dataURL.length);
    
    if (dataURL.length < 1000) {
      console.error('❌ 生成的图片数据过小，可能为空');
      throw new Error('生成的图片数据异常');
    }

    const link = document.createElement('a');
    link.download = options.filename;
    link.href = dataURL;
    
    // 确保下载能够触发
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理临时容器
    document.body.removeChild(tempContainer);
    
    console.log('🎉 封面下载成功:', options.filename);
    return true;

  } catch (error) {
    console.error('💥 下载失败详细信息:', error);
    if (error instanceof Error) {
      console.error('📝 错误消息:', error.message);
      console.error('📋 错误堆栈:', error.stack);
    }
    
    // 清理可能残留的临时容器
    const tempContainers = document.querySelectorAll('[style*="-9999px"]');
    tempContainers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    
    return false;
  }
}

/**
 * 生成下载文件名
 */
export function generateFileName(sizeLabel: string, width: number, height: number): string {
  const timestamp = new Date().getTime();
  return `${sizeLabel}_${width}x${height}_${timestamp}.png`;
} 