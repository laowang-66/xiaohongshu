import { NextRequest, NextResponse } from 'next/server';
import { ENHANCED_TEMPLATES, getEnhancedTemplate, recommendTemplateByContent, convertToMarkdown, parseMarkdownStructure, optimizeCoverContent } from '../../utils/enhancedTemplates';
import { cache, cacheUtils } from '../../utils/cache';

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 🧬 三大平台DNA数据库 - 核心设计规范
const PLATFORM_DNA_DATABASE = {
  xiaohongshu: {
    // 视觉特征
    visual: {
      colorTone: '明亮温暖',
      fontSize: { title: '46-56px', subtitle: '26-32px', body: '18-22px' },
      spacing: '宽松舒适',
      corners: '圆角友好',
      shadows: '轻柔阴影',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      lineHeight: { title: '1.2', subtitle: '1.4', body: '1.6' }
    },
    // 内容特征
    content: {
      tone: '亲切友好',
      structure: '标题+副标题+关键点',
      keywords: ['种草', '测评', '攻略', '分享', '必看', '干货'],
      emotions: ['兴奋', '好奇', '惊喜', '实用'],
      titleLength: { min: 6, max: 12 },
      subtitleLength: { min: 8, max: 15 }
    },
    // 用户行为
    behavior: {
      scanTime: '3-5秒',
      focusArea: '标题区域70%',
      interactionStyle: '点赞收藏'
    },
    // 配色方案
    colorSchemes: [
      { bg: 'linear-gradient(135deg, #FFB6C1 0%, #FFE4E1 100%)', title: '#D2691E', subtitle: '#696969' },
      { bg: 'linear-gradient(135deg, #FFA07A 0%, #FFEFD5 100%)', title: '#B22222', subtitle: '#708090' },
      { bg: 'linear-gradient(135deg, #98FB98 0%, #F0FFF0 100%)', title: '#228B22', subtitle: '#2F4F4F' }
    ],
    // 专业提示词模板
    promptTemplate: `你是一位优秀的网页和营销视觉设计师，具有丰富的UI/UX设计经验，曾为众多知名品牌打造过引人注目的营销视觉，擅长将现代设计趋势与实用营销策略完美融合。现在需要为我创建一张专业级小红书封面。

## 基本要求
- 比例严格为3:4（宽:高）
- 设计一个边框为0的div作为画布，确保生成图片无边界
- 最外面的卡片需要为直角
- 将我提供的文案提炼为30-40字以内的中文精华内容
- 文字必须成为视觉主体，占据页面至少70%的空间
- 运用3-4种不同字号创造层次感，关键词使用最大字号
- 主标题字号需要比副标题和介绍大三倍以上
- 主标题提取2-3个关键词，使用特殊处理（如描边、高亮、不同颜色）

## 技术实现
- 使用现代CSS技术（如flex/grid布局、变量、渐变）
- 确保代码简洁高效，无冗余元素
- 使用Google Fonts或其他CDN加载适合的现代字体
- 可引用在线图标资源（如Font Awesome）

## 专业排版技巧
- 运用设计师常用的"反白空间"技巧创造焦点
- 文字与装饰元素间保持和谐的比例关系
- 确保视觉流向清晰，引导读者目光移动
- 使用微妙的阴影或光效增加层次感`
  },
  
  video: {
    // 视觉特征
    visual: {
      colorTone: '高对比强烈',
      fontSize: { title: '72-96px', subtitle: '36-48px', body: '24-32px' },
      spacing: '紧凑有力',
      corners: '锐利边缘',
      shadows: '强烈阴影',
      fontFamily: '"PingFang SC Bold", "Microsoft YaHei", sans-serif',
      lineHeight: { title: '1.1', subtitle: '1.3', body: '1.5' }
    },
    // 内容特征
    content: {
      tone: '震撼冲击',
      structure: '超大标题+核心数字',
      keywords: ['震撼', '爆料', '必看', '涨知识', '惊呆了', '太牛了'],
      emotions: ['震惊', '好奇', '紧迫', 'FOMO'],
      titleLength: { min: 4, max: 8 },
      subtitleLength: { min: 6, max: 12 }
    },
    // 用户行为
    behavior: {
      scanTime: '1-3秒',
      focusArea: '中央区域80%',
      interactionStyle: '快速滑动'
    },
    // 配色方案
    colorSchemes: [
      { bg: 'linear-gradient(135deg, #000000 0%, #434343 100%)', title: '#FFFFFF', subtitle: '#FFD700' },
      { bg: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', title: '#FFFFFF', subtitle: '#BBDEFB' },
      { bg: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)', title: '#FFFFFF', subtitle: '#FFCDD2' }
    ],
    // 专业提示词模板
    promptTemplate: `你是一位资深的视频平台视觉设计师，擅长创作引人注目的视频封面，精通短视频平台的视觉营销策略和用户心理学，能够打造既符合平台算法推荐又能吸引用户点击的专业封面。

## 基本要求
- 比例严格为9:16（1080×1920像素）
- 设计一个边框为0的div作为画布，确保生成图片无边界
- 最外层卡片需要为直角
- 核心内容区域保持在1080×1464px（上下各留228px安全边距）
- 文字距离边缘至少100px，避免被平台UI遮挡

## 文字处理
- 将提供的文案提炼为10-15字以内的中文精华标题
- 主标题必须成为视觉焦点，占据画面至少50%的空间
- 副标题/补充说明控制在20字以内（可选）
- 标题需要有足够对比度，确保在小尺寸预览时仍清晰可读

## 视觉元素
- 使用简洁有力的视觉元素，避免画面过于复杂
- 可添加1-2个吸引眼球的图标或装饰元素增强主题
- 背景可使用渐变色或简单图案，确保不干扰主要内容
- 可选添加品牌标识，但需保持小巧并放置在角落位置
- 考虑添加边框、高光或阴影以增强视觉层次感

## 专业排版技巧
- 运用"反白空间"技巧（高对比色+留白）突出核心信息
- 文字与装饰元素保持黄金比例（1:1.618）
- 确保视觉流向清晰（Z型或F型阅读路径）
- 使用微妙的阴影/光效（如text-shadow、box-shadow）
- 避免过多装饰，保持极简但冲击力强的风格`
  },
  
  wechat: {
    // 视觉特征
    visual: {
      colorTone: '专业商务',
      fontSize: { title: '32-42px', subtitle: '22-28px', body: '16-20px' },
      spacing: '严谨规整',
      corners: '直角正式',
      shadows: 'subtle阴影',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      lineHeight: { title: '1.3', subtitle: '1.5', body: '1.7' }
    },
    // 内容特征
    content: {
      tone: '专业权威',
      structure: '主标题+副标题+要点',
      keywords: ['深度', '解析', '权威', '专业', '洞察', '趋势'],
      emotions: ['信任', '专业', '深度', '价值'],
      titleLength: { min: 12, max: 25 },
      subtitleLength: { min: 10, max: 20 }
    },
    // 用户行为
    behavior: {
      scanTime: '5-8秒',
      focusArea: '整体布局均匀',
      interactionStyle: '仔细阅读'
    },
    // 配色方案
    colorSchemes: [
      { bg: 'linear-gradient(135deg, #263238 0%, #37474F 100%)', title: '#FFFFFF', subtitle: '#B0BEC5' },
      { bg: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)', title: '#FFFFFF', subtitle: '#E3F2FD' },
      { bg: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)', title: '#212121', subtitle: '#757575' }
    ],
    // 专业提示词模板
    promptTemplate: `你是一位优秀的网页和营销视觉设计师，具有丰富的UI/UX设计经验，曾为众多知名品牌打造过引人注目的营销视觉，擅长将现代设计趋势与实用营销策略完美融合。请使用HTML和CSS代码按照设计风格要求创建一个微信公众号封面图片组合布局。

## 基本要求
- 整体比例严格保持为3.35:1
- 容器高度应随宽度变化自动调整，始终保持比例
- 左边区域放置2.35:1比例的主封面图
- 右边区域放置1:1比例的朋友圈分享封面

## 布局结构
- 朋友圈封面只需四个大字铺满整个区域（上面两个下面两个）
- 文字必须成为主封面图的视觉主体，占据页面至少70%的空间
- 两个封面共享相同的背景色和点缀装饰元素
- 最外层卡片需要是直角

## 技术实现
- 使用纯HTML和CSS编写
- 严格实现响应式设计，确保在任何浏览器宽度下都保持3.35:1的整体比例
- 在线CDN引用Tailwind CSS来优化比例和样式控制
- 内部元素应相对于容器进行缩放，确保整体设计和文字排版比例一致
- 使用Google Fonts或其他CDN加载适合的现代字体
- 可引用在线图标资源（如Font Awesome）
- 代码应可在现代浏览器中直接运行`
  }
};

// 🧠 智能内容分析器
class ContentAnalyzer {
  analyzeContent(text: string) {
    return {
      hasNumbers: /\d+/.test(text),
      hasEmotions: this.detectEmotions(text),
      hasQuestions: /[？?]/.test(text),
      length: text.length,
      keywords: this.extractKeywords(text),
      sentiment: this.analyzeSentiment(text),
      hasEmojis: /[\uD83C-\uDBFF\uDC00-\uDFFF]/.test(text)
    };
  }
  
  detectEmotions(text: string): string[] {
    const emotionKeywords = {
      excitement: ['太好了', '惊喜', '震撼', '厉害', '牛'],
      curiosity: ['为什么', '怎么', '如何', '什么'],
      urgency: ['马上', '立即', '快速', 'urgent', '必须'],
      practical: ['方法', '技巧', '攻略', '指南', '教程']
    };
    
    const emotions = [];
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        emotions.push(emotion);
      }
    }
    return emotions;
  }
  
  extractKeywords(text: string): string[] {
    const commonKeywords = ['学会', '方法', '技巧', '秘诀', '攻略', '指南', '必看', '干货', '分享'];
    return commonKeywords.filter(keyword => text.includes(keyword));
  }
  
  analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['好', '棒', '厉害', '优秀', '成功', '赚', '提升'];
    const negativeWords = ['难', '失败', '错误', '问题', '困难'];
    
    const positiveScore = positiveWords.filter(word => text.includes(word)).length;
    const negativeScore = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
  
  // 根据平台提炼重点
  extractForPlatform(text: string, platform: string) {
    const analysis = this.analyzeContent(text);
    const platformDNA = PLATFORM_DNA_DATABASE[platform as keyof typeof PLATFORM_DNA_DATABASE];
    
    switch(platform) {
      case 'xiaohongshu':
        return this.extractForXiaohongshu(text, analysis, platformDNA);
      case 'video':
        return this.extractForVideo(text, analysis, platformDNA);
      case 'wechat':
        return this.extractForWechat(text, analysis, platformDNA);
      default:
        return { mainTitle: text, subtitle: '', highlights: [] };
    }
  }
  
  private extractForXiaohongshu(text: string, analysis: any, dna: any) {
    // 提炼情感化标题 + 实用性副标题
    const words = text.split(/[，。！？\s]+/).filter(w => w.length > 0);
    const mainTitle = words.slice(0, 2).join('') + (analysis.hasEmotions.includes('excitement') ? '！' : '');
    const subtitle = words.length > 2 ? words.slice(2, 4).join('') : '实用干货分享';
    
    return {
      mainTitle: mainTitle.substring(0, dna.content.titleLength.max),
      subtitle: subtitle.substring(0, dna.content.subtitleLength.max),
      highlights: analysis.keywords.slice(0, 3),
      callToAction: '马上收藏📖'
    };
  }
  
  private extractForVideo(text: string, analysis: any, dna: any) {
    // 提炼冲击性标题
    const coreWords = text.split(/[，。！？\s]+/).filter(w => w.length > 1);
    const impactTitle = coreWords[0] || text.substring(0, 8);
    const subtitle = analysis.hasNumbers ? '数据惊人！' : '必看内容';
    
    return {
      mainTitle: impactTitle.substring(0, dna.content.titleLength.max),
      subtitle: subtitle,
      highlights: [],
      callToAction: '点击观看👆'
    };
  }
  
  private extractForWechat(text: string, analysis: any, dna: any) {
    // 提炼专业化标题
    const professionalTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
    const subtitle = '深度解析 | 专业观点';
    
    return {
      mainTitle: professionalTitle,
      subtitle: subtitle,
      highlights: analysis.keywords,
      callToAction: '阅读全文'
    };
  }
}

