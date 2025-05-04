# AI描述转换实现文档

## 概述

AI描述转换是EinoDevOps助手中业务引导流程的关键环节，位于需求澄清和DevOps方案推荐之间。该环节旨在将业务需求转换为面向AI代码生成的结构化描述，使AI能够更好地理解需求并生成符合要求的代码。

## 实现目标

1. 将业务需求转换为面向AI的任务描述
2. 生成适合AI代码生成的系统提示词
3. 生成清晰的用户提示词
4. 定义明确的约束条件
5. 设定可量化的评估标准
6. 确保整个过程使用中文，提供友好的用户体验

## 技术实现

### 后端实现

后端实现基于Eino框架的图编排能力，主要包括以下组件：

1. **AIDescriptionChain**: 基于Eino的Chain组件实现的AI描述转换链，包含多个处理节点
2. **generateAITaskDescription**: 生成AI任务描述的函数
3. **generateSystemPrompt**: 生成系统提示词的函数
4. **generateUserPrompt**: 生成用户提示词的函数
5. **defineConstraints**: 定义约束条件的函数
6. **defineEvaluationCriteria**: 定义评估标准的函数

关键代码实现：

```go
func createAIDescriptionChain(ctx context.Context, llm llms.LLM) (*compose.Chain, error) {
    chain := compose.NewChain()
    
    chain.AddNode("generateAITaskDescription", generateAITaskDescription)
    chain.AddNode("generateSystemPrompt", generateSystemPrompt)
    chain.AddNode("generateUserPrompt", generateUserPrompt)
    chain.AddNode("defineConstraints", defineConstraints)
    chain.AddNode("defineEvaluationCriteria", defineEvaluationCriteria)
    
    chain.AddEdge("generateAITaskDescription", "generateSystemPrompt")
    chain.AddEdge("generateSystemPrompt", "generateUserPrompt")
    chain.AddEdge("generateUserPrompt", "defineConstraints")
    chain.AddEdge("defineConstraints", "defineEvaluationCriteria")
    
    return chain, nil
}
```

### 辅助函数实现

为了提高AI描述转换的质量，实现了以下辅助函数：

1. **extractProjectType**: 从功能范围中提取项目类型
2. **extractMainFeatures**: 从需求点中提取主要功能
3. **extractKeyNonFunctionalRequirements**: 从非功能需求中提取关键需求

这些辅助函数帮助生成更加精准的AI任务描述，提高AI代码生成的质量。

### 模板化提示词生成

AI描述转换使用模板化的方式生成提示词，主要包括以下模板：

1. **任务描述模板**: 用于生成AI任务描述
2. **系统提示词模板**: 用于生成系统提示词
3. **用户提示词模板**: 用于生成用户提示词
4. **约束条件模板**: 用于生成约束条件
5. **评估标准模板**: 用于生成评估标准

这些模板使用Go的`text/template`包实现，可以根据需求动态生成提示词。

## 前端集成

AI描述转换的结果将在前端展示，主要包括以下内容：

1. **AI任务描述**: 展示AI任务的概述
2. **系统提示词**: 展示给AI的系统指令
3. **用户提示词**: 展示给AI的用户指令
4. **约束条件**: 展示AI代码生成的约束条件
5. **评估标准**: 展示AI代码生成的评估标准

用户可以查看和编辑这些内容，确保AI描述符合预期。

## AI技术应用

### 任务描述生成

使用LLM生成AI任务描述，主要考虑以下方面：

1. 项目目标
2. 主要功能模块
3. 技术栈要求
4. 非功能需求

### 系统提示词生成

使用LLM生成系统提示词，主要考虑以下方面：

1. AI助手的角色和专业领域
2. AI助手的技术专长
3. AI助手的行为准则和回答风格
4. AI助手处理代码生成请求的方式

### 用户提示词生成

使用LLM生成用户提示词，主要考虑以下方面：

1. 用户的具体需求和期望
2. 技术细节和约束条件
3. 交付标准和验收标准

### 约束条件生成

使用LLM生成约束条件，主要考虑以下方面：

1. 技术栈要求
2. 代码质量标准
3. 性能和可靠性要求
4. 架构设计原则

### 评估标准生成

使用LLM生成评估标准，主要考虑以下方面：

1. 功能性评估标准
2. 非功能性评估标准
3. 可量化的指标
4. 代码质量、性能和可靠性评估

## 与其他模块的集成

### 与需求澄清的集成

AI描述转换环节接收需求澄清环节的输出，包括：

1. 功能范围
2. 非功能需求
3. 需求点

### 与DevOps方案推荐的集成

AI描述转换环节的输出将传递给DevOps方案推荐环节，包括：

1. AI任务描述
2. 系统提示词
3. 用户提示词
4. 约束条件
5. 评估标准

## 未来改进方向

1. **更智能的任务描述生成**: 使用更先进的LLM模型生成更精准的任务描述
2. **多轮对话优化**: 支持多轮对话，深入理解用户需求
3. **提示词优化**: 通过实验和反馈不断优化提示词模板
4. **多语言支持**: 支持中英文等多种语言
5. **可视化编辑**: 提供更友好的可视化编辑界面

## 总结

AI描述转换环节是EinoDevOps助手中连接业务需求和AI代码生成的关键桥梁，通过AI技术和模板化提示词生成，帮助业务用户将需求转换为面向AI的结构化描述，提高AI代码生成的质量和效率。该环节的实现充分体现了"Attention is all you need"的理念，通过关注用户的真实需求，提供精准的AI代码生成支持。
