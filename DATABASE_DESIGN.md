# 老旺AI - 数据库设计文档

## 概述

本文档描述了老旺AI平台的数据库设计，包括用户管理、认证系统、密钥管理、内容生成记录、使用统计等核心功能的数据存储方案。

**数据库信息：**
- 数据库类型：MySQL 8.0+
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci
- 时区：UTC
- ORM框架：TypeORM
- 后端框架：NestJS

## 数据库架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   xhs_users     │    │  xhs_user_keys  │    │ xhs_key_templates│
│                 │    │                 │    │                 │
│ - id (PK)       │◄──►│ - id (PK)       │    │ - id (PK)       │
│ - email         │    │ - user_id (FK)  │    │ - type          │
│ - password_hash │    │ - key_code      │    │ - total_calls   │
│ - nickname      │    │ - type          │    │ - duration_days │
│ - avatar        │    │ - total_calls   │    │ - price         │
│ - status        │    │ - remaining_calls│   │ - description   │
│ - created_at    │    │ - activated_at  │    │ - status        │
│ - updated_at    │    │ - expires_at    │    └─────────────────┘
│                 │    │ - status        │
└─────────────────┘    │ - created_at    │
                       │ - updated_at    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ xhs_usage_records│
                       │                 │
                       │ - id (PK)       │
                       │ - user_id (FK)  │
                       │ - key_id (FK)   │
                       │ - action_type   │
                       │ - request_data  │
                       │ - response_data │
                       │ - status        │
                       │ - created_at    │
                       └─────────────────┘
```

## TypeORM 实体设计

### 1. 小红书用户表 (XhsUser)

存储小红书模块用户基本信息和账户状态。

```typescript
import { Column, Entity, OneToMany } from 'typeorm';
import { BasePo } from '@/common/base.po';

export enum XhsUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive', 
  SUSPENDED = 'suspended'
}

@Entity({
  name: 'xhs_users',
  comment: '小红书用户表'
})
export class XhsUser extends BasePo {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: '邮箱地址'
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar', 
    length: 255,
    comment: '密码哈希'
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '用户昵称'
  })
  nickname?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '头像URL'
  })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: XhsUserStatus,
    default: XhsUserStatus.ACTIVE,
    comment: '账户状态'
  })
  status: XhsUserStatus;

  @Column({
    name: 'email_verified',
    type: 'boolean',
    default: false,
    comment: '邮箱是否已验证'
  })
  emailVerified: boolean;

  @Column({
    name: 'email_verified_at',
    type: 'timestamp',
    nullable: true,
    comment: '邮箱验证时间'
  })
  emailVerifiedAt?: Date;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true,
    comment: '最后登录时间'
  })
  lastLogin?: Date;

  @Column({
    name: 'login_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '登录次数'
  })
  loginCount: number;

  @OneToMany(() => XhsUserKey, userKey => userKey.user)
  userKeys: XhsUserKey[];

  @OneToMany(() => XhsUsageRecord, usageRecord => usageRecord.user)
  usageRecords: XhsUsageRecord[];
}
```

### 2. 密钥模板表 (XhsKeyTemplate)

定义不同类型密钥的规格和价格。

```typescript
import { Column, Entity } from 'typeorm';
import { BasePo } from '@/common/base.po';

export enum XhsKeyTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity({
  name: 'xhs_key_templates',
  comment: '小红书密钥模板表'
})
export class XhsKeyTemplate extends BasePo {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '密钥类型'
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '密钥名称'
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '密钥描述'
  })
  description?: string;

  @Column({
    name: 'total_calls',
    type: 'int',
    unsigned: true,
    comment: '总调用次数'
  })
  totalCalls: number;

  @Column({
    name: 'duration_days',
    type: 'int',
    unsigned: true,
    comment: '有效期天数'
  })
  durationDays: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.00,
    comment: '价格（元）'
  })
  price: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: '功能特性列表'
  })
  features?: string[];

  @Column({
    type: 'enum',
    enum: XhsKeyTemplateStatus,
    default: XhsKeyTemplateStatus.ACTIVE,
    comment: '状态'
  })
  status: XhsKeyTemplateStatus;

  @Column({
    name: 'sort_order',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '排序权重'
  })
  sortOrder: number;
}
```

### 3. 用户密钥表 (XhsUserKey)

存储用户激活的密钥信息。

```typescript
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BasePo } from '@/common/base.po';
import { XhsUser } from './xhs-user.entity';
import { XhsUsageRecord } from './xhs-usage-record.entity';

export enum XhsUserKeyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

