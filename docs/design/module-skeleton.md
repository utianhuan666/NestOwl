# NestOwl AI 知识库 · 模块骨架

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v0.1 |
| 更新日期 | 2026-10-20 |
| 关联文档 | [PRD](../prd/ai-knowledge-base.md) · [领域模型](./domain-model.md) |
| 代码基线 | NestJS 12 · ESM · Vue 3 · pnpm workspace |

---

## 1. 架构风格

**模块化单体（Modular Monolith）**，每个限界上下文一个 NestJS Module，内部按四层组织：

```
interface       HTTP / SSE / CLI / 消息消费者
    ↓
application     用例编排、事务边界、权限校验
    ↓
domain          实体、值对象、领域服务、仓储接口
    ↑
infrastructure  PostgreSQL / pgvector / Redis / S3 / LLM 适配器
```

**依赖规则**

- `domain` 不依赖 NestJS、ORM、HTTP、SDK。
- `application` 只依赖 `domain` 的接口，不直接依赖具体实现。
- `infrastructure` 实现 `domain` 定义的 Port，通过 Nest DI 注入。
- 跨模块调用 `application` 暴露的 Service；跨模块副作用走领域事件。
- 禁止跨模块直接访问 Repository 或表。
- 每个模块只拥有自己的表；跨模块读取通过 Port 或读模型。

---

## 2. 目录结构

```text
apps/server/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── auth/
│   │   ├── current-user.decorator.ts
│   │   └── request-context.ts
│   ├── dto/
│   │   └── pagination.dto.ts
│   ├── errors/
│   │   ├── domain-error.ts
│   │   └── domain-exception.filter.ts
│   └── utils/
│       └── id.ts
├── modules/
│   ├── identity/
│   │   ├── identity.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── workspace/
│   │   ├── workspace.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── knowledge/
│   │   ├── knowledge.module.ts
│   │   ├── knowledge-base/
│   │   │   ├── knowledge-base.module.ts
│   │   │   ├── interface/
│   │   │   │   ├── knowledge-base.controller.ts
│   │   │   │   └── dto/
│   │   │   ├── application/
│   │   │   │   └── knowledge-base.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── knowledge-base.ts
│   │   │   │   └── knowledge-base.repository.ts
│   │   │   └── infrastructure/
│   │   │       └── in-memory-knowledge-base.repository.ts
│   │   ├── folder/
│   │   ├── document/
│   │   │   ├── document.module.ts
│   │   │   ├── interface/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── chunk/
│   │   └── metadata/
│   ├── ingestion/
│   │   ├── ingestion.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   │   ├── ingestion.service.ts
│   │   │   └── pipeline.orchestrator.ts
│   │   ├── domain/
│   │   │   ├── data-source.ts
│   │   │   ├── sync-run.ts
│   │   │   ├── ingestion-job.ts
│   │   │   └── ports.ts
│   │   └── infrastructure/
│   │       ├── parsers/
│   │       │   ├── pdf.parser.ts
│   │       │   ├── docx.parser.ts
│   │       │   ├── html.parser.ts
│   │       │   ├── markdown.parser.ts
│   │       │   └── parser.registry.ts
│   │       ├── chunking/
│   │       │   ├── heading-aware.chunker.ts
│   │       │   └── parent-child.chunker.ts
│   │       ├── embedding/
│   │       │   └── embedding.service.ts
│   │       └── connectors/
│   ├── retrieval/
│   │   ├── retrieval.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   │   ├── retrieve.usecase.ts
│   │   │   ├── query-understanding.ts
│   │   │   ├── hybrid-recall.ts
│   │   │   ├── rerank.service.ts
│   │   │   └── context-builder.ts
│   │   ├── domain/
│   │   │   └── retrieval.types.ts
│   │   └── infrastructure/
│   │       ├── pgvector.repository.ts
│   │       ├── keyword.repository.ts
│   │       └── rerank.client.ts
│   ├── conversation/
│   │   ├── conversation.module.ts
│   │   ├── interface/
│   │   │   ├── conversation.controller.ts
│   │   │   └── chat.sse.ts
│   │   ├── application/
│   │   │   └── chat.service.ts
│   │   ├── domain/
│   │   │   ├── conversation.ts
│   │   │   ├── message.ts
│   │   │   └── citation.ts
│   │   └── infrastructure/
│   ├── feedback/
│   │   ├── feedback.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   └── domain/
│   ├── governance/
│   │   ├── governance.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   │   ├── acl.service.ts
│   │   │   └── audit.service.ts
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── evaluation/
│   │   ├── evaluation.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   └── domain/
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── interface/
│   │   ├── application/
│   │   └── infrastructure/
│   └── integration/
│       ├── integration.module.ts
│       ├── rest/
│       ├── webhook/
│       └── mcp/
├── platform/
│   ├── database/
│   │   ├── database.module.ts
│   │   └── migrations/
│   ├── vector-store/
│   │   └── vector-store.module.ts
│   ├── object-storage/
│   │   └── object-storage.module.ts
│   ├── llm/
│   │   ├── llm.module.ts
│   │   ├── chat.provider.ts
│   │   ├── embedding.provider.ts
│   │   └── rerank.provider.ts
│   ├── queue/
│   │   └── queue.module.ts
│   ├── cache/
│   │   └── cache.module.ts
│   └── observability/
│       ├── observability.module.ts
│       └── trace.middleware.ts
```

