# 后端聊天流程设计

## 概述

为支持前端的聊天式引导流程，后端需要重新设计对话管理、状态跟踪和响应生成机制。本文档详细说明后端改造的设计方案。

## 核心组件

### 1. 对话管理器

对话管理器负责维护对话历史、跟踪当前阶段和管理上下文信息。

```go
type DialogManager struct {
    // 对话历史
    History []Message
    
    // 当前阶段
    CurrentStage Stage
    
    // 阶段数据
    StageData map[Stage]interface{}
    
    // 会话ID
    SessionID string
    
    // 用户信息
    UserInfo UserInfo
}

type Message struct {
    ID        string    `json:"id"`
    Role      string    `json:"role"`      // user, assistant, system
    Type      string    `json:"type"`      // text, question, reflection, etc.
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
    Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

type Stage string

const (
    StageInitial       Stage = "initial"
    StageRequirement   Stage = "requirement"
    StageReflection    Stage = "reflection"
    StageClarification Stage = "clarification"
    StageConfirmation  Stage = "confirmation"
    StageAIDescription Stage = "ai_description"
    StageDevOps        Stage = "devops"
    StageKnowledge     Stage = "knowledge"
    StageSolution      Stage = "solution"
)
```

### 2. 阶段控制器

阶段控制器负责管理引导流程的各个阶段，决定何时转换到下一个阶段，以及每个阶段的处理逻辑。

```go
type StageController interface {
    // 处理用户消息
    ProcessMessage(ctx context.Context, manager *DialogManager, message Message) ([]Message, error)
    
    // 检查是否可以进入下一阶段
    CanProceedToNextStage(manager *DialogManager) bool
    
    // 获取下一个阶段
    GetNextStage(manager *DialogManager) Stage
    
    // 准备进入阶段
    PrepareStage(ctx context.Context, manager *DialogManager) ([]Message, error)
    
    // 完成阶段
    CompleteStage(ctx context.Context, manager *DialogManager) ([]Message, error)
}
```

### 3. 消息处理器

消息处理器负责解析用户消息，提取关键信息，并生成适当的响应。

```go
type MessageProcessor interface {
    // 处理用户消息
    ProcessUserMessage(ctx context.Context, manager *DialogManager, message Message) ([]Message, error)
    
    // 生成系统消息
    GenerateSystemMessage(ctx context.Context, manager *DialogManager, messageType string, data interface{}) (Message, error)
}
```

### 4. 信息提取器

信息提取器负责从对话中提取结构化信息，用于后续处理。

```go
type InformationExtractor interface {
    // 从对话中提取需求
    ExtractRequirements(ctx context.Context, history []Message) (Requirements, error)
    
    // 从对话中提取澄清回答
    ExtractClarificationAnswers(ctx context.Context, history []Message, questions []ClarificationQuestion) (map[string]string, error)
    
    // 从对话中提取确认结果
    ExtractConfirmation(ctx context.Context, history []Message) (bool, map[string]string, error)
}
```

## 流程设计

### 1. 初始化会话

```
客户端 -> 创建会话请求 -> 服务器
服务器 -> 创建DialogManager -> 存储会话
服务器 -> 生成欢迎消息 -> 客户端
```

### 2. 消息处理流程

```
客户端 -> 发送用户消息 -> 服务器
服务器 -> 加载DialogManager -> 更新对话历史
服务器 -> 调用当前阶段控制器 -> 处理消息
服务器 -> 检查是否可以进入下一阶段
  是 -> 完成当前阶段 -> 准备下一阶段
  否 -> 继续当前阶段
服务器 -> 保存DialogManager -> 返回响应消息 -> 客户端
```

### 3. 阶段转换逻辑

每个阶段都有特定的转换条件和处理逻辑：

#### 需求交流阶段 (StageRequirement)
- **转换条件**：收集到足够的初始需求信息
- **处理逻辑**：自由对话，提取关键需求点

#### 需求反思阶段 (StageReflection)
- **转换条件**：用户确认反思结果
- **处理逻辑**：生成反思分析，处理用户反馈