// 🎨 智能模板选择器
class SmartTemplateSelector {
  selectOptimalTemplate(content: any, platform: string, userTemplate: string) {
    const platformDNA = PLATFORM_DNA_DATABASE[platform as keyof typeof PLATFORM_DNA_DATABASE];
    const contentAnalysis = new ContentAnalyzer().analyzeContent(content);
    
    // 计算内容适配度
    const contentScore = this.scoreContent(contentAnalysis, platformDNA);
    
    // 🎨 保持用户选择的视觉风格，只优化内容
    // 新策略：尊重用户的模板选择，确保视觉风格一致性
    return {
      useTemplate: userTemplate, // 严格使用用户选择的模板
      reason: '保持用户选择的视觉风格',
      originalTemplate: userTemplate,
      adaptationScore: this.calculateAdaptationScore(userTemplate, platform, contentScore),
      visualStylePreservation: true // 标记保持视觉风格
    };
    
    // 注释掉自动替换模板的逻辑，确保视觉风格一致性
    /*
    // 评估模板适配度
    const templateScore = this.scoreTemplate(userTemplate, platform, contentScore);
    
    // 如果适配度低，推荐更合适的模板
    if (templateScore < 0.7) {
      const recommendedTemplate = this.getRecommendedTemplate(platform, contentScore);
      return {
        useTemplate: recommendedTemplate,
        reason: '为了更好的平台适配效果',
        originalTemplate: userTemplate,
        adaptationScore: this.calculateAdaptationScore(recommendedTemplate, platform, contentScore)
      };
    }
    
    return {
      useTemplate: userTemplate,
      adaptationScore: templateScore
    };
    */
  }
  