单元测试与源码同目录（`*.spec.ts`）；跨模块集成与 E2E 放在 `apps/server/test/`。

> 以上为建议结构，当前仓库尚未实现业务模块，按本文档逐步补齐。

---

## 3. 模块职责

| 模块 | 职责 | 拥有的表 | 关键应用服务 | 发布事件 | 消费事件 |
| --- | --- | --- | --- | --- | --- |
| identity | 登录、用户、API Key、SSO | users, api_keys, sessions | AuthService, ApiKeyService | UserDeactivated | — |
| workspace | 租户、成员、角色、配额 | workspaces, memberships, invites, quotas | WorkspaceService, MembershipService, QuotaService | MemberRoleChanged | — |
| knowledge | 知识库、目录、文档、版本、分块、元数据 | knowledge_bases, folders, documents, document_versions, chunks, metadata_schemas, tags | KnowledgeBaseService, DocumentService, VersionService | DocumentPublished, DocumentArchived | DocumentIndexed, AclChanged |
| ingestion | 数据源、同步、解析、分块、向量化、索引 | data_sources, sync_runs, ingestion_jobs | IngestionService, PipelineOrchestrator, SyncService | DocumentIndexed, DocumentIndexFailed | DocumentPublished |
| retrieval | 查询理解、混合召回、重排、上下文、轨迹 | retrieval_traces | RetrieveUseCase, RerankService, ContextBuilder | RetrievalCompleted | AclChanged, DocumentIndexed |
| conversation | 会话、消息、引用、SSE | conversations, messages, citations | ChatService, CitationService | MessageCompleted, AnswerAbstained | — |
| feedback | 反馈、知识缺口 | feedback, knowledge_gaps | FeedbackService, GapService | FeedbackSubmitted, KnowledgeGapOpened | MessageCompleted, AnswerAbstained |
| governance | ACL、审计、保留策略 | resource_acls, document_acl, audit_logs, retention_policies | AclService, AuditService | AclChanged | DocumentPublished, DocumentDeleted |
| evaluation | 评测集、用例、运行、指标 | eval_datasets, eval_cases, eval_runs, eval_results | EvalService, EvalRunner | EvalRunCompleted | DocumentIndexed |
| analytics | 埋点、日聚合、看板 | analytics_events, daily_metrics | AnalyticsService | — | 全部业务事件 |
| integration | 对外 API、Webhook、MCP、嵌入组件 | api_clients, webhooks, webhook_deliveries | ApiClientService, WebhookService | WebhookDelivered | 全部业务事件 |

### 3.1 关键 Port

| Port | 定义方 | 实现方 | 用途 |
| --- | --- | --- | --- |
| `KnowledgeBaseRepository` | knowledge | infrastructure | 知识库持久化 |
| `DocumentRepository` | knowledge | infrastructure | 文档与版本持久化 |
| `ChunkReadPort` | knowledge | retrieval 适配 | 检索读取分块 |
| `DocumentWritePort` | ingestion | knowledge 适配 | 入库更新文档状态 |
| `ObjectStoragePort` | ingestion | platform/object-storage | 原始文件存取 |
| `ParserPort` | ingestion | parsers | 各格式解析 |
| `EmbeddingPort` | ingestion / retrieval | platform/llm | 向量化 |
| `ChatModelPort` | conversation | platform/llm | 对话生成 |
| `RerankPort` | retrieval | platform/llm | 重排 |
| `QueuePort` | ingestion / evaluation | platform/queue | 异步任务 |
| `AclReadPort` | retrieval / conversation | governance | 权限过滤与引用校验 |
| `AuditPort` | 全部 | governance | 审计写入 |

---

## 4. API 设计

统一前缀：`/api/v1`。认证：`Authorization: Bearer <token>` 或 `X-API-Key`。多租户：路径不暴露 workspace 时从 Token 解析；显式跨工作区操作使用 `/workspaces/:workspaceId/...`。

