const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MultiAgentClient = require('./multiagent-client');

const app = express();
const PORT = 3003;

const multiAgentClient = new MultiAgentClient('http://localhost:8080');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(bodyParser.json());

// 全局状态数据
let onboardingData = {
  inProgress: false,
  currentStep: 0,
  chatHistory: [],
  requirements: {},
  reflectionData: null,
  clarificationData: null,
  aiDescription: null,
  devopsRecommendation: null,
  knowledgeSuggestions: null
};

// 获取引导状态
app.get('/api/onboarding/status', (req, res) => {
  console.log('获取引导状态');
  res.json(onboardingData);
});

// 开始引导过程
app.post('/api/onboarding/start', (req, res) => {
  console.log('开始引导过程');
  onboardingData.inProgress = true;
  onboardingData.currentStep = 1;
  res.json({ success: true, message: '引导过程已开始' });
});

app.post('/api/onboarding/reset', (req, res) => {
  console.log('重置引导过程');
  onboardingData = {
    inProgress: false,
    currentStep: 0,
    chatHistory: [],
    requirements: {},
    reflectionData: null,
    clarificationData: null,
    aiDescription: null,
    devopsRecommendation: null,
    knowledgeSuggestions: null
  };
  res.json({ success: true, message: '引导过程已重置' });
});

