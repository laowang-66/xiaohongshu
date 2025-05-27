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
  
  // 递归清理子元素
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    cleanElementStyles(children[i] as HTMLElement);
  }
}

/**
 * 获取当前编辑内容的纯净HTML
 */
export function getCurrentCleanContent(containerSelector: string, fallbackContent: string): string {
  const container = document.querySelector(containerSelector) as HTMLElement;
  
  if (container && container.innerHTML.trim()) {
    // 克隆容器内容
    const clonedContainer = container.cloneNode(true) as HTMLElement;
    
    // 清理编辑样式
    cleanElementStyles(clonedContainer);
    
    // 获取内部内容，如果有子元素则获取第一个子元素的outerHTML
    const innerContent = clonedContainer.innerHTML.trim();
    if (innerContent) {
      return innerContent;
    }
  }
  
  console.log('使用后备内容进行下载');
  // 如果找不到容器或容器为空，使用后备内容并清理
  return cleanEditingStyles(fallbackContent);
}

/**
 * 使用html2canvas下载封面图片
 */
export async function downloadCoverImage(
  htmlContent: string, 
  options: DownloadOptions
): Promise<boolean> {
  try {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.zIndex = '-9999';
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    const tempElement = tempContainer.firstChild as HTMLElement;
    
    if (!tempElement) {
      throw new Error('无法创建临时元素');
    }
    
    // 清理编辑样式
    cleanElementStyles(tempElement);
    
    // 设置原始尺寸
    tempElement.style.width = `${options.width}px`;
    tempElement.style.height = `${options.height}px`;
    tempElement.style.transform = 'none';
    tempElement.style.transformOrigin = 'initial';
    tempElement.style.margin = '0';
    tempElement.style.padding = '0';
    tempElement.style.position = 'relative';

    // 等待字体和样式加载
    await new Promise(resolve => setTimeout(resolve, 150));

    // 动态导入html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(tempElement, {
      backgroundColor: options.backgroundColor || null,
      width: options.width,
      height: options.height,
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      logging: false,
      onclone: (clonedDoc, element) => {
        // 在克隆的文档中再次清理样式
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            el.style.cursor = '';
            el.style.transition = '';
            el.style.backgroundColor = '';
            el.style.outline = '';
            el.style.outlineOffset = '';
          }
        });
      }
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = options.filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    // 清理临时容器
    document.body.removeChild(tempContainer);
    
    console.log('封面下载成功:', options.filename);
    return true;

  } catch (error) {
    console.error('下载失败:', error);
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