### 4.1 知识库与文档

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/knowledge-bases?workspaceId=` | 列表 + 分页 | read |
| POST | `/knowledge-bases` | 创建 | write |
| GET | `/knowledge-bases/:id` | 详情 | read |
| PATCH | `/knowledge-bases/:id` | 更新 | write |
| DELETE | `/knowledge-bases/:id` | 归档 | manage |
| GET | `/knowledge-bases/:id/documents` | 文档列表 | read |
| POST | `/knowledge-bases/:id/documents` | 上传/新建 | write |
| POST | `/documents/:id/reindex` | 重建索引 | write |
| GET | `/documents/:id/versions` | 版本列表 | read |
| POST | `/documents/:id/publish` | 发布 | write |
| POST | `/documents/:id/archive` | 归档 | write |
| GET | `/documents/:id/status` | 入库状态 | read |

### 4.2 检索与问答

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/conversations` | 创建会话 |
| GET | `/conversations` | 会话列表 |
| GET | `/conversations/:id/messages` | 历史消息 |
| POST | `/conversations/:id/messages` | 提问（SSE 流式） |
| POST | `/messages/:id/regenerate` | 重新生成 |
| POST | `/messages/:id/stop` | 停止生成 |
| POST | `/messages/:id/feedback` | 反馈 |
| GET | `/messages/:id/citations` | 引用列表 |
| POST | `/retrieval/debug` | 检索调试台 |

### 4.3 治理、评测、运营

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET/PUT | `/resources/:type/:id/acl` | 查询/替换 ACL |
| GET | `/audit-logs` | 审计查询 |
| GET | `/knowledge-bases/:id/gaps` | 知识缺口 |
| PATCH | `/gaps/:id` | 更新缺口状态/负责人 |
| GET/POST | `/eval/datasets` | 评测集 |
| POST | `/eval/datasets/:id/cases` | 添加用例 |
| POST | `/eval/runs` | 发起评测 |
| GET | `/eval/runs/:id` | 评测报告 |
| GET | `/analytics/overview` | 运营看板 |

### 4.4 SSE 事件契约

`POST /conversations/:id/messages` 返回 `text/event-stream`：

```text
event: message.started
data: {"messageId":"01J...","conversationId":"01J..."}

event: retrieval.completed
data: {"traceId":"01J...","candidateCount":37,"citations":[{"index":1,"documentId":"01J...","title":"差旅管理制度","page":3}]}

event: message.delta
data: {"delta":"根据《差旅管理制度》第 3 页，"}

event: message.completed
data: {"messageId":"01J...","finishReason":"stop","usage":{"promptTokens":3120,"completionTokens":286},"latencyMs":1840}

event: message.failed
data: {"code":"MODEL_UNAVAILABLE","message":"模型服务暂不可用，请稍后重试"}
```

**规则**

- 事件按 `started → retrieval.completed → delta* → completed|failed` 顺序发送。
- 客户端断开时服务端取消 LLM 请求并保存 `canceled` 状态。
- 每个 `delta` 不大于 200 字符，便于前端平滑渲染。
- `citations` 在 `retrieval.completed` 中先下发，前端可提前渲染来源。

### 4.5 错误码

| HTTP | code | 说明 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 参数错误 |
| 401 | `UNAUTHENTICATED` | 未登录 |
| 403 | `ACL_DENIED` | 无权限 |
| 404 | `KB_NOT_FOUND` / `DOCUMENT_NOT_FOUND` | 资源不存在 |
| 409 | `KB_NAME_CONFLICT` | 名称冲突 |
| 409 | `DOCUMENT_NOT_READY` | 文档未就绪 |
| 422 | `PARSE_FAILED` | 解析失败 |
| 429 | `RATE_LIMITED` / `QUOTA_EXCEEDED` | 限流/配额 |
| 503 | `MODEL_UNAVAILABLE` | 模型不可用 |

统一响应：

```json
{
  "error": {
    "code": "KB_NAME_CONFLICT",
    "message": "知识库名称已存在",
    "traceId": "01J..."
  }
}
```

---

## 5. 异步任务

| 队列 | 任务 | 并发 | 重试 | 说明 |
| --- | --- | --- | --- | --- |
| `ingestion.fetch` | 下载/拉取 | 10 | 3，指数退避 | 大文件走对象存储 |
| `ingestion.parse` | 解析/OCR | CPU 核数 | 3 | 可独立扩容 |
| `ingestion.chunk` | 分块 | 8 | 2 | 纯 CPU |
| `ingestion.embed` | 向量化 | 4 | 5 | 批大小按供应商限流 |
| `ingestion.index` | 写索引/激活 | 8 | 3 | 事务激活版本 |
| `acl.fanout` | ACL 扇出 | 4 | 5 | 按文档分批 |
| `eval.run` | 离线评测 | 2 | 1 | 长任务，可取消 |
| `gap.cluster` | 缺口聚类 | 2 | 3 | 每日/每小时 |
| `analytics.rollup` | 指标聚合 | 2 | 3 | 每小时 |

