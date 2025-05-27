import { NextRequest, NextResponse } from 'next/server';
import { ENHANCED_TEMPLATES, getEnhancedTemplate } from '../../utils/enhancedTemplates';

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 封面尺寸配置
const coverSizes = {
  xiaohongshu: {
    name: '小红书封面',
    width: 900,
    height: 1200,
    ratio: '3:4',
    description: '小红书图文封面，垂直布局',
  },
  video: {
    name: '短视频封面',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    description: '抖音/快手/视频号封面，竖屏布局',
  },
  wechat: {
    name: '公众号封面',
    width: 900, // 基础宽度
    height: 268, // 900 / 3.35 ≈ 268
    ratio: '3.35:1',
    description: '微信公众号文章封面，横向布局',
    special: true, // 标记为特殊布局
  },
};

// 专业封面设计提示词系统
const getProfessionalPrompt = (sizeConfig: any, templateName: string) => {
  if (sizeConfig.key === 'xiaohongshu') {
    // 小红书专业封面设计
    return `请为以下内容创建一个专业的小红书封面设计：

【小红书用户心理洞察】
- 目标用户：18-35岁女性为主，追求精致生活方式，重视真实体验和种草
- 浏览特点：第一张图决定70%点击率，需要瞬间获得感和信息量
- 种草心理：寻找实用干货、真实测评、情绪共鸣、视觉冲击

【内容提炼标准化规范】
1. 核心卖点识别：从原文中提取最具获得感的实用价值点
2. 关键词权重筛选：选择2-3个小红书高频搜索词和种草关键词
3. 文案结构公式：主标题(8-12字) + 副标题(补充说明) + 话题标签(#关键词)

【小红书吸引力触发词库】
- 实用干货型：必备、好用、实测、避坑、教程、秘籍、攻略
- 真实测评型：前后对比、效果图、实拍、真实、亲测
- 情绪共鸣型：真香、绝了、太好哭了、爱了、yyds、Amazing
- 数字冲击型：3步搞定、7天见效、90%的人不知道、5分钟学会

【封面规格要求】
- 尺寸：标准小红书封面3:4比例（${sizeConfig.width}×${sizeConfig.height}像素）
- 分辨率：至少72dpi，确保清晰度
- 文件格式：PNG格式，支持透明效果

【设计风格要求】
- 布局：采用卡片式设计，主体内容放在圆角白色卡片中
- 背景：使用柔和渐变背景（如浅粉到浅蓝、浅紫到浅青等）
- 配色：主色调2-3种，确保与内容主题匹配，可使用对比色突出重点
- 字体：使用无衬线字体，确保清晰易读
- 装饰：适当添加几何图形、图标或装饰元素增强视觉效果

【文案层次要求】
- 主标题：50-60px字号，加粗处理，突出1-2个核心关键词
- 副标题：28-32px字号，支持主标题并提供补充信息
- 描述文字：22-26px字号，简洁表达内容价值
- 标签：底部添加2-3个相关话题标签，前缀#符号，20-24px字号

【布局边距规范】
- 外边距：上下左右各40px，确保内容不贴边
- 卡片内边距：30px，保证文字与卡片边缘有足够间距
- 行间距：标题间距20-30px，段落间距15-20px

【视觉处理技巧】
- 关键词处理：使用高亮色、下划线或特殊背景突出关键词
- 层次感：通过字号、颜色、间距创造清晰的视觉层次
- 留白：确保设计有足够留白，避免过于拥挤
- 装饰元素：添加简约的图标、几何形状或轻微动感效果
- 情感表达：根据内容基调选择合适的视觉元素和色彩

【特殊元素建议】
- 在合适位置添加1-2个emoji表情增强亲和力
- 可使用轻微阴影效果增加设计层次感
- 考虑添加简单的装饰元素（如星星、火花、箭头等）
- 可在角落添加简约的品牌标识或个人标记

请根据以下内容，按照上述要求设计一个吸引人的小红书封面，只输出HTML代码：

内容：`;

  } else if (sizeConfig.key === 'video') {
    // 短视频专业封面设计
    return `请为以下内容创建一个吸引眼球的短视频封面设计：

【短视频用户心理分析】
- 快速滑动环境：平均停留时间3-5秒，需要瞬间抓取注意力
- 黄金3秒原则：开头3秒决定用户是否继续观看，前3个字必须触及痛点
- 口语化偏好：贴近日常交流，制造信息差和期待感

【短视频内容提炼公式】
1. 悬念式：原来/竟然/没想到 + 核心信息点
2. 对比式：别人vs我/以前vs现在/普通vs高级
3. 数字式：X个方法/X天效果/X%的人不知道
4. 场景式：每次/当你/遇到XX情况时
5. 反转式：本以为...没想到.../看起来...实际上...

【3秒抓取文案结构】
- 主标题：5-8字超强冲击力开头，必须制造悬念或触及痛点
- 副标题：8-12字补充信息，制造继续观看的期待感
- 信息密度：避免过多文字，单个信息点突出，口语化表达

【封面规格要求】
- 尺寸：标准竖屏短视频封面9:16比例（${sizeConfig.width}×${sizeConfig.height}像素）
- 分辨率：至少72dpi，确保在移动设备上清晰显示
- 文件格式：PNG格式，支持透明效果和高质量显示

【设计风格要求】
- 布局：重点内容位于上半部分或中央区域，避开底部可能被界面元素遮挡的区域
- 背景：使用简洁但有冲击力的背景，可考虑渐变、纯色或简约图案
- 配色：使用高对比度配色方案，主色调不超过3种，确保在小屏幕上醒目
- 字体：选用粗体无衬线字体，确保在快速滑动时仍能吸引注意
- 装饰：添加简约但有冲击力的视觉元素，增强停留效果

【文案层次要求】
- 主标题：70-80px字号，极简文字（5-8字），加粗处理
- 副标题/卖点：35-40px字号，补充说明主要价值（8-12字）
- 强调元素：可使用色块、描边或特殊效果突出核心词汇
- 标签/口号：可选，24-28px字号，位于中上部分

【安全区域布局规范】
- 上边距：120px，避开状态栏和标题区域
- 下边距：200px，避开底部操作按钮和推荐区域
- 左右边距：60px，确保文字在各种设备上完整显示
- 核心内容区域：位于屏幕上2/3区域，重点信息集中展示

【视觉处理技巧】
- 对比度：确保文字与背景形成强烈对比，提高可读性
- 视觉引导：使用线条、箭头或动态元素引导视线到核心信息
- 层次感：通过大小、颜色、位置创造明确的信息层级
- 简化设计：避免过多细节，专注于1-2个核心视觉元素
- 边距控制：保留足够边距，避免文字贴近屏幕边缘

【特殊元素建议】
- 专注于内容本身，避免添加"观看视频"或"点击播放"等多余文案
- 可使用简单的框架、边框或色块增强视觉结构
- 适当添加动感元素暗示（如波浪线、光效、动作线）
- 在不影响主体内容的情况下，可添加小型品牌标识

请根据以下内容，按照上述要求设计一个能在快速滑动中吸引用户停留的短视频封面，只输出HTML代码：

内容：`;

  } else if (sizeConfig.key === 'wechat') {
    // 公众号专业封面设计
    return `你是一位资深的新媒体运营专家和UI/UX设计师，深谙公众号传播逻辑和用户行为心理。请创建一个微信公众号封面图片组合布局，包含主封面和朋友圈分享封面。

【公众号传播心理分析】
- 双重传播设计：主封面吸引打开，分享图强化传播意愿
- 用户决策路径：标题+封面图→点击打开→内容阅读→分享转发
- 社交分享特性：朋友圈1:1展示，需要独立传达核心价值

【公众号内容提炼策略】
1. 主封面文案要求：
   - 标题字数：12-15字最佳，使用情绪词汇和数字
   - 信息差制造：让读者产生"不看就吃亏"的紧迫感
   - SEO友好：考虑搜索习惯和关键词布局

2. 朋友圈分享图策略：
   - 4字金句提炼：从内容中提取最核心的观点或价值主张
   - 独立传达能力：脱离主封面也能完整表达核心信息
   - 品牌调性强化：与整体视觉风格保持一致，增强记忆点

【传播链路优化】
主封面(制造好奇心+吸引打开) → 优质内容(引发情感共鸣) → 分享图(降低分享门槛+强化传播)

## 设计规格要求：

- **尺寸与比例**：
  - 总尺寸：${sizeConfig.width}×${sizeConfig.height}像素（${sizeConfig.ratio}比例）
  - 主封面区域：632×268像素（左侧，宽度约70%）
  - 朋友圈封面区域：268×268像素（右侧，正方形区域）
  - 整体布局：使用flex布局，左侧主封面+右侧朋友圈分享图，无间距对接

- **设计风格**：
  - 采用现代简约设计，黑色/深色背景搭配1-2种鲜明对比色
  - 文字作为视觉主体，占据页面70%以上空间
  - 使用大胆的字体排版和对比色强调关键词
  - 可添加极简几何元素或图标作为装饰
  - 朋友圈封面设计要求：必须只包含4个汉字（如"运营秘籍"），两字一行垂直排列，字体大小40-50px，水平垂直居中，背景与主封面色调呼应

- **文字处理**：
  - 主标题：30-36px字号，加粗处理，可使用对比色突出关键词
  - 副标题/说明文字：18-22px字号，可使用次要颜色或白色
  - 分类/标签：14-16px字号，可使用细线条或简约图标搭配
  - 朋友圈封面文字：32-36px字号，四个汉字两字一行排列，完全居中显示

- **边距布局优化**：
  - 整体外边距：20px，确保封面不贴边显示
  - 主封面内边距：25px，实际内容区域为582×218px
  - 朋友圈图内边距：20px，实际文字区域为228×228px
  - 文字行间距：主标题与副标题间距12-15px

- **视觉元素**：
  - 可使用简约的代码图标、技术相关图标或几何形状
  - 添加细线条、色块或简约装饰提升设计感
  - 可使用垂直分隔线或留白创造层次感
  - 背景可添加低对比度的纹理或渐变效果

## 技术实现要求：

- 使用纯HTML和CSS编写，所有样式内联
- 使用现代无衬线字体：'PingFang SC', 'Microsoft YaHei', sans-serif
- 总容器尺寸严格按照900×268px
- 使用flex布局：左侧主封面区域632×268px，右侧朋友圈分享图268×268px
- 朋友圈分享图要求：必须包含且只包含4个汉字，采用2×2排列（两字一行），字体40-50px，完全居中显示在268×268px正方形区域内

**朋友圈分享图布局特别要求：**
- 右侧268×268px正方形区域
- 只能包含4个汉字，不能有多余文字或符号
- 布局格式：第一行2个字，第二行2个字，垂直排列
- 字体大小40-50px，确保4个字都能完整显示
- 文字完全居中，距离边缘有足够间距
- 背景颜色与左侧主封面呼应

请根据以下内容，创建一个具有强烈视觉冲击力、现代感和专业性的公众号封面设计，只输出HTML代码：

内容：`;
  }
};

