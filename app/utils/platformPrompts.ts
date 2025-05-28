/**
 * 平台专用提示词库 - 针对不同平台的内容优化规则
 */

interface ContentTypeConfig {
  template: string;
  examples: string[];
}

interface PlatformPromptConfig {
  systemPrompt: string;
  contentRules: {
    titleStructure: string;
    language: string;
    keywords: string[];
    emotions: string[];
    avoid: string[];
  };
  contentTypes: Record<string, ContentTypeConfig>;
  optimizationPrompt: string;
}

export const XIAOHONGSHU_PROMPTS: PlatformPromptConfig = {
  systemPrompt: `你是小红书内容优化专家，深谙小红书用户喜好和平台算法规则。`,
  
  contentRules: {
    titleStructure: "主标题(≤20字) + 副标题(≤15字，可选)",
    language: "亲切友好，口语化，像朋友聊天",
    keywords: ["种草", "实测", "避坑", "干货", "必看", "真实", "超好用", "姐妹们", "宝子们"],
    emotions: ["惊喜", "兴奋", "分享欲", "亲切感"],
    avoid: ["广告感", "过度商业化", "生硬推销"]
  },

  contentTypes: {
    tutorial: {
      template: "X步教你{核心技能}！{效果描述}",
      examples: ["3步教你化妆不卡粉！新手也能画出高级感", "5分钟学会拍照姿势！秒变腿精女神"]
    },
    review: {
      template: "真实测评{产品}！{结果}不踩雷",
      examples: ["真实测评10款口红！显白不脱妆的竟是它", "亲测5款面膜！这款补水效果绝了"]
    },
    sharing: {
      template: "分享我的{经历/发现}！{收获}",
      examples: ["分享我的护肤心得！一个月肌肤变透亮", "分享我的减肥经历！2个月瘦了20斤"]
    },
    collection: {
      template: "{数量}个{类别}合集！{特点}",
      examples: ["10个穿搭公式合集！小个子也能穿出大长腿", "15个拍照pose合集！怎么拍都好看"]
    }
  },

  optimizationPrompt: `请根据小红书平台特点，为以下内容生成3个优化版本：

{content}

要求：
1. 主标题不超过20字，要有吸引力和话题性
2. 副标题不超过15字，补充关键信息（可选）
3. 语调亲切友好，像闺蜜分享
4. 善用小红书热词：种草、实测、避坑、干货等
5. 适当使用emoji，增加亲切感
6. 避免广告感，突出真实体验
7. 要能激发用户的好奇心和互动欲

请按以下格式输出：

版本1：
主标题：[标题内容]
副标题：[副标题内容]（如无则省略）
情感标签：[如：兴奋分享/真诚推荐/惊喜发现]
推荐理由：[为什么这个版本适合小红书]

版本2：
[同上格式]

版本3：
[同上格式]`
};

export const VIDEO_PROMPTS: PlatformPromptConfig = {
  systemPrompt: `你是短视频内容优化专家，精通抖音、快手等平台的内容策略。`,
  
  contentRules: {
    titleStructure: "超短主标题(≤15字) + 数字/符号强化",
    language: "简洁有力，制造悬念，强烈冲击",
    keywords: ["震惊", "必看", "爆料", "揭秘", "真相", "秒懂", "绝了", "太牛了", "不看后悔"],
    emotions: ["震撼", "紧迫", "好奇", "兴奋"],
    avoid: ["冗长描述", "模糊表达", "缺乏冲击力"]
  },

  contentTypes: {
    revelation: {
      template: "震惊！{事件}真相曝光",
      examples: ["震惊！奶茶店不告诉你的真相", "爆料！明星私下真实生活"]
    },
    tutorial: {
      template: "{数字}秒学会{技能}！",
      examples: ["30秒学会拍照技巧！", "3招搞定化妆难题！"]
    },
    comparison: {
      template: "{A} VS {B}，结果太意外",
      examples: ["大牌VS平价护肤品，结果太意外", "iPhone VS 华为，谁更值得买"]
    },
    secret: {
      template: "揭秘{行业/人群}不为人知的{秘密}",
      examples: ["揭秘美妆博主不说的秘密", "医生从不公开的养生法"]
    }
  },

  optimizationPrompt: `请根据短视频平台特点，为以下内容生成3个优化版本：

{content}

要求：
1. 标题极其精简，最多15字
2. 制造强烈视觉冲击和紧迫感
3. 多用数字、感叹号等抓眼球元素
4. 语调要有张力，制造悬念
5. 适合竖屏显示，字体要大而醒目
6. 3秒内抓住用户注意力
7. 可适度夸张，但不虚假

请按以下格式输出：

版本1：
主标题：[≤15字]
关键元素：[数字/符号等]
情感强度：[1-10级]
适用场景：[什么情况下使用这个版本]

版本2：
[同上格式]

版本3：
[同上格式]`
};

