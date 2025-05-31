/**
 * 模板映射配置文件
 * 统一预览组件和实际生成的模板标识符
 */

// 预览组件支持的模板键值 -> 实际生成使用的模板键值
export const TEMPLATE_KEY_MAPPING: Record<string, string> = {
  // 新增强模板（已同步）
  'soft_tech_card': 'soft_tech_card',
  'modern_business_news': 'modern_business_news', 
  'flowing_tech_blue_style': 'flowing_tech_blue_style',
  'minimal_grid_master': 'minimal_grid_master',
  'digital_ticket_style': 'digital_ticket_style',
  'luxury_natural_mood': 'luxury_natural_mood',
  'constructivist_teaching': 'constructivist_teaching',
  'industrial_rebellion_style': 'industrial_rebellion_style',
  'cute_knowledge_card': 'cute_knowledge_card',
  'business_simple_clean': 'business_simple_clean',
  'fresh_illustration_style': 'fresh_illustration_style',
  
  // 原有constants.ts模板 -> 对应的增强模板
  'scene_photo_xiaohongshu': 'soft_tech_card', // 映射到柔和科技风
  'flowing_tech_blue': 'flowing_tech_blue_style', // 已统一命名
  'soft_rounded_card': 'cute_knowledge_card', // 映射到软萌知识卡片风
  'modern_business_info': 'modern_business_news', // 已统一命名
  'minimal_grid': 'minimal_grid_master', // 已统一命名
  'industrial_rebellion': 'industrial_rebellion_style', // 已统一命名
  'tech_knowledge_sharing': 'business_simple_clean', // 映射到商务简约风
  'luxury_natural_artistic': 'luxury_natural_mood', // 已统一命名
};

// 反向映射：实际模板 -> 预览组件支持的键值
export const REVERSE_TEMPLATE_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(TEMPLATE_KEY_MAPPING).map(([key, value]) => [value, key])
);

// 平台推荐的正确模板映射
export const PLATFORM_TEMPLATE_RECOMMENDATIONS = {
  xiaohongshu: {
    primary: ['soft_tech_card', 'cute_knowledge_card', 'luxury_natural_mood'],
    secondary: ['fresh_illustration_style', 'business_simple_clean']
  },
  video: {
    primary: ['minimal_grid_master', 'industrial_rebellion_style', 'digital_ticket_style'],
    secondary: ['flowing_tech_blue_style', 'constructivist_teaching']
  },
  wechat: {
    primary: ['business_simple_clean', 'modern_business_news', 'digital_ticket_style'],
    secondary: ['luxury_natural_mood', 'flowing_tech_blue_style']
  }
};

// 统一的模板显示配置
export const UNIFIED_TEMPLATE_CONFIG = [
  // 增强模板配置（优先显示）
  {
    key: 'soft_tech_card',
    label: '柔和科技卡片风',
    description: '圆角卡片布局，轻柔色彩系统，适合科技类内容的友好呈现',
    category: '科技友好',
    preview: '🎨💜',
    platformSuitability: { xiaohongshu: 9, video: 6, wechat: 8 }
  },
  {
    key: 'modern_business_news',
    label: '现代商务资讯卡片风',
    description: '深绿深红色调象征专业，网格底纹增强科技感，商务应用美学',
    category: '商务专业',
    preview: '💼📊',
    platformSuitability: { xiaohongshu: 7, video: 5, wechat: 10 }
  },
  {
    key: 'flowing_tech_blue_style',
    label: '流动科技蓝风格',
    description: '现代简约科技风，蓝白渐变配合流线型曲线，营造动态科技感',
    category: '科技动感',
    preview: '🌊💙',
    platformSuitability: { xiaohongshu: 8, video: 9, wechat: 7 }
  },
  {
    key: 'minimal_grid_master',
    label: '极简格栅主义封面风格',
    description: '黑白极简配合强烈几何感，网格系统布局，工业风格装饰',
    category: '极简格栅',
    preview: '⬛📐',
    platformSuitability: { xiaohongshu: 6, video: 10, wechat: 5 }
  },
  {
    key: 'digital_ticket_style',
    label: '数字极简票券风',
    description: '黑白对比主导，票券化布局，东西方美学融合，数字界面映射',
    category: '数字票券',
    preview: '🎫⚡',
    platformSuitability: { xiaohongshu: 7, video: 8, wechat: 9 }
  },
  {
    key: 'luxury_natural_mood',
    label: '奢华自然意境风',
    description: '高级沉稳色调配合意境式呈现，东西方美学融合，沉浸式体验',
    category: '奢华意境',
    preview: '✨🍃',
    platformSuitability: { xiaohongshu: 10, video: 7, wechat: 8 }
  },
  {
    key: 'cute_knowledge_card',
    label: '软萌知识卡片风',
    description: '柔和色彩基调，圆角卡片结构，情感化设计，Q版表情角色',
    category: '软萌可爱',
    preview: '🌸😊',
    platformSuitability: { xiaohongshu: 9, video: 4, wechat: 6 }
  },
  {
    key: 'business_simple_clean',
    label: '商务简约信息卡片风',
    description: '极简背景设计，高对比度呈现，方正几何布局，功能性优先',
    category: '商务简约',
    preview: '📋⚪',
    platformSuitability: { xiaohongshu: 6, video: 7, wechat: 10 }
  },
  {
    key: 'industrial_rebellion_style',
    label: '工业反叛风格',
    description: '暗黑高对比，个性张扬，适合潮流、音乐、创意类内容',
    category: '潮流创意',
    preview: '⚡🖤',
    platformSuitability: { xiaohongshu: 5, video: 9, wechat: 4 }
  },
  {
    key: 'fresh_illustration_style',
    label: '清新插画风信息卡片风',
    description: '马卡龙色系基调，手绘插画主导，不规则布局，轻量装饰元素',
    category: '清新插画',
    preview: '🎨🌈',
    platformSuitability: { xiaohongshu: 8, video: 6, wechat: 5 }
  },
  {
    key: 'constructivist_teaching',
    label: '新构成主义教学风',
    description: '黑红白三色系统，网格化精准排版，学术实验美学',
    category: '学术专业',
    preview: '📚🔴',
    platformSuitability: { xiaohongshu: 4, video: 8, wechat: 9 }
  }
];

/**
 * 获取模板的实际键值（用于API调用）
 */
export function getActualTemplateKey(previewKey: string): string {
  return TEMPLATE_KEY_MAPPING[previewKey] || previewKey;
}

/**
 * 获取模板的预览键值（用于预览组件）
 */
export function getPreviewTemplateKey(actualKey: string): string {
  return REVERSE_TEMPLATE_MAPPING[actualKey] || actualKey;
}

/**
 * 获取平台推荐的模板列表
 */
export function getPlatformRecommendedTemplates(platform: string): string[] {
  const platformRec = PLATFORM_TEMPLATE_RECOMMENDATIONS[platform as keyof typeof PLATFORM_TEMPLATE_RECOMMENDATIONS];
  return platformRec ? [...platformRec.primary, ...platformRec.secondary] : [];
}

/**
 * 根据平台适配度排序模板
 */
export function sortTemplatesByPlatform(platform: string): typeof UNIFIED_TEMPLATE_CONFIG {
  return [...UNIFIED_TEMPLATE_CONFIG].sort((a, b) => {
    const scoreA = a.platformSuitability[platform as keyof typeof a.platformSuitability] || 0;
    const scoreB = b.platformSuitability[platform as keyof typeof b.platformSuitability] || 0;
    return scoreB - scoreA;
  });
} 