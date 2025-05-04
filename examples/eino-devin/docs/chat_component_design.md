# 聊天组件设计文档

## 组件概述

新的聊天组件将作为整个引导流程的核心界面，支持富文本消息、多种消息类型和上下文感知的交互。该组件将替代当前的多个表单式界面，提供一致且流畅的用户体验。

## 组件结构

```
ChatInterface
├── ChatHeader
│   ├── ProgressIndicator
│   └── StageTitle
├── ChatMessages
│   ├── MessageList
│   │   ├── UserMessage
│   │   ├── AssistantMessage
│   │   │   ├── TextMessage
│   │   │   ├── QuestionMessage
│   │   │   ├── ReflectionMessage
│   │   │   ├── ClarificationMessage
│   │   │   ├── ConfirmationMessage
│   │   │   ├── AIDescriptionMessage
│   │   │   ├── DevOpsRecommendationMessage
│   │   │   ├── KnowledgeSuggestionMessage
│   │   │   └── SolutionMessage
│   │   └── SystemMessage
│   └── TypingIndicator
├── ChatInput
│   ├── MessageInput
│   ├── SendButton
│   └── ActionButtons
└── SidePanel (可选)
    ├── PanelHeader
    ├── PanelContent
    └── PanelFooter
```

## 消息类型

1. **TextMessage**：普通文本消息
2. **QuestionMessage**：包含问题和可能的选项
3. **ReflectionMessage**：展示反思分析结果
4. **ClarificationMessage**：澄清问题和回答
5. **ConfirmationMessage**：需求确认和摘要
6. **AIDescriptionMessage**：AI描述展示
7. **DevOpsRecommendationMessage**：DevOps推荐方案
8. **KnowledgeSuggestionMessage**：知识建议
9. **SolutionMessage**：最终解决方案

## 消息渲染

每种消息类型将有专门的渲染器，支持以下格式：

- 富文本（Markdown）
- 代码块（支持语法高亮）
- 表格
- 列表（有序和无序）
- 链接
- 图片/图表
- 交互元素（按钮、选择框等）

## 状态管理

```javascript
// 消息状态
const [messages, setMessages] = useState([]);
const [isTyping, setIsTyping] = useState(false);
const [currentStage, setCurrentStage] = useState('initial');
const [stageData, setStageData] = useState({});
```

## 交互逻辑

1. **阶段转换**：
   - 系统根据当前阶段和用户回答决定下一个阶段
   - 每个阶段有特定的消息模板和处理逻辑

2. **消息处理**：
   - 用户消息直接显示
   - 系统消息根据类型使用不同渲染器
   - 支持消息分组和折叠

3. **输入处理**：
   - 文本输入
   - 按钮选择
   - 特殊输入（如代码、表格等）

## 辅助面板

可选的辅助面板可以显示：
- 当前阶段的摘要信息
- 已收集的需求列表
- 相关文档和资源
- 架构图和流程图

## 组件接口

```typescript
interface ChatInterfaceProps {
  // 初始消息
  initialMessages?: Message[];
  
  // 当前阶段
  currentStage: string;
  
  // 阶段数据
  stageData?: Record<string, any>;
  
  // 消息发送回调
  onSendMessage: (message: string) => Promise<void>;
  
  // 阶段完成回调
  onStageComplete: (stage: string, data: any) => Promise<void>;
  
  // 显示辅助面板
  showSidePanel?: boolean;
  
  // 辅助面板内容
  sidePanelContent?: React.ReactNode;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  type: MessageType;
  content: string | React.ReactNode;
  timestamp: number;
  metadata?: Record<string, any>;
}

type MessageType = 
  | 'text'
  | 'question'
  | 'reflection'
  | 'clarification'
  | 'confirmation'
  | 'ai_description'
  | 'devops_recommendation'
  | 'knowledge_suggestion'
  | 'solution';
```

## 样式设计

- 使用响应式设计，适应不同屏幕尺寸
- 明确的视觉区分不同消息类型
- 一致的颜色方案和排版
- 支持亮色/暗色模式
- 平滑的动画和过渡效果

## 辅助功能

- 键盘导航
- 屏幕阅读器支持
- 高对比度模式
- 消息历史搜索
- 会话导出

## 实现计划

1. 创建基础ChatInterface组件结构
2. 实现各种消息类型的渲染器
3. 添加状态管理和交互逻辑
4. 实现辅助面板
5. 添加样式和动画
6. 实现辅助功能
7. 集成到现有应用中

## 技术选择

- React函数组件
- Hooks用于状态管理
- Ant Design组件库
- Tailwind CSS用于样式
- React Markdown用于富文本渲染
- React Syntax Highlighter用于代码高亮
