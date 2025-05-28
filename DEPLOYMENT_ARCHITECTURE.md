# 老旺AI - 系统架构与部署文档

## 系统架构概览

老旺AI采用现代化的微服务架构，支持高并发、高可用、可扩展的AI内容创作服务。

### 技术栈

**前端技术栈：**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Headless UI
- html2canvas (图片生成)

**后端技术栈：**
- Node.js / Python (FastAPI)
- MySQL 8.0 (主数据库)
- Redis (缓存 + 会话存储)
- Nginx (反向代理 + 负载均衡)
- Docker + Kubernetes (容器化部署)

**AI服务：**
- OpenAI GPT-4 / Claude
- 自研内容分析模型
- 图像生成服务
- 语音合成服务

**基础设施：**
- 阿里云 / AWS
- CDN (静态资源加速)
- OSS (对象存储)
- ELK Stack (日志分析)
- Prometheus + Grafana (监控)

## 系统架构图

```
                                    ┌─────────────────┐
                                    │   用户浏览器     │
                                    └─────────┬───────┘
                                              │
                                    ┌─────────▼───────┐
                                    │      CDN        │
                                    │   (静态资源)     │
                                    └─────────┬───────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │         负载均衡器              │
                              │        (Nginx/ALB)           │
                              └───────────────┬───────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
          ┌─────────▼─────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
          │   Web服务器 1      │    │   Web服务器 2      │    │   Web服务器 N      │
          │   (Next.js)       │    │   (Next.js)       │    │   (Next.js)       │
          └─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
                    │                        │                        │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │        API网关               │
                              │     (Kong/Zuul)             │
                              └───────────────┬───────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
          ┌─────────▼─────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
          │   认证服务         │    │   内容服务         │    │   AI服务          │
          │   (Auth API)      │    │ (Content API)     │    │  (AI API)        │
          └─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
                    │                        │                        │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │        数据层               │
                              └───────────────┬───────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
          ┌─────────▼─────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
          │   MySQL主库       │    │   MySQL从库       │    │     Redis        │
          │   (写操作)        │    │   (读操作)        │    │   (缓存+会话)     │
          └───────────────────┘    └───────────────────┘    └───────────────────┘
```

## 微服务架构设计

### 1. 认证服务 (Auth Service)

**职责：**
- 用户注册、登录、登出
- JWT Token生成和验证
- 密钥管理和验证
- 权限控制

**技术栈：**
- Node.js + Express / Python + FastAPI
- JWT + Redis (Token存储)
- bcrypt (密码加密)

**API端点：**
```
POST /auth/register     # 用户注册
POST /auth/login        # 用户登录
POST /auth/refresh      # 刷新Token
POST /auth/logout       # 用户登出
GET  /auth/profile      # 获取用户信息
PUT  /auth/profile      # 更新用户信息
POST /key/activate      # 激活密钥
GET  /key/status        # 查询密钥状态
```

### 2. 内容服务 (Content Service)

**职责：**
- 内容提炼和生成
- 全网搜索和整合
- 内容改写和优化
- 历史记录管理

**技术栈：**
- Python + FastAPI
- Celery (异步任务)
- BeautifulSoup (网页解析)
- Requests (HTTP请求)

**API端点：**
```
POST /content/extract           # 内容提炼
POST /content/search            # 全网搜索
POST /content/rewrite           # 内容改写
POST /content/generate-from-url # 基于URL生成
GET  /content/history           # 获取历史记录
```

### 3. AI服务 (AI Service)

**职责：**
- 封面设计生成
- 信息卡片生成
- 语音合成
- 脚本生成

**技术栈：**
- Python + FastAPI
- OpenAI API / Claude API
- Pillow (图像处理)
- TTS引擎

**API端点：**
```
POST /ai/generate-cover     # 封面生成
POST /ai/generate-info-card # 信息卡片生成
POST /ai/voice-synthesis    # 语音合成
POST /ai/script-generation  # 脚本生成
```