#### 需求澄清阶段 (StageClarification)
- **转换条件**：所有澄清问题都已回答
- **处理逻辑**：逐个提问，处理用户回答

#### 需求确认阶段 (StageConfirmation)
- **转换条件**：用户确认需求摘要
- **处理逻辑**：生成需求摘要，处理用户确认或修改

#### AI描述阶段 (StageAIDescription)
- **转换条件**：用户确认AI描述
- **处理逻辑**：生成AI描述，处理用户反馈

#### DevOps推荐阶段 (StageDevOps)
- **转换条件**：用户确认DevOps推荐
- **处理逻辑**：生成DevOps推荐，处理用户反馈

#### 知识建议阶段 (StageKnowledge)
- **转换条件**：用户确认知识建议
- **处理逻辑**：生成知识建议，处理用户反馈

#### 方案生成阶段 (StageSolution)
- **转换条件**：用户确认最终方案
- **处理逻辑**：生成最终方案，处理用户反馈

## API设计

### 1. 会话管理

```
POST /api/chat/sessions
- 创建新会话
- 返回会话ID和初始消息

GET /api/chat/sessions/{sessionId}
- 获取会话信息
- 返回当前阶段和对话历史

DELETE /api/chat/sessions/{sessionId}
- 删除会话
```

### 2. 消息处理

```
POST /api/chat/sessions/{sessionId}/messages
- 发送用户消息
- 返回系统响应消息

GET /api/chat/sessions/{sessionId}/messages
- 获取会话消息历史
- 支持分页和过滤
```

### 3. 阶段管理

```
GET /api/chat/sessions/{sessionId}/stages
- 获取会话阶段信息
- 返回当前阶段和阶段数据

POST /api/chat/sessions/{sessionId}/stages/next
- 手动进入下一阶段
- 返回新阶段的初始消息

POST /api/chat/sessions/{sessionId}/stages/previous
- 返回上一阶段
- 返回阶段的初始消息
```

### 4. 数据导出

```
GET /api/chat/sessions/{sessionId}/export
- 导出会话数据
- 返回完整的会话数据，包括所有阶段的结果
```

## 数据存储

### 1. 会话数据

```
sessions/{sessionId}/metadata.json
- 会话元数据

sessions/{sessionId}/messages.json
- 对话历史

sessions/{sessionId}/stage_data.json
- 各阶段数据
```

### 2. 用户数据

```
users/{userId}/sessions.json
- 用户会话列表

users/{userId}/preferences.json
- 用户偏好设置
```

## 集成Eino框架

利用Eino框架的组件和能力实现聊天流程：

### 1. 使用Eino的LLM组件处理自然语言

```go
// 创建LLM客户端
llmClient := llm.NewClient(config.LLMConfig)

// 使用LLM处理用户消息
response, err := llmClient.Chat(ctx, history, message)
```

### 2. 使用Eino的Compose组件构建处理流程

```go
// 创建处理流程
pipeline := compose.NewChain(
    extractInformation,
    updateDialogState,
    generateResponse,
)

// 执行流程
result, err := pipeline.Run(ctx, input)
```

### 3. 使用Eino的Agent组件实现智能助手

```go
// 创建Agent
agent := agent.NewReActAgent(
    llmClient,
    tools.NewToolRegistry(
        tools.NewRequirementTool(),
        tools.NewDevOpsTool(),
        tools.NewKnowledgeTool(),
    ),
)

// 执行Agent
response, err := agent.Run(ctx, task)
```

## 实现计划

1. 实现核心数据结构和接口
2. 实现对话管理器
3. 实现各阶段控制器
4. 实现消息处理器和信息提取器
5. 实现API接口
6. 集成Eino框架组件
7. 实现数据存储和持久化
8. 测试和优化

## 性能考虑

1. 使用缓存减少LLM调用
2. 实现消息批处理减少API请求
3. 使用异步处理提高响应速度
4. 实现会话数据定期持久化
5. 考虑水平扩展支持多用户并发
