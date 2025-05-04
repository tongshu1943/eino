/**
 * 阶段控制器
 * 负责管理引导流程的各个阶段，决定何时转换到下一个阶段，以及每个阶段的处理逻辑
 */
const { Stage } = require('./dialog-manager');

class BaseStageController {
  async processMessage(manager, message) {
    return [];
  }
  
  canProceedToNextStage(manager) {
    return false;
  }
  
  getNextStage(manager) {
    return Stage.INITIAL;
  }
  
  async prepareStage(manager) {
    return [{
      role: 'assistant',
      content: '欢迎使用EinoDevOps助手！我可以帮助您将想法转化为可实现的项目。请告诉我您的项目想法或需求，我们一起来探讨如何实现它。',
      type: 'text'
    }];
  }
  
  async completeStage(manager) {
    return [];
  }
}

class InitialStageController extends BaseStageController {
  async processMessage(manager, message) {
    const responses = [];
    
    responses.push({
      role: 'assistant',
      content: '欢迎使用EinoDevOps助手！我可以帮助您将想法转化为可实现的项目。请告诉我您的项目想法或需求，我们一起来探讨如何实现它。',
      type: 'text'
    });
    
    manager.setStage(Stage.REQUIREMENT);
    
    return responses;
  }
  
  getNextStage(manager) {
    return Stage.REQUIREMENT;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
}

class RequirementStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content;
    const responses = [];
    
    const hasKeywords = content.includes('业务部门') || content.includes('从想法到上线');
    
