import { NextRequest, NextResponse } from 'next/server';

// 建议实际部署时用 process.env 存储密钥
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

export async function POST(req: NextRequest) {
  try {
    const { text, style } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 1, message: '缺少需要改写的内容' }, { status: 400 });
    }

    // 根据风格构建不同的提示词
    let stylePrompt = '';
    switch (style) {
      case '爆款风格':
        stylePrompt =
          '爆款风格，要求标题吸引眼球，内容有争议点和话题性，使用大量emoji和感叹号，营造紧迫感';
        break;
      case '生活化':
        stylePrompt = '生活化风格，要求语言亲切自然，像朋友聊天一样，多用口语化表达和生活化场景';
        break;
      case '专业解读':
        stylePrompt = '专业解读风格，要求逻辑清晰，数据支撑，专业术语适当，具有权威性和可信度';
        break;
      default:
        stylePrompt = '默认风格，保持原文核心信息，适当优化表达和结构';
    }

    const prompt = `请将以下内容改写为一篇${stylePrompt}的小红书笔记，要求：
1. 保持原文的核心信息和要点
2. 适合小红书平台的用户阅读习惯
3. 语言自然流畅，去除AI痕迹
4. 结构清晰，适当使用emoji和分点
5. 标题要有吸引力
6. 控制在合适的长度，不要过长

原文内容：
${text}`;

    console.log('Rewriting with style:', style);

    // 调用 DeepSeek API 进行改写
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
            content: '你是一个资深的新媒体内容创作者，擅长改写和优化小红书笔记内容。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1024,
      }),
    });

    if (!deepseekRes.ok) {
      console.error('DeepSeek API error:', deepseekRes.status, deepseekRes.statusText);
      return NextResponse.json({ error: 2, message: 'AI服务异常，请稍后重试' }, { status: 502 });
    }

    const deepseekData = await deepseekRes.json();
    console.log('Rewrite completed');

    const result = deepseekData?.choices?.[0]?.message?.content || '';

    if (!result || result.trim().length === 0) {
      console.error('Empty rewrite result:', deepseekData);
      return NextResponse.json({ error: 3, message: '改写结果为空，请重试' }, { status: 500 });
    }

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error('Rewrite API error:', error);

    // 根据错误类型返回不同的错误信息
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 401, message: 'API密钥无效' }, { status: 401 });
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 429, message: '请求过于频繁，请稍后重试' },
          { status: 429 }
        );
      }
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 502, message: '网络连接异常，请稍后重试' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: 500, message: '改写服务异常，请稍后重试' }, { status: 500 });
  }
}