export const WECHAT_PROMPTS: PlatformPromptConfig = {
  systemPrompt: `你是公众号内容优化专家，了解公众号读者的阅读习惯和价值追求。`,
  
  contentRules: {
    titleStructure: "主标题(≤30字) + 副标题(≤20字)",
    language: "专业严谨，有深度，体现价值",
    keywords: ["深度", "分析", "思考", "洞察", "解读", "专业", "权威", "独家", "重磅"],
    emotions: ["理性", "权威", "深度", "价值感"],
    avoid: ["情绪化", "哗众取宠", "缺乏深度"]
  },

  contentTypes: {
    analysis: {
      template: "{事件/现象}深度解析：{核心观点}",
      examples: ["ChatGPT现象深度解析：AI时代的机遇与挑战", "房价走势深度解析：2024年市场预判"]
    },
    insight: {
      template: "{领域}行业洞察：{趋势/变化}",
      examples: ["新能源行业洞察：未来十年的投资机会", "教育行业洞察：在线教育的下半场"]
    },
    professional: {
      template: "专业解读{话题}：{专业角度}",
      examples: ["专业解读新税法：对中小企业的影响", "律师解读合同纠纷：如何保护自身权益"]
    },
    exclusive: {
      template: "独家{类型}：{核心价值}",
      examples: ["独家调研：90后消费行为报告", "独家专访：创业者的成功密码"]
    }
  },

  optimizationPrompt: `请根据公众号平台特点，为以下内容生成3个优化版本：

{content}

要求：
1. 主标题最多30字，体现深度和权威
2. 副标题最多20字，补充核心信息
3. 语调专业有深度，体现思考价值
4. 适合横版显示，左右布局合理
5. 体现内容的价值和独特性
6. 避免情绪化或哗众取宠
7. 适合职场人士和知识分子阅读

请按以下格式输出：

版本1：
主标题：[体现深度和价值]
副标题：[关键信息补充]
内容定位：[如：深度分析/行业洞察/专业解读]
目标读者：[具体人群描述]

版本2：
[同上格式]

版本3：
[同上格式]`
};

/**
 * 根据平台获取提示词配置
 */
export function getPlatformPrompts(platform: string): PlatformPromptConfig {
  switch (platform) {
    case 'xiaohongshu':
      return XIAOHONGSHU_PROMPTS;
    case 'video':
      return VIDEO_PROMPTS;
    case 'wechat':
      return WECHAT_PROMPTS;
    default:
      return XIAOHONGSHU_PROMPTS; // 默认使用小红书配置
  }
}

/**
 * 生成平台特定的优化提示词
 */
export function generatePlatformPrompt(content: string, platform: string, contentType?: string): string {
  const prompts = getPlatformPrompts(platform);
  let finalPrompt = prompts.optimizationPrompt.replace('{content}', content);
  
  // 如果指定了内容类型，添加相关示例
  if (contentType && prompts.contentTypes[contentType]) {
    const typeInfo = prompts.contentTypes[contentType];
    finalPrompt += `\n\n参考${contentType}类型模板：${typeInfo.template}\n示例：${typeInfo.examples.join('、')}`;
  }
  
  return finalPrompt;
} 