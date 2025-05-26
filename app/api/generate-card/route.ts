import { NextRequest, NextResponse } from 'next/server';

// 建议实际部署时用 process.env 存储密钥
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

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

// 生成通用prompt的辅助函数
const generateGenericPrompt = (templateName: string, styleDesc: string, sizeConfig: any) => {
  if (sizeConfig.special) {
    // 公众号特殊布局
    return `请基于以下文案，生成一个${templateName}风格的公众号封面HTML，包含左右两个区域。

严格要求：
- 整体尺寸：width:${sizeConfig.width}px; height:${sizeConfig.height}px（${sizeConfig.ratio}比例）
- 布局：flex横向布局，左右两个区域
- 左区域：width:632px（2.35:1比例主封面）
- 右区域：width:268px（1:1比例朋友圈分享）
- ${styleDesc}
- 标题：适中字体(24-28px)，加粗
- 副标题：小号字体(16-18px)

请只输出<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;display:flex;...">内容</div>格式。

文案内容：`;
  } else {
    // 垂直布局（小红书/短视频）
    const titleSize = sizeConfig.width > 1000 ? '52-60px' : '48-56px';
    const subtitleSize = sizeConfig.width > 1000 ? '32-36px' : '28-32px';
    const padding = sizeConfig.width > 1000 ? '80px' : '60px';
    
    return `请基于以下文案，生成一个${templateName}风格的封面HTML。

严格要求：
- 尺寸：width:${sizeConfig.width}px; height:${sizeConfig.height}px（${sizeConfig.ratio}比例）
- ${styleDesc}
- 标题：大号字体(${titleSize})，加粗
- 副标题：中号字体(${subtitleSize})
- 间距：padding ${padding}

请只输出<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;...">内容</div>格式。

文案内容：`;
  }
};

// 封面模板配置
const cardTemplates = {
  scene_photo_xiaohongshu: {
    name: '小红书经典风格',
    getPrompt: (sizeConfig: any) => {
      if (sizeConfig.special) {
        // 公众号特殊布局
        return `请基于以下文案，生成一个公众号封面风格的HTML，包含左右两个区域。

严格要求：
- 整体尺寸：width:${sizeConfig.width}px; height:${sizeConfig.height}px（${sizeConfig.ratio}比例）
- 布局：flex横向布局，左右两个区域
- 左区域：width:632px（2.35:1比例主封面），橙黄温暖渐变背景(#fb923c到#fbbf24)
- 右区域：width:268px（1:1比例朋友圈分享），相同风格但更紧凑
- 标题：适中字体(24-28px)，白色，加粗
- 副标题：小号字体(16-18px)，白色，90%透明度
- 装饰：简约几何元素，保持小红书橙黄风格一致

请只输出<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;display:flex;...">内容</div>格式。

文案内容：`;
      } else {
        // 垂直布局（小红书/短视频）
        const titleSize = sizeConfig.width > 1000 ? '52-60px' : '48-56px';
        const subtitleSize = sizeConfig.width > 1000 ? '32-36px' : '28-32px';
        const padding = sizeConfig.width > 1000 ? '80px' : '60px';
        
        return `请基于以下文案，生成一个小红书爆款封面风格的HTML。

严格要求：
- 尺寸：width:${sizeConfig.width}px; height:${sizeConfig.height}px（${sizeConfig.ratio}比例）
- 背景：温暖渐变色（#fb923c到#fbbf24，45度角渐变）
- 标题：大号字体(${titleSize})，加粗，白色，文字阴影
- 副标题：中号字体(${subtitleSize})，白色，90%透明度
- 装饰：右上角圆形装饰，增加视觉层次
- 按钮：白色背景，橙色文字(#fb923c)，圆角20px，padding充足
- 间距：上下左右padding至少${padding}，元素间距合理
- 字体：使用系统默认字体，确保兼容性
- 编码：确保所有中文字符正确显示

布局结构：
1. 顶部区域：主标题+副标题（垂直居中靠上）
2. 中部区域：留白或简单装饰
3. 底部区域：行动按钮（居中偏下）

重要：
- 不要使用特殊引号或特殊字符
- 确保HTML结构完整
- 所有样式内联在style属性中

请只输出<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;...">内容</div>格式。

文案内容：`;
      }
    },
  },
  flowing_tech_blue: {
    name: '科技蓝商务风',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '科技蓝商务风',
      '背景：深蓝到浅蓝渐变（#1e3a8a到#3b82f6），白色文字，科技几何元素装饰，专业商务感',
      sizeConfig
    ),
  },
  soft_rounded_card: {
    name: '温柔圆角风格',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '温柔圆角风格',
      '背景：紫黄温柔渐变（#a855f7到#fbbf24），圆角设计，白色文字，柔和几何装饰，温馨美感',
      sizeConfig
    ),
  },
  modern_business_info: {
    name: '现代商务资讯风',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '现代商务资讯风',
      '背景：商务蓝渐变（#1e40af），专业色调，绿红颜色编码，商务图标装饰，专业权威感',
      sizeConfig
    ),
  },
  minimal_grid: {
    name: '极简格栅主义封面风格',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '极简格栅主义',
      '背景：纯黑白对比（#000000，#ffffff），严格网格布局，几何线条装饰，大量留白，现代主义美学',
      sizeConfig
    ),
  },
  industrial_rebellion: {
    name: '新潮工业反叛风',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '新潮工业反叛风',
      '背景：纯黑（#000000），霓虹红绿对比（#ef4444，#10b981），工业金属装饰，解构主义设计，朋克美学',
      sizeConfig
    ),
  },
  tech_knowledge_sharing: {
    name: '科技感知识分享',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '科技感知识分享',
      '背景：深空蓝渐变（#1e293b到#3b82f6），荧光青装饰（#06b6d4），科技线条，代码元素，权威感',
      sizeConfig
    ),
  },
  luxury_natural_artistic: {
    name: '奢华自然意境风',
    getPrompt: (sizeConfig: any) => generateGenericPrompt(
      '奢华自然意境风',
      '背景：深棕金色渐变（#78716c到#d97706），自然绿装饰（#16a34a），东方美学，艺术化装饰，奢华高级',
      sizeConfig
    ),
  },
};

