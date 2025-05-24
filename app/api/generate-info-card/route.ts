import { NextRequest, NextResponse } from 'next/server';

// 建议实际部署时用 process.env 存储密钥
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

// 信息卡片模板配置
const infoCardTemplates = {
  knowledge_summary: {
    name: '知识总结卡片',
    prompt: `请基于以下内容，智能拆分并生成多张知识总结卡片的结构化数据。

拆分规则：
1. 将内容按逻辑段落或知识点拆分成2-4个部分
2. 每个部分生成一张独立的卡片
3. 确保每张卡片内容完整且有逻辑

每张卡片需要提取的字段：
- title: 卡片标题（简洁明确）
- content: 主要内容（数组，包含2-4个要点）
- highlights: 关键要点（数组，包含2-3个重点）
- summary: 总结（一句话概括）

请严格按照以下JSON格式返回多张卡片的数据，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "第一部分标题",
      "content": ["内容1", "内容2"],
      "highlights": ["要点1", "要点2"],
      "summary": "第一部分总结"
    },
    {
      "title": "第二部分标题", 
      "content": ["内容1", "内容2"],
      "highlights": ["要点1", "要点2"],
      "summary": "第二部分总结"
    }
  ]
}

原始内容：`,
  },
  product_intro: {
    name: '产品介绍卡片',
    prompt: `请基于以下内容，智能拆分并生成多张产品介绍卡片的结构化数据。

拆分规则：
1. 按产品功能、使用场景、优势等维度拆分成2-4张卡片
2. 每张卡片聚焦一个核心主题
3. 确保信息完整且互补

每张卡片需要提取的字段：
- title: 卡片标题（产品名称+主题）
- content: 产品特色（数组，包含3-5个特色功能）
- highlights: 推荐理由（数组，包含2-3个推荐点）

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "产品名称 - 核心功能",
      "content": ["特色1", "特色2", "特色3"],
      "highlights": ["推荐理由1", "推荐理由2"]
    },
    {
      "title": "产品名称 - 使用体验",
      "content": ["特色1", "特色2", "特色3"], 
      "highlights": ["推荐理由1", "推荐理由2"]
    }
  ]
}

原始内容：`,
  },
  tutorial_steps: {
    name: '教程步骤卡片',
    prompt: `请基于以下内容，智能拆分并生成多张教程步骤卡片的结构化数据。

拆分规则：
1. 按教程的不同阶段或步骤组拆分成2-4张卡片
2. 每张卡片包含相关的几个步骤
3. 保持操作的连贯性和逻辑性

每张卡片需要提取的字段：
- title: 阶段标题（如"准备阶段"、"操作阶段"等）
- content: 操作步骤（数组，包含3-6个步骤）
- highlights: 注意事项（数组，包含2-3个注意点）

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "教程 - 准备阶段",
      "content": ["步骤1", "步骤2", "步骤3"],
      "highlights": ["注意事项1", "注意事项2"]
    },
    {
      "title": "教程 - 操作阶段",
      "content": ["步骤1", "步骤2", "步骤3"],
      "highlights": ["注意事项1", "注意事项2"]
    }
  ]
}

原始内容：`,
  },
  comparison_analysis: {
    name: '对比分析卡片',
    prompt: `请基于以下内容，智能拆分并生成多张对比分析卡片的结构化数据。

拆分规则：
1. 按不同对比维度或产品类别拆分成2-4张卡片
2. 每张卡片聚焦特定的对比角度
3. 确保对比全面且有结论

每张卡片需要提取的字段：
- title: 对比主题（如"性能对比"、"价格对比"等）
- content: 对比内容（数组，包含3-5个对比点）
- summary: 该维度的建议结论

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "性能对比分析",
      "content": ["对比点1", "对比点2", "对比点3"],
      "summary": "性能方面的建议结论"
    },
    {
      "title": "价格对比分析", 
      "content": ["对比点1", "对比点2", "对比点3"],
      "summary": "价格方面的建议结论"
    }
  ]
}

原始内容：`,
  },
  experience_sharing: {
    name: '经验分享卡片',
    prompt: `请基于以下内容，智能拆分并生成多张经验分享卡片的结构化数据。

拆分规则：
1. 按经验类型或应用场景拆分成2-4张卡片
2. 每张卡片包含相关的经验和建议
3. 确保内容实用且易于理解

每张卡片需要提取的字段：
- title: 经验主题（如"基础经验"、"进阶技巧"等）
- content: 核心经验（数组，包含2-4个经验点）
- highlights: 实用建议（数组，包含2-3个建议）

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "基础经验分享",
      "content": ["经验1", "经验2", "经验3"],
      "highlights": ["建议1", "建议2"]
    },
    {
      "title": "进阶技巧分享",
      "content": ["经验1", "经验2", "经验3"],
      "highlights": ["建议1", "建议2"]
    }
  ]
}

原始内容：`,
  },
  event_timeline: {
    name: '事件时间线卡片',
    prompt: `请基于以下内容，智能拆分并生成多张事件时间线卡片的结构化数据。

拆分规则：
1. 按时间段或事件类型拆分成2-4张卡片
2. 每张卡片包含一个时间段的重要事件
3. 保持时间的连贯性和逻辑性

每张卡片需要提取的字段：
- title: 时间段标题（如"早期发展"、"关键转折"等）
- content: 重要事件（数组，包含3-6个时间节点事件）

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "cards": [
    {
      "title": "早期发展阶段",
      "content": ["事件1", "事件2", "事件3"]
    },
    {
      "title": "关键转折阶段",
      "content": ["事件1", "事件2", "事件3"]
    }
  ]
}

原始内容：`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: '请提供要生成的内容' }, { status: 400 });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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