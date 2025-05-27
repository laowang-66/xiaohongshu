/**
 * AI内容智能分析器
 * 用于自动分析用户输入内容，推荐最适合的模板、配色和布局
 */

export interface ContentAnalysis {
  contentType: string;
  targetAudience: string;
  emotionalTone: string;
  platform: string;
  recommendedTemplate: string;
  recommendedColors: string[];
  fontSizeAdjustment: number;
  reasoning: string;
}

export interface StyleRecommendation {
  templateKey: string;
  confidence: number;
  reasons: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  typography: {
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    fontWeight: 'normal' | 'bold';
  };
}

// 内容类型关键词映射
const CONTENT_TYPE_KEYWORDS = {
  tutorial: ['教程', '方法', '步骤', '如何', '怎么', '学会', '掌握', '技巧', '操作'],
  review: ['测评', '评测', '对比', '推荐', '好用', '值得', '性价比', '体验', '效果'],
  sharing: ['分享', '经验', '心得', '感受', '体会', '日常', '生活', '记录', '发现'],
  knowledge: ['知识', '科普', '解释', '原理', '为什么', '什么是', '干货', '学习'],
  travel: ['旅行', '旅游', '攻略', '景点', '美食', '住宿', '交通', '路线', '打卡'],
  beauty: ['美妆', '护肤', '化妆', '保养', '美白', '祛痘', '抗老', '彩妆', '口红'],
  food: ['美食', '料理', '菜谱', '做法', '食材', '烹饪', '餐厅', '小吃', '甜点'],
  tech: ['科技', '数码', '软件', 'APP', '工具', '效率', '电脑', '手机', '智能'],
  business: ['商务', '职场', '工作', '效率', '管理', '创业', '投资', '理财', '营销']
};

// 情感色调关键词映射
const EMOTIONAL_TONE_KEYWORDS = {
  exciting: ['震惊', '太好了', '绝了', 'amazing', '超棒', '惊艳', '刷新认知', '颠覆'],
  warm: ['温暖', '治愈', '感动', '温柔', '舒服', '安心', '放松', '美好'],
  professional: ['专业', '权威', '深度', '系统', '全面', '详细', '严谨', '科学'],
  trendy: ['潮流', '时尚', '前沿', '最新', '流行', '网红', 'ins风', '小众'],
  practical: ['实用', '干货', '有用', '必备', '推荐', '值得', '收藏', '马住']
};

// 目标受众分析
const TARGET_AUDIENCE_KEYWORDS = {
  young_female: ['小仙女', '姐妹', '女孩子', '学生党', '职场新人', '美妆', '穿搭'],
  young_male: ['兄弟', '男生', '小伙子', '数码', '游戏', '科技', '运动'],
  professional: ['职场', '商务', '管理', '领导', '专业人士', '创业者', '投资'],
  general: ['大家', '朋友', '用户', '消费者', '人群', '所有人', '每个人']
};

// 模板推荐规则
const TEMPLATE_RECOMMENDATIONS = {
  scene_photo_xiaohongshu: {
    contentTypes: ['sharing', 'beauty', 'food', 'travel'],
    tones: ['warm', 'exciting'],
    audiences: ['young_female', 'general']
  },
  flowing_tech_blue: {
    contentTypes: ['tech', 'business', 'knowledge'],
    tones: ['professional', 'trendy'],
    audiences: ['professional', 'young_male']
  },
  soft_rounded_card: {
    contentTypes: ['beauty', 'sharing', 'warm'],
    tones: ['warm', 'trendy'],
    audiences: ['young_female']
  },
  modern_business_info: {
    contentTypes: ['business', 'knowledge', 'tech'],
    tones: ['professional', 'practical'],
    audiences: ['professional', 'general']
  },
  minimal_grid: {
    contentTypes: ['knowledge', 'tutorial', 'review'],
    tones: ['professional', 'practical'],
    audiences: ['general', 'professional']
  },
  industrial_rebellion: {
    contentTypes: ['tech', 'trendy'],
    tones: ['trendy', 'exciting'],
    audiences: ['young_male', 'general']
  },
  tech_knowledge_sharing: {
    contentTypes: ['tech', 'knowledge', 'tutorial'],
    tones: ['professional', 'practical'],
    audiences: ['professional', 'young_male']
  },
  luxury_natural_artistic: {
    contentTypes: ['travel', 'food', 'sharing'],
    tones: ['warm', 'professional'],
    audiences: ['general', 'professional']
  }
};