export async function POST(req: NextRequest) {
  try {
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
    
    // 获取对应尺寸的prompt
    const basePrompt = (selectedTemplate as any).getPrompt ? 
      (selectedTemplate as any).getPrompt(sizeConfig) : 
      (selectedTemplate as any).prompt;
    
    // 调试输出
    console.log('Selected template:', template);
    console.log('Template name:', selectedTemplate.name);
    console.log('Cover size:', coverSize);
    console.log('Size config:', sizeConfig);
    
    // 修改prompt，要求AI只返回HTML代码
    const prompt = basePrompt + '\n\n' + text + '\n\n重要要求：\n1. 只返回一个div容器的HTML代码，不要包含任何解释文字\n2. 所有CSS样式必须内联在style属性中\n3. 确保div有固定宽高：width:' + sizeConfig.width + 'px; height:' + sizeConfig.height + 'px\n4. 输出格式：<div style="width:' + sizeConfig.width + 'px;height:' + sizeConfig.height + 'px;...">内容</div>\n5. 不要包含markdown代码块标记\n6. 字体大小要适配' + sizeConfig.width + 'x' + sizeConfig.height + '的尺寸\n7. 生成的必须是视觉封面设计，不要生成列表、段落或其他文本内容\n8. 确保中文字符正确显示，不要使用Unicode转义\n9. 设计要美观，有视觉冲击力，符合' + selectedTemplate.name + '风格';

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
              '你是一个专业的HTML/CSS封面设计师，专门制作各种平台的精美封面。你的任务是根据用户需求生成一个完整的div容器，包含所有必要的内联CSS样式。重要规则：1)只输出<div>到</div>的HTML代码；2)所有样式都要写在style属性中；3)严格按照指定尺寸输出；4)不要输出任何解释文字或markdown标记；5)字体大小要适配指定尺寸；6)严格遵循颜色和风格要求；7)使用标准字体如Arial,sans-serif确保兼容性；8)避免使用特殊引号，使用标准双引号；9)确保中文字符编码正确；10)HTML结构要完整且标准；11)生成的必须是视觉封面设计，包含标题、装饰元素等，不要生成列表或纯文本；12)设计要有视觉冲击力和美感；13)中文文字要直接输出，不要转义为Unicode。',
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
    
    // 调试输出生成的内容
    console.log('Generated HTML length:', result.length);
    console.log('Generated HTML preview:', result.substring(0, 200) + '...');

    return NextResponse.json({
      result: result.trim(),
      template: selectedTemplate.name,
      coverSize: sizeConfig.name,
      dimensions: {
        width: sizeConfig.width,
        height: sizeConfig.height,
        ratio: sizeConfig.ratio,
      },
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Generate card API error:', error);
    return NextResponse.json({ error: 500, message: '封面生成服务异常，请稍后重试' }, { status: 500 });
  }
}
