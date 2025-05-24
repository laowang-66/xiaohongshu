'use client';

import { useState } from 'react';
import Navigation from './components/Navigation';

const tabs = [
  { key: 'extract', label: '内容提炼' },
  { key: 'search', label: '全网搜索' },
  { key: 'rewrite', label: '笔记改写' },
  { key: 'card', label: '信息卡片' },
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

const referenceNotes = [
  {
    title: '参考爆款',
    content: [
      'Q.5款热门咖啡实测！这款性价比最高☕️',
      '一直想做一款温和又不腻的咖啡，这次终于一次买了5款热门产品来对比测评~',
      '第一名：美丽芳丝（97分）',
      '功效力：⭐⭐⭐⭐⭐',
      '温和度：⭐⭐⭐⭐',
    ],
  },
  {
    title: '预设风格',
    content: [
      '咖啡小白必看｜一张图看懂10种咖啡的区别',
      '发现很多小伙伴分不清各种咖啡的区别，作为一名咖啡师，今天给大家整理了一份超详细咖啡科普！',
      '1. 意式浓缩（Espresso）',
      '特点：浓缩咖啡的基础，约30ml',
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

export default function Home() {
  const [activeTab, setActiveTab] = useState('extract');
  const [input, setInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

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

  // 内容提炼生成
  const handleGenerate = async () => {
    setError('');
    setResult('');
    setCopied(false);
    if (!input.trim()) {
      setError('请输入内容链接');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/extract-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link: input,
          style: noteStyles.find(s => s.key === selectedStyle)?.label || '',
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <section className="py-10">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-2 rounded-full font-medium border transition-colors ${activeTab === tab.key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
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

              {/* Main content: note styles and reference */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Note styles */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {noteStyles.map(style => (
                    <div
                      key={style.key}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedStyle === style.key ? 'border-primary shadow-lg bg-red-50' : 'border-gray-200 bg-white hover:shadow'}`}
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
                {/* Reference/Presets */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                  {referenceNotes.map((ref, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="font-bold mb-2">{ref.title}</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {ref.content.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

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

          {/* 信息卡片、图片生成Tab */}
          {activeTab === 'card' && (
            <div className="text-center text-gray-400 py-32 text-lg">
              信息卡片功能开发中，敬请期待...
            </div>
          )}
          {activeTab === 'image' && (
            <div className="text-center text-gray-400 py-32 text-lg">
              图片生成功能开发中，敬请期待...
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