  private scoreContent(analysis: any, dna: any): any {
    return {
      emotionalResonance: analysis.hasEmotions.length / 4,
      platformKeywords: analysis.keywords.filter((k: string) => dna.content.keywords.includes(k)).length / dna.content.keywords.length,
      lengthFit: analysis.length >= dna.content.titleLength.min && analysis.length <= dna.content.titleLength.max * 3 ? 1 : 0.5,
      sentiment: analysis.sentiment === 'positive' ? 1 : 0.6
    };
  }
  
  private scoreTemplate(template: string, platform: string, contentScore: any): number {
    // 平台模板适配映射
    const templatePlatformFit = {
      xiaohongshu: {
        'soft_tech_card_style': 0.9,
        'xiaohongshu_lifestyle_card': 0.95,
        'xiaohongshu_trendy_card': 0.85,
        'scene_photo_xiaohongshu': 0.8
      },
      video: {
        'minimal_grid_master': 0.9,
        'industrial_rebellion_style': 0.85,
        'digital_ticket_style': 0.8,
        'video_pro_safe_zone': 0.95
      },
      wechat: {
        'business_simple_clean': 0.95,
        'digital_ticket_style': 0.8,
        'luxury_natural_mood': 0.85,
        'wechat_pro_business': 0.9
      }
    };
    
    const platformTemplates = templatePlatformFit[platform as keyof typeof templatePlatformFit] || {};
    const baseFit = platformTemplates[template as keyof typeof platformTemplates] || 0.5;
    
    // 结合内容适配度
    const avgContentScore = Object.values(contentScore).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0) / Object.keys(contentScore).length;
    
    return (baseFit + avgContentScore) / 2;
  }
  
  private getRecommendedTemplate(platform: string, contentScore: any): string {
    const recommendations = {
      xiaohongshu: contentScore.emotionalResonance > 0.7 ? 'xiaohongshu_lifestyle_card' : 'soft_tech_card_style',
      video: contentScore.emotionalResonance > 0.8 ? 'industrial_rebellion_style' : 'minimal_grid_master',
      wechat: contentScore.platformKeywords > 0.5 ? 'wechat_pro_business' : 'business_simple_clean'
    };
    
    return recommendations[platform as keyof typeof recommendations] || 'scene_photo_xiaohongshu';
  }
  
  private calculateAdaptationScore(template: string, platform: string, contentScore: any): number {
    return this.scoreTemplate(template, platform, contentScore);
  }
}

// 🎯 精准视觉输出引擎
class PlatformStandardGenerator {
  generateForPlatform(content: any, platform: string, template: string) {
    const platformDNA = PLATFORM_DNA_DATABASE[platform as keyof typeof PLATFORM_DNA_DATABASE];
    const contentAnalyzer = new ContentAnalyzer();
    const optimizedContent = contentAnalyzer.extractForPlatform(content, platform);
    
    // 智能选择配色方案
    const colorSchemeIndex = this.selectColorScheme(content, optimizedContent);
    const colorScheme = platformDNA.colorSchemes[colorSchemeIndex];
    
    // 生成平台特化的设计参数
    const designParams = {
      layout: this.calculateOptimalLayout(platformDNA, optimizedContent),
      typography: this.generateTypography(platformDNA, optimizedContent),
      colors: colorScheme,
      spacing: this.calculateSpacing(platformDNA),
      effects: this.generateEffects(platformDNA, template)
    };
    
    // 生成精确的HTML+CSS
    return this.generatePreciseHTML(designParams, platformDNA, optimizedContent);
  }
  
  private selectColorScheme(content: string, optimizedContent: any): number {
    // 根据内容特征选择配色
    if (/\d+/.test(content)) return 1; // 数字内容用第二套配色
    if (optimizedContent.highlights.length > 2) return 2; // 丰富内容用第三套配色
    return 0; // 默认第一套配色
  }
  
  private calculateOptimalLayout(dna: any, content: any) {
    return {
      width: '100%',
      height: '100%',
      padding: dna.visual.spacing === '宽松舒适' ? '40px' : dna.visual.spacing === '紧凑有力' ? '20px' : '30px',
      alignment: 'center',
      distribution: 'space-evenly'
    };
  }
  
  private generateTypography(dna: any, content: any) {
    return {
      title: {
        size: dna.visual.fontSize.title.split('-')[1] || '48px',
        weight: 'bold',
        lineHeight: dna.visual.lineHeight.title
      },
      subtitle: {
        size: dna.visual.fontSize.subtitle.split('-')[1] || '24px',
        weight: 'normal',
        lineHeight: dna.visual.lineHeight.subtitle
      }
    };
  }
  
