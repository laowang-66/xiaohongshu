import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: '请提供要生成的内容' }, { status: 400 });
    }

    // 使用正确的API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-28c73a6d126d45ae9d5237427ba65bde';

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的内容编辑和视觉设计师。你的任务是将用户提供的长文内容智能地分析、整理和分配成2-4张精美的信息卡片。

核心要求：
1. **内容完整性**：确保原文所有重要信息都被保留，不遗漏关键内容
2. **自然表达**：避免过度结构化，用自然流畅的文字表达内容
3. **重点突出**：通过文字加重、颜色标注来突出重要信息，而不是分块格式化
4. **合理分配**：根据内容逻辑将长文分成2-4个主题明确的卡片
5. **视觉优化**：每张卡片内容量适中，避免拥挤或稀疏

分析内容时，请：
- 识别主要话题和逻辑结构
- 确定最适合的卡片数量（2-4张）
- 为每张卡片选择最合适的模板类型
- 将内容自然地分配到各张卡片中

可用的6种模板类型：
1. **knowledge_summary**: 知识总结 - 适合概念解释、理论阐述
2. **product_intro**: 产品介绍 - 适合产品特点、功能介绍
3. **tutorial_steps**: 教程步骤 - 适合操作指南、流程说明
4. **comparison_analysis**: 对比分析 - 适合优缺点对比、方案比较
5. **experience_sharing**: 经验分享 - 适合个人经历、心得体会
6. **event_timeline**: 事件时间线 - 适合历史发展、时间顺序

请直接返回JSON格式，包含cards数组：`
          },
          {
            role: 'user',
            content: `请将以下内容分析整理成信息卡片：

${content}

要求：
1. 生成2-4张卡片，完整覆盖原文内容
2. 每张卡片有明确的主题焦点
3. 内容表达自然流畅，不要过度格式化
4. 通过highlights字段标注需要重点突出的内容
5. 如有总结性内容，放入summary字段

请直接返回JSON格式：
{
  "cards": [
    {
      "type": "模板类型",
      "title": "卡片标题",
      "content": ["段落1", "段落2", "段落3"],
      "highlights": ["重点内容1", "重点内容2"],
      "summary": "总结内容（可选）"
    }
  ]
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      // 尝试直接解析JSON
      const parsed = JSON.parse(aiResponse);
      return NextResponse.json(parsed);
    } catch (parseError) {
      // 如果直接解析失败，尝试提取JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return NextResponse.json(extracted);
      }
      
      throw new Error('无法解析AI响应');
    }
    
  } catch (error) {
    console.error('生成信息卡片失败:', error);
    return NextResponse.json(
      { error: '生成信息卡片失败，请稍后重试' },
      { status: 500 }
    );
  }
} 