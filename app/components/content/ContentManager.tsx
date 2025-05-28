'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { apiClient, type Content, type ContentType } from '../../lib/api-client';

interface ContentFilters {
  type?: ContentType;
  status?: 'published' | 'draft' | 'archived';
  search?: string;
}

export default function ContentManager() {
  const { user, isActivated } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ContentFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 加载内容列表
  const loadContents = useCallback(async (page = 1) => {
    if (!user || !isActivated()) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.getContents({
        page,
        limit: 10,
        ...filters
      });

      if (response.success && response.data) {
        setContents(response.data.contents);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      } else {
        setError(response.message || '加载内容失败');
      }
    } catch (error) {
      console.error('加载内容失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [user, isActivated, filters]);

  // 初始加载
  useEffect(() => {
    loadContents(1);
  }, [loadContents]);

  // 删除内容
  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('确定要删除这个内容吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await apiClient.deleteContent(contentId);
      
      if (response.success) {
        // 重新加载当前页
        await loadContents(currentPage);
        setShowDetails(false);
        setSelectedContent(null);
      } else {
        setError(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除内容失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  // 更新内容状态
  const handleUpdateStatus = async (contentId: string, status: 'published' | 'draft' | 'archived') => {
    try {
      const response = await apiClient.updateContent(contentId, { status });
      
      if (response.success) {
        // 重新加载当前页
        await loadContents(currentPage);
        if (selectedContent?.id === contentId) {
          setSelectedContent({ ...selectedContent, status });
        }
      } else {
        setError(response.message || '更新状态失败');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      setError('更新状态失败，请稍后重试');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取内容类型标签颜色
  const getTypeColor = (type: ContentType) => {
    const colors: Record<ContentType, string> = {
      note: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      live: 'bg-red-100 text-red-800',
      article: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态中文名
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      published: '已发布',
      draft: '草稿',
      archived: '已归档'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">请先登录</p>
      </div>
    );
  }

  if (!isActivated()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-yellow-600">请先激活有效的激活码</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 头部和筛选 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">内容管理</h2>
          <button
            onClick={() => loadContents(currentPage)}
            disabled={loading}
            className="text-sm text-pink-600 hover:text-pink-500 disabled:opacity-50"
          >
            刷新
          </button>
        </div>

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="搜索标题或内容..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容类型
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as ContentType || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">全部类型</option>
              <option value="note">笔记</option>
              <option value="video">视频</option>
              <option value="live">直播</option>
              <option value="article">文章</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => loadContents(1)}
            disabled={loading}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无内容</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedContent(content);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                          {content.type}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {getStatusText(content.status)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {content.title}
                      </h3>
                      
                      {content.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {content.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>创建时间: {formatDate(content.createdAt)}</span>
                        {content.updatedAt !== content.createdAt && (
                          <span>更新时间: {formatDate(content.updatedAt)}</span>
                        )}
                        {content.viewCount !== undefined && (
                          <span>浏览: {content.viewCount}</span>
                        )}
                        {content.likeCount !== undefined && (
                          <span>点赞: {content.likeCount}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(
                            content.id, 
                            content.status === 'published' ? 'archived' : 'published'
                          );
                        }}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {content.status === 'published' ? '归档' : '发布'}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContent(content.id);
                        }}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => loadContents(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <span className="text-sm text-gray-600">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                
                <button
                  onClick={() => loadContents(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 内容详情模态框 */}
      {showDetails && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">内容详情</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <p className="text-sm text-gray-900">{selectedContent.title}</p>
                </div>
                
                {selectedContent.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <p className="text-sm text-gray-900">{selectedContent.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedContent.type)}`}>
                      {selectedContent.type}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContent.status)}`}>
                      {getStatusText(selectedContent.status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedContent.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">更新时间</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedContent.updatedAt)}</p>
                  </div>
                </div>
                
                {(selectedContent.viewCount !== undefined || selectedContent.likeCount !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedContent.viewCount !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">浏览次数</label>
                        <p className="text-sm text-gray-900">{selectedContent.viewCount}</p>
                      </div>
                    )}
                    
                    {selectedContent.likeCount !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">点赞次数</label>
                        <p className="text-sm text-gray-900">{selectedContent.likeCount}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedContent.tags && selectedContent.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedContent.tags.map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedContent.url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">链接</label>
                    <a 
                      href={selectedContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-pink-600 hover:text-pink-500 break-all"
                    >
                      {selectedContent.url}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(
                    selectedContent.id, 
                    selectedContent.status === 'published' ? 'archived' : 'published'
                  )}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {selectedContent.status === 'published' ? '归档' : '发布'}
                </button>
                
                <button
                  onClick={() => handleDeleteContent(selectedContent.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  删除
                </button>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 