@Entity({
  name: 'xhs_user_keys',
  comment: '小红书用户密钥表'
})
export class XhsUserKey extends BasePo {
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 32,
    comment: '用户ID'
  })
  userId: string;

  @Column({
    name: 'key_code',
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '密钥代码'
  })
  keyCode: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '密钥类型'
  })
  type: string;

  @Column({
    name: 'total_calls',
    type: 'int',
    unsigned: true,
    comment: '总调用次数'
  })
  totalCalls: number;

  @Column({
    name: 'remaining_calls',
    type: 'int',
    unsigned: true,
    comment: '剩余调用次数'
  })
  remainingCalls: number;

  @Column({
    name: 'activated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '激活时间'
  })
  activatedAt: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    comment: '过期时间'
  })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: XhsUserKeyStatus,
    default: XhsUserKeyStatus.ACTIVE,
    comment: '密钥状态'
  })
  status: XhsUserKeyStatus;

  @Column({
    name: 'activation_ip',
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '激活IP地址'
  })
  activationIp?: string;

  @Column({
    name: 'last_used_at',
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间'
  })
  lastUsedAt?: Date;

  @ManyToOne(() => XhsUser, user => user.userKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: XhsUser;

  @OneToMany(() => XhsUsageRecord, usageRecord => usageRecord.key)
  usageRecords: XhsUsageRecord[];
}
```

### 4. 使用记录表 (XhsUsageRecord)

记录用户的API调用历史和使用统计。

```typescript
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BasePo } from '@/common/base.po';
import { XhsUser } from './xhs-user.entity';
import { XhsUserKey } from './xhs-user-key.entity';

export enum XhsUsageRecordStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

@Entity({
  name: 'xhs_usage_records',
  comment: '小红书使用记录表'
})
export class XhsUsageRecord extends BasePo {
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 32,
    comment: '用户ID'
  })
  userId: string;

  @Column({
    name: 'key_id',
    type: 'varchar',
    length: 32,
    comment: '密钥ID'
  })
  keyId: string;

  @Column({
    name: 'action_type',
    type: 'varchar',
    length: 50,
    comment: '操作类型'
  })
  actionType: string;

  @Column({
    name: 'action_name',
    type: 'varchar',
    length: 100,
    comment: '操作名称'
  })
  actionName: string;

  @Column({
    name: 'request_data',
    type: 'json',
    nullable: true,
    comment: '请求数据'
  })
  requestData?: any;

  @Column({
    name: 'response_data',
    type: 'json',
    nullable: true,
    comment: '响应数据'
  })
  responseData?: any;

  @Column({
    type: 'enum',
    enum: XhsUsageRecordStatus,
    default: XhsUsageRecordStatus.PENDING,
    comment: '执行状态'
  })
  status: XhsUsageRecordStatus;

  @Column({
    name: 'error_message',
    type: 'text',
    nullable: true,
    comment: '错误信息'
  })
  errorMessage?: string;

  @Column({
    name: 'processing_time',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '处理时间(毫秒)'
  })
  processingTime?: number;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP地址'
  })
  ipAddress?: string;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
    comment: '用户代理'
  })
  userAgent?: string;

  @ManyToOne(() => XhsUser, user => user.usageRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: XhsUser;

  @ManyToOne(() => XhsUserKey, key => key.usageRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'key_id' })
  key: XhsUserKey;
}
```

### 5. 内容生成记录表 (XhsContentGeneration)

存储生成的内容和相关元数据。

```typescript
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BasePo } from '@/common/base.po';
import { XhsUser } from './xhs-user.entity';
import { XhsUsageRecord } from './xhs-usage-record.entity';

@Entity({
  name: 'xhs_content_generations',
  comment: '小红书内容生成记录表'
})
export class XhsContentGeneration extends BasePo {
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 32,
    comment: '用户ID'
  })
  userId: string;

  @Column({
    name: 'usage_record_id',
    type: 'varchar',
    length: 32,
    comment: '使用记录ID'
  })
  usageRecordId: string;

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 50,
    comment: '内容类型'
  })
  contentType: string;

  @Column({
    name: 'input_data',
    type: 'json',
    comment: '输入数据'
  })
  inputData: any;

  @Column({
    name: 'output_data',
    type: 'json',
    comment: '输出数据'
  })
  outputData: any;

  @Column({
    name: 'template_used',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '使用的模板'
  })
  templateUsed?: string;

  @Column({
    name: 'quality_score',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    comment: '质量评分(0-1)'
  })
  qualityScore?: number;

  @Column({
    name: 'word_count',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '字数统计'
  })
  wordCount?: number;

  @Column({
    name: 'generation_time',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '生成时间(毫秒)'
  })
  generationTime?: number;

  @Column({
    name: 'is_favorite',
    type: 'boolean',
    default: false,
    comment: '是否收藏'
  })
  isFavorite: boolean;

  @Column({
    name: 'is_shared',
    type: 'boolean',
    default: false,
    comment: '是否分享'
  })
  isShared: boolean;

  @ManyToOne(() => XhsUser, user => user.usageRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: XhsUser;

  @ManyToOne(() => XhsUsageRecord, usageRecord => usageRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usage_record_id' })
  usageRecord: XhsUsageRecord;
}
```

### 6. 用户会话表 (XhsUserSession)

管理用户登录会话和Token。

```typescript
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BasePo } from '@/common/base.po';
import { XhsUser } from './xhs-user.entity';