  private calculateSpacing(dna: any) {
    const baseSpacing = dna.visual.spacing === '宽松舒适' ? 30 : 
                      dna.visual.spacing === '紧凑有力' ? 15 : 20;
    
    return {
      container: baseSpacing * 1.5,
      titleToSubtitle: baseSpacing,
      subtitleToBody: baseSpacing * 0.8
    };
  }
  
  private generateEffects(dna: any, template: string) {
    return {
      shadow: dna.visual.shadows === '轻柔阴影' ? '0 4px 15px rgba(0,0,0,0.1)' :
              dna.visual.shadows === '强烈阴影' ? '0 8px 25px rgba(0,0,0,0.3)' :
              '0 2px 8px rgba(0,0,0,0.05)',
      textShadow: dna.visual.colorTone === '高对比强烈' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
      borderRadius: dna.visual.corners === '圆角友好' ? '20px' : '8px'
    };
  }
  
  private generatePreciseHTML(params: any, dna: any, content: any): string {
    // 🎨 计算字符间距，根据平台优化阅读体验
    const spacing = this.calculateTextSpacing(dna);
    
    return `
    <div style="
      width: 100%;
      height: 100%;
      font-family: ${dna.visual.fontFamily};
      background: ${params.colors.bg};
      border-radius: ${params.effects.borderRadius};
      box-shadow: ${params.effects.shadow};
      padding: ${params.spacing.container}px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        font-size: ${params.typography.title.size};
        font-weight: ${params.typography.title.weight};
        color: ${params.colors.title};
        line-height: ${params.typography.title.lineHeight};
        letter-spacing: ${spacing.letterSpacing};
        word-spacing: ${spacing.wordSpacing};
        margin-bottom: ${params.spacing.titleToSubtitle}px;
        text-shadow: ${params.effects.textShadow};
        max-width: 90%;
        word-wrap: break-word;
      ">
        ${content.mainTitle}
      </div>
      
      <div style="
        font-size: ${params.typography.subtitle.size};
        color: ${params.colors.subtitle};
        line-height: ${params.typography.subtitle.lineHeight};
        letter-spacing: ${spacing.letterSpacing};
        word-spacing: ${spacing.wordSpacing};
        margin-bottom: ${params.spacing.subtitleToBody}px;
        max-width: 80%;
        word-wrap: break-word;
      ">
        ${content.subtitle}
      </div>
      
      ${content.highlights.length > 0 ? `
      <div style="
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 20px;
      ">
        ${content.highlights.map((highlight: string) => `
          <span style="
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: ${params.colors.subtitle};
            border: 1px solid rgba(255,255,255,0.3);
            letter-spacing: ${spacing.letterSpacing};
            word-spacing: ${spacing.wordSpacing};
          ">${highlight}</span>
        `).join('')}
      </div>
      ` : ''}
    </div>`;
  }

  // 🎨 新增：计算平台专属文字间距
  private calculateTextSpacing(dna: any) {
    const platform = dna.key;
    
    // 根据不同平台特性配置字符间距
    if (platform === 'video') {
      return {
        letterSpacing: '0.08em',  // 短视频需要更大间距，提升可读性
        wordSpacing: '0.15em'
      };
    } else if (platform === 'wechat') {
      return {
        letterSpacing: '0.06em',  // 公众号适中间距
        wordSpacing: '0.12em'
      };
    } else {
      return {
        letterSpacing: '0.05em',  // 小红书紧凑间距
        wordSpacing: '0.1em'
      };
    }
  }
}

