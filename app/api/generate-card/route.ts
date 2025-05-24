import { NextRequest, NextResponse } from 'next/server';

// 建议实际部署时用 process.env 存储密钥
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

// 卡片模板配置
const cardTemplates = {
  flowing_tech_blue: {
    name: '流动科技蓝风格',
    prompt: `请基于以下简介文案，生成一个流动科技蓝风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：科技蓝 (#1e3a8a, #3b82f6)，白色 (#ffffff)
- 辅助色：霓虹蓝 (#06b6d4)，渐变色 (#1e40af 到 #3b82f6)

设计元素：
- 流动曲线背景，蓝白渐变
- 几何形状装饰（圆形、菱形）
- 无衬线字体，现代感强
- 科技感图标或符号

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  soft_rounded_card: {
    name: '圆角卡片温柔风格',
    prompt: `请基于以下简介文案，生成一个圆角卡片温柔风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：温柔紫 (#a855f7)，温柔黄 (#fbbf24)，粉色 (#f472b6)，米色 (#fef3c7)
- 圆角设计：border-radius: 20px 以上
- 微妙阴影效果

设计元素：
- 圆角卡片布局
- 温柔色彩搭配
- 网格布局思维
- 温暖亲切的字体排版
- 简约而温馨的视觉元素

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  modern_business_info: {
    name: '现代商务资讯卡片风',
    prompt: `请基于以下简介文案，生成一个现代商务资讯卡片风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：商务蓝 (#1e40af)，成功绿 (#10b981)，警示红 (#ef4444)，专业灰 (#6b7280)
- 三级层次结构：主标题、副标题、正文

设计元素：
- 专业商务布局
- 绿红颜色编码（涨跌、好坏等）
- 卡片式信息分组
- 商务图标和符号
- 专业字体排版

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  minimal_grid: {
    name: '极简格栅主义封面风格',
    prompt: `请基于以下简介文案，生成一个极简格栅主义封面风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：纯黑 (#000000)，纯白 (#ffffff)，深灰 (#374151)
- 严格网格系统布局

设计元素：
- 极简网格布局
- 黑白对比强烈
- 几何元素装饰
- 大量留白空间
- 精炼的文字排版
- 线条和方块装饰

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  industrial_rebellion: {
    name: '新潮工业反叛风',
    prompt: `请基于以下简介文案，生成一个新潮工业反叛风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：纯黑 (#000000)，霓虹红 (#ef4444)，荧光绿 (#10b981)，金属灰 (#6b7280)
- 高对比度设计

设计元素：
- 黑色主背景
- 工业风装饰元素
- 解构主义字体排版
- 朋克美学符号
- 金属质感边框
- 地下文化氛围

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  tech_knowledge_sharing: {
    name: '科技感知识分享',
    prompt: `请基于以下简介文案，生成一个科技感知识分享风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：深空蓝 (#1e293b)，科技蓝 (#3b82f6)，荧光青 (#06b6d4)
- 专业化设计，体现权威感

设计元素：
- 深蓝科技背景
- 几何图形装饰
- 技术符号和图标
- 清晰的信息层级
- 现代科技字体
- 电路板纹理效果

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  scene_photo_xiaohongshu: {
    name: '场景图片小红书封面',
    prompt: `请基于以下简介文案，生成一个场景图片小红书封面风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：醒目黄 (#fbbf24)，生活橙 (#fb923c)，清新白 (#ffffff)
- 真实生活场景感

设计元素：
- 渐变背景模拟真实场景
- 醒目黄色标题字体
- 生活化图标和装饰
- 实用性强的信息排版
- 小红书风格的视觉元素
- 贴近生活的配色

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
  luxury_natural_artistic: {
    name: '奢华自然意境风',
    prompt: `请基于以下简介文案，生成一个奢华自然意境风格的HTML+CSS信息卡片。要求：

设计规格：
- 宽高比：3:4 (例如：300px × 400px)
- 主色调：深棕 (#78716c)，金色 (#d97706)，自然绿 (#16a34a)，奢华黑 (#1c1917)
- 高级沉稳的色调搭配

设计元素：
- 暗调自然背景渐变
- 优雅的字体排版
- 东西方美学融合
- 半透明装饰元素
- 摄影级光影效果
- 艺术化的视觉符号

请生成完整的HTML结构，包含内联CSS样式，确保可以直接渲染。

简介文案：`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { text, template } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 1, message: '缺少简介文案' }, { status: 400 });
    }

    if (!template || !cardTemplates[template as keyof typeof cardTemplates]) {
      return NextResponse.json({ error: 1, message: '无效的模板选择' }, { status: 400 });
    }

    const selectedTemplate = cardTemplates[template as keyof typeof cardTemplates];
    const prompt = selectedTemplate.prompt + '\n\n' + text;

    // 使用 DeepSeek API 生成卡片内容
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
            content: `你是一个专业的UI/UX设计师和前端开发者，擅长制作各种风格的HTML+CSS信息卡片。

核心要求：
1. 输出完整的HTML结构，包含内联CSS样式
2. 确保宽高比为3:4（例如：width: 300px; height: 400px）
3. 使用现代CSS技术：flexbox、grid、渐变、阴影等
4. 字体选择要符合设计风格
5. 颜色搭配要专业且符合主题
6. 布局要清晰，层次分明
7. 添加适当的视觉装饰元素

输出格式要求：
- 只返回完整的HTML代码，包含内联CSS
- 不要包含任何markdown代码块标记（如 \`\`\`html 或 \`\`\`）
- 不要包含任何解释说明文字
- 直接从<div>或<html>标签开始
- 确保HTML可以直接在浏览器中渲染`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    const deepseekData = await deepseekRes.json();
    let result = deepseekData?.choices?.[0]?.message?.content || '';

    if (!result) {
      return NextResponse.json({ error: 3, message: '卡片生成失败' }, { status: 500 });
    }

    // 清理markdown代码块标记
    result = result
      .replace(/```html\s*/gi, '') // 移除开始的```html
      .replace(/```\s*$/gi, '') // 移除结尾的```
      .replace(/^```\s*/gi, '') // 移除开头的```
      .trim(); // 清理首尾空白

    console.log('Card generation completed for template:', template);
    return NextResponse.json({ result });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: 500, message: '服务器异常' }, { status: 500 });
  }
}