// 聊天API端点 - 使用非流式响应
app.post('/api/chat', async (req, res) => {
  console.log('收到聊天请求:', JSON.stringify(req.body, null, 2));
  console.log('当前阶段:', onboardingData.currentStep);
  
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '无效的消息格式' });
    }
    
    const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();
    
    let responseMessage = '';
    
    switch (onboardingData.currentStep) {
      case 1: // 需求交流阶段
        if (!latestUserMessage) {
          responseMessage = '欢迎使用EinoDevOps助手！我是您的AI引导专家，将帮助您将想法转化为可实现的项目。请告诉我您的项目想法是什么？';
        } else if (latestUserMessage.content.includes('AI分身') || latestUserMessage.content.includes('抖音')) {
          responseMessage = '这是一个很好的想法！您希望开发抖音里的AI分身，可以根据发布的视频回答用户问题。这正是我们的专长所在。请告诉我更多关于您的需求，例如目标用户是谁？您期望AI分身具备哪些核心功能？';
        } else if (latestUserMessage.content.includes('视频') || latestUserMessage.content.includes('回答问题')) {
          responseMessage = '了解了，您希望AI能够根据视频内容回答用户问题。这个功能需要支持哪些具体的场景？例如，视频内容理解、用户问题分析、个性化回答生成等。';
        } else {
          responseMessage = '感谢您的信息！请问您对这个AI分身项目还有什么具体的需求或期望？例如，您希望它能够支持哪些特定的交互场景或技术特性？';
        }
        break;
        
      case 4: // 需求澄清阶段
        if (!latestUserMessage) {
          responseMessage = '为了更好地理解您的需求，我有一些澄清问题需要您回答：';
        } else if (latestUserMessage.content.includes('视频类型') || latestUserMessage.content.includes('教学')) {
          responseMessage = '了解了，您希望AI分身能够处理多种类型的视频。这对我们的视频内容理解模块设计很有帮助。您对AI分身的回答风格有什么偏好吗？';
        } else if (latestUserMessage.content.includes('风格') || latestUserMessage.content.includes('专业')) {
          responseMessage = '明白了，您期望AI分身保持专业且友好的回答风格。这将影响我们的回答生成模块设计。您对AI分身的响应时间有什么要求？';
        } else if (latestUserMessage.content.includes('响应时间') || latestUserMessage.content.includes('实时')) {
          responseMessage = '感谢您的回答！基于您提供的信息，我们将设计一个能够快速响应的系统架构。您还有其他关于AI分身功能的需求吗？';
        } else {
          responseMessage = '感谢您的回答！这些信息对我们理解您的需求非常有帮助。还有其他您想补充的信息吗？';
        }
        break;
        
      default:
        responseMessage = '感谢您的信息！我们正在处理您的需求，请稍候。';
        break;
    }
    
    // 返回标准JSON响应
    res.json({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'eino-devops-assistant',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseMessage
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    });
  } catch (error) {
    console.error('处理聊天请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/onboarding/message', async (req, res) => {
  try {
    const { messages, stage, stageData } = req.body;
    
    console.log('收到消息请求:', JSON.stringify(req.body.messages ? req.body.messages.slice(-1) : {}, null, 2));
    console.log('当前阶段:', stage || onboardingData.currentStep);
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '无效的消息格式' });
    }
    
    const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();
    const userContent = latestUserMessage ? latestUserMessage.content : '';
    
    let responseMessage = '';
    let shouldComplete = false;
    const currentStage = stage || onboardingData.currentStep;
    
    switch (currentStage) {
      case 1: // 需求交流阶段
      case 'initial': // 初始阶段
        if (!latestUserMessage) {
          responseMessage = '欢迎使用EinoDevOps助手！我是您的AI引导专家，将帮助您将想法转化为可实现的项目。请告诉我您的项目想法是什么？';
        } else if (userContent.includes('AI分身') || userContent.includes('抖音')) {
          responseMessage = '这是一个很好的想法！您希望开发抖音里的AI分身，可以根据发布的视频回答用户问题。这正是我们的专长所在。请告诉我更多关于您的需求，例如目标用户是谁？您期望AI分身具备哪些核心功能？';
        } else if (userContent.includes('视频') || userContent.includes('回答问题')) {
          responseMessage = '了解了，您希望AI能够根据视频内容回答用户问题。这个功能需要支持哪些具体的场景？例如，视频内容理解、用户问题分析、个性化回答生成等。';
          shouldComplete = true;
        } else {
          responseMessage = '感谢您的信息！请问您对这个AI分身项目还有什么具体的需求或期望？例如，您希望它能够支持哪些特定的交互场景或技术特性？';
        }
        break;
        
      case 2: // 需求反思阶段
      case 'reflection': // 反思阶段
        if (!latestUserMessage) {
          responseMessage = '基于您提供的信息，我们已经提取了以下需求要点。请确认这些是否准确反映了您的想法：';
        } else if (userContent.includes('确认') || userContent.includes('正确')) {
          responseMessage = '非常感谢您的确认！接下来，我们将进入需求澄清阶段，以确保我们完全理解您的需求细节。';
          shouldComplete = true;
        } else if (userContent.includes('修改') || userContent.includes('调整')) {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整需求。请告诉我具体需要修改的地方。';
        } else {
          responseMessage = '感谢您的反馈！我们将记录您的意见，并在后续的需求澄清中进一步细化。';
        }
        break;
        
      case 3: // 需求澄清准备阶段
      case 'clarification_prep': // 澄清准备阶段
        responseMessage = '为了更好地理解您的需求，我有一些澄清问题需要您回答：';
        shouldComplete = true;
        break;
        
      case 4: // 需求澄清阶段
      case 'clarification': // 澄清阶段
        if (!latestUserMessage) {
          responseMessage = '为了更好地理解您的需求，我有一些澄清问题需要您回答：';
        } else if (userContent.includes('视频类型') || userContent.includes('教学')) {
          responseMessage = '了解了，您希望AI分身能够处理多种类型的视频。这对我们的视频内容理解模块设计很有帮助。您对AI分身的回答风格有什么偏好吗？';
        } else if (userContent.includes('风格') || userContent.includes('专业')) {
          responseMessage = '明白了，您期望AI分身保持专业且友好的回答风格。这将影响我们的回答生成模块设计。您对AI分身的响应时间有什么要求？';
        } else if (userContent.includes('响应时间') || userContent.includes('实时')) {
          responseMessage = '感谢您的回答！基于您提供的信息，我们将设计一个能够快速响应的系统架构。您还有其他关于AI分身功能的需求吗？';
          shouldComplete = true;
        } else {
          responseMessage = '感谢您的回答！这些信息对我们理解您的需求非常有帮助。还有其他您想补充的信息吗？';
        }
        break;
        
      case 5: // 需求确认阶段
      case 'confirmation': // 确认阶段
        if (!latestUserMessage) {
          responseMessage = '基于我们的讨论，以下是您的项目需求概要。请确认这些信息是否准确：';
        } else if (userContent.includes('确认') || userContent.includes('正确')) {
          responseMessage = '非常感谢您的确认！接下来，我们将为您的AI分身项目创建一个AI描述，这将作为开发的基础。';
          shouldComplete = true;
          onboardingData.currentStep = 6;
        } else if (userContent.includes('修改') || userContent.includes('调整')) {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整需求。请告诉我具体需要修改的地方。';
        } else {
          responseMessage = '感谢您的反馈！我们将记录您的意见，并在后续的开发中考虑这些因素。';
        }
        break;
        
      case 6: // AI描述阶段
      case 'ai_description': // AI描述阶段
        if (!latestUserMessage) {
          responseMessage = '以下是为您的抖音AI分身项目创建的AI系统描述。这将作为开发的基础：';
        } else if (userContent.includes('确认') || userContent.includes('继续')) {
          responseMessage = '非常感谢您的确认！接下来，我们将为您提供DevOps推荐方案，帮助您规划项目的开发和部署流程。';
          shouldComplete = true;
          onboardingData.currentStep = 7;
        } else {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整AI描述。请告诉我具体需要修改的地方。';
        }
        break;
        
      case 7: // DevOps推荐阶段
      case 'devops': // DevOps阶段
        if (!latestUserMessage) {
          responseMessage = '以下是为您的抖音AI分身项目提供的DevOps推荐方案：';
        } else if (userContent.includes('确认') || userContent.includes('继续')) {
          responseMessage = '非常感谢您的确认！接下来，我们将为您提供相关的知识建议，帮助您更好地理解和实现这个项目。';
          shouldComplete = true;
          onboardingData.currentStep = 8;
        } else {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整DevOps推荐方案。请告诉我具体需要修改的地方。';
        }
        break;
        
      case 8: // 知识建议阶段
      case 'knowledge': // 知识建议阶段
        if (!latestUserMessage) {
          responseMessage = '以下是为您的抖音AI分身项目提供的相关知识建议：';
        } else if (userContent.includes('确认') || userContent.includes('继续')) {
          responseMessage = '非常感谢您的确认！接下来，我们将为您生成完整的项目方案，包括开发计划、资源需求和时间线。';
          shouldComplete = true;
          onboardingData.currentStep = 9;
        } else {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整知识建议。请告诉我具体需要修改的地方。';
        }
        break;
        
      case 9: // 方案生成阶段
      case 'solution': // 方案阶段
        if (!latestUserMessage) {
          responseMessage = '以下是为您的抖音AI分身项目生成的完整项目方案：';
        } else if (userContent.includes('确认') || userContent.includes('完成')) {
          responseMessage = '非常感谢您的确认！您的抖音AI分身项目方案已经完成。我们期待看到这个项目的实现！';
          shouldComplete = true;
        } else {
          responseMessage = '感谢您的反馈！我们将根据您的意见调整项目方案。请告诉我具体需要修改的地方。';
        }
        break;
        
      default:
        responseMessage = '感谢您的信息！我们正在处理您的需求，请稍候。';
        break;
    }
    
    // 返回标准JSON响应，兼容Vercel AI SDK格式
    res.json({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'eino-devops-assistant',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseMessage
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      shouldComplete
    });
  } catch (error) {
    console.error('处理消息请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 分析需求
app.post('/api/onboarding/analyze-requirements', async (req, res) => {
  try {
    const messages = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '无效的消息格式' });
    }
    
    onboardingData.chatHistory = messages;
    
    let extractedRequirements;
    
    try {
      console.log('使用需求分析智能体处理...');
      const result = await multiAgentClient.processAgent('requirement_analysis', JSON.stringify(messages));
      
      if (result && result.data && result.data.requirements) {
        extractedRequirements = result.data.requirements;
        console.log('需求分析智能体处理完成');
      } else {
        console.log('多智能体系统不可用，使用备用方案');
        extractedRequirements = getFallbackRequirements();
      }
    } catch (error) {
      console.error('多智能体系统调用失败，使用备用方案:', error);
      extractedRequirements = getFallbackRequirements();
    }
    
    onboardingData.requirements = extractedRequirements;
    onboardingData.currentStep = 2;
    
    res.json({ 
      success: true, 
      shouldComplete: true,
      extractedRequirements 
    });
  } catch (error) {
    console.error('处理需求分析请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

function getFallbackRequirements() {
  return {
    projectName: '抖音AI分身',
    description: '根据发布的视频回答用户问题',
    businessGoals: '提升用户互动体验，增加用户粘性和停留时间',
    targetUsers: '抖音普通用户',
    keyFeatures: [
      '视频内容理解',
      '智能问答生成',
      '个性化回复定制',
      '运营数据监控'
    ],
    businessValue: "该项目将显著提升抖音用户的互动体验，增加用户粘性和停留时间，让创作者专注于内容创作，体现'Attention is all you need'的理念。",
    technicalFeasibility: "从技术角度看，该项目可以使用字节跳动开源的CloudWeGo生态实现，包括Eino框架作为AI能力支撑，Kitex作为高性能RPC框架，Hertz作为HTTP框架，结合视频内容理解和大语言模型技术。",
    potentialChallenges: [
      "需要处理复杂的视频内容理解和语义分析",
      "需要确保AI回答的准确性和个性化",
      "需要支持高并发用户访问和实时响应",
      "需要建立完善的运营数据监控系统"
    ],
    suggestedImprovements: [
      "使用Eino框架的组合能力，构建灵活的AI问答工作流",
      "集成CloudWeGo生态的高性能组件，提升系统响应速度",
      "建立完善的视频内容知识库，支持更精准的问题回答",
      "实现多模态理解能力，提升视频内容分析准确性"
    ]
  };
}

app.post('/api/onboarding/confirm-requirements', (req, res) => {
  console.log('确认需求反思');
  
  onboardingData.currentStep = 3;
  
  res.json({
    success: true,
    message: '需求已确认'
  });
});

app.post('/api/onboarding/request-changes', (req, res) => {
  console.log('请求修改需求');
  const { changes } = req.body;
  
  console.log('请求的修改:', changes);
  
  res.json({
    success: true,
    message: '修改请求已接收'
  });
});

app.post('/api/onboarding/clarify-requirements', (req, res) => {
  console.log('澄清需求');
  
  onboardingData.currentStep = 4;
  onboardingData.clarificationData = {
    questions: [
      {
        id: 'q1',
        question: '您希望AI分身能够处理的视频类型有哪些？例如，教学视频、娱乐视频、产品展示等。',
        answer: ''
      },
      {
        id: 'q2',
        question: '您期望AI分身的回答风格是什么样的？例如，专业、幽默、简洁等。',
        answer: ''
      },
      {
        id: 'q3',
        question: '您对AI分身的响应时间有什么要求？',
        answer: ''
      }
    ]
  };
  
  res.json({
    success: true,
    clarificationData: onboardingData.clarificationData
  });
});

app.post('/api/onboarding/convert-to-ai-description', async (req, res) => {
  try {
    console.log('转换为AI描述');
    
    onboardingData.currentStep = 5;
    
    let aiDescription;
    
    try {
      console.log('使用架构设计智能体处理...');
      const result = await multiAgentClient.processAgent('architecture_design', JSON.stringify(onboardingData.requirements));
      
      if (result && result.data && result.data.ai_description) {
        aiDescription = result.data.ai_description;
        console.log('架构设计智能体处理完成');
      } else {
        console.log('多智能体系统不可用，使用备用方案');
        aiDescription = getFallbackAIDescription();
      }
    } catch (error) {
      console.error('多智能体系统调用失败，使用备用方案:', error);
      aiDescription = getFallbackAIDescription();
    }
    
    onboardingData.aiDescription = aiDescription;
    
    res.json({
      success: true,
      aiDescription: onboardingData.aiDescription
    });
  } catch (error) {
    console.error('处理AI描述请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

function getFallbackAIDescription() {
  return {
    systemPrompt: `你是一个抖音AI分身助手，负责根据创作者发布的视频内容回答用户问题。你应该：
1. 理解视频的核心内容和主题
2. 分析用户问题的意图和关联性
3. 提供准确、个性化的回答
4. 保持创作者的语言风格和专业性
5. 在不确定的情况下，引导用户提供更多信息`,
    capabilities: [
      '视频内容理解与分析',
      '自然语言处理与问题意图识别',
      '个性化回答生成',
      '多轮对话管理',
      '用户反馈学习'
    ],
    constraints: [
      '仅回答与视频内容相关的问题',
      '不提供虚假或误导性信息',
      '保护用户隐私和敏感信息',
      '明确标识AI生成的内容',
      '遵守平台内容政策和规范'
    ]
  };
}

app.post('/api/onboarding/get-devops-recommendations', async (req, res) => {
  try {
    console.log('获取DevOps推荐');
    
    onboardingData.currentStep = 6;
    
    let devopsRecommendation;
    
    try {
      console.log('使用持续交付智能体处理...');
      const result = await multiAgentClient.processAgent('continuous_delivery', JSON.stringify({
        requirements: onboardingData.requirements,
        aiDescription: onboardingData.aiDescription
      }));
      
      if (result && result.data && result.data.devops_recommendation) {
        devopsRecommendation = result.data.devops_recommendation;
        console.log('持续交付智能体处理完成');
      } else {
        console.log('多智能体系统不可用，使用备用方案');
        devopsRecommendation = getFallbackDevOpsRecommendation();
      }
    } catch (error) {
      console.error('多智能体系统调用失败，使用备用方案:', error);
      devopsRecommendation = getFallbackDevOpsRecommendation();
    }
    
    onboardingData.devopsRecommendation = devopsRecommendation;
    
    res.json({
      success: true,
      devopsRecommendation: onboardingData.devopsRecommendation
    });
  } catch (error) {
    console.error('处理DevOps推荐请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

function getFallbackDevOpsRecommendation() {
  return {
    architecture: {
      frontend: '使用React + Tailwind CSS构建用户界面',
      backend: '使用CloudWeGo生态系统（Kitex + Hertz）构建高性能后端服务',
      ai: '使用Eino框架构建AI能力层',
      storage: '使用分布式存储系统存储视频内容和用户数据'
    },
    cicd: {
      vcs: 'Git + GitHub',
      ci: 'GitHub Actions',
      cd: 'Kubernetes + ArgoCD',
      monitoring: 'Prometheus + Grafana'
    },
    deployment: {
      environment: ['开发环境', '测试环境', '预发布环境', '生产环境'],
      strategy: '蓝绿部署',
      scaling: '自动水平扩展'
    },
    monitoring: {
      metrics: ['API响应时间', 'AI处理时间', '用户满意度', '系统资源使用率'],
      alerts: ['服务不可用', '响应时间超过阈值', '错误率超过阈值'],
      dashboard: '实时监控仪表板'
    }
  };
}

app.post('/api/onboarding/get-knowledge-suggestions', async (req, res) => {
  try {
    console.log('获取知识建议');
    
    onboardingData.currentStep = 7;
    
    let knowledgeSuggestions;
    
    try {
      console.log('使用知识管理智能体处理...');
      const result = await multiAgentClient.processAgent('knowledge_management', JSON.stringify({
        requirements: onboardingData.requirements,
        aiDescription: onboardingData.aiDescription,
        devopsRecommendation: onboardingData.devopsRecommendation
      }));
      
      if (result && result.data && result.data.knowledge_suggestions) {
        knowledgeSuggestions = result.data.knowledge_suggestions;
        console.log('知识管理智能体处理完成');
      } else {
        console.log('多智能体系统不可用，使用备用方案');
        knowledgeSuggestions = getFallbackKnowledgeSuggestions();
      }
    } catch (error) {
      console.error('多智能体系统调用失败，使用备用方案:', error);
      knowledgeSuggestions = getFallbackKnowledgeSuggestions();
    }
    
    onboardingData.knowledgeSuggestions = knowledgeSuggestions;
    
    res.json({
      success: true,
      knowledgeSuggestions: onboardingData.knowledgeSuggestions
    });
  } catch (error) {
    console.error('处理知识建议请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

function getFallbackKnowledgeSuggestions() {
  return {
    technologies: [
      {
        name: 'Eino框架',
        description: '字节跳动开源的Go语言LLM应用开发框架',
        resources: ['https://github.com/bytedance/eino', 'https://bytedance.github.io/eino/']
      },
      {
        name: 'CloudWeGo',
        description: '字节跳动开源的云原生微服务通信框架',
        resources: ['https://github.com/cloudwego', 'https://www.cloudwego.io/']
      },
      {
        name: '视频内容理解',
        description: '使用多模态模型理解视频内容',
        resources: ['https://arxiv.org/abs/2103.00020']
      }
    ],
    bestPractices: [
      '使用Eino的组合能力构建灵活的AI工作流',
      '利用CloudWeGo的高性能组件提升系统响应速度',
      '建立完善的视频内容知识库',
      '实现多模态理解能力'
    ],
    examples: [
      {
        title: '视频内容提取示例',
        code: 'https://github.com/example/video-content-extraction'
      },
      {
        title: 'Eino问答系统示例',
        code: 'https://github.com/bytedance/eino/examples/qa-system'
      }
    ]
  };
}

app.post('/api/onboarding/generate-plan', async (req, res) => {
  try {
    console.log('生成项目方案');
    
    onboardingData.currentStep = 8;
    
    let projectPlan;
    
    try {
      console.log('使用项目管理智能体处理...');
      const result = await multiAgentClient.processAgent('project_management', JSON.stringify({
        requirements: onboardingData.requirements,
        aiDescription: onboardingData.aiDescription,
        devopsRecommendation: onboardingData.devopsRecommendation,
        knowledgeSuggestions: onboardingData.knowledgeSuggestions
      }));
      
      if (result && result.data && result.data.project_plan) {
        projectPlan = result.data.project_plan;
        console.log('项目管理智能体处理完成');
      } else {
        console.log('多智能体系统不可用，使用备用方案');
        projectPlan = getFallbackProjectPlan();
      }
    } catch (error) {
      console.error('多智能体系统调用失败，使用备用方案:', error);
      projectPlan = getFallbackProjectPlan();
    }
    
    res.json({
      success: true,
      projectPlan
    });
  } catch (error) {
    console.error('处理项目方案请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

function getFallbackProjectPlan() {
  return {
    phases: [
      {
        name: '需求分析与规划',
        tasks: [
          '详细需求文档编写',
          '技术选型确认',
          '项目计划制定',
          '资源分配'
        ],
        duration: '1-2周'
      },
      {
        name: '设计与原型',
        tasks: [
          'AI系统设计',
          '架构设计',
          '数据流设计',
          'UI/UX设计',
          '原型开发'
        ],
        duration: '2-3周'
      },
      {
        name: '开发与集成',
        tasks: [
          '前端开发',
          '后端开发',
          'AI模型开发与训练',
          '系统集成',
          '单元测试'
        ],
        duration: '4-6周'
      },
      {
        name: '测试与优化',
        tasks: [
          '功能测试',
          '性能测试',
          'AI准确性测试',
          '用户体验测试',
          '系统优化'
        ],
        duration: '2-3周'
      },
      {
        name: '部署与上线',
        tasks: [
          '环境准备',
          'CI/CD配置',
          '灰度发布',
          '监控系统部署',
          '全量上线'
        ],
        duration: '1-2周'
      },
      {
        name: '运营与维护',
        tasks: [
          '用户反馈收集',
          'AI模型迭代',
          '性能监控',
          '系统维护',
          '定期更新'
        ],
        duration: '持续进行'
      }
    ],
    timeline: '预计总开发周期：10-16周',
    resources: {
      frontend: '2-3人',
      backend: '2-3人',
      ai: '1-2人',
      devops: '1人',
      pm: '1人'
    },
    milestones: [
      '需求确认与技术选型完成',
      '原型开发完成',
      '核心功能开发完成',
      '测试与优化完成',
      '系统上线'
    ]
  };
}

app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
});
