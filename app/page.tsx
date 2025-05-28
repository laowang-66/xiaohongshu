'use client';

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import { TEMPLATE_COMPONENTS } from './components/InfoCardTemplates';
import CoverTemplatePreview from './components/CoverTemplatePreview';
import EditableCard from './components/EditableCard';
import ContentOptimizer from './components/ContentOptimizer';
import { analyzeContentAndRecommend, generateDesignSuggestion } from './utils/aiContentAnalyzer';
import { ENHANCED_TEMPLATES } from './utils/enhancedTemplates';
import { OptimizationResult } from './utils/contentOptimizer';

const tabs = [
  { key: 'extract', label: '内容提炼' },
  { key: 'search', label: '全网搜索' },
  { key: 'rewrite', label: '笔记改写' },
  { key: 'card', label: '封面生成' },
  { key: 'info-card', label: '信息卡片' },
  { key: 'image', label: '图片生成' },
];

const noteStyles = [
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

const rewriteStyles = [
  { key: 'video', label: '口播短视频' },
  { key: 'xiaohongshu', label: '小红书图文笔记内容' },
  { key: 'wechat', label: '公众号文章内容' },
];

// 添加搜索类型配置
const searchTypes = [
  { key: 'google', label: 'Google', icon: '🌐' },
  { key: 'wechat', label: '微信公众号', icon: '💬' },
  { key: 'zhihu', label: '知乎', icon: '🧠' },
  { key: 'xiaohongshu', label: '小红书', icon: '📖' },
  { key: 'douyin', label: '抖音', icon: '🎵' },
  { key: 'weibo', label: '微博', icon: '📱' },
  { key: 'github', label: 'GitHub', icon: '💻' },
  { key: 'twitter', label: 'Twitter', icon: '🐦' },
];

// 封面尺寸配置
const coverSizes = [
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

// 封面模板配置
const cardTemplates = [
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

// 整合原有模板和增强模板
const allCardTemplates = [
  ...cardTemplates,
  ...ENHANCED_TEMPLATES.map(template => ({
    key: template.key,
    label: template.name,
    description: template.description,
    preview: template.preview,
    category: template.category,
    features: template.features,
    colorPalette: template.colorPalette
  }))
];

// 信息卡片模板配置
const infoCardTemplates = [
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
    preview: '��',
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

export default function Home() {
  const [activeTab, setActiveTab] = useState('extract');
  const [input, setInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // 添加生成模式状态
  const [generateMode, setGenerateMode] = useState<'preset' | 'reference'>('preset');
  const [referenceContent, setReferenceContent] = useState('');

  // 全网搜索专用
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('google');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchNote, setSearchNote] = useState('');
  const [searchNoteSource, setSearchNoteSource] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchCopied, setSearchCopied] = useState(false);

  // 单个URL生成笔记的状态
  const [urlGeneratingIndex, setUrlGeneratingIndex] = useState<number | null>(null);

  // 改写专用
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteStyle, setRewriteStyle] = useState('video');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteCopied, setRewriteCopied] = useState(false);

  // 封面生成专用
  const [cardInput, setCardInput] = useState('');
  const [cardTemplate, setCardTemplate] = useState('scene_photo_xiaohongshu');
  const [cardSize, setCardSize] = useState('xiaohongshu');
  const [cardResult, setCardResult] = useState('');
  const [cardResultInfo, setCardResultInfo] = useState<any>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardCopied, setCardCopied] = useState(false);
  const [editedCardContent, setEditedCardContent] = useState('');
  
  // 内容优化专用
  const [optimizedContent, setOptimizedContent] = useState('');
  const [showContentOptimizer, setShowContentOptimizer] = useState(false);
  const [contentOptimizationResult, setContentOptimizationResult] = useState<OptimizationResult | null>(null);
  
  // AI智能推荐
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // 信息卡片专用
  const [infoCardInput, setInfoCardInput] = useState('');
  const [infoCardTemplate, setInfoCardTemplate] = useState('knowledge_summary');
  const [infoCardLoading, setInfoCardLoading] = useState(false);
  const [infoCardError, setInfoCardError] = useState('');
  const [infoCardResult, setInfoCardResult] = useState<any[]>([]);
  const [infoCardCopied, setInfoCardCopied] = useState(false);

  // 内容提炼生成
  const handleGenerate = async () => {
    setError('');
    setResult('');
    setCopied(false);
    if (!input.trim()) {
      setError('请输入内容链接');
      return;
    }

    // 根据模式验证必要参数
    if (generateMode === 'reference' && !referenceContent.trim()) {
      setError('请输入参考爆款内容');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/extract-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link: input,
          mode: generateMode,
          style:
            generateMode === 'preset'
              ? noteStyles.find(s => s.key === selectedStyle)?.label || ''
              : undefined,
          referenceContent: generateMode === 'reference' ? referenceContent : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.message || '生成失败，请稍后重试');
      } else {
        setResult(data.note);
      }
    } catch (e) {
      setError('生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 内容提炼复制
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // 全网搜索生成
  const handleSearch = async () => {
    setSearchError('');
    setSearchResult([]);
    setSearchNote('');
    setSearchNoteSource(null);
    setSearchCopied(false);
    if (!searchInput.trim()) {
      setSearchError('请输入搜索关键词');
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchInput,
          searchType: searchType,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSearchError(data.message || '搜索失败，请稍后重试');
      } else {
        setSearchNote(data.note || '');
        setSearchResult(data.searchResults || []);
        setSearchNoteSource({
          type: 'search',
          searchType: data.searchParameters?.searchTypeName || 'Google',
        });
      }
    } catch (e) {
      setSearchError('搜索失败，请稍后重试');
    } finally {
      setSearchLoading(false);
    }
  };

  // 全网搜索复制
  const handleSearchCopy = () => {
    if (searchNote) {
      navigator.clipboard.writeText(searchNote);
      setSearchCopied(true);
      setTimeout(() => setSearchCopied(false), 1500);
    }
  };

  // 基于单个URL生成笔记
  const handleGenerateFromUrl = async (item: any, index: number) => {
    setUrlGeneratingIndex(index);
    setSearchError('');

    try {
      const res = await fetch('/api/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: item.link,
          title: item.title,
          searchType: searchType,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSearchError(data.message || '生成失败，请稍后重试');
      } else {
        // 替换原来的笔记
        setSearchNote(data.note);
        setSearchNoteSource({
          type: 'url',
          url: data.sourceUrl,
          title: data.sourceTitle,
          searchType: data.sourceType,
        });
        setSearchCopied(false);
      }
    } catch (e) {
      setSearchError('生成失败，请稍后重试');
    } finally {
      setUrlGeneratingIndex(null);
    }
  };

  // 改写生成
  const handleRewrite = async () => {
    setRewriteError('');
    setRewriteResult('');
    setRewriteCopied(false);
    if (!rewriteInput.trim()) {
      setRewriteError('请输入需要改写的内容');
      return;
    }
    setRewriteLoading(true);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rewriteInput,
          style: rewriteStyles.find(s => s.key === rewriteStyle)?.label || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setRewriteError(data.message || '改写失败，请稍后重试');
      } else {
        setRewriteResult(data.result);
      }
    } catch (e) {
      setRewriteError('改写失败，请稍后重试');
    } finally {
      setRewriteLoading(false);
    }
  };

  // 改写复制
  const handleRewriteCopy = () => {
    if (rewriteResult) {
      navigator.clipboard.writeText(rewriteResult);
      setRewriteCopied(true);
      setTimeout(() => setRewriteCopied(false), 1500);
    }
  };

  // AI智能分析和推荐
  const handleAiAnalysis = () => {
    if (!cardInput.trim()) return;
    
    const recommendation = analyzeContentAndRecommend(cardInput, cardSize);
    setAiRecommendation(recommendation);
    setShowAiSuggestion(true);
    
    // 自动应用推荐的模板
    if (recommendation.confidence > 0.6) {
      setCardTemplate(recommendation.templateKey);
    }
  };

  // 处理内容优化选择
  const handleOptimizedContentSelect = (content: string) => {
    setOptimizedContent(content);
    setCardInput(content); // 更新输入框内容
  };

  // 处理内容优化结果
  const handleOptimizationResult = (result: OptimizationResult | null) => {
    setContentOptimizationResult(result);
  };

  // 处理文案输入变化
  const handleCardInputChange = (newInput: string) => {
    setCardInput(newInput);
    
    // 显示/隐藏内容优化器
    const shouldShow = newInput.trim().length > 5;
    setShowContentOptimizer(shouldShow);
    
    // 如果用户手动修改了输入，清除已选择的优化内容
    if (newInput !== optimizedContent) {
      setOptimizedContent('');
    }
  };
  
  // 监听文案输入变化，自动进行AI分析
  useEffect(() => {
    if (cardInput.trim().length > 5) {
      const timer = setTimeout(() => {
        handleAiAnalysis();
      }, 1000); // 延迟1秒执行，避免频繁调用
      
      return () => clearTimeout(timer);
    } else {
      setShowAiSuggestion(false);
    }
  }, [cardInput, cardSize]);

  // 封面生成
  const handleCardGenerate = async () => {
    setCardError('');
    setCardResult('');
    setCardResultInfo(null);
    setCardCopied(false);
    setEditedCardContent(''); // 重置编辑内容
    
    // 使用优化后的内容或原始输入
    const contentToUse = optimizedContent || cardInput;
    
    if (!contentToUse.trim()) {
      setCardError('请输入封面文案内容');
      return;
    }
    setCardLoading(true);
    try {
      const res = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentToUse,
          template: cardTemplate,
          coverSize: cardSize,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCardError(data.message || '封面生成失败，请稍后重试');
      } else {
        setCardResult(data.result);
        setCardResultInfo(data);
      }
    } catch (e) {
      setCardError('封面生成失败，请稍后重试');
    } finally {
      setCardLoading(false);
    }
  };

  // 封面复制
  // 处理编辑内容变化
  const handleCardContentChange = (newContent: string) => {
    setEditedCardContent(newContent);
  };

  const handleCardCopy = () => {
    const contentToCopy = editedCardContent || cardResult;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 1500);
    }
  };

  // 封面下载图片
  const handleCardDownload = async () => {
    if (!cardResultInfo?.dimensions) {
      setCardError('没有可下载的内容');
      return;
    }

    try {
      setCardError('🚀 正在准备下载...');
      console.log('📋 开始下载流程');
      
      const { downloadCoverImage, generateFileName } = await import('./utils/downloadHelper');
      
      let contentToDownload = '';
      let downloadSource = '';
      
      // 优先策略：下载容器 -> 编辑内容 -> 原始内容
      console.log('🔍 开始内容获取流程');
      
      // 1. 优先从下载容器获取内容（专门为下载准备的原尺寸版本）
      try {
        const downloadContainer = document.querySelector('[data-download-container]') as HTMLElement;
        if (downloadContainer?.innerHTML?.trim()) {
          contentToDownload = downloadContainer.innerHTML.trim();
          downloadSource = '下载容器';
          console.log('✅ 成功从下载容器获取内容，长度:', contentToDownload.length);
          
          // 验证下载容器内容质量
          if (contentToDownload.includes('rgba(59, 130, 246') || 
              contentToDownload.includes('editable-') ||
              contentToDownload.includes('cursor: pointer')) {
            console.warn('⚠️ 下载容器包含编辑样式，将使用其他源');
            contentToDownload = '';
          } else {
            console.log('✅ 下载容器内容验证通过');
          }
        } else {
          console.log('❌ 下载容器为空或不存在');
        }
      } catch (e) {
        console.warn('❌ 获取下载容器失败:', e);
      }
      
      // 2. 如果下载容器为空或有问题，使用编辑后的内容
      if (!contentToDownload && editedCardContent) {
        contentToDownload = editedCardContent;
        downloadSource = '编辑内容';
        console.log('✅ 使用编辑后的内容，长度:', contentToDownload.length);
      }
      
      // 3. 最后使用原始生成的内容
      if (!contentToDownload && cardResult) {
        contentToDownload = cardResult;
        downloadSource = '原始内容';
        console.log('✅ 使用原始生成内容，长度:', contentToDownload.length);
      }

      // 内容验证
      if (!contentToDownload?.trim()) {
        setCardError('❌ 没有可下载的内容，请重新生成');
        return;
      }

      const { width, height } = cardResultInfo.dimensions;
      const sizeLabel = coverSizes.find(s => s.key === cardSize)?.label || '封面';
      const filename = generateFileName(sizeLabel, width, height);

      console.log('📊 下载参数:');
      console.log('  📁 文件名:', filename);
      console.log('  📏 尺寸:', width, 'x', height);
      console.log('  📄 内容源:', downloadSource);
      console.log('  📝 内容长度:', contentToDownload.length);
      console.log('  🔍 内容预览:', contentToDownload.substring(0, 200) + '...');

      setCardError('🎨 正在生成高质量图片...');

      // 执行下载
      console.log('🖼️ 开始图片生成和下载');
      const success = await downloadCoverImage(contentToDownload, {
        width,
        height,
        filename,
        backgroundColor: null,
        scale: 2
      });

      if (!success) {
        throw new Error('图片生成失败，请重试');
      } else {
        // 下载成功
        setCardError('');
        console.log('🎉 下载成功完成!');
        
        // 显示成功提示并自动消失
        setCardError('✅ 下载成功！');
        setTimeout(() => {
          setCardError('');
        }, 3000);
      }
    } catch (error) {
      console.error('💥 下载流程失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setCardError(`❌ 封面下载失败：${errorMessage}`);
      
      // 错误信息延迟清除
      setTimeout(() => {
        setCardError('');
      }, 5000);
    }
  };

  // 信息卡片生成
  const handleInfoCardGenerate = async () => {
    setInfoCardError('');
    setInfoCardCopied(false);
    if (!infoCardInput.trim()) {
      setInfoCardError('请输入信息卡片内容');
      return;
    }
    setInfoCardLoading(true);
    try {
      const res = await fetch('/api/generate-info-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: infoCardInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setInfoCardError(data.error || '信息卡片生成失败，请稍后重试');
      } else {
        setInfoCardResult(data.cards);
      }
    } catch (e) {
      setInfoCardError('信息卡片生成失败，请稍后重试');
    } finally {
      setInfoCardLoading(false);
    }
  };

  // 信息卡片复制（复制为JSON数据）
  const handleInfoCardCopy = () => {
    if (infoCardResult && infoCardResult.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(infoCardResult, null, 2));
      setInfoCardCopied(true);
      setTimeout(() => setInfoCardCopied(false), 1500);
    }
  };

  // 单张卡片下载
  const handleSingleCardDownload = async (cardIndex: number) => {
    const cardElement = document.getElementById(`info-card-preview-${cardIndex}`);
    if (!cardElement) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `信息卡片_${cardIndex + 1}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
      setInfoCardError('信息卡片下载失败，请稍后重试');
    }
  };

  // 批量下载所有卡片
  const handleBatchDownload = async () => {
    if (!infoCardResult || infoCardResult.length === 0) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      for (let i = 0; i < infoCardResult.length; i++) {
        const cardElement = document.getElementById(`info-card-preview-${i}`);
        if (cardElement) {
          const canvas = await html2canvas(cardElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
          });

          const link = document.createElement('a');
          link.download = `信息卡片_${i + 1}_${new Date().getTime()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          
          // 稍作延迟，避免浏览器阻止多次下载
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      setInfoCardError('批量下载失败，请稍后重试');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <section className="py-10">
        <div className="container-custom">
          {/* 功能介绍标题 */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">老旺AI - 小红书智能运营助手</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI驱动的内容创作平台，一键生成爆款小红书笔记、专业封面设计，让您的内容创作更高效
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-3 rounded-full font-medium border transition-all duration-200 ${activeTab === tab.key ? 'bg-primary text-white border-primary shadow-lg transform scale-105' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 功能说明 */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
            <div className="text-center">
              {activeTab === 'extract' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">📝 内容提炼</h3>
                  <p className="text-sm text-gray-600">从任意链接提取内容，AI智能生成小红书爆款笔记，支持预设风格模板和参考爆款内容两种模式</p>
                </div>
              )}
              {activeTab === 'search' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🔍 全网搜索</h3>
                  <p className="text-sm text-gray-600">搜索全网热门内容，覆盖Google、微信公众号、知乎、小红书等8大平台，AI自动整合生成优质笔记</p>
                </div>
              )}
              {activeTab === 'rewrite' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">✏️ 笔记改写</h3>
                  <p className="text-sm text-gray-600">将现有内容智能改写为不同平台风格，支持口播短视频、小红书图文、公众号文章等多种格式</p>
                </div>
              )}
              {activeTab === 'card' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🎨 封面生成</h3>
                  <p className="text-sm text-gray-600">AI驱动的专业封面设计工具，提供8种精美风格模板，一键生成高质量封面图片</p>
                </div>
              )}
              {activeTab === 'info-card' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">📚 信息卡片</h3>
                  <p className="text-sm text-gray-600">AI智能分析长文内容，自动选择最适合的模板，生成2-4张精美的信息卡片，内容分配合理，视觉呈现优雅</p>
                </div>
              )}
              {activeTab === 'image' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🖼️ 图片生成</h3>
                  <p className="text-sm text-gray-600">AI图片生成功能正在开发中，即将为您提供更多创作可能</p>
                </div>
              )}
            </div>
          </div>

          {/* 内容提炼Tab */}
          {activeTab === 'extract' && (
            <>
              {/* Input area */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">输入内容链接</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="支持多条链接，支持微信公众号、知乎、头条、推特、YouTube 等各个平台..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                />
                <div className="text-xs text-gray-400 mt-1">
                  粘贴链接会自动识别，如果选择手动输入，请输入有效链接后按 Enter 或逗号添加
                </div>
              </div>

              {/* 生成模式切换 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">选择生成模式</label>
                <div className="flex gap-4 mb-6">
                  <button
                    className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                      generateMode === 'preset'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setGenerateMode('preset')}
                    disabled={loading}
                  >
                    <div className="font-medium mb-1">预设风格</div>
                    <div className="text-sm opacity-80">从预设模板中选择风格</div>
                  </button>
                  <button
                    className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                      generateMode === 'reference'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setGenerateMode('reference')}
                    disabled={loading}
                  >
                    <div className="font-medium mb-1">参考爆款</div>
                    <div className="text-sm opacity-80">输入参考的爆款内容</div>
                  </button>
                </div>
              </div>

              {/* 根据模式显示不同内容 */}
              {generateMode === 'preset' ? (
                // 预设风格模式
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    选择预设风格
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {noteStyles.map(style => (
                      <div
                        key={style.key}
                        className={`rounded-xl border p-4 cursor-pointer transition-all ${
                          selectedStyle === style.key
                            ? 'border-primary shadow-lg bg-red-50'
                            : 'border-gray-200 bg-white hover:shadow'
                        }`}
                        onClick={() => setSelectedStyle(style.key)}
                      >
                        <div className="font-bold mb-2">{style.label}</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {style.content.map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // 参考爆款模式
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入参考爆款内容
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-40"
                    placeholder="请粘贴您想要参考的爆款小红书笔记内容..."
                    value={referenceContent}
                    onChange={e => setReferenceContent(e.target.value)}
                    disabled={loading}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    系统将基于您提供的参考内容风格来生成新的笔记
                  </div>
                </div>
              )}

              {/* Generate button */}
              <div className="mt-10 flex justify-center">
                <button
                  className="w-full max-w-xl btn-primary py-4 text-lg"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? '生成中...' : '生成小红书笔记'}
                </button>
              </div>
              {/* 错误提示 */}
              {error && <div className="text-red-500 text-center mt-4">{error}</div>}
              {/* 生成结果 */}
              {result && (
                <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6 whitespace-pre-line">
                  <div className="font-bold mb-2 text-primary flex items-center justify-between">
                    生成结果
                    <button
                      className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                      onClick={handleCopy}
                    >
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <div>{result}</div>
                </div>
              )}
            </>
          )}

          {/* 全网搜索Tab */}
          {activeTab === 'search' && (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">选择搜索类型</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {searchTypes.map(type => (
                    <button
                      key={type.key}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        searchType === type.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSearchType(type.key)}
                      disabled={searchLoading}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入搜索关键词
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入你想搜索的内容关键词..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  disabled={searchLoading}
                />
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  className="w-full max-w-xl btn-primary py-4 text-lg"
                  onClick={handleSearch}
                  disabled={searchLoading}
                >
                  {searchLoading ? '搜索中...' : `搜索并生成小红书笔记`}
                </button>
              </div>
              {searchError && <div className="text-red-500 text-center mt-4">{searchError}</div>}
              {searchNote && (
                <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
                  <div className="font-bold mb-2 text-primary flex items-center justify-between">
                    生成的小红书笔记
                    <button
                      className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                      onClick={handleSearchCopy}
                    >
                      {searchCopied ? '已复制' : '复制'}
                    </button>
                  </div>

                  {/* 来源信息 */}
                  {searchNoteSource && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
                      <div className="text-xs text-gray-600">
                        {searchNoteSource.type === 'search' ? (
                          <span>
                            📊 基于{' '}
                            <span className="font-medium">{searchNoteSource.searchType}</span>{' '}
                            综合搜索结果生成
                          </span>
                        ) : (
                          <span>
                            📄 基于文章：
                            <a
                              href={searchNoteSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline ml-1"
                            >
                              {searchNoteSource.title}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{searchNote}</div>
                </div>
              )}
              {searchResult.length > 0 && (
                <div className="mt-6 max-w-2xl mx-auto bg-gray-50 rounded-xl p-6">
                  <div className="font-bold mb-2 text-gray-700">参考搜索结果</div>
                  <ul className="space-y-4">
                    {searchResult.map((item, idx) => (
                      <li key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="font-medium text-gray-800 mb-2">{item.title}</div>
                        <div className="text-gray-600 text-sm mb-3">{item.snippet}</div>
                        <div className="flex items-center justify-between">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline text-xs hover:text-primary-dark"
                          >
                            {item.link}
                          </a>
                          <button
                            onClick={() => handleGenerateFromUrl(item, idx)}
                            disabled={urlGeneratingIndex === idx}
                            className="ml-4 px-3 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {urlGeneratingIndex === idx ? '生成中...' : '基于此内容生成笔记'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* 笔记改写Tab */}
          {activeTab === 'rewrite' && (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入需要改写的内容
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  placeholder="请输入你想改写的内容..."
                  value={rewriteInput}
                  onChange={e => setRewriteInput(e.target.value)}
                  disabled={rewriteLoading}
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">选择改写风格</label>
                <div className="flex gap-4 flex-wrap">
                  {rewriteStyles.map(style => (
                    <button
                      key={style.key}
                      className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${rewriteStyle === style.key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                      onClick={() => setRewriteStyle(style.key)}
                      disabled={rewriteLoading}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  className="w-full max-w-xl btn-primary py-4 text-lg"
                  onClick={handleRewrite}
                  disabled={rewriteLoading}
                >
                  {rewriteLoading ? '生成中...' : '生成改写内容'}
                </button>
              </div>
              {rewriteError && <div className="text-red-500 text-center mt-4">{rewriteError}</div>}
              {rewriteResult && (
                <div className="mt-10 max-w-2xl mx-auto bg-white rounded-xl shadow p-6 whitespace-pre-line">
                  <div className="font-bold mb-2 text-primary flex items-center justify-between">
                    改写结果
                    <button
                      className="ml-2 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                      onClick={handleRewriteCopy}
                    >
                      {rewriteCopied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <div>{rewriteResult}</div>
                </div>
              )}
            </>
          )}

          {/* 封面生成Tab */}
          {activeTab === 'card' && (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">选择封面尺寸</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {coverSizes.map(size => (
                    <div
                      key={size.key}
                      className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                        cardSize === size.key
                          ? 'border-primary shadow-xl bg-blue-50 ring-2 ring-primary ring-opacity-30 transform scale-105'
                          : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:scale-102'
                      }`}
                      onClick={() => setCardSize(size.key)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{size.icon}</div>
                        <div className="font-bold text-sm text-gray-800 mb-1">
                          {size.label}
                        </div>
                        <div className="text-xs text-primary font-medium mb-2">
                          {size.ratio} • {size.size}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {size.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">输入封面文案内容</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  placeholder="请输入您想要制作封面的核心文案内容，如标题、关键信息等..."
                  value={cardInput}
                  onChange={e => handleCardInputChange(e.target.value)}
                  disabled={cardLoading}
                />
                <div className="text-xs text-gray-400 mt-1">
                  系统将根据您输入的文案自动生成符合所选风格的专业封面设计
                </div>
                
                {/* 示例文案 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs font-medium text-gray-700 mb-2">💡 文案示例（点击快速使用）：</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "震惊！一个月涨粉5000+！我的公众号运营秘籍全在这！",
                      "5款热门面膜实测！这款性价比居然最高？",
                      "零基础学编程！30天从小白到大神的逆袭之路",
                      "日本关西5日游攻略！人均3000元玩转大阪京都",
                      "AI工具盘点！这10个神器让工作效率翻倍"
                    ].map((example, index) => (
                      <button
                        key={index}
                        className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        onClick={() => handleCardInputChange(example)}
                        disabled={cardLoading}
                      >
                        {example.length > 25 ? example.substring(0, 25) + '...' : example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 内容智能优化组件 */}
                <ContentOptimizer
                  originalContent={cardInput}
                  selectedPlatform={cardSize}
                  onContentSelect={handleOptimizedContentSelect}
                  onOptimizationResult={handleOptimizationResult}
                  isVisible={showContentOptimizer}
                />
              </div>

              {/* AI智能推荐区域 */}
              {showAiSuggestion && aiRecommendation && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-lg font-bold text-purple-800">AI智能推荐</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      aiRecommendation.confidence > 0.8 
                        ? 'bg-green-100 text-green-800' 
                        : aiRecommendation.confidence > 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      匹配度 {Math.round(aiRecommendation.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">📊 分析结果</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {aiRecommendation.reasons.map((reason: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">🎨 推荐方案</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: aiRecommendation.colorScheme.primary }}></span>
                          <span>主色调: {aiRecommendation.colorScheme.primary}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: aiRecommendation.colorScheme.secondary }}></span>
                          <span>辅助色: {aiRecommendation.colorScheme.secondary}</span>
                        </div>
                        <div className="text-gray-600">
                          <span>字体建议: {aiRecommendation.typography.titleSize}px {aiRecommendation.typography.fontWeight === 'bold' ? '加粗' : '正常'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setCardTemplate(aiRecommendation.templateKey)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      ✨ 应用推荐模板
                    </button>
                    <button
                      onClick={() => setShowAiSuggestion(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      隐藏建议
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">选择封面设计风格</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allCardTemplates.map(template => (
                    <div
                      key={template.key}
                      className={`rounded-xl border cursor-pointer transition-all duration-300 ${
                        cardTemplate === template.key
                          ? 'border-primary shadow-xl bg-blue-50 ring-2 ring-primary ring-opacity-30 transform scale-105'
                          : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:scale-102'
                      }`}
                      onClick={() => setCardTemplate(template.key)}
                    >
                      {/* 预览区域 */}
                      <div className="p-4 flex justify-center">
                        <CoverTemplatePreview 
                          templateKey={template.key} 
                          isSelected={cardTemplate === template.key}
                        />
                      </div>
                      
                      {/* 信息区域 */}
                      <div className="px-4 pb-4">
                        <div className="text-center mb-2">
                          <div className="font-bold text-sm text-gray-800 mb-1">
                            {template.label}
                          </div>
                          <div className="text-xs text-primary font-medium bg-primary bg-opacity-10 px-2 py-1 rounded-full inline-block">
                            {template.category}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 text-center leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  className="w-full max-w-xl btn-primary py-4 text-lg font-medium"
                  onClick={handleCardGenerate}
                  disabled={cardLoading}
                >
                  {cardLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI设计中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {optimizedContent ? (
                        <>
                          ✨ 生成专业封面
                          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">使用优化内容</span>
                        </>
                      ) : (
                        <>🎨 生成专业封面</>
                      )}
                    </span>
                  )}
                </button>
              </div>

              {/* 显示当前使用的内容 */}
              {optimizedContent && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">✨ 当前使用优化内容：</span>
                    <div className="mt-1 text-blue-600 font-medium">{optimizedContent}</div>
                  </div>
                </div>
              )}

              {cardError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-700 text-center">
                    <span className="font-medium">生成失败：</span>{cardError}
                  </div>
                </div>
              )}

              {cardResult && (
                <div className="mt-10 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* 头部信息区域 */}
                    <div className="bg-white px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              🎨 {cardResultInfo?.coverSize}生成完成
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                📐 尺寸: {cardResultInfo?.dimensions.width}×{cardResultInfo?.dimensions.height}
                              </span>
                              <span className="flex items-center gap-1">
                                📏 比例: {cardResultInfo?.dimensions.ratio}
                              </span>
                              <span className="flex items-center gap-1">
                                🎯 模板: {cardResultInfo?.template}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                            onClick={handleCardCopy}
                          >
                            {cardCopied ? '✅ 已复制' : '📋 复制代码'}
                          </button>
                          <button
                            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                            onClick={handleCardDownload}
                          >
                            💾 下载高清图片
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 预览区域 */}
                    <div className="p-6">
                      <EditableCard
                        htmlContent={cardResult}
                        dimensions={cardResultInfo.dimensions}
                        cardSize={cardSize}
                        onContentChange={handleCardContentChange}
                      />
                    </div>

                    {/* 底部提示信息 */}
                    <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>💡 提示：点击封面中的任意文字可以进行编辑，修改后的内容会自动应用到下载的图片中</span>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          AI智能生成 • 专业设计
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 信息卡片Tab */}
          {activeTab === 'info-card' && (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">输入信息卡片内容</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  placeholder="请输入您想要生成信息卡片的内容..."
                  value={infoCardInput}
                  onChange={e => setInfoCardInput(e.target.value)}
                  disabled={infoCardLoading}
                />
                <div className="text-xs text-gray-400 mt-1">
                  系统将根据您输入的内容自动生成符合所选模板的信息卡片
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  className="w-full max-w-xl btn-primary py-4 text-lg font-medium"
                  onClick={handleInfoCardGenerate}
                  disabled={infoCardLoading}
                >
                  {infoCardLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI设计中...
                    </span>
                  ) : (
                    '🎨 生成信息卡片'
                  )}
                </button>
              </div>

              {infoCardError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-700 text-center">
                    <span className="font-medium">生成失败：</span>{infoCardError}
                  </div>
                </div>
              )}

              {infoCardResult && infoCardResult.length > 0 && (
                <div className="mt-10 w-full max-w-6xl mx-auto">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="font-bold mb-6 text-primary flex items-center justify-between">
                      <span className="flex items-center">
                        ✨ 您的信息卡片已生成 ({infoCardResult.length}张)
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                          onClick={handleInfoCardCopy}
                        >
                          {infoCardCopied ? '✅ 已复制' : '📋 复制数据'}
                        </button>
                        <button
                          className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1"
                          onClick={handleBatchDownload}
                        >
                          💾 批量下载所有卡片
                        </button>
                      </div>
                    </div>
                    
                    {/* 卡片网格布局 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
                      {infoCardResult.map((card, index) => {
                        const TemplateComponent = TEMPLATE_COMPONENTS[card.type as keyof typeof TEMPLATE_COMPONENTS];
                        if (!TemplateComponent) {
                          console.error(`Unknown template type: ${card.type}`);
                          return null;
                        }
                        return (
                          <div key={index} className="flex flex-col items-center space-y-4 w-full max-w-md">
                            <div id={`info-card-preview-${index}`} className="w-full">
                              <TemplateComponent data={card} />
                            </div>
                            <button
                              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                              onClick={() => handleSingleCardDownload(index)}
                            >
                              📥 下载第{index + 1}张卡片
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 text-xs text-gray-500 text-center">
                      💡 提示：点击"下载第X张卡片"可下载单张卡片，点击"批量下载所有卡片"可下载所有卡片
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'image' && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">AI图片生成</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  我们正在开发强大的AI图片生成功能，将为您提供：
                </p>
                <div className="text-left bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>文字转图片生成</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>小红书风格配图</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>多种艺术风格选择</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>高清图片输出</span>
                    </li>
                  </ul>
                </div>
                <p className="text-gray-500 text-sm mt-6">
                  🎉 即将上线，敬请期待！
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
