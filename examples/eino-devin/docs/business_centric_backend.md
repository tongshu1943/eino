# 业务中心化后端实现

## 概述

为了实现"Attention is all you need"的理念，我们设计了一个业务中心化的后端API，让业务方能够专注于创意和业务需求，而将技术实现的复杂性交由AI助手处理。本文档描述了后端API的设计和实现。

## API设计原则

### 1. 业务需求优先

API设计以业务需求为中心，从需求讨论开始，而非从代码仓库或技术实现开始。这使得业务方能够更自然地表达他们的想法和需求。

### 2. 结构化的需求收集

API提供了结构化的需求收集流程，包括需求交流、需求反思、需求澄清和需求确认等步骤，确保收集到全面、清晰的业务需求。

### 3. 业务到技术的无缝转换

API提供了将业务需求转换为技术实现的功能，包括AI描述转换、DevOps推荐和知识建议等，使业务方无需关心技术细节。

## API端点

### 1. 引导状态管理

```javascript
// 获取引导状态
app.get('/api/onboarding/status', (req, res) => {
  res.json(onboardingData);
});

// 开始引导过程
app.post('/api/onboarding/start', (req, res) => {
  onboardingData.inProgress = true;
  onboardingData.currentStep = 1;
  res.json({ success: true, message: '引导过程已开始' });
});
```

### 2. 需求分析

```javascript
// 分析需求
app.post('/api/onboarding/analyze-requirements', (req, res) => {
  const { chatHistory } = req.body;
  // 实现需求分析逻辑
  res.json({ success: true, extractedRequirements });
});
```

### 3. 需求澄清

```javascript
// 澄清需求
app.post('/api/onboarding/clarify-requirements', (req, res) => {
  const { chatHistory, reflectionData } = req.body;
  // 实现需求澄清逻辑
  res.json(clarificationData);
});

// 回答澄清问题
app.post('/api/onboarding/answer-question', (req, res) => {
  const { questionId, answer, clarificationData } = req.body;
  // 处理问题回答
  res.json(updatedData);
});
```

### 4. AI描述转换

```javascript
// 转换为AI描述
app.post('/api/onboarding/convert-to-ai-description', (req, res) => {
  const { requirements, clarificationData } = req.body;
  // 实现AI描述转换逻辑
  res.json(aiDescription);
});
```

### 5. DevOps推荐

```javascript
// 获取DevOps推荐方案
app.post('/api/onboarding/get-devops-recommendations', (req, res) => {
  const { aiDescription, requirements } = req.body;
  // 实现DevOps推荐逻辑
  res.json(devopsRecommendation);
});
```

### 6. 知识建议

```javascript
// 获取知识建议
app.post('/api/onboarding/get-knowledge-suggestions', (req, res) => {
  const { requirements, aiDescription, devopsRecommendation } = req.body;
  // 实现知识建议逻辑
  res.json(knowledgeSuggestions);
});
```

## 业务中心化的体现

1. **从业务需求开始**：API设计从业务需求讨论开始，而非从代码仓库或技术实现开始。

2. **结构化的需求收集**：API提供了结构化的需求收集流程，确保收集到全面、清晰的业务需求。

3. **业务价值分析**：API提供了业务价值分析功能，帮助业务方理解其需求的价值和可行性。

4. **业务语言交流**：API使用业务方熟悉的语言和概念，减少技术术语的使用。

5. **技术细节隐藏**：API将技术实现的复杂性隐藏在后端，业务方只需关注业务需求本身。

## 总结

业务中心化后端API的设计和实现体现了"Attention is all you need"的理念，让业务方能够专注于创意和业务需求，而将技术实现的复杂性交由AI助手处理。这种设计不仅降低了业务方的技术门槛，还提高了需求质量和开发效率。
