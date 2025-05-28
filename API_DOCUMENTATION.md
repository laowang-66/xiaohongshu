# 老旺AI - API接口文档

## 概述

老旺AI是一个基于人工智能的小红书内容创作平台，提供内容提炼、全网搜索、笔记改写、封面生成、信息卡片等功能。

**基础信息：**
- API版本：v1
- 基础URL：`/api/v1/xiaohongshu`
- 认证方式：Bearer Token (JWT)
- 数据格式：JSON
- 字符编码：UTF-8
- 后端框架：NestJS
- 数据库：MySQL + TypeORM

## 统一响应格式

### 成功响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 认证系统

### 1. 用户注册

**接口地址：** `POST /auth/register`

**请求参数：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "用户昵称"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "status": "active",
      "createTime": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 用户登录

**接口地址：** `POST /auth/login`

**请求参数：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. 刷新Token

**接口地址：** `POST /auth/refresh`

**请求头：**
```
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "success": true,
  "message": "Token刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 密钥管理

### 1. 激活密钥

**接口地址：** `POST /key/activate`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "keyCode": "LAOWANG-XXXX-XXXX-XXXX"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "密钥激活成功",
  "data": {
    "keyInfo": {
      "id": "uuid-string",
      "keyCode": "LAOWANG-XXXX-XXXX-XXXX",
      "type": "premium",
      "totalCalls": 1000,
      "remainingCalls": 1000,
      "activatedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-31T23:59:59.000Z",
      "status": "active"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 查询密钥状态

**接口地址：** `GET /key/status`

**请求头：**
```
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "keyInfo": {
      "id": "uuid-string",
      "type": "premium",
      "totalCalls": 1000,
      "remainingCalls": 856,
      "activatedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-31T23:59:59.000Z",
      "status": "active",
      "daysLeft": 15
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. 获取密钥模板

**接口地址：** `GET /key/templates`

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "templates": [
      {
        "id": "uuid-string",
        "type": "trial",
        "name": "体验版",
        "description": "免费体验版本，适合新用户试用",
        "totalCalls": 50,
        "durationDays": 7,
        "price": 0.00,
        "features": ["内容提炼", "笔记改写"],
        "status": "active"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 内容创作功能

### 1. 内容提炼生成

**接口地址：** `POST /content/extract`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "link": "https://mp.weixin.qq.com/s/xxxxx",
  "mode": "preset",
  "style": "默认",
  "referenceContent": "参考内容（mode为reference时必填）"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "内容生成成功",
  "data": {
    "note": "🌟今日分享我的高颜值生活小妙招！让生活更轻松的小技巧❤️\n\n大家好呀~最近发现了一些超级实用的小技巧...",
    "sourceInfo": {
      "title": "原文标题",
      "url": "https://mp.weixin.qq.com/s/xxxxx",
      "platform": "wechat"
    },
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "extract_content",
      "remainingCalls": 999
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 全网搜索

**接口地址：** `POST /content/search`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "query": "AI工具推荐",
  "searchType": "google",
  "limit": 10
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "搜索成功",
  "data": {
    "note": "🤖 AI工具大盘点！这10个神器让工作效率翻倍\n\n姐妹们，今天给大家分享一些超好用的AI工具...",
    "searchResults": [
      {
        "title": "10个最佳AI工具推荐",
        "snippet": "这些AI工具可以帮助你提高工作效率...",
        "link": "https://example.com/ai-tools",
        "source": "example.com"
      }
    ],
    "searchParameters": {
      "query": "AI工具推荐",
      "searchType": "google",
      "searchTypeName": "Google"
    },
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "search_content",
      "remainingCalls": 998
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. 基于URL生成笔记

**接口地址：** `POST /content/generate-from-url`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "url": "https://example.com/article",
  "title": "文章标题",
  "searchType": "google"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "笔记生成成功",
  "data": {
    "note": "📚 深度解析：AI如何改变我们的工作方式\n\n最近看到一篇超棒的文章...",
    "sourceUrl": "https://example.com/article",
    "sourceTitle": "文章标题",
    "sourceType": "Google",
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "generate_from_url",
      "remainingCalls": 997
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. 内容改写

**接口地址：** `POST /content/rewrite`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "text": "原始内容文本",
  "style": "口播短视频"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "改写成功",
  "data": {
    "result": "大家好，我是小王。今天要跟大家分享一个超级实用的技巧...",
    "originalLength": 500,
    "rewrittenLength": 450,
    "style": "口播短视频",
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "rewrite_content",
      "remainingCalls": 996
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5. 封面生成

**接口地址：** `POST /content/generate-cover`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "text": "封面文案内容",
  "template": "scene_photo_xiaohongshu",
  "coverSize": "xiaohongshu"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "封面生成成功",
  "data": {
    "result": "<div class=\"cover-container\">...</div>",
    "coverSize": "小红书封面",
    "template": "小红书经典风格",
    "dimensions": {
      "width": 900,
      "height": 1200,
      "ratio": "3:4"
    },
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "generate_cover",
      "remainingCalls": 995
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 6. 信息卡片生成

**接口地址：** `POST /content/generate-info-card`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "content": "需要生成信息卡片的长文内容"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "信息卡片生成成功",
  "data": {
    "cards": [
      {
        "type": "knowledge_summary",
        "title": "知识要点总结",
        "content": {
          "mainTitle": "AI工具使用指南",
          "points": [
            "选择合适的AI工具",
            "掌握基本操作技巧",
            "提高工作效率"
          ]
        }
      }
    ],
    "totalCards": 3,
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "generate_info_card",
      "remainingCalls": 994
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 语音配音功能

### 1. 语音配音生成

**接口地址：** `POST /voice/generate`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "text": "需要配音的文本",
  "voice": "female_sweet",
  "speed": 1.0,
  "pitch": 1.0,
  "format": "mp3"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "语音生成成功",
  "data": {
    "audioUrl": "https://cdn.laowangai.com/audio/xxx.mp3",
    "duration": 30.5,
    "fileSize": 1024000,
    "format": "mp3",
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "voice_generate",
      "remainingCalls": 993
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 脚本生成功能

### 1. 口播脚本生成

**接口地址：** `POST /script/generate`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "topic": "脚本主题",
  "style": "教程类",
  "duration": 60,
  "targetAudience": "年轻女性"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "脚本生成成功",
  "data": {
    "script": "【开场】大家好，我是小红...",
    "estimatedDuration": 58,
    "wordCount": 280,
    "style": "教程类",
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "script_generate",
      "remainingCalls": 992
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 短视频脚本生成

**接口地址：** `POST /short-video/generate`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "topic": "视频主题",
  "platform": "抖音",
  "duration": 30,
  "style": "搞笑"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "短视频脚本生成成功",
  "data": {
    "script": "【镜头1】特写：手机屏幕...",
    "scenes": [
      {
        "sceneNumber": 1,
        "description": "特写：手机屏幕",
        "duration": 3,
        "dialogue": "今天教大家一个神奇的技巧"
      }
    ],
    "totalDuration": 28,
    "platform": "抖音",
    "usageRecord": {
      "id": "uuid-string",
      "actionType": "short_video_generate",
      "remainingCalls": 991
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 用户管理

### 1. 获取用户信息

**接口地址：** `GET /user/profile`

**请求头：**
```
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "nickname": "小红书达人",
      "avatar": "https://cdn.laowangai.com/avatars/xxx.jpg",
      "status": "active",
      "createTime": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "loginCount": 144
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 更新用户信息

**接口地址：** `PUT /user/profile`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "nickname": "新昵称",
  "avatar": "头像URL"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "nickname": "新昵称",
      "avatar": "https://cdn.laowangai.com/avatars/xxx.jpg",
      "updateTime": "2024-01-01T12:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 使用统计

### 1. 获取使用统计

**接口地址：** `GET /usage/stats`

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
- `period`: 统计周期 (day/week/month)
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**响应示例：**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "totalCalls": 144,
    "remainingCalls": 856,
    "usageByFeature": {
      "extract_content": 50,
      "search_content": 30,
      "rewrite_content": 25,
      "generate_cover": 20,
      "generate_info_card": 15,
      "voice_generate": 4
    },
    "dailyUsage": [
      {
        "date": "2024-01-01",
        "calls": 15
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## HTTP状态码和错误处理

### HTTP状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | 请求成功处理 |
| 201 | 创建成功 | 资源创建成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未授权 | Token无效或过期 |
| 403 | 禁止访问 | 权限不足或密钥无效 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 429 | 请求过于频繁 | 触发限流 |
| 500 | 服务器错误 | 内部服务器错误 |

### 错误码定义

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| INVALID_PARAMETER | 请求参数错误 | 检查请求参数格式和必填字段 |
| UNAUTHORIZED | 未授权访问 | 检查Token是否有效 |
| FORBIDDEN | 权限不足 | 检查用户权限或密钥状态 |
| NOT_FOUND | 资源不存在 | 检查请求路径是否正确 |
| RATE_LIMIT_EXCEEDED | 请求频率过高 | 降低请求频率 |
| KEY_EXPIRED | 密钥已过期 | 激活新密钥 |
| INSUFFICIENT_CALLS | 调用次数不足 | 购买新密钥或等待重置 |
| INTERNAL_ERROR | 服务器内部错误 | 联系技术支持 |

### 错误响应示例

```json
{
  "success": false,
  "message": "密钥已过期",
  "error": {
    "code": "KEY_EXPIRED",
    "details": "当前密钥已于2024-01-01过期，请激活新密钥"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 限流规则

- 认证接口：每分钟最多10次请求
- 内容生成接口：每分钟最多30次请求
- 其他接口：每分钟最多60次请求

## NestJS 装饰器说明

### 控制器装饰器

```typescript
@Controller('xiaohongshu')
@ApiTags('小红书模块')
export class XiaohongshuController {
  
  @Post('auth/login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async login(@Body() loginDto: LoginDto) {
    // 实现逻辑
  }
  
  @Get('user/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    // 实现逻辑
  }
}
```

### 验证装饰器

```typescript
export class LoginDto {
  @ApiProperty({ description: '邮箱地址' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;
}
```

## SDK示例代码

### TypeScript/Node.js

```typescript
import axios, { AxiosInstance } from 'axios';

class XiaohongshuAPI {
  private client: AxiosInstance;
  private token: string;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL: `${baseURL}/api/v1/xiaohongshu`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (token) {
      this.setToken(token);
    }
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.success) {
      this.setToken(response.data.data.accessToken);
    }
    
    return response.data;
  }

  async extractContent(link: string, mode: string = 'preset', style: string = '默认') {
    const response = await this.client.post('/content/extract', {
      link,
      mode,
      style
    });
    
    return response.data;
  }
}

// 使用示例
const api = new XiaohongshuAPI('http://localhost:3000');

// 登录
const loginResult = await api.login('user@example.com', 'password123');
console.log(loginResult);

// 内容提炼
const extractResult = await api.extractContent('https://mp.weixin.qq.com/s/xxxxx');
console.log(extractResult.data.note);
```

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基于NestJS + TypeORM架构
- 支持用户认证和密钥管理
- 提供内容提炼、搜索、改写等核心功能
- 支持封面生成和信息卡片生成
- 统一响应格式和错误处理

---

**技术支持：** support@laowangai.com  
**文档更新时间：** 2024-01-01  
**API版本：** v1.0.0  
**后端框架：** NestJS  
**数据库：** MySQL + TypeORM 