// 🎯 三要素融合生成引擎
class UnifiedGenerationEngine {
  private contentAnalyzer: ContentAnalyzer;
  private templateSelector: SmartTemplateSelector;
  private visualGenerator: PlatformStandardGenerator;
  
  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
    this.templateSelector = new SmartTemplateSelector();
    this.visualGenerator = new PlatformStandardGenerator();
  }
  
  async generate(userInput: {
    content: string,
    platform: string,
    template: string
  }) {
    console.log('🎯 启动三要素融合生成...');
    
    // 1. 智能内容分析和提炼
    const contentAnalysis = this.contentAnalyzer.analyzeContent(userInput.content);
    const optimizedContent = this.contentAnalyzer.extractForPlatform(userInput.content, userInput.platform);
    
    // 2. 智能模板选择和适配
    const templateDecision = this.templateSelector.selectOptimalTemplate(
      userInput.content, 
      userInput.platform, 
      userInput.template
    );
    
    // 3. 平台DNA融合生成
    if (PERFORMANCE_CONFIG.ENABLE_SMART_FUSION) {
      // 使用新的三要素融合方式
      const visualResult = this.visualGenerator.generateForPlatform(
        userInput.content,
        userInput.platform,
        templateDecision.useTemplate
      );
      
      return {
        html: visualResult,
        contentAnalysis,
        optimizedContent,
        templateDecision,
        method: 'smart-fusion'
      };
    } else {
      // 降级到AI生成
      const fusedPrompt = this.generateFusedPrompt(userInput, optimizedContent, templateDecision);
      const aiResult = await smartFusionAICall(fusedPrompt);
      
      return {
        html: aiResult,
        contentAnalysis,
        optimizedContent,
        templateDecision,
        method: 'ai-fusion'
      };
    }
  }
  
  private generateFusedPrompt(userInput: any, optimizedContent: any, templateDecision: any): string {
    const platformDNA = PLATFORM_DNA_DATABASE[userInput.platform as keyof typeof PLATFORM_DNA_DATABASE];
    
    // 🔧 智能内容处理：避免截取，保留关键信息
    const cleanContent = userInput.content.length > 100 ? 
      this.contentAnalyzer.extractForPlatform(userInput.content, userInput.platform).mainTitle : 
      userInput.content;
    
    // 根据模板选择对应的设计风格指南
    const designStyleGuide = this.getDesignStyleGuide(templateDecision.useTemplate);
    
    return `🎨 【重要】：你必须严格遵循用户选择的模板视觉风格，不可随意更改颜色、布局或装饰元素！

## 🎯 【用户选择的模板风格】 - ${templateDecision.useTemplate}
${designStyleGuide}

## 📝 【核心内容】
${cleanContent}

## 📱 【平台适配要求】 - ${userInput.platform}
- 视觉风格：${platformDNA.content.tone}
- 主标题：${platformDNA.visual.fontSize.title}，${platformDNA.visual.fontFamily}
- 副标题：${platformDNA.visual.fontSize.subtitle}
- 配色风格：${platformDNA.visual.colorTone}
- 圆角：${platformDNA.visual.corners}
- 阴影：${platformDNA.visual.shadows}
- 扫视时间：${platformDNA.behavior.scanTime}
- 焦点区域：${platformDNA.behavior.focusArea}

## ✨ 【内容优化建议】
- 主标题：${optimizedContent.title}
- 副标题：${optimizedContent.subtitle || ''}
- 关键词：${optimizedContent.highlights.join('、')}

## 🔧 【技术要求】
- 返回完整HTML代码，包含内联CSS
- 确保在${coverSizes[userInput.platform as keyof typeof coverSizes]?.width || 900}x${coverSizes[userInput.platform as keyof typeof coverSizes]?.height || 1200}尺寸下完美显示
- 响应式设计，文字大小适配
- 🎨 **字符间距优化**：所有文字元素必须添加适当的letter-spacing和word-spacing，避免文字挤在一起

## ⚠️ 【严格要求】：
1. 必须100%按照上述模板风格的颜色、渐变、布局进行设计
2. 只能优化文字内容，不能改变视觉风格元素
3. 确保生成的封面与预览效果在视觉上保持高度一致

🚨 **严格要求：直接返回纯HTML代码，绝对不要使用markdown或代码块标记包裹！只返回从div开始的纯HTML代码！**

${platformDNA.promptTemplate}`;
  }
  
  // 根据模板获取对应的设计风格指南
  private getDesignStyleGuide(templateKey: string): string {
    const styleGuides: Record<string, string> = {
      // 🎨 原有模板的详细风格指导
      'scene_photo_xiaohongshu': `
### 小红书场景照片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #fb923c, #fbbf24) - 橙色到金黄色渐变，不可更改
- **主色调**: 温暖的橙金色系 (#fb923c, #fbbf24)
- **文字颜色**: 纯白色 (#ffffff)，确保对比度
- **布局风格**: 垂直布局，左对齐文字
- **视觉层次**: 标题粗体，副标题普通字重，透明度0.9
- **装饰元素**: 右下角白底橙色文字按钮"点击查看"
- **圆角**: 适度圆角，不要过度圆润
- **阴影**: 无明显阴影，保持清爽
- **字体**: 使用PingFang SC或类似现代字体
- **情感调性**: 活力四射、青春动感的小红书风格`,

      'soft_rounded_card': `
### 温柔圆角卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #ffb6c1 0%, #fffacd 100%) - 粉色到淡黄色
- **主色调**: 柔和粉色系 (#ffb6c1, #fffacd, #d1477a)
- **文字颜色**: 深粉色 (#d1477a, #ec4899)
- **布局风格**: 居中对齐，温馨布局
- **装饰元素**: 紫色爱心💜图标装饰
- **圆角**: 大圆角15px，营造温柔感
- **阴影**: 轻微粉色阴影 0 2px 8px rgba(255, 182, 193, 0.3)
- **情感调性**: 温暖亲和、美妆时尚的柔美风格`,

      'soft_tech_card': `
### 柔和科技卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #f8f4ff 0%, #e8d5ff 100%) - 淡紫色渐变
- **主色调**: 柔和紫色系 (#6b46c1, #8b5cf6, #f8f4ff)
- **文字颜色**: 深紫色 (#6b46c1)，副标题 (#8b5cf6)
- **布局风格**: 卡片式居中布局
- **边框**: 1px solid rgba(232, 213, 255, 0.3) 微妙边框
- **圆角**: 12px圆角，现代感
- **阴影**: 0 2px 12px rgba(107, 70, 193, 0.15) 轻微立体感
- **情感调性**: 友好科技、现代简约的专业风格`,

      'modern_business_news': `
### 现代商务资讯卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #2d5a27 0%, #8b1538 100%) - 深绿到深红
- **主色调**: 商务色系 (#2d5a27, #8b1538)
- **文字颜色**: 纯白色 (#ffffff)
- **布局风格**: 专业商务布局
- **背景纹理**: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)
- **装饰元素**: 右上角白色半透明方块装饰
- **情感调性**: 专业权威、金融科技的商务风格`,

      'flowing_tech_blue_style': `
### 流动科技蓝风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #4682b4 0%, #87ceeb 50%, #f0f8ff 100%) - 蓝色流动渐变
- **主色调**: 蓝色系 (#4682b4, #87ceeb, #f0f8ff, #1e40af)
- **文字颜色**: 深蓝色 (#1e40af, #3b82f6)
- **布局风格**: 现代简约科技布局
- **装饰元素**: 右上角蓝色半透明圆形装饰
- **圆角**: 10px适度圆角
- **情感调性**: 现代科技、未来感的动态风格`,

      'minimal_grid_master': `
### 极简格栅主义风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景**: 纯黑色 (#000000)
- **主色调**: 黑白对比 (#000000, #ffffff, #00ff00)
- **文字颜色**: 纯白色 (#ffffff)，副标题灰色 (#cccccc)
- **布局风格**: 极简几何布局
- **装饰元素**: 左上角绿色方形装饰，45度旋转
- **边框**: 1px solid #333333
- **情感调性**: 工业感、极简主义的几何美学`,

      'digital_ticket_style': `
### 数字极简票券风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景**: 纯白色 (#ffffff)
- **主色调**: 黑白对比 (#000000, #ffffff)
- **文字颜色**: 黑色 (#000000)，副标题灰色 (#666666)
- **布局风格**: 票券式布局，分区明确
- **边框**: 1px solid #000000 黑色边框
- **装饰元素**: 右上角黑色方块装饰
- **圆角**: 4px轻微圆角
- **情感调性**: 简约票券、数字界面的克制风格`,

      'luxury_natural_mood': `
### 奢华自然意境风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #2f4f4f 0%, #8fbc8f 50%, #f5f5dc 100%) - 深绿到米色
- **主色调**: 自然色系 (#2f4f4f, #8fbc8f, #f5f5dc, #daa520)
- **文字颜色**: 米色 (#f5f5dc)，标题金色 (#daa520)
- **布局风格**: 意境式中心布局
- **背景纹理**: radial-gradient(circle at 70% 30%, rgba(218, 165, 32, 0.1) 0%, transparent 50%)
- **装饰元素**: 右上角金色星星✨装饰
- **圆角**: 8px圆角
- **情感调性**: 奢华意境、东方美学的高级质感`,

      'constructivist_teaching': `
### 新构成主义教学风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #000000 0%, #333333 100%) - 黑到深灰
- **主色调**: 构成主义色系 (#000000, #ff0000, #ffffff)
- **文字颜色**: 白色 (#ffffff)，副标题红色 (#ff0000)
- **布局风格**: 网格化学术布局
- **装饰元素**: 垂直红线分割装饰，右下角红色"实验"标签
- **边框**: 2px solid #ff0000 红色边框
- **情感调性**: 学术实验、构成主义的前卫美学`,

      'industrial_rebellion_style': `
### 工业反叛风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景**: 纯黑色 (#000000)
- **主色调**: 反叛色系 (#000000, #ffff00, #ff0080)
- **文字颜色**: 黄色 (#ffff00)，副标题粉色 (#ff0080)
- **布局风格**: 个性张扬的反叛布局
- **装饰元素**: 右上角黄色方形边框装饰，45度旋转
- **情感调性**: 暗黑潮流、工业反叛的个性风格`,

      'cute_knowledge_card': `
### 软萌知识卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #ffb6c1 0%, #fffacd 100%) - 粉色到淡黄
- **主色调**: 软萌色系 (#ffb6c1, #fffacd, #d1477a)
- **文字颜色**: 深粉色 (#d1477a, #ec4899)
- **布局风格**: 可爱卡片式布局
- **装饰元素**: 爱心💜装饰
- **圆角**: 15px大圆角，软萌感
- **阴影**: 0 2px 8px rgba(255, 182, 193, 0.3)
- **情感调性**: 软萌可爱、知识分享的温馨风格`,

      'business_simple_clean': `
### 商务简约信息卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景**: 浅灰色 (#f5f5f5)
- **主色调**: 简约色系 (#f5f5f5, #2c3e50, #27ae60)
- **文字颜色**: 深灰色 (#2c3e50)，副标题 (#7f8c8d)
- **布局风格**: 方正简约布局
- **装饰元素**: 绿色线条装饰
- **边框**: 1px solid #e0e0e0
- **圆角**: 6px轻微圆角
- **情感调性**: 商务简约、功能至上的专业风格`,

      'fresh_illustration_style': `
### 清新插画风信息卡片风格 - 严格视觉规范
**必须严格遵循以下视觉元素：**
- **背景渐变**: linear-gradient(135deg, #ffc0cb 0%, #98fb98 50%, #87ceeb 100%) - 马卡龙三色渐变
- **主色调**: 马卡龙色系 (#ffc0cb, #98fb98, #87ceeb, #2d5a87)
- **文字颜色**: 深蓝色 (#2d5a87, #4a90e2)
- **布局风格**: 不规则插画式布局
- **装饰元素**: 左上角调色板🎨装饰
- **圆角**: 12px圆角
- **情感调性**: 清新治愈、手绘插画的轻松风格`
    };

    return styleGuides[templateKey] || `
### 默认设计风格
- 使用现代简约设计
- 适当的颜色对比度
- 清晰的视觉层次
- 符合平台特色的布局
    `;
  }
}