@Entity({
  name: 'xhs_user_sessions',
  comment: '小红书用户会话表'
})
export class XhsUserSession extends BasePo {
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 32,
    comment: '用户ID'
  })
  userId: string;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Token哈希'
  })
  tokenHash: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '刷新Token哈希'
  })
  refreshTokenHash?: string;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP地址'
  })
  ipAddress?: string;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
    comment: '用户代理'
  })
  userAgent?: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    comment: '过期时间'
  })
  expiresAt: Date;

  @Column({
    name: 'last_activity',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '最后活动时间'
  })
  lastActivity: Date;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否活跃'
  })
  isActive: boolean;

  @ManyToOne(() => XhsUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: XhsUser;
}
```

## 初始化数据

### 1. 密钥模板初始数据

```typescript
// 在服务启动时插入的初始数据
const keyTemplates = [
  {
    type: 'trial',
    name: '体验版',
    description: '免费体验版本，适合新用户试用',
    totalCalls: 50,
    durationDays: 7,
    price: 0.00,
    features: ['内容提炼', '笔记改写'],
    status: XhsKeyTemplateStatus.ACTIVE,
    sortOrder: 1
  },
  {
    type: 'basic',
    name: '基础版',
    description: '基础功能版本，适合个人用户',
    totalCalls: 500,
    durationDays: 30,
    price: 29.90,
    features: ['内容提炼', '全网搜索', '笔记改写', '封面生成'],
    status: XhsKeyTemplateStatus.ACTIVE,
    sortOrder: 2
  },
  {
    type: 'premium',
    name: '专业版',
    description: '专业功能版本，适合内容创作者',
    totalCalls: 1000,
    durationDays: 30,
    price: 59.90,
    features: ['内容提炼', '全网搜索', '笔记改写', '封面生成', '信息卡片', '语音配音'],
    status: XhsKeyTemplateStatus.ACTIVE,
    sortOrder: 3
  },
  {
    type: 'enterprise',
    name: '企业版',
    description: '企业级功能版本，适合团队使用',
    totalCalls: 5000,
    durationDays: 90,
    price: 199.90,
    features: ['所有功能', '优先支持', '定制模板', 'API接入'],
    status: XhsKeyTemplateStatus.ACTIVE,
    sortOrder: 4
  }
];
```

## 索引优化策略

TypeORM 会自动为主键、外键和 unique 字段创建索引。对于复合查询，可以通过装饰器添加索引：

```typescript
import { Index } from 'typeorm';

@Entity()
@Index(['userId', 'status', 'expiresAt'])
@Index(['userId', 'createTime'])
export class XhsUserKey extends BasePo {
  // ... 实体定义
}
```

## 业务逻辑说明

### 1. 用户注册流程

1. 验证邮箱格式和密码强度
2. 检查邮箱是否已注册
3. 创建用户记录（密码使用 bcrypt 哈希存储）
4. 自动分配体验版密钥
5. 发送欢迎邮件（可选）

### 2. 密钥激活流程

1. 验证用户登录状态（JWT Token）
2. 检查密钥代码格式和有效性
3. 验证密钥是否已被使用
4. 创建用户密钥记录
5. 记录激活日志

### 3. API调用计费流程

1. 验证用户JWT Token有效性
2. 检查用户密钥状态和剩余次数
3. 执行API调用
4. 记录使用记录
5. 扣减剩余次数
6. 返回结果

### 4. 数据统计逻辑

1. 实时统计：基于内存缓存
2. 历史统计：基于 xhs_usage_records 表聚合
3. 用户画像：基于多维度数据分析
4. 系统监控：基于关键指标告警

---

**数据库版本：** MySQL 8.0+  
**ORM框架：** TypeORM  
**后端框架：** NestJS  
**文档更新时间：** 2024-01-01  
**设计版本：** v1.0.0 