    if (hasKeywords && (content.includes('创新引擎') || content.includes('内部平台'))) {
      responses.push({
        role: 'assistant',
        content: '这是一个很好的想法！您希望开发一个支持业务部门从想法到上线全过程的内部创新引擎平台。这正是我们的专长所在。请告诉我更多关于您的业务需求，例如目标用户是谁？您期望平台提供哪些核心功能？',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        projectName: '内部创新引擎平台',
        description: '支持业务部门从想法到上线的全过程',
        businessGoals: '提高业务创新效率，减少从想法到实现的时间',
        targetUsers: '业务部门人员',
        keyFeatures: [
          '需求收集和分析',
          '自动化代码生成',
          'DevOps流水线集成',
          '知识建议和技术推荐'
        ],
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    } else if (content.includes('创新引擎') || content.includes('内部平台')) {
      responses.push({
        role: 'assistant',
        content: '这是一个很好的想法！请告诉我更多关于这个内部创新引擎平台的信息。例如，它将支持哪些具体的业务场景？目标用户是谁？',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        projectName: '内部创新引擎平台',
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    } else if (hasKeywords) {
      responses.push({
        role: 'assistant',
        content: '了解了，您希望支持业务部门从想法到上线的全过程。这个平台需要支持哪些具体的功能？例如，需求收集、代码生成、自动化部署等。',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        description: '支持业务部门从想法到上线的全过程',
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    } else if (content.includes('AI') || content.includes('人工智能')) {
      responses.push({
        role: 'assistant',
        content: 'AI技术确实是这个平台的核心。我们可以利用Eino框架的AI能力，帮助业务部门快速将想法转化为可实现的项目。您对AI在这个平台中的应用有什么特别的期望吗？',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        aiFeatures: ['AI辅助需求分析', 'AI代码生成'],
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    } else if (content.includes('DevOps') || content.includes('自动化')) {
      responses.push({
        role: 'assistant',
        content: 'DevOps自动化是提高研发效率的关键。我们可以集成CloudWeGo生态的组件，构建高性能的DevOps流水线。您希望这个平台支持哪些具体的DevOps实践？',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        devopsFeatures: ['自动化部署', 'CI/CD集成'],
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的信息！请问您对这个平台还有什么具体的需求或期望？例如，您希望它能够支持哪些特定的技术栈或业务场景？',
        type: 'text'
      });
      
      manager.setStageData(Stage.REQUIREMENT, {
        messageCount: (manager.getStageData(Stage.REQUIREMENT).messageCount || 0) + 1
      });
    }
    
    if (this.canProceedToNextStage(manager)) {
      responses.push({
        role: 'assistant',
        content: '我已经收集到足够的需求信息，接下来我将对您的需求进行分析和反思，帮助您更好地理解项目的价值和可行性。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.REFLECTION
        }
      });
      
      const reflectionResponses = await this.prepareReflectionStage(manager);
      responses.push(...reflectionResponses);
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    const requirementData = manager.getStageData(Stage.REQUIREMENT);
    const messageCount = requirementData.messageCount || 0;
    
    const hasProjectName = requirementData.projectName;
    const hasDescription = requirementData.description;
    const hasFeatures = requirementData.keyFeatures && requirementData.keyFeatures.length > 0;
    
    return messageCount >= 3 && hasProjectName && hasDescription && hasFeatures;
  }
  
  getNextStage(manager) {
    return Stage.REFLECTION;
  }
  
  async prepareReflectionStage(manager) {
    const requirementData = manager.getStageData(Stage.REQUIREMENT);
    
    const reflectionData = {
      businessValue: "该项目将显著提升业务团队从想法到上线的效率，减少沟通成本，让业务方专注于创意本身，体现'Attention is all you need'的理念。",
      technicalFeasibility: "从技术角度看，该项目可以使用字节跳动开源的CloudWeGo生态实现，包括Eino框架作为AI能力支撑，Kitex作为高性能RPC框架，Hertz作为HTTP框架。",
      potentialChallenges: [
        "需要处理复杂的业务需求转换为技术实现的过程",
        "需要确保AI生成的代码质量和安全性",
        "需要支持多种业务场景和技术栈"
      ],
      suggestedImprovements: [
        "使用Eino框架的组合能力，构建灵活的AI工作流",
        "集成CloudWeGo生态的高性能组件，提升系统性能",
        "建立完善的知识库，支持更精准的技术推荐"
      ]
    };
    
    manager.setStageData(Stage.REFLECTION, reflectionData);
    
    return [{
      role: 'assistant',
      content: '根据您提供的信息，我对您的需求进行了分析和反思：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(reflectionData, null, 2),
      type: 'reflection',
      metadata: {
        reflectionData
      }
    }];
  }
}

class ReflectionStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    if (content.includes('继续') || content.includes('下一步') || content.includes('好的') || content.includes('确认')) {
      responses.push({
        role: 'assistant',
        content: '感谢您确认反思结果。接下来，我需要澄清一些关键问题，以便更好地理解您的需求。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.CLARIFICATION
        }
      });
      
      const clarificationResponses = await this.prepareClarificationStage(manager);
      responses.push(...clarificationResponses);
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的反馈。我已经记录下您的意见，并会在后续的需求分析中考虑这些因素。您对反思结果还有其他意见吗？如果没有，我们可以继续下一步。',
        type: 'text'
      });
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
  
  getNextStage(manager) {
    return Stage.CLARIFICATION;
  }
  
  async prepareClarificationStage(manager) {
    const clarificationData = {
      questions: [
        {
          id: "q1",
          question: "您希望这个平台主要解决业务团队在从想法到上线过程中的哪些痛点？",
          type: "business",
          description: "了解业务团队的核心痛点，确保平台功能针对性解决问题",
        },
        {
          id: "q2",
          question: "业务团队的技术背景如何？他们是否需要无代码/低代码的体验？",
          type: "user",
          description: "了解用户技术水平，确定平台的易用性设计",
        },
        {
          id: "q3",
          question: "您期望平台能够支持哪些类型的应用开发？（如Web应用、移动应用、微服务等）",
          type: "functional",
          description: "明确平台支持的应用类型范围",
        }
      ],
      requirementPoints: [
        "平台需要支持从业务需求描述到代码实现的全流程自动化",
        "需要提供友好的业务需求输入界面，减少技术门槛",
        "需要集成DevOps工具链，支持自动化测试和部署",
        "需要提供知识建议功能，辅助业务团队理解技术实现"
      ],
      functionalScope: "平台将专注于业务需求到代码实现的转换过程，包括需求分析、架构推荐、代码生成和部署配置，不包括复杂的业务逻辑实现和数据处理。",
      nonFunctionalRequirements: [
        "平台响应时间不超过3秒",
        "支持至少50个并发用户",
        "代码生成准确率不低于85%",
        "系统可用性不低于99.5%"
      ]
    };
    
    manager.setStageData(Stage.CLARIFICATION, clarificationData);
    
    return [{
      role: 'assistant',
      content: '为了更好地理解您的需求，请回答以下几个问题：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(clarificationData.questions, null, 2),
      type: 'clarification',
      metadata: {
        clarificationData
      }
    }];
  }
}

class StageControllerFactory {
  static getController(stage) {
    switch (stage) {
      case Stage.INITIAL:
        return new InitialStageController();
      case Stage.REQUIREMENT:
        return new RequirementStageController();
      case Stage.REFLECTION:
        return new ReflectionStageController();
      case Stage.CLARIFICATION:
        return new ClarificationStageController();
      case Stage.CONFIRMATION:
        return new ConfirmationStageController();
      case Stage.AI_DESCRIPTION:
        return new AIDescriptionStageController();
      case Stage.DEVOPS:
        return new DevOpsStageController();
      case Stage.KNOWLEDGE:
        return new KnowledgeStageController();
      case Stage.SOLUTION:
        return new SolutionStageController();
      default:
        return new InitialStageController();
    }
  }
}

class ClarificationStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content;
    const responses = [];
    
    const clarificationData = manager.getStageData(Stage.CLARIFICATION);
    const answeredQuestions = clarificationData.answeredQuestions || [];
    const questions = clarificationData.questions || [];
    
    if (answeredQuestions.length < questions.length) {
      const questionId = questions[answeredQuestions.length].id;
      answeredQuestions.push({
        questionId,
        answer: content
      });
      
      manager.setStageData(Stage.CLARIFICATION, {
        ...clarificationData,
        answeredQuestions
      });
      
      if (answeredQuestions.length < questions.length) {
        const nextQuestion = questions[answeredQuestions.length];
        responses.push({
          role: 'assistant',
          content: `感谢您的回答。下一个问题：${nextQuestion.question}`,
          type: 'text'
        });
      } else {
        responses.push({
          role: 'assistant',
          content: '感谢您回答了所有问题。根据您的回答，我已经更新了需求理解。接下来，我将为您生成需求摘要，请确认是否准确。',
          type: 'text',
          metadata: {
            transition: true,
            nextStage: Stage.CONFIRMATION
          }
        });
        
        const confirmationResponses = await this.prepareConfirmationStage(manager);
        responses.push(...confirmationResponses);
      }
    } else {
      responses.push({
        role: 'assistant',
        content: '您已经回答了所有问题。如果您有其他补充，我会记录下来。接下来，我将为您生成需求摘要，请确认是否准确。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.CONFIRMATION
        }
      });
      
      const confirmationResponses = await this.prepareConfirmationStage(manager);
      responses.push(...confirmationResponses);
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    const clarificationData = manager.getStageData(Stage.CLARIFICATION);
    const answeredQuestions = clarificationData.answeredQuestions || [];
    const questions = clarificationData.questions || [];
    
    return answeredQuestions.length >= questions.length;
  }
  
  getNextStage(manager) {
    return Stage.CONFIRMATION;
  }
  
  async prepareConfirmationStage(manager) {
    const requirementData = manager.getStageData(Stage.REQUIREMENT);
    const clarificationData = manager.getStageData(Stage.CLARIFICATION);
    
    const requirementSummary = {
      projectName: requirementData.projectName || '内部创新引擎平台',
      description: requirementData.description || '支持业务部门从想法到上线的全过程',
      businessGoals: requirementData.businessGoals || '提高业务创新效率，减少从想法到实现的时间',
      targetUsers: requirementData.targetUsers || '业务部门人员',
      keyFeatures: requirementData.keyFeatures || [
        '需求收集和分析',
        '自动化代码生成',
        'DevOps流水线集成',
        '知识建议和技术推荐'
      ],
      technicalRequirements: [
        '使用CloudWeGo生态组件构建',
        '支持多种应用类型开发',
        '提供API和SDK供集成'
      ],
      nonFunctionalRequirements: clarificationData.nonFunctionalRequirements || []
    };
    
    manager.setStageData(Stage.CONFIRMATION, {
      requirementSummary
    });
    
    return [{
      role: 'assistant',
      content: '根据我们的讨论，以下是您的需求摘要：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(requirementSummary, null, 2),
      type: 'confirmation',
      metadata: {
        requirementSummary
      }
    }, {
      role: 'assistant',
      content: '请确认这个需求摘要是否准确。如果有任何需要修改的地方，请告诉我。',
      type: 'text'
    }];
  }
}

class ConfirmationStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    if (content.includes('确认') || content.includes('正确') || content.includes('可以') || content.includes('没问题')) {
      responses.push({
        role: 'assistant',
        content: '感谢您的确认。接下来，我将为您生成AI描述，这将是AI助手理解您需求的方式。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.AI_DESCRIPTION
        }
      });
      
      const aiDescriptionResponses = await this.prepareAIDescriptionStage(manager);
      responses.push(...aiDescriptionResponses);
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的反馈。我已经记录下您的修改意见。请问还有其他需要修改的地方吗？如果没有，请确认修改后的需求摘要。',
        type: 'text'
      });
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
  
  getNextStage(manager) {
    return Stage.AI_DESCRIPTION;
  }
  
  async prepareAIDescriptionStage(manager) {
    const confirmationData = manager.getStageData(Stage.CONFIRMATION);
    const requirementSummary = confirmationData.requirementSummary || {};
    
    const aiDescription = {
      systemPrompt: `你是一个专业的DevOps助手，帮助用户将业务想法转化为可实现的项目。你的目标是理解用户的业务需求，提供技术实现建议，并生成相关代码。请记住"Attention is all you need"的理念，让用户专注于创意，而你负责技术实现细节。`,
      userPrompt: `我需要一个${requirementSummary.projectName || '创新引擎平台'}，它能够${requirementSummary.description || '支持业务部门从想法到上线的全过程'}。主要功能包括${(requirementSummary.keyFeatures || []).join('、')}。目标用户是${requirementSummary.targetUsers || '业务部门人员'}。`,
      constraints: [
        "生成的代码必须符合公司编码规范",
        "必须使用CloudWeGo生态组件",
        "必须考虑安全性和可扩展性",
        "必须提供完整的部署文档"
      ],
      evaluationCriteria: [
        "代码质量和可维护性",
        "功能完整性",
        "性能指标",
        "用户体验"
      ],
      projectType: "DevOps平台",
      mainFeatures: requirementSummary.keyFeatures || [],
      nonFunctionalRequirements: requirementSummary.nonFunctionalRequirements || []
    };
    
    manager.setStageData(Stage.AI_DESCRIPTION, {
      aiDescription
    });
    
    return [{
      role: 'assistant',
      content: '以下是根据您的需求生成的AI描述：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(aiDescription, null, 2),
      type: 'ai_description',
      metadata: {
        aiDescription
      }
    }, {
      role: 'assistant',
      content: '这个AI描述将用于指导AI助手理解您的需求并生成相应的解决方案。请确认这个描述是否准确反映了您的需求。',
      type: 'text'
    }];
  }
}

class AIDescriptionStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    if (content.includes('确认') || content.includes('正确') || content.includes('可以') || content.includes('没问题')) {
      responses.push({
        role: 'assistant',
        content: '感谢您的确认。接下来，我将为您生成DevOps推荐方案，包括架构设计、技术栈选择和流水线配置等。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.DEVOPS
        }
      });
      
      const devopsResponses = await this.prepareDevOpsStage(manager);
      responses.push(...devopsResponses);
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的反馈。我已经记录下您的修改意见。请问还有其他需要修改的地方吗？如果没有，请确认修改后的AI描述。',
        type: 'text'
      });
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
  
  getNextStage(manager) {
    return Stage.DEVOPS;
  }
  
  async prepareDevOpsStage(manager) {
    const aiDescriptionData = manager.getStageData(Stage.AI_DESCRIPTION);
    const aiDescription = aiDescriptionData.aiDescription || {};
    
    const devopsRecommendation = {
      architecture: "基于微服务架构的DevOps平台，使用CloudWeGo生态组件构建",
      architectureDiagram: `
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|    前端UI         |---->|    API网关        |---->|  需求分析服务      |
|  React+Ant Design |     |  CloudWeGo Hertz  |     | CloudWeGo Eino    |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
                                                           |
                                                           v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| DevOps流水线服务   |<----|  代码生成服务      |<----| 知识推荐服务      |
| Kitex+Jenkins/    |     | CloudWeGo Eino    |     | CloudWeGo Eino    |
| GitLab CI         |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
`,
      techStack: ["React", "Ant Design", "CloudWeGo Eino", "CloudWeGo Kitex", "CloudWeGo Hertz", "Docker", "Kubernetes"],
      cloudWeGoComponents: [
        {
          name: "Eino",
          description: "Go语言编写的LLM应用开发框架，用于构建AI功能",
          usage: "用于需求分析、代码生成和知识推荐",
          url: "https://github.com/cloudwego/eino",
          benefits: ["高性能", "易扩展", "组件化设计"]
        },
        {
          name: "Kitex",
          description: "高性能、强可扩展的Go微服务RPC框架",
          usage: "用于服务间通信",
          url: "https://github.com/cloudwego/kitex",
          benefits: ["高性能", "强扩展性", "多协议支持"]
        },
        {
          name: "Hertz",
          description: "高性能、可扩展的HTTP框架",
          usage: "用于构建API网关和HTTP服务",
          url: "https://github.com/cloudwego/hertz",
          benefits: ["高性能", "可扩展", "易用性"]
        }
      ],
      bestPractices: [
        "使用基于Eino的组合式工作流，提高AI应用的可维护性",
        "采用CloudWeGo生态组件，提升系统性能",
        "实现自动化测试和部署，提高开发效率",
        "建立完善的监控和告警机制，保障系统稳定性",
        "定期更新AI模型和知识库，提高推荐准确性"
      ]
    };
    
    manager.setStageData(Stage.DEVOPS, {
      devopsRecommendation
    });
    
    return [{
      role: 'assistant',
      content: '以下是根据您的需求生成的DevOps推荐方案：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(devopsRecommendation, null, 2),
      type: 'devops',
      metadata: {
        devopsRecommendation
      }
    }, {
      role: 'assistant',
      content: '这个DevOps推荐方案包括架构设计、技术栈选择和流水线配置等。请确认这个方案是否满足您的需求。',
      type: 'text'
    }];
  }
}

class DevOpsStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    if (content.includes('确认') || content.includes('正确') || content.includes('可以') || content.includes('没问题')) {
      responses.push({
        role: 'assistant',
        content: '感谢您的确认。接下来，我将为您提供知识建议，帮助您更好地理解和实现这个项目。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.KNOWLEDGE
        }
      });
      
      const knowledgeResponses = await this.prepareKnowledgeStage(manager);
      responses.push(...knowledgeResponses);
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的反馈。我已经记录下您的修改意见。请问还有其他需要修改的地方吗？如果没有，请确认修改后的DevOps推荐方案。',
        type: 'text'
      });
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
  
  getNextStage(manager) {
    return Stage.KNOWLEDGE;
  }
  
  async prepareKnowledgeStage(manager) {
    const devopsData = manager.getStageData(Stage.DEVOPS);
    const devopsRecommendation = devopsData.devopsRecommendation || {};
    
    const knowledgeSuggestions = {
      categories: [
        {
          name: "CloudWeGo生态",
          items: [
            {
              id: "k1",
              title: "Eino框架入门指南",
              description: "学习如何使用Eino框架构建LLM应用",
              url: "https://github.com/cloudwego/eino",
              tags: ["Eino", "LLM", "AI"]
            },
            {
              id: "k2",
              title: "Kitex高性能RPC框架",
              description: "了解Kitex框架的特性和使用方法",
              url: "https://github.com/cloudwego/kitex",
              tags: ["Kitex", "RPC", "微服务"]
            }
          ]
        },
        {
          name: "DevOps实践",
          items: [
            {
              id: "k3",
              title: "Docker容器化最佳实践",
              description: "学习如何使用Docker容器化应用",
              url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
              tags: ["Docker", "容器化", "最佳实践"]
            },
            {
              id: "k4",
              title: "Kubernetes入门指南",
              description: "了解Kubernetes的基本概念和使用方法",
              url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
              tags: ["Kubernetes", "容器编排", "部署"]
            }
          ]
        }
      ]
    };
    
    manager.setStageData(Stage.KNOWLEDGE, {
      knowledgeSuggestions
    });
    
    return [{
      role: 'assistant',
      content: '以下是为您提供的知识建议，帮助您更好地理解和实现这个项目：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(knowledgeSuggestions, null, 2),
      type: 'knowledge',
      metadata: {
        knowledgeSuggestions
      }
    }, {
      role: 'assistant',
      content: '这些知识建议涵盖了CloudWeGo生态和DevOps实践等方面，可以帮助您更好地理解和实现这个项目。请确认这些建议是否有帮助。',
      type: 'text'
    }];
  }
}

class KnowledgeStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    if (content.includes('确认') || content.includes('有帮助') || content.includes('可以') || content.includes('没问题')) {
      responses.push({
        role: 'assistant',
        content: '感谢您的确认。接下来，我将为您生成最终解决方案，包括项目结构、关键组件和实现步骤等。',
        type: 'text',
        metadata: {
          transition: true,
          nextStage: Stage.SOLUTION
        }
      });
      
      const solutionResponses = await this.prepareSolutionStage(manager);
      responses.push(...solutionResponses);
    } else {
      responses.push({
        role: 'assistant',
        content: '感谢您的反馈。我已经记录下您的意见。请问还有其他需要补充的知识点吗？如果没有，我们可以继续生成最终解决方案。',
        type: 'text'
      });
    }
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return true;
  }
  
  getNextStage(manager) {
    return Stage.SOLUTION;
  }
  
  async prepareSolutionStage(manager) {
    const requirementData = manager.getStageData(Stage.REQUIREMENT);
    const devopsData = manager.getStageData(Stage.DEVOPS);
    
    const solution = {
      projectName: requirementData.projectName || '内部创新引擎平台',
      description: requirementData.description || '支持业务部门从想法到上线的全过程',
      architecture: devopsData.devopsRecommendation?.architecture || '基于微服务架构的DevOps平台',
      techStack: devopsData.devopsRecommendation?.techStack || [],
      components: [
        {
          name: "前端UI",
          description: "提供用户交互界面，包括需求输入、项目管理等功能",
          tech: ["React", "Ant Design"],
          implementation: "使用React和Ant Design构建，支持响应式设计"
        },
        {
          name: "API网关",
          description: "提供统一的API入口，处理请求路由、认证授权等",
          tech: ["CloudWeGo Hertz"],
          implementation: "使用Hertz框架构建，提供高性能的HTTP服务"
        },
        {
          name: "需求分析服务",
          description: "分析用户输入的需求，生成技术规格",
          tech: ["CloudWeGo Eino", "LLM模型"],
          implementation: "使用Eino框架构建，集成LLM模型进行需求分析"
        },
        {
          name: "代码生成服务",
          description: "根据技术规格生成代码",
          tech: ["CloudWeGo Eino", "LLM模型", "代码模板"],
          implementation: "使用Eino框架构建，集成LLM模型进行代码生成"
        },
        {
          name: "知识推荐服务",
          description: "提供相关技术知识和最佳实践",
          tech: ["CloudWeGo Eino", "向量数据库"],
          implementation: "使用Eino框架构建，集成向量数据库进行知识检索"
        },
        {
          name: "DevOps流水线服务",
          description: "管理代码构建、测试和部署流程",
          tech: ["CloudWeGo Kitex", "Jenkins/GitLab CI", "Docker", "Kubernetes"],
          implementation: "使用Kitex框架构建，集成CI/CD工具进行流水线管理"
        }
      ],
      implementationSteps: [
        {
          name: "需求分析",
          description: "分析用户输入的需求，生成技术规格",
          details: "使用Eino框架的LLM能力，分析用户输入的需求，生成技术规格"
        },
        {
          name: "架构设计",
          description: "根据技术规格生成架构设计",
          details: "使用Eino框架的LLM能力，根据技术规格生成架构设计"
        },
        {
          name: "代码生成",
          description: "根据架构设计生成代码",
          details: "使用Eino框架的LLM能力，根据架构设计生成代码"
        },
        {
          name: "自动化测试",
          description: "对生成的代码进行测试",
          details: "使用单元测试框架和集成测试框架，对生成的代码进行测试"
        },
        {
          name: "自动化部署",
          description: "将测试通过的代码部署到目标环境",
          details: "使用Docker和Kubernetes，将测试通过的代码部署到目标环境"
        }
      ],
      nextSteps: [
        "设置开发环境",
        "创建项目结构",
        "实现核心组件",
        "集成CI/CD流水线",
        "部署到测试环境",
        "进行用户测试",
        "部署到生产环境"
      ]
    };
    
    manager.setStageData(Stage.SOLUTION, {
      solution
    });
    
    return [{
      role: 'assistant',
      content: '以下是为您生成的最终解决方案：',
      type: 'text'
    }, {
      role: 'assistant',
      content: JSON.stringify(solution, null, 2),
      type: 'solution',
      metadata: {
        solution
      }
    }, {
      role: 'assistant',
      content: '这个解决方案包括项目结构、关键组件和实现步骤等。您可以按照这个方案开始实施项目。如果您有任何问题，随时可以向我咨询。',
      type: 'text'
    }];
  }
}

class SolutionStageController extends BaseStageController {
  async processMessage(manager, message) {
    const content = message.content.toLowerCase();
    const responses = [];
    
    responses.push({
      role: 'assistant',
      content: '感谢您的反馈。我很高兴能够帮助您规划这个项目。如果您在实施过程中有任何问题，随时可以向我咨询。祝您项目顺利！',
      type: 'text'
    });
    
    return responses;
  }
  
  canProceedToNextStage(manager) {
    return false;
  }
  
  getNextStage(manager) {
    return Stage.SOLUTION;
  }
}

module.exports = {
  StageControllerFactory,
  BaseStageController,
  InitialStageController,
  RequirementStageController,
  ReflectionStageController,
  ClarificationStageController,
  ConfirmationStageController,
  AIDescriptionStageController,
  DevOpsStageController,
  KnowledgeStageController,
  SolutionStageController
};