// ⚡ 性能优化配置
const PERFORMANCE_CONFIG = {
  FAST_API_TIMEOUT: 8000, // 增加到8秒，确保AI质量
  MAX_RETRIES: 0,
  ENABLE_SMART_FUSION: false, // 暂时禁用直接生成，优先质量
};

// 封面尺寸配置
const coverSizes = {
  xiaohongshu: {
    name: '小红书封面',
    width: 900,
    height: 1200,
    ratio: '3:4',
    description: '小红书图文封面，垂直布局',
    key: 'xiaohongshu'
  },
  video: {
    name: '短视频封面',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    description: '抖音/快手/视频号封面，竖屏布局',
    key: 'video'
  },
  wechat: {
    name: '公众号封面',
    width: 900,
    height: 268,
    ratio: '3.35:1',
    description: '微信公众号文章封面，横向布局',
    key: 'wechat',
    special: true,
  },
};

// ⚡ 性能优化：请求去重映射
const requestDeduplication = new Map<string, Promise<any>>();

// 定期清理去重映射，防止内存泄漏
setInterval(() => {
  if (requestDeduplication.size > 50) {
    console.log(`🧹 清理请求去重映射，当前大小: ${requestDeduplication.size}`);
    requestDeduplication.clear();
  }
}, 5 * 60 * 1000);

// ⚡ 超时控制的fetch函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout/1000}秒）`);
    }
    throw error;
  }
}

// 🚀 三要素融合AI调用函数
async function smartFusionAICall(fusedPrompt: string): Promise<string> {
  console.log('🧬 三要素融合AI调用开始...');
  
  const response = await fetchWithTimeout('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: "你是顶级封面设计专家，专门创建符合不同平台特色的专业封面。你深刻理解小红书的温暖友好、短视频的震撼冲击、公众号的专业权威等平台DNA。\n\n🚨 **严格要求：直接返回纯HTML代码，绝对不要使用markdown或代码块标记包裹！只返回从<!DOCTYPE html>或<div>开始的纯HTML代码。任何代码块标记都会导致生成失败！**\n\n✅ 正确示例：直接输出 <div style=\"...\">内容</div>\n❌ 错误示例：```html <div>内容</div> ```"
        },
        {
          role: 'user',
          content: fusedPrompt
        }
      ],
      temperature: 0.3, // 提高创意性
      max_tokens: 1500, // 增加token确保完整HTML
      top_p: 0.8,
      stream: false,
    }),
  }, PERFORMANCE_CONFIG.FAST_API_TIMEOUT);

  if (!response.ok) {
    throw new Error(`AI调用失败: ${response.status}`);
  }

  const data = await response.json();
  let htmlContent = data.choices?.[0]?.message?.content;

  if (!htmlContent) {
    throw new Error('AI未返回有效内容');
  }

  // 🛡️ 核心内容清理机制
  htmlContent = cleanAIResponse(htmlContent);
  
  console.log('🧬 三要素融合AI调用完成');
  return htmlContent;
}

