'use client';

import { useState } from 'react';

interface MarkdownAnalysis {
  contentType: string;
  layoutType: string;
  optimizedTitle: string;
  optimizedSubtitle?: string;
  highlights: string[];
  layoutSuggestion: string;
  colorScheme: string;
  visualElements: string[];
}

export default function MarkdownDemoPage() {
  const [inputText, setInputText] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [markdownAnalysis, setMarkdownAnalysis] = useState<MarkdownAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('xiaohongshu');

  // 示例内容
  const examples = [
    {
      title: '教程类内容',
      content: `如何在30天内掌握AI绘画技巧

30天速成指南，从零基础到创作高质量AI艺术作品

第一步：选择合适的AI绘画工具
- Midjourney：适合创意类作品
- Stable Diffusion：免费且功能强大
- DALL-E：界面简单易上手

第二步：学习提示词写作技巧
1. 描述主体和风格
2. 添加情绪和氛围词汇
3. 指定画质和细节要求

第三步：实战练习计划
- 第1-10天：基础操作和简单创作
- 第11-20天：风格模仿和技巧提升
- 第21-30天：原创作品和作品集整理

> 坚持每天练习2小时，你也能创作出**专业级**的AI艺术作品！

\`\`\`prompt
一个梦幻的森林场景，阳光透过树叶洒下，油画风格，高清，细节丰富
\`\`\`

小贴士：记住保存每天的练习作品，进步会比你想象的更快！`
    },
    {
      title: '测评类内容',
      content: `5款热门面膜实测！这款性价比居然最高？

作为一个用了100+款面膜的护肤博主，今天来给大家测评5款最近很火的面膜

## 测评产品清单

1. **森田药妆玻尿酸面膜** - 价格：￥3.9/片
2. **SK-II前男友面膜** - 价格：￥58/片  
3. **美迪惠尔N.M.F针剂面膜** - 价格：￥12/片
4. **可复美类人胶原蛋白敷料** - 价格：￥25/片
5. **薇诺娜舒敏保湿面膜** - 价格：￥18/片

## 测评维度

- 补水效果：⭐⭐⭐⭐⭐
- 性价比：⭐⭐⭐⭐⭐  
- 温和度：⭐⭐⭐⭐⭐
- 使用感受：⭐⭐⭐⭐⭐

## 最终排名

> **第一名：森田药妆玻尿酸面膜**
> 价格便宜效果好，学生党必备！

第二名：美迪惠尔N.M.F针剂面膜
第三名：薇诺娜舒敏保湿面膜

详细测评过程和使用感受，记得点赞收藏！`
    },
    {
      title: '故事分享类内容',
      content: `从月薪3000到年薪30万，我只做对了这3件事

两年前的我，刚毕业在一家小公司做客服，月薪3000，每天被各种投诉搞得焦头烂额。

那时候觉得人生就这样了，直到遇到了我的导师...

## 转折点：那个改变我命运的午后

还记得那是一个很普通的周三下午，我正准备辞职回老家。

突然收到一封邮件，是公司的产品总监发来的：

> "小王，我注意到你处理客户问题的方式很特别，有没有兴趣聊聊？"

就是这封邮件，开启了我人生的转折。

## 我做对的三件事

### 第一件事：主动学习产品知识
- 每天花2小时研究产品功能
- 建立客户问题解决方案库
- 主动向技术团队请教

### 第二件事：转换思维模式
从"我要解决问题"变成"我要为客户创造价值"

### 第三件事：建立个人品牌
- 写技术博客分享经验
- 在公司内部做知识分享
- 主动承担更多责任

两年后的今天，我已经成为产品经理，年薪30万。

**最重要的不是起点，而是你愿意为改变付出多少努力。**`
    },
    {
      title: '技术类内容',
      content: `Next.js 14 + TypeScript 最佳实践指南

## 项目初始化

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm run dev
\`\`\`

## 核心配置优化

### 1. TypeScript 配置增强

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
\`\`\`

### 2. 性能优化配置

- **Image 组件**：使用 next/image 自动优化
- **动态导入**：React.lazy + Suspense
- **Bundle 分析**：使用 @next/bundle-analyzer

## API 路由最佳实践

### GET 请求处理

\`\`\`typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
\`\`\`

### 中间件配置

\`\`\`typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 认证逻辑
  return NextResponse.next();
}
\`\`\`

## 部署优化

> 推荐使用 **Vercel** 进行部署，零配置支持 Next.js

关键优化点：
- 启用 gzip 压缩
- 配置 CDN 缓存
- 设置环境变量

记住：**好的架构是演进出来的，不是设计出来的。**`
    }
  ];

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          size: selectedSize,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();
      setGeneratedHtml(data.html);
      setMarkdownAnalysis(data.markdownAnalysis);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const useExample = (content: string) => {
    setInputText(content);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧠 Markdown增强封面生成演示
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            通过Markdown结构分析，自动识别内容类型、提取重点信息、优化设计建议，
            生成更精准、更美观的封面设计
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 示例选择 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📋 快速体验示例</h3>
              <div className="grid grid-cols-2 gap-3">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExample(example.content)}
                    className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <div className="font-medium text-blue-800">{example.title}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {example.content.substring(0, 50)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 内容输入 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">✍️ 输入内容</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入你的内容...支持Markdown语法，系统会自动分析结构并优化设计"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    平台尺寸：
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="xiaohongshu">小红书 (3:4)</option>
                    <option value="video">短视频 (9:16)</option>
                    <option value="wechat">公众号 (3.35:1)</option>
                  </select>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '🔄 生成中...' : '🚀 生成封面'}
                </button>
              </div>
            </div>

            {/* Markdown分析结果 */}
            {markdownAnalysis && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">🧠 Markdown结构分析</h3>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">内容类型：</span>
                      <span className={`px-2 py-1 rounded text-xs ml-2 ${
                        markdownAnalysis.contentType === 'tutorial' ? 'bg-green-100 text-green-800' :
                        markdownAnalysis.contentType === 'review' ? 'bg-purple-100 text-purple-800' :
                        markdownAnalysis.contentType === 'technical' ? 'bg-blue-100 text-blue-800' :
                        markdownAnalysis.contentType === 'story' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {markdownAnalysis.contentType}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">布局类型：</span>
                      <span className="text-gray-600 ml-2">{markdownAnalysis.layoutType}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">优化标题：</span>
                    <span className="text-gray-600 ml-2">{markdownAnalysis.optimizedTitle}</span>
                  </div>
                  
                  {markdownAnalysis.optimizedSubtitle && (
                    <div>
                      <span className="font-medium text-gray-700">副标题：</span>
                      <span className="text-gray-600 ml-2">{markdownAnalysis.optimizedSubtitle}</span>
                    </div>
                  )}
                  
                  {markdownAnalysis.highlights && markdownAnalysis.highlights.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">重点要素：</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {markdownAnalysis.highlights.map((highlight, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700">布局建议：</span>
                    <span className="text-gray-600 ml-2">{markdownAnalysis.layoutSuggestion}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">配色方案：</span>
                    <span className="text-gray-600 ml-2">{markdownAnalysis.colorScheme}</span>
                  </div>
                  
                  {markdownAnalysis.visualElements && markdownAnalysis.visualElements.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">视觉元素：</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {markdownAnalysis.visualElements.map((element, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：结果展示 */}
          <div className="space-y-6">
            {/* 封面预览 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🎨 封面预览</h3>
              {generatedHtml ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                    className="flex justify-center items-center"
                    style={{
                      transform: 'scale(0.5)',
                      transformOrigin: 'center',
                      overflow: 'hidden'
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  {isLoading ? '🔄 正在生成封面...' : '📋 输入内容后点击生成封面'}
                </div>
              )}
            </div>

            {/* HTML代码 */}
            {generatedHtml && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">💻 生成的HTML代码</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{generatedHtml}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">🌟 Markdown增强功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold mb-2">智能内容分析</h3>
              <p className="text-gray-600 text-sm">
                自动识别内容类型（教程、测评、技术等），提取核心价值点和关键信息
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📐</span>
              </div>
              <h3 className="font-semibold mb-2">结构化布局</h3>
              <p className="text-gray-600 text-sm">
                基于Markdown结构自动生成层次化布局，突出重点内容和视觉层次
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">精准模板匹配</h3>
              <p className="text-gray-600 text-sm">
                根据内容特征智能选择最适合的设计模板和视觉风格
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 