**约定**

- 任务 Payload 只放 ID 与必要参数，不放文件内容。
- 幂等键：`{stage}:{versionId}`。
- 失败进入 `dead_letter`，后台提供「查看错误 / 重跑」。
- 长任务定期写心跳，超时可被回收。

---

## 6. 配置与环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | 是 | development / test / production |
| `PORT` | 否 | 默认 3000 |
| `DATABASE_URL` | 是 | PostgreSQL 连接串（需 pgvector） |
| `REDIS_URL` | 是 | 队列与缓存 |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` | 是 | 对象存储 |
| `LLM_PROVIDER` | 是 | openai / azure / anthropic / local |
| `LLM_API_KEY` | 是 | 服务端密钥，禁止下发前端 |
| `CHAT_MODEL` | 是 | 对话模型 |
| `EMBEDDING_MODEL` | 是 | 向量模型 |
| `EMBEDDING_DIM` | 是 | 必须与数据库维度一致 |
| `RERANK_MODEL` | 否 | 未配置时退化为 RRF |
| `MAX_UPLOAD_MB` | 否 | 默认 100 |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | 否 | 链路追踪 |

**启动校验**：使用配置 Schema 在启动时校验，缺失必填项直接失败，避免运行期才发现。

---

## 7. 可观测性

- **Trace**：每个请求生成 `trace_id`，贯穿 HTTP → 队列 → Worker → LLM 调用。
- **日志**：结构化 JSON，必带 `trace_id`、`workspace_id`、`module`、`duration_ms`；禁止打印文档正文与密钥。
- **指标**：
  - `ingestion_job_duration_seconds{stage,status}`
  - `retrieval_latency_seconds{phase}`
  - `llm_tokens_total{model,type}`
  - `answer_total{result="answered|abstained|failed"}`
  - `acl_fanout_lag_seconds`
- **成本**：按 `workspace_id` 聚合 Token 与调用次数，支持预算告警。
- **审计**：权限、导出、删除、问答查询独立审计表，不依赖应用日志。

---

## 8. 测试策略

| 层级 | 范围 | 工具 |
| --- | --- | --- |
| 单元测试 | 领域不变量、状态机、分块、权限判定 | Vitest |
| 集成测试 | Repository、pgvector 检索、队列消费者 | Vitest + Testcontainers |
| 契约测试 | API DTO、SSE 事件、Webhook | Vitest + supertest |
| E2E | 上传 → 入库 → 提问 → 引用 → 反馈 | Playwright + 测试租户 |
| 评测回归 | 黄金问答集、检索指标 | Eval Runner（CI 定时/发布前） |
| 安全测试 | 越权、租户隔离、Prompt 注入 | 专项用例集 |

**必测的越权用例**

1. 用户 A 无法通过文档 ID 直接读取用户 B 的文档。
2. 无 KB 权限的用户提问时，召回结果不包含该 KB 分块。
3. 引用接口对已失权用户返回「来源不可访问」，不返回原文。
4. 跨工作区 ID 替换全部返回 404，不泄露资源是否存在。
5. API Key 只能访问授权 Scope 内的知识库。

---

## 9. 演进路线

| 阶段 | 形态 | 触发条件 |
| --- | --- | --- |
| MVP | 单 NestJS 应用 + 单 PostgreSQL + Redis | 验证产品价值 |
| 成长期 | 入库 Worker 独立部署；读写分离 | 入库吞吐成为瓶颈 |
| 规模化 | Retrieval 独立服务；专用向量库 | 分块 > 1 亿 / 检索 P95 超标 |
| 企业化 | 按区域/租户分片；私有化部署包 | 大客户合规要求 |

**拆分优先级**：Ingestion Worker → Retrieval → Evaluation → Analytics。拆分前先保证模块边界干净，避免拆成分布式单体。

---

## 10. 建议实现顺序

1. **数据库基线**：PostgreSQL + pgvector、迁移脚本、`workspace_id` 租户约束、Outbox 表。
2. **知识库 CRUD**：先打通 DTO → Controller → Service → Repository Port → 数据库适配器的最小闭环。
3. **文档与入库**：`document` + `ingestion`，先支持文件上传、PDF/DOCX/Markdown 解析、分块、向量化、版本激活。
4. **检索与问答**：混合召回、重排、上下文构建、SSE 流式回答、引用落库。
5. **治理与反馈**：ACL、审计、反馈、知识缺口。
6. **评测与运营**：评测集、离线回归、看板。

每一步都应保持「接口 → 应用 → 领域 → 基础设施」的依赖方向，并为关键不变量补单元测试。
