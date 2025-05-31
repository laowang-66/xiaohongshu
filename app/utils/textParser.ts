interface ParsedTextElement {
  id: string;
  element: Element;
  text: string;
  originalText: string;
  style: {
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
  bounds: DOMRect;
}

/**
 * 解析 HTML 中的文本元素，识别可编辑的文字内容
 */
export class TextParser {
  private container: HTMLElement;
  private textElements: Map<string, ParsedTextElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 解析容器中的所有文本元素
   */
  parseTextElements(): ParsedTextElement[] {
    this.textElements.clear();
    const elements = this.findTextElements(this.container);
    
    elements.forEach((element, index) => {
      const parsed = this.parseElement(element, index);
      if (parsed) {
        this.textElements.set(parsed.id, parsed);
      }
    });

    return Array.from(this.textElements.values());
  }

  /**
   * 查找所有包含文本的元素
   */
  private findTextElements(container: Element): Element[] {
    const textElements: Element[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          
          // 跳过脚本、样式等非内容元素
          if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

                     // 检查是否包含直接文本内容
           const hasDirectText = Array.from(element.childNodes).some(
             child => child.nodeType === Node.TEXT_NODE && 
             child.textContent?.trim().length && child.textContent.trim().length > 0
           );

           // 或者是叶子节点且包含文本
           const isLeafWithText = element.children.length === 0 && 
             element.textContent?.trim() && element.textContent.trim().length > 0;

          if (hasDirectText || isLeafWithText) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      textElements.push(node as Element);
    }

    return textElements;
  }

  /**
   * 解析单个元素的文本和样式信息
   */
  private parseElement(element: Element, index: number): ParsedTextElement | null {
    const text = this.extractText(element);
    if (!text || text.length === 0) {
      return null;
    }

    const computedStyle = window.getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    
    return {
      id: `text-${index}-${Date.now()}`,
      element,
      text,
      originalText: text,
      style: {
        fontSize: this.parseFontSize(computedStyle.fontSize),
        color: this.parseColor(computedStyle.color),
        fontWeight: this.parseFontWeight(computedStyle.fontWeight),
        textAlign: this.parseTextAlign(computedStyle.textAlign)
      },
      bounds
    };
  }

  /**
   * 提取元素的纯文本内容
   */
  private extractText(element: Element): string {
    // 获取所有直接文本节点
    const textNodes: string[] = [];
    
    Array.from(element.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          textNodes.push(text);
        }
      }
    });

    // 如果没有直接文本节点，但元素是叶子节点，获取其文本内容
    if (textNodes.length === 0 && element.children.length === 0) {
      const text = element.textContent?.trim();
      if (text) {
        textNodes.push(text);
      }
    }

    return textNodes.join(' ').trim();
  }

  /**
   * 解析字体大小
   */
  private parseFontSize(fontSize: string): number {
    const match = fontSize.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1])) : 16;
  }

  /**
   * 解析颜色值
   */
  private parseColor(color: string): string {
    // 处理 rgb() 格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }

    // 处理 rgba() 格式
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }

    // 已经是十六进制格式或命名颜色
    return color.startsWith('#') ? color : '#000000';
  }

  /**
   * 解析字体粗细
   */
  private parseFontWeight(fontWeight: string): 'normal' | 'bold' {
    const weight = parseInt(fontWeight);
    if (!isNaN(weight)) {
      return weight >= 600 ? 'bold' : 'normal';
    }
    return ['bold', 'bolder'].includes(fontWeight) ? 'bold' : 'normal';
  }

  /**
   * 解析文本对齐
   */
  private parseTextAlign(textAlign: string): 'left' | 'center' | 'right' {
    switch (textAlign) {
      case 'center':
        return 'center';
      case 'right':
        return 'right';
      default:
        return 'left';
    }
  }

  /**
   * 更新文本元素的内容和样式 - 改进版本
   */
  updateTextElement(id: string, newText: string, newStyle: any): boolean {
    const textElement = this.textElements.get(id);
    if (!textElement) {
      console.warn('❌ 未找到文本元素:', id);
      return false;
    }

    const { element } = textElement;
    console.log('🎯 正在更新文本元素:', {
      id,
      旧文本: textElement.text,
      新文本: newText,
      元素类型: element.tagName,
      子元素数量: element.children.length
    });
    
    try {
      // 更新文本内容 - 改进版本
      let textUpdated = false;
      
      if (element.children.length === 0) {
        // 叶子节点，直接设置文本内容
        element.textContent = newText;
        textUpdated = true;
        console.log('✅ 叶子节点文本更新成功');
      } else {
        // 有子元素，需要智能更新文本节点
        const textNodes = Array.from(element.childNodes).filter(
          child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()
        );
        
        if (textNodes.length > 0) {
          // 更新第一个有内容的文本节点
          textNodes[0].textContent = newText;
          textUpdated = true;
          console.log('✅ 文本节点更新成功');
        } else {
          // 没有文本节点，创建一个新的
          const textNode = document.createTextNode(newText);
          element.insertBefore(textNode, element.firstChild);
          textUpdated = true;
          console.log('✅ 创建新文本节点成功');
        }
      }

      if (!textUpdated) {
        console.warn('⚠️ 文本内容未能更新');
        return false;
      }

      // 更新样式 - 增强版本
      const htmlElement = element as HTMLElement;
      
      // 先保存当前的重要样式，避免丢失
      const preservedStyles = {
        position: htmlElement.style.position,
        display: htmlElement.style.display,
        visibility: htmlElement.style.visibility,
        transform: htmlElement.style.transform,
        transformOrigin: htmlElement.style.transformOrigin
      };
      
      // 应用新样式
      htmlElement.style.fontSize = `${newStyle.fontSize}px`;
      htmlElement.style.color = newStyle.color;
      htmlElement.style.fontWeight = newStyle.fontWeight;
      htmlElement.style.textAlign = newStyle.textAlign;
      
      // 确保字体一致性
      if (!htmlElement.style.fontFamily || htmlElement.style.fontFamily.includes('system-ui')) {
        htmlElement.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
      }
      
      // 恢复重要样式
      Object.entries(preservedStyles).forEach(([property, value]) => {
        if (value) {
          htmlElement.style.setProperty(property, value);
        }
      });

      // 更新缓存的数据
      textElement.text = newText;
      textElement.style = { ...newStyle };

      console.log('🎨 文本元素更新完成:', {
        最终文本: element.textContent,
        新样式: newStyle
      });

      // 触发重绘，确保更改生效
      element.getBoundingClientRect();

      return true;
    } catch (error) {
      console.error('❌ 更新文本元素时出错:', error);
      return false;
    }
  }

  /**
   * 获取文本元素
   */
  getTextElement(id: string): ParsedTextElement | undefined {
    return this.textElements.get(id);
  }

  /**
   * 获取所有文本元素
   */
  getAllTextElements(): ParsedTextElement[] {
    return Array.from(this.textElements.values());
  }

  /**
   * 重置解析器
   */
  reset(): void {
    this.textElements.clear();
  }
}

