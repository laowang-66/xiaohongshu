/**
 * 设计风格配置文件
 * 基于用户提供的11种专业设计风格和提示词模板
 */

export interface DesignStyle {
  key: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    titleSize: string;
    subtitleSize: string;
    bodySize: string;
    fontFamily: string;
    fontWeight: {
      title: string;
      subtitle: string;
      body: string;
    };
    lineHeight: {
      title: string;
      subtitle: string;
      body: string;
    };
  };
  layout: {
    type: 'card' | 'full' | 'split' | 'overlay';
    spacing: string;
    corners: string;
    shadows: string;
  };
  designPrinciples: string[];
  technicalSpecs: {
    cssFeatures: string[];
    animations: string[];
    interactions: string[];
  };
  platformSuitability: {
    xiaohongshu: number; // 1-10
    video: number;
    wechat: number;
  };
  contentTypes: string[]; // 适合的内容类型
}

export const PROFESSIONAL_DESIGN_STYLES: DesignStyle[] = [
  {
    key: 'soft_tech_card_style',
    name: '柔和科技卡片风',
    description: '圆角卡片布局，轻柔色彩系统，适合科技类内容的友好呈现',
    category: '科技友好',
    features: ['圆角卡片', '渐变背景', '微立体阴影', '网格布局', '功能美学'],
    colorPalette: {
      primary: '#f8f4ff',
      secondary: '#e8d5ff',
      accent: '#4682b4',
      background: 'linear-gradient(135deg, #f8f4ff 0%, #e8d5ff 50%, #ffbdbd 100%)'
    },
    typography: {
      titleSize: '36-42px',
      subtitleSize: '18-22px',
      bodySize: '14-16px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontWeight: {
        title: '700',
        subtitle: '500',
        body: '400'
      },
      lineHeight: {
        title: '1.2',
        subtitle: '1.4',
        body: '1.6'
      }
    },
    layout: {
      type: 'card',
      spacing: '宽松舒适',
      corners: '大圆角(16px)',
      shadows: 'subtle(0 2px 12px rgba(0,0,0,0.08))'
    },
    designPrinciples: [
      '友好亲和感',
      '功能美学主义',
      '极简留白设计',
      '数据突显处理',
      '层级分明排版'
    ],
    technicalSpecs: {
      cssFeatures: ['flex/grid布局', 'CSS变量', '柔和渐变', 'box-shadow'],
      animations: ['微妙过渡', 'hover效果'],
      interactions: ['卡片悬停', '按钮反馈']
    },
    platformSuitability: {
      xiaohongshu: 9,
      video: 6,
      wechat: 8
    },
    contentTypes: ['科技产品', '教程指南', '数据展示', '应用介绍']
  },
  
  {
    key: 'modern_business_news',
    name: '现代商务资讯卡片风',
    description: '深绿深红色调象征专业，网格底纹增强科技感，商务应用美学',
    category: '商务专业',
    features: ['色彩情绪编码', '主题色块', '网格底纹', '三级信息层级', '功能导向'],
    colorPalette: {
      primary: '#2d5a27',
      secondary: '#8b1538',
      accent: '#f5f5f5',
      background: 'linear-gradient(135deg, #2d5a27 0%, #37474F 100%)'
    },
    typography: {
      titleSize: '32-38px',
      subtitleSize: '18-24px',
      bodySize: '14-16px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontWeight: {
        title: '700',
        subtitle: '600',
        body: '400'
      },
      lineHeight: {
        title: '1.3',
        subtitle: '1.4',
        body: '1.6'
      }
    },
    layout: {
      type: 'card',
      spacing: '严谨规整',
      corners: '小圆角(8px)',
      shadows: '专业阴影(0 4px 16px rgba(45, 90, 39, 0.15))'
    },
    designPrinciples: [
      '专业稳重氛围',
      '信息获取效率',
      '商务应用美学',
      '左对齐规整排版',
      '高对比度文字'
    ],
    technicalSpecs: {
      cssFeatures: ['网格纹理', '渐变背景', '指向性图标', '进度指示'],
      animations: ['点阵动效', '指示箭头'],
      interactions: ['卡片展开', '区域切换']
    },
    platformSuitability: {
      xiaohongshu: 7,
      video: 5,
      wechat: 10
    },
    contentTypes: ['商务资讯', '金融报告', '企业动态', '行业分析']
  },

  {
    key: 'flowing_tech_blue_style',
    name: '流动科技蓝风格',
    description: '现代简约科技风，蓝白渐变配合流线型曲线，营造动态科技感',
    category: '科技动感',
    features: ['蓝色系主体', '流线曲线', '圆角矩形', '光影柔和', '折纸元素'],
    colorPalette: {
      primary: '#4682b4',
      secondary: '#87ceeb',
      accent: '#f0f8ff',
      background: 'linear-gradient(135deg, #4682b4 0%, #87ceeb 50%, #f0f8ff 100%)'
    },
    typography: {
      titleSize: '42-52px',
      subtitleSize: '24-28px',
      bodySize: '16-18px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontWeight: {
        title: '700',
        subtitle: '500',
        body: '400'
      },
      lineHeight: {
        title: '1.2',
        subtitle: '1.3',
        body: '1.5'
      }
    },
    layout: {
      type: 'overlay',
      spacing: '流动自然',
      corners: '动态圆角(16px + 流线)',
      shadows: '科技光效(0 4px 20px rgba(70, 130, 180, 0.15))'
    },
    designPrinciples: [
      '科技未来感',
      '流动美学',
      '简约现代',
      '视觉动感',
      '轻盈通透'
    ],
    technicalSpecs: {
      cssFeatures: ['流线型曲线', '蓝白渐变', '几何抽象', '半透明波纹'],
      animations: ['流动效果', '螺旋动画', '光效渐变'],
      interactions: ['曲线跟随', '波纹扩散']
    },
    platformSuitability: {
      xiaohongshu: 8,
      video: 9,
      wechat: 7
    },
    contentTypes: ['科技产品', '未来概念', '数据可视化', '创新方案']
  },

  {
    key: 'minimal_grid_master',
    name: '极简格栅主义封面风格',
    description: '黑白极简配合强烈几何感，网格系统布局，工业风格装饰',
    category: '极简格栅',
    features: ['黑白对比', '几何元素', '网格布局', '留白艺术', '工业装饰'],
    colorPalette: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#00ff00',
      background: '#000000'
    },
    typography: {
      titleSize: '72-96px',
      subtitleSize: '24-32px',
      bodySize: '14-18px',
      fontFamily: '"Helvetica Neue", "Arial", sans-serif',
      fontWeight: {
        title: '900',
        subtitle: '300',
        body: '400'
      },
      lineHeight: {
        title: '1.0',
        subtitle: '1.2',
        body: '1.4'
      }
    },
    layout: {
      type: 'full',
      spacing: '严格网格',
      corners: '直角',
      shadows: '无阴影'
    },
    designPrinciples: [
      '极简主义',
      '几何美学',
      '工业设计',
      '视觉冲击',
      '留白艺术'
    ],
    technicalSpecs: {
      cssFeatures: ['网格系统', '几何形状', '线条装饰', '对比色块'],
      animations: ['几何变换', '线条延展'],
      interactions: ['网格交互', '区块切换']
    },
    platformSuitability: {
      xiaohongshu: 6,
      video: 10,
      wechat: 5
    },
    contentTypes: ['艺术设计', '建筑空间', '工业产品', '概念展示']
  },

  {
    key: 'digital_ticket_style',
    name: '数字极简票券风',
    description: '黑白对比主导，票券化布局，东西方美学融合，数字界面映射',
    category: '数字票券',
    features: ['票券布局', '几何分区', '留白艺术', '中英混排', '数字界面'],
    colorPalette: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#f0f0f0',
      background: 'linear-gradient(135deg, #000000 0%, #333333 100%)'
    },
    typography: {
      titleSize: '48-64px',
      subtitleSize: '20-26px',
      bodySize: '12-16px',
      fontFamily: '"Roboto Mono", "SF Mono", monospace',
      fontWeight: {
        title: '700',
        subtitle: '400',
        body: '300'
      },
      lineHeight: {
        title: '1.1',
        subtitle: '1.3',
        body: '1.5'
      }
    },
    layout: {
      type: 'split',
      spacing: '精确控制',
      corners: '直角',
      shadows: 'minimal'
    },
    designPrinciples: [
      '东西融合',
      '极简设计',
      '工业感',
      '功能导向',
      '数字美学'
    ],
    technicalSpecs: {
      cssFeatures: ['票券分区', '边框线条', 'UI元素', '功能指示符'],
      animations: ['扫描效果', 'UI交互'],
      interactions: ['票券翻转', 'CHECK IN']
    },
    platformSuitability: {
      xiaohongshu: 7,
      video: 8,
      wechat: 9
    },
    contentTypes: ['活动票券', '会员卡片', '数字凭证', '科技产品']
  },

  {
    key: 'luxury_natural_mood',
    name: '奢华自然意境风',
    description: '高级沉稳色调配合意境式呈现，东西方美学融合，沉浸式体验',
    category: '奢华意境',
    features: ['沉稳色调', '意境呈现', '空间层次', '摄影级光影', '水墨意境'],
    colorPalette: {
      primary: '#2f4f4f',
      secondary: '#8fbc8f',
      accent: '#daa520',
      background: 'linear-gradient(135deg, #2f4f4f 0%, rgba(47, 79, 79, 0.8) 100%)'
    },
    typography: {
      titleSize: '38-48px',
      subtitleSize: '20-26px',
      bodySize: '16-18px',
      fontFamily: '"Noto Serif SC", "Times New Roman", serif',
      fontWeight: {
        title: '600',
        subtitle: '400',
        body: '300'
      },
      lineHeight: {
        title: '1.3',
        subtitle: '1.5',
        body: '1.7'
      }
    },
    layout: {
      type: 'overlay',
      spacing: '意境留白',
      corners: '自然圆角',
      shadows: '景深虚化'
    },
    designPrinciples: [
      '奢华内敛',
      '自然和谐',
      '意境深远',
      '品质追求',
      '摄影级美感'
    ],
    technicalSpecs: {
      cssFeatures: ['景深效果', '半透明叠加', '光影处理', '悬浮定位'],
      animations: ['意境渐变', '光影流动'],
      interactions: ['沉浸体验', '视差滚动']
    },
    platformSuitability: {
      xiaohongshu: 10,
      video: 7,
      wechat: 8
    },
    contentTypes: ['奢侈品牌', '自然风光', '生活方式', '艺术鉴赏']
  }
];

