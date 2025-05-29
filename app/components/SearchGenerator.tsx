'use client';

import { useState } from 'react';
import { apiCall, isAuthenticated } from '../lib/auth';
import { searchTypes } from '../config/constants';

interface SearchGeneratorProps {
  onShowLogin: () => void;
}

export default function SearchGenerator({ onShowLogin }: SearchGeneratorProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('google');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchNote, setSearchNote] = useState('');
  const [searchNoteSource, setSearchNoteSource] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchCopied, setSearchCopied] = useState(false);
  const [urlGeneratingIndex, setUrlGeneratingIndex] = useState<number | null>(null);

  // 全网搜索生成
  const handleSearch = async () => {
    setSearchError('');
    setSearchResult([]);
    setSearchNote('');
    setSearchNoteSource(null);
    setSearchCopied(false);
    
    // 检查认证和密钥
    if (!isAuthenticated()) {
      setSearchError('请先登录');
      return;
    }
    
    if (!searchInput.trim()) {
      setSearchError('请输入搜索关键词');
      return;
    }
    setSearchLoading(true);
    try {
      const res = await apiCall('/api/search', {
        method: 'POST',
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
      setSearchError(e instanceof Error ? e.message : '搜索失败，请稍后重试');
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

    // 检查认证和密钥
    if (!isAuthenticated()) {
      setSearchError('请先登录');
      return;
    }

    try {
      const res = await apiCall('/api/generate-from-url', {
        method: 'POST',
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
      setSearchError(e instanceof Error ? e.message : '生成失败，请稍后重试');
    } finally {
      setUrlGeneratingIndex(null);
    }
  };

  return (
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
  );
} 