/**
 * Search1API 工具类
 * 用于抓取各大自媒体平台的内容
 */

interface SearchParams {
  query: string;
  search_service: 'google' | 'bing';
  max_results?: number;
  crawl_results?: number;
  image?: boolean;
  include_sites?: string[];
  exclude_sites?: string[];
  language?: string;
  time_range?: string;
}

interface DeepCrawlParams {
  url: string;
  max_pages?: number;
  max_depth?: number;
}

interface ExtractParams {
  url: string;
  prompt: string;
  schema: Record<string, any>;
}

export class Search1APIUtil {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.search1api.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 基础搜索功能
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async search(params: SearchParams) {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * 深度爬取功能
   * @param params 爬取参数
   * @returns 爬取结果
   */
  async deepCrawl(params: DeepCrawlParams) {
    try {
      const response = await fetch(`${this.baseUrl}/deepcrawl`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Deep crawl failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Deep crawl error:', error);
      throw error;
    }
  }

  /**
   * 结构化数据提取
   * @param params 提取参数
   * @returns 提取的结构化数据
   */
  async extract(params: ExtractParams) {
    try {
      const response = await fetch(`${this.baseUrl}/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Extract failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Extract error:', error);
      throw error;
    }
  }

  /**
   * 获取小红书内容
   * @param keyword 搜索关键词
   * @param maxResults 最大结果数
   */
  async getXiaohongshuContent(keyword: string, maxResults: number = 10) {
    return this.search({
      query: keyword,
      search_service: 'google',
      max_results: maxResults,
      include_sites: ['xiaohongshu.com'],
      language: 'zh',
    });
  }

  /**
   * 获取抖音内容
   * @param keyword 搜索关键词
   * @param maxResults 最大结果数
   */
  async getDouyinContent(keyword: string, maxResults: number = 10) {
    return this.search({
      query: keyword,
      search_service: 'google',
      max_results: maxResults,
      include_sites: ['douyin.com'],
      language: 'zh',
    });
  }

  /**
   * 获取微信公众号内容
   * @param keyword 搜索关键词
   * @param maxResults 最大结果数
   */
  async getWechatContent(keyword: string, maxResults: number = 10) {
    return this.search({
      query: keyword,
      search_service: 'google',
      max_results: maxResults,
      include_sites: ['mp.weixin.qq.com'],
      language: 'zh',
    });
  }

  /**
   * 获取知乎内容
   * @param keyword 搜索关键词
   * @param maxResults 最大结果数
   */
  async getZhihuContent(keyword: string, maxResults: number = 10) {
    return this.search({
      query: keyword,
      search_service: 'google',
      max_results: maxResults,
      include_sites: ['zhihu.com'],
      language: 'zh',
    });
  }
} 