# 需求澄清实现文档

## 概述

需求澄清是EinoDevOps助手中业务引导流程的关键环节，位于需求反思和需求确认之间。该环节旨在通过AI引导式问答，帮助业务用户更清晰地表达需求，并将业务语言转换为更适合AI理解和处理的结构化需求。

## 实现目标

1. 提供优雅的交互界面，引导业务用户回答关键问题
2. 通过AI技术生成针对性问题，覆盖功能和非功能需求
3. 实时提取和整理需求点，形成功能范围和非功能需求列表
4. 支持用户添加和编辑需求点，实现人机协作的需求定义
5. 确保整个过程使用中文，提供友好的用户体验

## 技术实现

### 后端实现

后端实现基于Eino框架的图编排能力，主要包括以下组件：

1. **ClarificationChain**: 基于Eino的Chain组件实现的需求澄清链，包含多个处理节点
2. **generateClarificationQuestions**: 生成针对性问题的函数，使用LLM根据项目上下文生成问题
3. **extractRequirementPoints**: 从用户回答中提取关键需求点的函数
4. **defineFunctionalScope**: 根据需求点定义系统功能范围的函数
5. **identifyNonFunctionalRequirements**: 识别非功能需求的函数

关键代码实现：

```go
func createClarificationChain(ctx context.Context, llm llms.LLM) (*compose.Chain, error) {
    chain := compose.NewChain()
    
    chain.AddNode("generateQuestions", generateClarificationQuestions)
    chain.AddNode("extractRequirements", extractRequirementPoints)
    chain.AddNode("defineFunctionalScope", defineFunctionalScope)
    chain.AddNode("identifyNonFunctionalRequirements", identifyNonFunctionalRequirements)
    
    chain.AddEdge("generateQuestions", "extractRequirements")
    chain.AddEdge("extractRequirements", "defineFunctionalScope")
    chain.AddEdge("defineFunctionalScope", "identifyNonFunctionalRequirements")
    
    return chain, nil
}
```

### 前端实现

前端实现基于React和Ant Design组件库，主要包括以下组件：

1. **ClarificationComponent**: 需求澄清的主组件，包含问题列表、需求点列表、功能范围和非功能需求展示
2. **OnboardingPage**: 整合了需求澄清组件的引导页面，管理状态和流程

关键交互流程：

1. 用户完成需求反思后，系统自动生成澄清问题
2. 用户回答问题，系统实时提取需求点并更新功能范围和非功能需求
3. 用户可以添加和编辑需求点，系统实时更新功能范围和非功能需求
4. 用户确认需求后，进入需求确认阶段

## 用户体验设计

### 界面设计

1. **分区布局**: 将问题、需求点、功能范围和非功能需求分区展示，便于用户理解和操作
2. **可折叠面板**: 使用可折叠面板展示各个部分，减少视觉干扰
3. **标签分类**: 使用不同颜色的标签标识不同类型的问题，提高可读性
4. **实时反馈**: 用户回答问题或添加需求点后，系统实时更新其他部分，提供即时反馈

### 交互流程

1. **引导式问答**: 系统生成针对性问题，引导用户思考和回答
2. **需求点提取**: 系统从用户回答中提取关键需求点，用户可以确认和编辑
3. **功能范围定义**: 系统根据需求点定义系统功能范围，用户可以确认和编辑
4. **非功能需求识别**: 系统识别非功能需求，用户可以确认和编辑
5. **需求确认**: 用户确认所有需求后，进入需求确认阶段

## AI技术应用

### 问题生成

使用LLM生成针对性问题，覆盖以下方面：

1. 功能需求
2. 非功能需求
3. 用户需求
4. 业务需求
5. 技术需求
6. 性能需求
7. 集成需求
8. 安全需求
9. 部署需求
10. 可扩展性需求

### 需求提取

使用LLM从用户回答中提取关键需求点，包括：

1. 功能需求点
2. 非功能需求点
3. 业务约束
4. 技术约束

### 功能范围定义

使用LLM根据需求点定义系统功能范围，包括：

1. 核心模块划分
2. 各模块主要功能
3. 不包括的功能

### 非功能需求识别

使用LLM识别非功能需求，包括：

1. 性能需求
2. 可用性需求
3. 可扩展性需求
4. 安全性需求
5. 可维护性需求
6. 兼容性需求
7. 国际化需求

## 与其他模块的集成

### 与需求反思的集成

需求澄清环节接收需求反思环节的输出，包括：

1. 业务价值评估
2. 技术可行性分析
3. 潜在挑战
4. 改进建议

### 与需求确认的集成

需求澄清环节的输出将传递给需求确认环节，包括：

1. 需求点列表
2. 功能范围
3. 非功能需求列表

## 未来改进方向

1. **更智能的问题生成**: 根据用户回答动态调整后续问题，提高问题的针对性
2. **多轮对话优化**: 支持多轮对话，深入挖掘用户需求
3. **需求冲突检测**: 自动检测需求之间的冲突，并提供解决建议
4. **需求优先级排序**: 支持需求优先级排序，帮助用户聚焦关键需求
5. **需求可视化**: 提供需求的可视化展示，如需求地图、用户旅程图等

## 总结

需求澄清环节是EinoDevOps助手中连接业务需求和技术实现的关键桥梁，通过AI技术和优雅的交互设计，帮助业务用户更清晰地表达需求，并将业务语言转换为更适合AI理解和处理的结构化需求。该环节的实现充分体现了"Attention is all you need"的理念，通过关注用户的真实需求，提供精准的技术支持。