// 封面模板配置 - 整合原有模板和增强模板
const cardTemplates = {
  // 原有经典模板
  scene_photo_xiaohongshu: {
    name: '小红书经典风格',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '小红书经典风格'),
  },
  flowing_tech_blue: {
    name: '科技蓝商务风',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '科技蓝商务风'),
  },
  soft_rounded_card: {
    name: '温柔圆角风格',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '温柔圆角风格'),
  },
  modern_business_info: {
    name: '现代商务资讯风',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '现代商务资讯风'),
  },
  minimal_grid: {
    name: '极简格栅主义封面风格',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '极简格栅主义'),
  },
  industrial_rebellion: {
    name: '新潮工业反叛风',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '新潮工业反叛风'),
  },
  tech_knowledge_sharing: {
    name: '科技感知识分享',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '科技感知识分享'),
  },
  luxury_natural_artistic: {
    name: '奢华自然意境风',
    getPrompt: (sizeConfig: any) => getProfessionalPrompt(sizeConfig, '奢华自然意境风'),
  },
  // 新增增强模板
  ...Object.fromEntries(
    ENHANCED_TEMPLATES.map(template => [
      template.key,
      {
        name: template.name,
        getPrompt: (sizeConfig: any, text: string) => template.getPrompt(sizeConfig, text)
      }
    ])
  )
};