### 4. 用户服务 (User Service)

**职责：**
- 用户信息管理
- 使用统计分析
- 偏好设置管理

**技术栈：**
- Node.js + Express
- MySQL + Redis

**API端点：**
```
GET  /user/profile      # 获取用户信息
PUT  /user/profile      # 更新用户信息
GET  /user/usage-stats  # 使用统计
GET  /user/preferences  # 用户偏好
PUT  /user/preferences  # 更新偏好
```

## 部署架构

### 1. 容器化部署

**Docker配置示例：**

```dockerfile
# 前端Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# 后端Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Kubernetes部署配置

**前端部署配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: laowangai-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: laowangai-frontend
  template:
    metadata:
      labels:
        app: laowangai-frontend
    spec:
      containers:
      - name: frontend
        image: laowangai/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: BACKEND_URL
          value: "http://laowangai-backend:8000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: laowangai-frontend
spec:
  selector:
    app: laowangai-frontend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**后端部署配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: laowangai-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: laowangai-backend
  template:
    metadata:
      labels:
        app: laowangai-backend
    spec:
      containers:
      - name: backend
        image: laowangai/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: laowangai-backend
spec:
  selector:
    app: laowangai-backend
  ports:
  - port: 8000
    targetPort: 8000
```

### 3. 数据库部署

**MySQL主从配置：**

```yaml
# MySQL主库
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql-master
spec:
  serviceName: mysql-master
  replicas: 1
  selector:
    matchLabels:
      app: mysql-master
  template:
    metadata:
      labels:
        app: mysql-master
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: root-password
        - name: MYSQL_DATABASE
          value: laowangai
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

**Redis集群配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cluster
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis-cluster
  template:
    metadata:
      labels:
        app: redis-cluster
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --cluster-enabled
        - "yes"
        - --cluster-config-file
        - nodes.conf
        - --cluster-node-timeout
        - "5000"
        - --appendonly
        - "yes"
```

## 监控和运维

### 1. 监控体系

**Prometheus配置：**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'laowangai-frontend'
    static_configs:
      - targets: ['laowangai-frontend:3000']
    metrics_path: '/metrics'
    
  - job_name: 'laowangai-backend'
    static_configs:
      - targets: ['laowangai-backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

**告警规则：**

```yaml
groups:
- name: laowangai-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      
  - alert: DatabaseConnectionFailure
    expr: mysql_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failure"
```

### 2. 日志管理

**ELK Stack配置：**

```yaml
# Elasticsearch
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
        env:
        - name: discovery.type
          value: single-node
        - name: ES_JAVA_OPTS
          value: "-Xms1g -Xmx1g"
        ports:
        - containerPort: 9200
        - containerPort: 9300
```

**Logstash配置：**

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "laowangai-frontend" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }
  
  if [fields][service] == "laowangai-backend" {
    json {
      source => "message"
    }
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "laowangai-logs-%{+YYYY.MM.dd}"
  }
}
```

### 3. 备份策略

**数据库备份脚本：**

```bash
#!/bin/bash
# 数据库备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DB_NAME="laowangai"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 全量备份
mysqldump --single-transaction \
          --routines \
          --triggers \
          --all-databases \
          --master-data=2 \
          > $BACKUP_DIR/full_backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/full_backup_$DATE.sql

# 上传到对象存储
aws s3 cp $BACKUP_DIR/full_backup_$DATE.sql.gz \
          s3://laowangai-backup/mysql/

# 清理本地备份（保留7天）
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: full_backup_$DATE.sql.gz"
```

**Redis备份脚本：**

```bash
#!/bin/bash
# Redis备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/redis"
REDIS_HOST="redis-cluster"
REDIS_PORT="6379"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行BGSAVE
redis-cli -h $REDIS_HOST -p $REDIS_PORT BGSAVE

# 等待备份完成
while [ $(redis-cli -h $REDIS_HOST -p $REDIS_PORT LASTSAVE) -eq $(redis-cli -h $REDIS_HOST -p $REDIS_PORT LASTSAVE) ]; do
  sleep 1
