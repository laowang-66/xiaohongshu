export const tabs = [
  { key: 'extract', label: '内容提炼' },
  { key: 'search', label: '全网搜索' },
  { key: 'rewrite', label: '笔记改写' },
  { key: 'card', label: '封面生成' },
  { key: 'info-card', label: '信息卡片' },
  { key: 'image', label: '图片生成' },
];

export const noteStyles = [
  {
    key: 'default',
    label: '默认',
    content: [
      '小今日分享我的高颜值生活小妙招！让生活更轻松的小技巧❤️',
      '大家好呀~最近发现了一些超级实用的小技巧，忍不住要分享给你们！',
      '小妙招1：用小苏打+柠檬清洁水槽，比任何清洁剂都好用！',
      '小妙招2：手机壳防水小心机',
    ],
  },
  {
    key: 'collection',
    label: '合集类',
    content: [
      '三步教你10块买到网红款面包！超详细图文合集',
      '姐妹们~这次的面包是我所有面包里最喜欢的，配方和做法都在下面了',
    ],
  },
  {
    key: 'review',
    label: '测评类',
    content: [
      '5款热款门咖啡实测！这款性价比最高☕️',
      '一直想做一款温和又不腻的咖啡，这次终于一次买了5款热门产品来对比测评~',
      '第一名：美丽芳丝（97分）',
      '功效力：⭐⭐⭐⭐⭐',
      '温和度：⭐⭐⭐⭐',
    ],
  },
  {
    key: 'science',
    label: '科普类',
    content: [
      '咖啡小白必看｜一张图看懂10种咖啡的区别',
      '发现很多小伙伴分不清各种咖啡的区别，作为一名咖啡师，今天给大家整理了一份超详细咖啡科普！',
      '1. 意式浓缩（Espresso）',
      '特点：浓缩咖啡的基础，约30ml',
    ],
  },
  {
    key: 'avoid',
    label: '避坑类',
    content: [
      '国庆节护肤品避坑指南！这样做绝对不"刮刮列"',
      '眼看着假期又要来了，作为一名精致女孩，今天来跟大家聊聊那些护肤避坑指南~',
      '⚠️坑1：某宝爆款"神仙水"成分表：成分全是水和酒精！',
    ],
  },
  {
    key: 'tutorial',
    label: '教程类',
    content: [
      '零基础修图！10分钟学会人像精修（附调色）',
      '大家好呀！很多小伙伴问我照片是怎么修出来的，今天手把手教你们零基础修图~',
      'Step1: 进入修图（3分钟）打开Lightroom，导入照片',
      '2. 调整曝光+0.35，提亮',
    ],
  },
  {
    key: 'strategy',
    label: '攻略类',
    content: [
      '日本关西5日游｜人均5000体验终极路线（附物价清单）',
      '刚从日本关西玩回来！这次5天4晚人均只花了5000块，行程安排超级详细如下',
      '【住宿攻略】',
      '住处：心斋桥附近的UNIZO酒店，¥350/晚',
    ],
  },
];

export const rewriteStyles = [
  { key: 'video', label: '口播短视频' },
  { key: 'xiaohongshu', label: '小红书图文笔记内容' },
  { key: 'wechat', label: '公众号文章内容' },
];

export const searchTypes = [
  { key: 'google', label: 'Google', icon: '🌐' },
  { key: 'wechat', label: '微信公众号', icon: '💬' },
  { key: 'zhihu', label: '知乎', icon: '🧠' },
  { key: 'xiaohongshu', label: '小红书', icon: '📖' },
  { key: 'douyin', label: '抖音', icon: '🎵' },
  { key: 'weibo', label: '微博', icon: '📱' },
  { key: 'github', label: 'GitHub', icon: '💻' },
  { key: 'twitter', label: 'Twitter', icon: '🐦' },
];

export const coverSizes = [
  {
    key: 'xiaohongshu',
    label: '小红书封面',
    ratio: '3:4',
    size: '900×1200',
    description: '小红书图文封面，垂直布局',
    icon: '📱'
  },
  {
    key: 'video',
    label: '短视频封面',
    ratio: '9:16', 
    size: '1080×1920',
    description: '抖音/快手/视频号封面',
    icon: '📺'
  },
  {
    key: 'wechat',
    label: '公众号封面',
    ratio: '3.35:1',
    size: '900×268',
    description: '微信公众号文章封面，包含朋友圈分享图',
    icon: '📰'
  }
];

export const cardTemplates = [
  {
    key: 'scene_photo_xiaohongshu',
    label: '小红书经典风格',
    description: '橙黄渐变背景，醒目标题，适合生活分享、经验总结类内容',
    preview: '📸💛',
    category: '生活分享'
  },
  {
    key: 'flowing_tech_blue',
    label: '科技蓝商务风',
    description: '蓝色科技渐变，专业大气，适合科技、商务、知识分享类内容',
    preview: '🚀💙',
    category: '科技商务'
  },
  {
    key: 'soft_rounded_card',
    label: '温柔圆角风格',
    description: '温柔色彩搭配，圆角设计，适合美妆、穿搭、情感类内容',
    preview: '💜🌸',
    category: '美妆时尚'
  },
  {
    key: 'modern_business_info',
    label: '商务资讯风格',
    description: '专业商务色调，权威感强，适合财经、职场、资讯类内容',
    preview: '💼📊',
    category: '商务职场'
  },
  {
    key: 'minimal_grid',
    label: '极简黑白风格',
    description: '黑白极简设计，高级感强，适合艺术、设计、文艺类内容',
    preview: '⬛⬜',
    category: '艺术设计'
  },
  {
    key: 'industrial_rebellion',
    label: '工业反叛风格',
    description: '暗黑高对比，个性张扬，适合潮流、音乐、创意类内容',
    preview: '⚡🖤',
    category: '潮流创意'
  },
  {
    key: 'tech_knowledge_sharing',
    label: '深蓝知识风格',
    description: '深蓝科技色调，专业权威，适合技术、教育、科普类内容',
    preview: '🔷💡',
    category: '教育科普'
  },
  {
    key: 'luxury_natural_artistic',
    label: '奢华自然风格',
    description: '奢华自然色调，高端大气，适合旅行、美食、生活品质类内容',
    preview: '✨🍃',
    category: '高端生活'
  },
];

export const infoCardTemplates = [
  {
    key: 'knowledge_summary',
    label: '知识总结',
    preview: '📚',
    description: '适用于知识点总结、学习笔记等内容整理',
  },
  {
    key: 'product_intro',
    label: '产品介绍',
    preview: '🛍️',
    description: '产品功能介绍、商品推荐等营销内容',
  },
  {
    key: 'tutorial_steps',
    label: '教程步骤',
    preview: '📝',
    description: '操作指南、教程步骤、方法分享',
  },
  {
    key: 'comparison_analysis',
    label: '对比分析',
    preview: '⚖️',
    description: '产品对比、方案分析、选择建议',
  },
  {
    key: 'experience_sharing',
    label: '经验分享',
    preview: '💡',
    description: '个人经验、心得体会、实用建议',
  },
  {
    key: 'event_timeline',
    label: '事件时间线',
    preview: '⏰',
    description: '事件发展、历史回顾、时间节点',
  },
];

export const exampleTexts = [
  "震惊！一个月涨粉5000+！我的公众号运营秘籍全在这！",
  "5款热门面膜实测！这款性价比居然最高？",
  "零基础学编程！30天从小白到大神的逆袭之路",
  "日本关西5日游攻略！人均3000元玩转大阪京都",
  "AI工具盘点！这10个神器让工作效率翻倍"
]; 