export async function POST(req: NextRequest) {
  try {
    // 验证API密钥
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        error: 500, 
        message: '服务配置错误：缺少DEEPSEEK_API_KEY环境变量' 
      }, { status: 500 });
    }

    const { text, template, coverSize = 'xiaohongshu' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 1, message: '缺少封面文案内容' }, { status: 400 });
    }

    if (!template || !cardTemplates[template as keyof typeof cardTemplates]) {
      return NextResponse.json({ error: 1, message: '无效的模板选择' }, { status: 400 });
    }

    const selectedTemplate = cardTemplates[template as keyof typeof cardTemplates];
    const sizeConfig = coverSizes[coverSize as keyof typeof coverSizes];
    
    if (!sizeConfig) {
      return NextResponse.json({ error: 1, message: '无效的封面尺寸选择' }, { status: 400 });
    }
    
    // 添加key属性到sizeConfig，用于专业提示词系统
    const sizeConfigWithKey = { ...sizeConfig, key: coverSize };
    
    // 获取对应尺寸的prompt
    let basePrompt: string;
    
    // 检查是否为增强模板（需要传入文本参数）
    const enhancedTemplate = getEnhancedTemplate(template as string);
    if (enhancedTemplate) {
      basePrompt = enhancedTemplate.getPrompt(sizeConfigWithKey, text);
    } else {
      // 原有模板处理
      basePrompt = (selectedTemplate as any).getPrompt ? 
        (selectedTemplate as any).getPrompt(sizeConfigWithKey) : 
        (selectedTemplate as any).prompt;
    }
    
    // 调试输出
    console.log('Selected template:', template);
    console.log('Template name:', selectedTemplate.name);
    console.log('Cover size:', coverSize);
    console.log('Size config:', sizeConfig);
    
    // 构建增强的专业提示词
    const prompt = basePrompt + '\n\n' + text + '\n\n## 专业输出要求：\n\n**技术规范：**\n- 只输出一个完整的div容器HTML代码，不包含任何解释文字或markdown标记\n- 所有CSS样式必须内联在style属性中，确保完全自包含\n- 严格按照指定尺寸：width:' + sizeConfigWithKey.width + 'px; height:' + sizeConfigWithKey.height + 'px\n- 输出格式：<div style="width:' + sizeConfigWithKey.width + 'px;height:' + sizeConfigWithKey.height + 'px;...">内容</div>\n\n**设计质量：**\n- 必须是专业的视觉封面设计，具有强烈的视觉冲击力和吸引力\n- 严格遵循' + selectedTemplate.name + '的设计风格和色彩规范\n- 文字层次清晰，字体大小完全适配' + sizeConfigWithKey.width + 'x' + sizeConfigWithKey.height + '尺寸\n- 布局合理，信息组织有序，符合' + sizeConfigWithKey.name + '平台特性\n\n**内容处理：**\n- 深度分析提供的内容，提取核心卖点和关键词\n- 根据内容情感基调选择合适的视觉元素和色彩搭配\n- 确保中文字符完美显示，不使用Unicode转义\n- 设计要能在3秒内抓住用户注意力，促进点击和分享';

    // 使用 DeepSeek API 生成封面内容
    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位资深的视觉设计师和HTML/CSS专家，专精于社交媒体封面设计。你深谙小红书、短视频、公众号等平台的设计规范和用户心理。你的任务是根据专业设计要求，生成一个完美的HTML封面设计。核心原则：1)严格按照设计规范执行，包括字体大小、颜色、布局等所有细节；2)只输出干净的HTML代码，所有样式内联；3)确保设计具有强烈的视觉冲击力和专业性；4)文字层次清晰，符合阅读习惯；5)色彩搭配专业，符合平台特性；6)布局合理，信息组织有序；7)装饰元素恰到好处，不喧宾夺主；8)确保中文字符完美显示；9)设计要能吸引用户停留和点击；10)严格按照指定尺寸和比例生成。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    if (!deepseekRes.ok) {
      console.error('DeepSeek API error:', deepseekRes.status, deepseekRes.statusText);
      return NextResponse.json({ error: 2, message: 'AI服务异常，请稍后重试' }, { status: 502 });
    }

    const deepseekData = await deepseekRes.json();
    let result = deepseekData?.choices?.[0]?.message?.content || '';

    if (!result || result.trim().length === 0) {
      console.error('Empty result from DeepSeek:', deepseekData);
      return NextResponse.json({ error: 3, message: '封面生成失败' }, { status: 500 });
    }

    // 提取纯净的HTML内容
    result = result.trim();
    
    // 移除markdown代码块标记
    result = result.replace(/```html\s*/g, '');
    result = result.replace(/```\s*/g, '');
    result = result.replace(/^```[\w]*\s*/g, '');
    
    // 移除开头和结尾的额外文本
    result = result.replace(/^[^<]*(<div[\s\S]*<\/div>)[^>]*$/g, '$1');
    
    // 规范化引号，防止特殊字符问题
    result = result.replace(/[""]/g, '"'); // 替换中文引号
    result = result.replace(/['']/g, "'"); // 替换中文单引号
    
    // 查找最外层的div标签（支持嵌套）
    const divRegex = /<div(?:\s[^>]*)?>[\s\S]*<\/div>/;
    const divMatch = result.match(divRegex);
    
    if (divMatch) {
      result = divMatch[0];
    } else {
      // 如果没有找到完整的div，尝试构建一个
      const divStart = result.indexOf('<div');
      if (divStart !== -1) {
        let content = result.substring(divStart);
        
        // 计算div标签的匹配
        let openTags = 0;
        let endPos = -1;
        
        for (let i = 0; i < content.length; i++) {
          if (content.substring(i, i + 4) === '<div') {
            openTags++;
          } else if (content.substring(i, i + 6) === '</div>') {
            openTags--;
            if (openTags === 0) {
              endPos = i + 6;
              break;
            }
          }
        }
        
        if (endPos > 0) {
          result = content.substring(0, endPos);
        }
      }
    }
    
    // 最终清理多余的空白和换行，确保HTML格式正确
    result = result.trim().replace(/\n\s*\n/g, '\n');
    
    // 验证HTML结构完整性
    if (!result.startsWith('<div') || !result.endsWith('</div>')) {
      console.error('Generated HTML structure is invalid:', result.substring(0, 100));
    }
    
    // 标准化输出格式验证和优化
    const finalResult = result.trim();
    
    // 验证HTML结构完整性
    const isValidHTML = finalResult.startsWith('<div') && finalResult.endsWith('</div>');
    const hasRequiredDimensions = finalResult.includes(`width:${sizeConfigWithKey.width}px`) && 
                                  finalResult.includes(`height:${sizeConfigWithKey.height}px`);
    
    // 调试输出生成的内容
    console.log('Generated HTML length:', finalResult.length);
    console.log('Generated HTML preview:', finalResult.substring(0, 200) + '...');
    console.log('HTML structure valid:', isValidHTML);
    console.log('Dimensions correct:', hasRequiredDimensions);
    
    // 构建标准化响应
    const response = {
      result: finalResult,
      template: selectedTemplate.name,
      coverSize: sizeConfigWithKey.name,
      dimensions: {
        width: sizeConfigWithKey.width,
        height: sizeConfigWithKey.height,
        ratio: sizeConfigWithKey.ratio,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        contentLength: text.length,
        htmlLength: finalResult.length,
        isValidStructure: isValidHTML,
        hasDimensions: hasRequiredDimensions,
        templateStyle: selectedTemplate.name,
        platform: sizeConfigWithKey.key,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Generate card API error:', error);
    return NextResponse.json({ error: 500, message: '封面生成服务异常，请稍后重试' }, { status: 500 });
  }
}