// 🛡️ 方案2：AI返回内容清理机制（核心防护）
function cleanAIResponse(htmlContent: string): string {
  console.log('🧽 开始清理AI返回内容...');
  
  // 移除所有markdown代码块标记
  let cleaned = htmlContent
    .replace(/```html\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/^```.*?\n/gm, '')
    .replace(/\n```$/gm, '')
    .replace(/```$/gm, '');
  
  // 移除开头结尾的空白字符和换行
  cleaned = cleaned.trim();
  
  // 如果不是以HTML标签开头，尝试提取HTML内容
  if (!cleaned.startsWith('<')) {
    const htmlMatch = cleaned.match(/<[^>]+[\s\S]*$/);
    if (htmlMatch) {
      cleaned = htmlMatch[0];
    }
  }
  
  // 额外清理：移除可能的文本描述
  if (cleaned.includes('以下是') || cleaned.includes('代码如下')) {
    const divMatch = cleaned.match(/<div[\s\S]*$/);
    if (divMatch) {
      cleaned = divMatch[0];
    }
  }
  
  console.log('✅ AI内容清理完成');
  return cleaned;
}

// 🔍 方案3：增强HTML验证机制（防御层）
function advancedValidateHtml(htmlContent: string): { isValid: boolean; issues: string[]; cleanedContent?: string } {
  const issues: string[] = [];
  let cleanedContent = htmlContent;
  
  // 检查是否包含markdown标记
  if (htmlContent.includes('```')) {
    issues.push('包含markdown代码块标记');
    // 尝试自动修复
    cleanedContent = cleanAIResponse(htmlContent);
  }
  
  // 检查是否以有效HTML开头
  if (!cleanedContent.trim().startsWith('<')) {
    issues.push('不以HTML标签开头');
  }
  
  // 检查基本结构
  if (!cleanedContent.includes('<div') && !cleanedContent.includes('<!DOCTYPE')) {
    issues.push('缺少基本HTML结构');
  }
  
  // 检查是否包含明显的非HTML文本
  const textPatterns = [
    /^(这是|以下是|代码如下|生成的)/i,
    /请注意|注意事项|说明/i,
    /(结束|完成)$/i
  ];
  
  for (const pattern of textPatterns) {
    if (pattern.test(cleanedContent)) {
      issues.push('包含描述性文本');
      break;
    }
  }
  
  // 如果自动修复后没有问题，返回修复结果
  const isValid = issues.length === 0 && cleanedContent.length > 50;
  const wasFixed = cleanedContent !== htmlContent;
  
  if (wasFixed && isValid) {
    console.log('🔧 HTML验证：自动修复成功');
  }
  
  return {
    isValid: isValid || wasFixed,
    issues,
    cleanedContent: wasFixed ? cleanedContent : undefined
  };
}

// 🔧 方案4：模板合规性验证（备选）
function validateTemplateCompliance(html: string, templateKey: string): boolean {
  const templateValidators: Record<string, (html: string) => boolean> = {
    'constructivist_teaching': (html) => 
      html.includes('background') && !html.includes('```') && html.includes('linear-gradient'),
    'luxury_natural_mood': (html) => 
      html.includes('#2f4f4f') || html.includes('#8fbc8f') || html.includes('自然'),
    'soft_tech_card': (html) => 
      html.includes('#6b46c1') || html.includes('#8b5cf6') || html.includes('科技'),
    'modern_business_news': (html) => 
      html.includes('#2d5a27') || html.includes('#8b1538') || html.includes('商务'),
    'flowing_tech_blue_style': (html) => 
      html.includes('#4682b4') || html.includes('#87ceeb') || html.includes('蓝'),
    'digital_ticket_style': (html) => 
      html.includes('#ffffff') && html.includes('#000000') && !html.includes('```'),
    'scene_photo_xiaohongshu': (html) => 
      html.includes('#fb923c') || html.includes('#fbbf24') || html.includes('小红书'),
    'soft_rounded_card': (html) => 
      html.includes('#ffb6c1') || html.includes('#fffacd') || html.includes('圆角')
  };
  
  const validator = templateValidators[templateKey];
  return validator ? validator(html) : true;
}

// ⚡ 升级版HTML验证（替换原有的quickValidateHtml）
function quickValidateHtml(htmlContent: string): boolean {
  const validation = advancedValidateHtml(htmlContent);
  
  if (!validation.isValid) {
    console.log('❌ HTML验证失败:', validation.issues.join(', '));
    return false;
  }
  
  return true;
}

// ⚡ 快速降级HTML生成
function createFastFallbackHtml(sizeConfig: any, text: string, templateName: string): string {
  const platformDNA = PLATFORM_DNA_DATABASE[sizeConfig.key as keyof typeof PLATFORM_DNA_DATABASE];
  const colorScheme = platformDNA?.colorSchemes[0] || 
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', title: '#FFFFFF', subtitle: '#E3F2FD' };
  
  const fontSize = platformDNA?.visual.fontSize.title.split('-')[1] || '48px';
  
  // 🎨 添加字符间距配置，根据平台优化
  const spacing = {
    letterSpacing: sizeConfig.key === 'video' ? '0.08em' : sizeConfig.key === 'wechat' ? '0.06em' : '0.05em',
    wordSpacing: sizeConfig.key === 'video' ? '0.15em' : sizeConfig.key === 'wechat' ? '0.12em' : '0.1em',
    lineHeight: sizeConfig.key === 'video' ? '1.3' : sizeConfig.key === 'wechat' ? '1.5' : '1.4'
  };
  
  return `<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;background:${colorScheme.bg};display:flex;align-items:center;justify-content:center;font-family:'PingFang SC',sans-serif;color:${colorScheme.title};font-size:${fontSize};text-align:center;padding:40px;box-sizing:border-box;border-radius:20px">
    <div style="max-width:90%">
      <h1 style="margin:0;font-size:${fontSize};margin-bottom:20px;text-shadow:2px 2px 4px rgba(0,0,0,0.3);letter-spacing:${spacing.letterSpacing};word-spacing:${spacing.wordSpacing};line-height:${spacing.lineHeight}">${text}</h1>
      <p style="margin:0;font-size:24px;opacity:0.8;background:rgba(255,255,255,0.1);padding:10px 20px;border-radius:20px;letter-spacing:${spacing.letterSpacing};word-spacing:${spacing.wordSpacing}">${templateName}</p>
    </div>
  </div>`;
}

