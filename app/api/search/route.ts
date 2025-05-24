import { NextRequest, NextResponse } from 'next/server';
import { Search1APIUtil } from '@/app/utils/search1api-util';

// 建议实际部署时用 process.env 存储密钥
const SEARCH1API_KEY = 'D02FA946-B803-49A9-BBDC-402F7AB8EF3A'; // Search1API Key
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

// 搜索类型配置
const searchTypeConfig = {
  google: { service: 'google', sites: [] },
  wechat: { service: 'google', sites: ['mp.weixin.qq.com'] },
  zhihu: { service: 'google', sites: ['zhihu.com'] },
  xiaohongshu: { service: 'google', sites: ['xiaohongshu.com'] },
  douyin: { service: 'google', sites: ['douyin.com'] },
  weibo: { service: 'google', sites: ['weibo.com'] },
  github: { service: 'google', sites: ['github.com'] },
  twitter: { service: 'google', sites: ['twitter.com', 'x.com'] },
};

export async function POST(req: NextRequest) {
  try {
    const { query, searchType = 'google' } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 1, message: '缺少搜索关键词' }, { status: 400 });
    }

    // 获取搜索类型配置
    const config =
      searchTypeConfig[searchType as keyof typeof searchTypeConfig] || searchTypeConfig.google;

    // 使用 Search1API 进行搜索
    const searchUtil = new Search1APIUtil(SEARCH1API_KEY);

    // 搜索参数配置
    const searchParams = {
      query: query.trim(),
      search_service: config.service as 'google',
      max_results: 8,
      crawl_results: 0,
      image: false,
      include_sites: config.sites,
      exclude_sites: [],
      language: 'zh',
      time_range: 'year',
    };

    console.log('Searching with params:', searchParams);

    const searchResult = await searchUtil.search(searchParams);
    console.log('Search completed:', searchResult);

    // 检查搜索结果
    if (!searchResult || !searchResult.results || !Array.isArray(searchResult.results)) {
      console.error('Invalid search result structure:', searchResult);
      return NextResponse.json(
        {
          error: 2,
          message: '搜索结果格式异常',
          debug: searchResult,
        },
        { status: 500 }
      );
    }

    if (searchResult.results.length === 0) {
      return NextResponse.json(
        {
          error: 3,
          message: '未找到相关搜索结果',
        },
        { status: 404 }
      );
    }

    // 整理搜索结果内容
    const searchContent = searchResult.results
      .slice(0, 5) // 取前5条结果
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.title}\n${item.snippet}\n来源：${item.link}`
      )
      .join('\n\n');

    // 使用 DeepSeek API 将搜索结果转换为小红书笔记
    const searchTypeName: Record<string, string> = {
      google: 'Google',
      wechat: '微信公众号',
      zhihu: '知乎',
      xiaohongshu: '小红书',
      douyin: '抖音',
      weibo: '微博',
      github: 'GitHub',
      twitter: 'Twitter',
    };

    const typeName = searchTypeName[searchType] || 'Google';

    const prompt = `基于以下${typeName}搜索结果，创作一篇小红书爆款笔记，要求：

1. 标题要吸引眼球，使用emoji增强视觉效果
2. 内容结构清晰，使用分点和emoji
3. 语言生动有趣，贴近小红书用户喜好
4. 适当添加个人体验感和真实感
5. 包含实用价值和可操作性
6. 控制在适合的长度，不要过长
7. 去除AI痕迹，让内容更自然

搜索关键词：${query}
搜索来源：${typeName}

搜索结果：
${searchContent}

请创作成一篇完整的小红书笔记：`;

    console.log('Generating Xiaohongshu note from search results...');

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
              '你是一个资深的小红书内容创作者，擅长将各种信息整合成吸引人的小红书笔记。你的内容总是能获得很高的点赞和收藏。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1500,
      }),
    });

    if (!deepseekRes.ok) {
      console.error('DeepSeek API error:', deepseekRes.status, deepseekRes.statusText);
      return NextResponse.json({ error: 4, message: 'AI服务异常，请稍后重试' }, { status: 502 });
    }

    const deepseekData = await deepseekRes.json();
    const note = deepseekData?.choices?.[0]?.message?.content || '';

    if (!note || note.trim().length === 0) {
      console.error('Empty note result:', deepseekData);
      return NextResponse.json({ error: 5, message: '笔记生成失败，请重试' }, { status: 500 });
    }

    console.log('Xiaohongshu note generated successfully');

    // 返回生成的小红书笔记和原始搜索结果
    return NextResponse.json({
      note: note.trim(),
      searchResults: searchResult.results.slice(0, 5).map((item: any) => ({
        title: item.title || '无标题',
        snippet: item.snippet || '无摘要',
        link: item.link || item.url || '',
      })),
      searchParameters: {
        ...searchResult.searchParameters,
        searchType: searchType,
        searchTypeName: typeName,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);

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

    return NextResponse.json({ error: 500, message: '搜索服务异常，请稍后重试' }, { status: 500 });
  }
}