/**
 * 工具函数：为元素添加可视化编辑提示
 */
export function addEditableHints(elements: ParsedTextElement[]): void {
  elements.forEach(({ element }) => {
    const htmlElement = element as HTMLElement;
    
    // 添加悬停效果样式
    htmlElement.style.cursor = 'pointer';
    htmlElement.style.transition = 'all 0.2s ease';
    
    // 添加事件监听器
    const handleMouseEnter = () => {
      htmlElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      htmlElement.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
      htmlElement.style.outlineOffset = '2px';
    };

    const handleMouseLeave = () => {
      htmlElement.style.backgroundColor = '';
      htmlElement.style.outline = '';
      htmlElement.style.outlineOffset = '';
    };

    htmlElement.addEventListener('mouseenter', handleMouseEnter);
    htmlElement.addEventListener('mouseleave', handleMouseLeave);
    
    // 保存清理函数
    (htmlElement as any).__removeEditableHints = () => {
      htmlElement.removeEventListener('mouseenter', handleMouseEnter);
      htmlElement.removeEventListener('mouseleave', handleMouseLeave);
      htmlElement.style.cursor = '';
      htmlElement.style.transition = '';
      htmlElement.style.backgroundColor = '';
      htmlElement.style.outline = '';
      htmlElement.style.outlineOffset = '';
    };
  });
}

/**
 * 工具函数：移除可视化编辑提示
 */
export function removeEditableHints(container: HTMLElement): void {
  const elements = container.querySelectorAll('[style*="cursor: pointer"]');
  elements.forEach((element) => {
    const cleanupFn = (element as any).__removeEditableHints;
    if (cleanupFn) {
      cleanupFn();
    }
  });
} 