// ⚡ 处理单个请求的优化函数 - 三要素融合版本
async function processRequest(text: string, sizeKey: string, templateKey: string, startTime: number) {
  try {
    // ⚡ 缓存检查
    const cacheKey = { text: text.trim(), template: templateKey, size: sizeKey };
    const cachedResult = cacheUtils.getCoverCache(cacheKey);
    
    if (cachedResult) {
      console.log('⚡ 缓存命中，瞬间返回');
      return NextResponse.json({
        ...cachedResult,
        generationTime: Date.now() - startTime,
        cached: true
      });
    }

    // 获取配置
    const sizeConfig = { ...coverSizes[sizeKey as keyof typeof coverSizes], key: sizeKey };
    if (!sizeConfig) {
      return NextResponse.json({ error: '不支持的封面尺寸' }, { status: 400 });
    }

    let selectedTemplate = getEnhancedTemplate(templateKey) || getEnhancedTemplate('scene_photo_xiaohongshu');

    if (!selectedTemplate) {
      selectedTemplate = {
        key: 'scene_photo_xiaohongshu',
        name: '默认专业模板',
        description: '适配当前平台的优化设计'
      } as any;
    }

    // 检查API配置
    if (!DEEPSEEK_API_KEY) {
      const fallbackHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate?.name || "默认模板");
      return NextResponse.json({
        error: 'API未配置，使用降级方案',
        html: fallbackHtml,
        template: selectedTemplate?.key || "default",
        templateName: selectedTemplate?.name || "默认模板",
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime,
        fallback: true
      });
    }

    try {
      console.log('🧬 开始三要素融合生成...');
      
      // 使用新的三要素融合引擎
      const unifiedEngine = new UnifiedGenerationEngine();
      const generationResult = await unifiedEngine.generate({
        content: text,
        platform: sizeKey,
        template: templateKey
      });

      console.log('🧬 三要素融合生成完成');
      
      // ⚡ 增强验证和清理
      const validation = advancedValidateHtml(generationResult.html);
      let finalHtml = generationResult.html;
      
      if (!validation.isValid) {
        console.log('⚠️ HTML验证失败，尝试修复...');
        
        if (validation.cleanedContent) {
          // 使用自动修复的内容
          finalHtml = validation.cleanedContent;
          console.log('🔧 使用自动修复的HTML内容');
        } else {
          // 降级到备用方案
          console.log('🔄 降级到备用HTML生成');
          finalHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate?.name || "默认模板");
        }
      }
      
      // 🔧 模板合规性验证
      const isTemplateCompliant = validateTemplateCompliance(finalHtml, templateKey);
      if (!isTemplateCompliant) {
        console.log('⚠️ 模板合规性验证失败，记录但继续使用');
      }
      
      const isValid = validation.isValid || !!validation.cleanedContent;

      const result = {
        html: finalHtml,
        template: selectedTemplate?.key || "default",
        templateName: selectedTemplate?.name || "默认模板",
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime,
        smartFusion: true, // 标记使用了三要素融合
        qualityOptimized: true, // 标记质量优化
        fusionDetails: {
          contentAnalysis: generationResult.contentAnalysis,
          optimizedContent: generationResult.optimizedContent,
          templateDecision: generationResult.templateDecision,
          method: generationResult.method
        },
        debug: {
          originalTemplate: templateKey,
          optimizedTemplate: generationResult.templateDecision.useTemplate,
          platform: sizeKey,
          contentLength: text.length,
          validationPassed: isValid,
          templateCompliant: isTemplateCompliant,
          autoFixed: !!validation.cleanedContent,
          validationIssues: validation.issues,
          adaptationScore: Math.round(generationResult.templateDecision.adaptationScore * 100),
          aiOptimized: !PERFORMANCE_CONFIG.ENABLE_SMART_FUSION
        }
      };

      // ⚡ 异步缓存
      if (isValid) {
        setTimeout(() => {
          cacheUtils.setCoverCache(cacheKey, result);
          console.log('💾 高质量三要素融合结果已缓存');
        }, 0);
      }

      console.log(`🧬 高质量三要素融合完成，总耗时: ${Date.now() - startTime}ms`);
      return NextResponse.json(result);

    } catch (aiError) {
      console.error('❌ 三要素融合失败:', aiError);
      
      // 快速降级响应
      const fallbackHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate?.name || "默认模板");
      return NextResponse.json({
        error: `生成失败，使用降级方案: ${aiError instanceof Error ? aiError.message : '未知错误'}`,
        html: fallbackHtml,
        template: selectedTemplate?.key || "default",
        templateName: selectedTemplate?.name || "默认模板",
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime,
        fallback: true
      });
    }

  } catch (error) {
    console.error('❌ 处理请求过程出错:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { text, size: sizeKey = 'xiaohongshu', template: templateKey } = body;

    console.log('📥 三要素融合请求:', { text: text?.substring(0, 30), sizeKey, templateKey });

    if (!text) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // ⚡ 性能优化：请求去重
    const requestKey = `${text.trim()}_${sizeKey}_${templateKey}`;
    if (requestDeduplication.has(requestKey)) {
      console.log('🔄 检测到重复请求，等待现有请求完成...');
      return await requestDeduplication.get(requestKey)!;
    }

    // 创建去重的Promise
    const processingPromise = processRequest(text, sizeKey, templateKey, startTime).finally(() => {
      // 清理去重记录
      requestDeduplication.delete(requestKey);
    });
    
    requestDeduplication.set(requestKey, processingPromise);

    // 设置5分钟后清理去重记录（防止内存泄漏）
    setTimeout(() => {
      requestDeduplication.delete(requestKey);
    }, 5 * 60 * 1000);

    return await processingPromise;

  } catch (error) {
    console.error('❌ 三要素融合处理出错:', error);
    
    return NextResponse.json(
      { 
        error: `处理请求出错: ${error instanceof Error ? error.message : '未知错误'}`,
        generationTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}