// 色彩方案配置
const COLOR_SCHEMES = {
  warm_vibrant: {
    primary: '#FF6B9D',
    secondary: '#FFA726', 
    accent: '#FFD54F',
    text: '#2C2C2C'
  },
  professional_blue: {
    primary: '#1976D2',
    secondary: '#512DA8',
    accent: '#37474F',
    text: '#212121'
  },
  fresh_green: {
    primary: '#81C784',
    secondary: '#A5D6A7',
    accent: '#F8BBD9',
    text: '#424242'
  },
  trendy_neon: {
    primary: '#E91E63',
    secondary: '#00BCD4',
    accent: '#FF5722',
    text: '#FFFFFF'
  },
  elegant_purple: {
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#F8BBD9',
    text: '#4A148C'
  }
};

/**
 * 分析文本内容，返回内容类型
 */
export function analyzeContentType(text: string): string {
  const lowercaseText = text.toLowerCase();
  
  for (const [type, keywords] of Object.entries(CONTENT_TYPE_KEYWORDS)) {
    const matchCount = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    ).length;
    
    if (matchCount >= 2) {
      return type;
    }
  }
  
  return 'sharing'; // 默认类型
}

/**
 * 分析情感色调
 */
export function analyzeEmotionalTone(text: string): string {
  const lowercaseText = text.toLowerCase();
  
  for (const [tone, keywords] of Object.entries(EMOTIONAL_TONE_KEYWORDS)) {
    const matchCount = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    ).length;
    
    if (matchCount >= 1) {
      return tone;
    }
  }
  
  return 'practical'; // 默认色调
}

/**
 * 分析目标受众
 */
export function analyzeTargetAudience(text: string): string {
  const lowercaseText = text.toLowerCase();
  
  for (const [audience, keywords] of Object.entries(TARGET_AUDIENCE_KEYWORDS)) {
    const matchCount = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    ).length;
    
    if (matchCount >= 1) {
      return audience;
    }
  }
  
  return 'general'; // 默认受众
}

/**
 * 根据文本长度推荐字体大小调整
 */
export function recommendFontSizeAdjustment(textLength: number): number {
  const length = textLength;
  
  if (length <= 10) return 1.2; // 短文本放大
  if (length <= 20) return 1.0; // 正常大小
  if (length <= 40) return 0.9; // 稍微缩小
  return 0.8; // 长文本缩小
}

/**
 * 推荐最适合的模板
 */
export function recommendTemplate(
  contentType: string, 
  emotionalTone: string, 
  targetAudience: string
): { template: string; confidence: number; reasons: string[] } {
  const scores: { [key: string]: { score: number; reasons: string[] } } = {};
  
  // 为每个模板计算匹配度分数
  for (const [templateKey, config] of Object.entries(TEMPLATE_RECOMMENDATIONS)) {
    let score = 0;
    const reasons: string[] = [];
    
    // 内容类型匹配
    if (config.contentTypes.includes(contentType)) {
      score += 3;
      reasons.push(`适合${contentType}类型内容`);
    }
    
    // 情感色调匹配
    if (config.tones.includes(emotionalTone)) {
      score += 2;
      reasons.push(`符合${emotionalTone}的情感表达`);
    }
    
    // 目标受众匹配
    if (config.audiences.includes(targetAudience)) {
      score += 2;
      reasons.push(`适合${targetAudience}受众群体`);
    }
    
    scores[templateKey] = { score, reasons };
  }
  
  // 找到最高分的模板
  let bestTemplate = 'scene_photo_xiaohongshu';
  let bestScore = 0;
  let bestReasons: string[] = [];
  
  for (const [templateKey, data] of Object.entries(scores)) {
    if (data.score > bestScore) {
      bestTemplate = templateKey;
      bestScore = data.score;
      bestReasons = data.reasons;
    }
  }
  
  return {
    template: bestTemplate,
    confidence: Math.min(bestScore / 7, 1), // 标准化到0-1
    reasons: bestReasons
  };
}

