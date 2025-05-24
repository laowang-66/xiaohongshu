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
          Authorization: `Bearer ${this.apiKey}`,
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
      // 1. 启动深度爬取任务
      const response = await fetch(`${this.baseUrl}/deepcrawl`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: params.url,
          type: 'sitemap', // 默认使用 sitemap 模式
        }),
      });

      if (!response.ok) {
        throw new Error(`Deep crawl failed: ${response.statusText}`);
      }

      const taskResult = await response.json();
      const taskId = taskResult.taskId;

      if (!taskId) {
        throw new Error('No taskId returned from deepcrawl');
      }

      console.log(`Deep crawl task started: ${taskId}`);

      // 2. 轮询任务状态直到完成
      return await this.waitForDeepCrawlCompletion(taskId);
    } catch (error) {
      console.error('Deep crawl error:', error);
      throw error;
    }
  }

  /**
   * 查询深度爬取任务状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  async getDeepCrawlStatus(taskId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/deepcrawl/status/${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Get deepcrawl status failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get deepcrawl status error:', error);
      throw error;
    }
  }

  /**
   * 等待深度爬取任务完成
   * @param taskId 任务ID
   * @param maxWaitTime 最大等待时间（毫秒），默认5分钟
   * @param pollInterval 轮询间隔（毫秒），默认3秒
   * @returns 完成的任务结果
   */
  async waitForDeepCrawlCompletion(
    taskId: string,
    maxWaitTime: number = 300000,
    pollInterval: number = 3000
  ) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const statusResult = await this.getDeepCrawlStatus(taskId);
        console.log(`Task ${taskId} status: ${statusResult.status}`);

        if (statusResult.status === 'completed') {
          // 任务完成，返回结果
          return statusResult;
        } else if (statusResult.status === 'failed') {
          throw new Error(`Deep crawl task failed: ${statusResult.message || 'Unknown error'}`);
        }

        // 任务还在进行中，等待后再次检查
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error checking task status:', error);
        throw error;
      }
    }

    throw new Error(`Deep crawl task ${taskId} timed out after ${maxWaitTime}ms`);
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
          Authorization: `Bearer ${this.apiKey}`,
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

  /**
   * 基础爬取功能（单个页面）
   * @param url 要爬取的URL
   * @returns 爬取结果
   */
  async crawl(url: string) {
    try {
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Crawl failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Crawl error:', error);
      throw error;
    }
  }
}