done

# 复制RDB文件
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# 上传到对象存储
aws s3 cp $BACKUP_DIR/redis_backup_$DATE.rdb \
          s3://laowangai-backup/redis/

echo "Redis backup completed: redis_backup_$DATE.rdb"
```

## 安全配置

### 1. 网络安全

**Nginx安全配置：**

```nginx
# SSL配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# 安全头
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

# 限流配置
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

server {
    listen 443 ssl http2;
    server_name api.laowangai.com;
    
    # API限流
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
    
    # 登录限流
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
    }
}
```

### 2. 应用安全

**环境变量管理：**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  redis-url: <base64-encoded-redis-url>
  jwt-secret: <base64-encoded-jwt-secret>
  openai-api-key: <base64-encoded-openai-key>
```

**RBAC权限控制：**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: laowangai-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: laowangai-rolebinding
subjects:
- kind: ServiceAccount
  name: laowangai-serviceaccount
roleRef:
  kind: Role
  name: laowangai-role
  apiGroup: rbac.authorization.k8s.io
```

## 性能优化

### 1. 缓存策略

**Redis缓存配置：**

```python
# 缓存配置
CACHE_CONFIG = {
    'user_sessions': {'ttl': 7200},      # 用户会话 2小时
    'api_responses': {'ttl': 300},       # API响应 5分钟
    'user_profiles': {'ttl': 3600},      # 用户信息 1小时
    'system_configs': {'ttl': 86400},    # 系统配置 24小时
    'content_cache': {'ttl': 1800},      # 内容缓存 30分钟
}

# 缓存键命名规范
CACHE_KEYS = {
    'user_session': 'session:user:{user_id}',
    'user_profile': 'profile:user:{user_id}',
    'api_response': 'api:{endpoint}:{params_hash}',
    'content_result': 'content:{type}:{content_hash}',
}
```

### 2. 数据库优化

**连接池配置：**

```python
# MySQL连接池配置
DATABASE_CONFIG = {
    'host': 'mysql-master',
    'port': 3306,
    'database': 'laowangai',
    'pool_size': 20,
    'max_overflow': 30,
    'pool_timeout': 30,
    'pool_recycle': 3600,
    'echo': False,
}

# 读写分离配置
READ_DATABASE_CONFIG = {
    'host': 'mysql-slave',
    'port': 3306,
    'database': 'laowangai',
    'pool_size': 10,
    'max_overflow': 20,
}
```

### 3. CDN配置

**静态资源CDN：**

```javascript
// Next.js CDN配置
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.laowangai.com' 
    : '',
  images: {
    domains: ['cdn.laowangai.com'],
    loader: 'custom',
    loaderFile: './cdn-loader.js',
  },
}
```

## 扩容策略

### 1. 水平扩容

**HPA配置：**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: laowangai-frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: laowangai-frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. 垂直扩容

**VPA配置：**

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: laowangai-backend-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: laowangai-backend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: backend
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## 灾难恢复

### 1. 多区域部署

```yaml
# 主区域部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: laowangai-primary
spec:
  replicas: 3
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: zone
                operator: In
                values: ["us-west-1a", "us-west-1b"]
```

### 2. 故障转移

```bash
#!/bin/bash
# 故障转移脚本

# 检查主服务状态
if ! curl -f http://laowangai-primary/health; then
    echo "Primary service is down, switching to backup..."
    
    # 更新DNS指向备用服务
    aws route53 change-resource-record-sets \
        --hosted-zone-id Z123456789 \
        --change-batch file://failover-dns.json
    
    # 通知运维团队
    curl -X POST https://hooks.slack.com/services/xxx \
        -d '{"text":"Primary service failed, switched to backup"}'
fi
```

---

**架构版本：** v1.0.0  
**文档更新时间：** 2024-01-01  
**维护团队：** 老旺AI技术团队 