/**
 * 推荐色彩方案
 */
export function recommendColorScheme(
  contentType: string, 
  emotionalTone: string, 
  targetAudience: string
): typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES] {
  // 根据不同组合推荐色彩方案
  if (targetAudience === 'young_female' && emotionalTone === 'warm') {
    return COLOR_SCHEMES.warm_vibrant;
  }
  
  if (contentType === 'tech' || contentType === 'business') {
    return COLOR_SCHEMES.professional_blue;
  }
  
  if (emotionalTone === 'trendy' || contentType === 'beauty') {
    return COLOR_SCHEMES.trendy_neon;
  }
  
  if (emotionalTone === 'warm' || contentType === 'food') {
    return COLOR_SCHEMES.fresh_green;
  }
  
  return COLOR_SCHEMES.elegant_purple; // 默认方案
}

/**
 * 推荐字体设置
 */
export function recommendTypography(
  contentType: string,
  textLength: number
): {
  titleSize: number;
  subtitleSize: number; 
  bodySize: number;
  fontWeight: 'normal' | 'bold';
} {
  const baseSize = recommendFontSizeAdjustment(textLength);
  
  if (contentType === 'tech' || contentType === 'business') {
    return {
      titleSize: Math.round(48 * baseSize),
      subtitleSize: Math.round(28 * baseSize),
      bodySize: Math.round(20 * baseSize),
      fontWeight: 'bold'
    };
  }
  
  if (contentType === 'beauty' || contentType === 'sharing') {
    return {
      titleSize: Math.round(52 * baseSize),
      subtitleSize: Math.round(30 * baseSize),
      bodySize: Math.round(22 * baseSize),
      fontWeight: 'normal'
    };
  }
  
  return {
    titleSize: Math.round(50 * baseSize),
    subtitleSize: Math.round(28 * baseSize),
    bodySize: Math.round(20 * baseSize),
    fontWeight: 'normal'
  };
}

/**
 * 综合分析并返回完整的推荐结果
 */
export function analyzeContentAndRecommend(text: string, platform: string = 'xiaohongshu'): StyleRecommendation {
  const contentType = analyzeContentType(text);
  const emotionalTone = analyzeEmotionalTone(text);
  const targetAudience = analyzeTargetAudience(text);
  
  const templateRec = recommendTemplate(contentType, emotionalTone, targetAudience);
  const colorScheme = recommendColorScheme(contentType, emotionalTone, targetAudience);
  const typography = recommendTypography(contentType, text.length);
  
  return {
    templateKey: templateRec.template,
    confidence: templateRec.confidence,
    reasons: [
      `检测到${contentType}类型内容`,
      `情感色调偏向${emotionalTone}`,
      `目标受众为${targetAudience}`,
      ...templateRec.reasons
    ],
    colorScheme,
    typography
  };
}

/**
 * 生成专业的设计建议文本
 */
export function generateDesignSuggestion(recommendation: StyleRecommendation): string {
  const { templateKey, confidence, reasons, colorScheme, typography } = recommendation;
  
  const confidenceText = confidence > 0.8 ? '强烈推荐' : 
                        confidence > 0.6 ? '推荐' : '建议考虑';
  
  return `
🎨 AI智能分析结果：

${confidenceText}使用"${templateKey}"模板
匹配度：${Math.round(confidence * 100)}%

📊 分析依据：
${reasons.map(reason => `• ${reason}`).join('\n')}

🎨 设计建议：
• 主色调：${colorScheme.primary}
• 辅助色：${colorScheme.secondary}  
• 强调色：${colorScheme.accent}
• 标题字号：${typography.titleSize}px
• 字体粗细：${typography.fontWeight === 'bold' ? '加粗' : '正常'}

✨ 这个组合将帮助您的内容获得更好的视觉效果和用户engagement！
  `.trim();
} 