// 根据平台推荐最适合的设计风格
export function getRecommendedStylesForPlatform(platform: string): DesignStyle[] {
  return PROFESSIONAL_DESIGN_STYLES
    .filter(style => style.platformSuitability[platform as keyof typeof style.platformSuitability] >= 7)
    .sort((a, b) => 
      b.platformSuitability[platform as keyof typeof b.platformSuitability] - 
      a.platformSuitability[platform as keyof typeof a.platformSuitability]
    );
}

// 根据内容类型推荐设计风格
export function getStylesByContentType(contentType: string): DesignStyle[] {
  return PROFESSIONAL_DESIGN_STYLES.filter(style => 
    style.contentTypes.some(type => 
      type.toLowerCase().includes(contentType.toLowerCase()) ||
      contentType.toLowerCase().includes(type.toLowerCase())
    )
  );
}

// 获取设计风格的完整提示词
export function getStylePromptTemplate(styleKey: string): string | null {
  const style = PROFESSIONAL_DESIGN_STYLES.find(s => s.key === styleKey);
  if (!style) return null;

  return `你是一位专业的视觉设计师，精通${style.category}设计美学。

## 设计风格：${style.name}
### 设计特征
${style.features.map(feature => `- ${feature}`).join('\n')}

### 色彩系统
- 主色：${style.colorPalette.primary}
- 辅色：${style.colorPalette.secondary}  
- 强调色：${style.colorPalette.accent}
- 背景：${style.colorPalette.background}

### 文字排版
- 主标题：${style.typography.titleSize}，字重${style.typography.fontWeight.title}
- 副标题：${style.typography.subtitleSize}，字重${style.typography.fontWeight.subtitle}
- 正文：${style.typography.bodySize}，字重${style.typography.fontWeight.body}
- 字体：${style.typography.fontFamily}
- 行高：标题${style.typography.lineHeight.title}，副标题${style.typography.lineHeight.subtitle}，正文${style.typography.lineHeight.body}

### 布局设计
- 类型：${style.layout.type}
- 间距：${style.layout.spacing}
- 圆角：${style.layout.corners}
- 阴影：${style.layout.shadows}

### 设计原则
${style.designPrinciples.map(principle => `- ${principle}`).join('\n')}

### 技术实现
- CSS特性：${style.technicalSpecs.cssFeatures.join('、')}
- 动画效果：${style.technicalSpecs.animations.join('、')}
- 交互方式：${style.technicalSpecs.interactions.join('、')}`;
} 