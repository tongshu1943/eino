import React, { useState, useEffect } from 'react';
import ChatContainer from '../components/ChatContainer';
import ChatInterface from '../components/ChatInterface';
import RequirementForm from '../components/RequirementForm';
import ReflectionComponent from '../components/ReflectionComponent';
import ClarificationComponent from '../components/ClarificationComponent';
import AIDescriptionComponent from '../components/AIDescriptionComponent';
import DevOpsRecommendationComponent from '../components/DevOpsRecommendationComponent';
import KnowledgeSuggestionsComponent from '../components/KnowledgeSuggestionsComponent';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import { 
  getOnboardingStatus, 
  startOnboarding, 
  analyzeRequirements, 
  clarifyRequirements, 
  answerQuestion, 
  addRequirement,
  convertToAIDescription,
  getDevOpsRecommendations,
  getKnowledgeSuggestions
} from '../api/onboarding';

const CHAT_STAGES = {
  INITIAL: 'initial',
  REQUIREMENT: 'requirement',
  REFLECTION: 'reflection',
  CLARIFICATION: 'clarification',
  CONFIRMATION: 'confirmation',
  AI_DESCRIPTION: 'ai_description',
  DEVOPS_RECOMMENDATION: 'devops_recommendation',
  KNOWLEDGE_SUGGESTION: 'knowledge_suggestion',
  SOLUTION: 'solution'
};

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [reflectionData, setReflectionData] = useState(null);
  const [clarificationData, setClarificationData] = useState(null);
  const [aiDescription, setAIDescription] = useState(null);
  const [devopsRecommendation, setDevopsRecommendation] = useState(null);
  const [knowledgeSuggestions, setKnowledgeSuggestions] = useState(null);
  const [savedKnowledgeItems, setSavedKnowledgeItems] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [requirements, setRequirements] = useState({
    projectName: '',
    description: '',
    techStack: [],
    businessGoals: '',
    targetUsers: '',
    keyFeatures: [],
    nonFunctionalRequirements: [],
    timeline: '',
    additionalNotes: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // success, error, info

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        setLoading(true);
        const response = await getOnboardingStatus();
        if (response.inProgress) {
          setChatHistory(response.chatHistory || []);
          setRequirements(response.requirements || requirements);
          setCurrentStep(response.currentStep || 0);
        }
      } catch (error) {
        console.error('获取引导状态失败:', error);
        message.error('获取引导状态失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, []);

  const handleStartOnboarding = async () => {
    try {
      setLoading(true);
      const response = await startOnboarding();
      setChatHistory([
        {
          role: 'assistant',
          content: '欢迎使用EinoDevOps助手！我是您的AI引导专家，将帮助您将想法转化为可实现的项目。请告诉我您的项目想法是什么？',
        },
      ]);
      setCurrentStep(1);
    } catch (error) {
      console.error('开始引导过程失败:', error);
      message.error('开始引导过程失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChatComplete = async (updatedChatHistory, extractedRequirements) => {
    setChatHistory(updatedChatHistory);
    setRequirements({
      ...requirements,
      ...extractedRequirements,
    });
    
    try {
      setLoading(true);
      const response = await analyzeRequirements({ chatHistory: updatedChatHistory });
      setReflectionData({
        businessValue: response.extractedRequirements?.businessValue || "该项目有潜力提高团队协作效率，减少沟通成本，提升产品交付速度。",
        technicalFeasibility: response.extractedRequirements?.technicalFeasibility || "从技术角度看，该项目可以使用CloudWeGo生态中的Kitex和Hertz实现，技术上可行。",
        potentialChallenges: response.extractedRequirements?.potentialChallenges || [
          "系统需要处理高并发请求",
          "需要确保数据一致性",
          "需要考虑跨团队协作的权限管理"
        ],
        suggestedImprovements: response.extractedRequirements?.suggestedImprovements || [
          "考虑使用CloudWeGo的Kitex作为RPC框架，提高性能",
          "使用Hertz作为HTTP框架，处理高并发请求",
          "明确定义API接口规范，便于团队协作"
        ]
      });
      setCurrentStep(2); // 进入反思阶段
    } catch (error) {
      console.error('分析需求失败:', error);
      message.error('分析需求失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReflectionConfirm = async () => {
    message.success('反思结果已确认，正在进入需求澄清阶段...');
    try {
      setLoading(true);
      const response = await clarifyRequirements({ 
        chatHistory: chatHistory,
        reflectionData: reflectionData
      });
      
      setClarificationData({
        questions: response.questions || [
          {
            id: "q1",
            question: "系统需要支持多少并发用户？",
            type: "performance",
            description: "了解系统的性能需求，确保系统能够满足业务规模要求",
          },
          {
            id: "q2",
            question: "系统需要支持哪些用户角色？",
            type: "functional",
            description: "了解系统的用户角色划分，确保权限设计合理",
          },
          {
            id: "q3",
            question: "系统的主要功能模块有哪些？",
            type: "functional",
            description: "了解系统的核心功能，确保架构设计合理",
          },
          {
            id: "q4",
            question: "系统需要与哪些外部系统集成？",
            type: "integration",
            description: "了解系统的集成需求，确保接口设计合理",
          },
          {
            id: "q5",
            question: "系统的部署环境是什么？",
            type: "deployment",
            description: "了解系统的部署需求，确保部署方案合理",
          },
          {
            id: "q6",
            question: "系统的安全需求有哪些？",
            type: "security",
            description: "了解系统的安全需求，确保安全措施合理",
          },
          {
            id: "q7",
            question: "系统的可扩展性需求是什么？",
            type: "scalability",
            description: "了解系统的扩展需求，确保架构设计可扩展",
          }
        ],
        requirementPoints: response.requirementPoints || [
          "系统需要支持用户注册和登录，包括第三方账号集成",
          "系统需要支持内容发布和管理，包括多媒体内容",
          "系统需要支持用户互动和评论，包括点赞、收藏和分享"
        ],
        functionalScope: response.functionalScope || "系统将包括用户管理、内容管理、互动管理三个核心模块，不包括支付和订单管理功能。",
        nonFunctionalRequirements: response.nonFunctionalRequirements || [
          "系统响应时间不超过200ms",
          "系统可用性不低于99.9%",
          "系统需要支持水平扩展"
        ]
      });
      
      setCurrentStep(3); // 进入需求澄清阶段
    } catch (error) {
      console.error('开始需求澄清失败:', error);
      message.error('开始需求澄清失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReflectionRequestChanges = () => {
    message.info('请继续与AI助手交流，完善您的需求');
    setCurrentStep(1); // 返回聊天阶段
  };
  
  const handleAnswerQuestion = async (questionId, answer) => {
    try {
      setLoading(true);
      const response = await answerQuestion({ 
        questionId,
        answer,
        clarificationData
      });
      
      const updatedQuestions = clarificationData.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, answer };
        }
        return q;
      });
      
      setClarificationData({
        ...clarificationData,
        questions: updatedQuestions,
        requirementPoints: response.requirementPoints || clarificationData.requirementPoints,
        functionalScope: response.functionalScope || clarificationData.functionalScope,
        nonFunctionalRequirements: response.nonFunctionalRequirements || clarificationData.nonFunctionalRequirements
      });
      
      message.success('回答已提交');
    } catch (error) {
      console.error('提交回答失败:', error);
      message.error('提交回答失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRequirement = async (requirementText) => {
    try {
      setLoading(true);
      const response = await addRequirement({ 
        requirement: requirementText,
        clarificationData
      });
      
      setClarificationData({
        ...clarificationData,
        requirementPoints: [...clarificationData.requirementPoints, requirementText],
        functionalScope: response.functionalScope || clarificationData.functionalScope,
        nonFunctionalRequirements: response.nonFunctionalRequirements || clarificationData.nonFunctionalRequirements
      });
      
      message.success('需求点已添加');
    } catch (error) {
      console.error('添加需求点失败:', error);
      message.error('添加需求点失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClarificationConfirm = () => {
    const formattedRequirements = {
      ...requirements,
      keyFeatures: clarificationData.requirementPoints.filter(req => 
        req.includes("功能") || !req.includes("不超过") && !req.includes("不低于")
      ),
      nonFunctionalRequirements: clarificationData.nonFunctionalRequirements,
      description: clarificationData.functionalScope
    };
    
    setRequirements(formattedRequirements);
    message.success('需求澄清已完成，请确认需求细节');
    setCurrentStep(4); // 进入需求确认阶段
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setRequirements({
        ...requirements,
        ...formData,
      });
      
      const response = await convertToAIDescription({
        requirements: {
          ...requirements,
          ...formData,
        },
        clarificationData
      });
      
      setAIDescription(response);
      message.success('需求已确认，正在生成AI描述...');
      setCurrentStep(5); // 进入AI描述阶段
    } catch (error) {
      console.error('生成AI描述失败:', error);
      message.error('生成AI描述失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAIDescriptionConfirm = async () => {
    try {
      setLoading(true);
      
      const response = await getDevOpsRecommendations({
        aiDescription,
        requirements
      });
      
      setDevopsRecommendation(response);
      message.success('AI描述已确认，正在生成DevOps推荐方案...');
      setCurrentStep(6); // 进入DevOps推荐阶段
    } catch (error) {
      console.error('生成DevOps推荐方案失败:', error);
      message.error('生成DevOps推荐方案失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDevOpsRecommendationConfirm = () => {
    message.success('DevOps推荐方案已确认，正在为您获取知识建议...');
    setLoading(true);
    
    getKnowledgeSuggestions({
      requirements,
      aiDescription,
      devopsRecommendation
    })
      .then(response => {
        setKnowledgeSuggestions(response);
        setCurrentStep(7); // 进入知识建议阶段
      })
      .catch(error => {
        console.error('获取知识建议失败:', error);
        message.error('获取知识建议失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const handleKnowledgeSave = (savedItems) => {
    setSavedKnowledgeItems(savedItems);
  };
  
  const handleKnowledgeSearch = (query) => {
    console.log('搜索知识资源:', query);
  };
  
  const handleKnowledgeConfirm = () => {
    message.success('知识建议已确认，正在为您生成项目方案...');
    setCurrentStep(8); // 进入方案生成阶段
  };
  
  const handleOpenSettings = () => {
    setSettingsModalVisible(true);
  };
  
  const handleCloseSettings = () => {
    setSettingsModalVisible(false);
  };

  const chatBasedSteps = [
    {
      title: '开始',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">欢迎使用EinoDevOps助手</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg">
              EinoDevOps助手是一个基于字节跳动开源的Eino框架开发的DevOps助手，旨在支持业务部门从想法到上线的全过程。
            </p>
            <p className="text-lg">
              通过AI技术赋能DevOps流程，我们将帮助您快速将想法转化为可实现的项目，并提供全流程的技术支持。
            </p>
            <p className="text-lg">点击下方按钮开始引导过程，我们的AI助手将与您交流，了解您的需求。</p>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleStartOnboarding}
              disabled={loading}
              className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-200 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              } text-white flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : (
                <>
                  开始引导
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: '需求交流',
      content: (
        <ChatInterface
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          onComplete={handleChatComplete}
          loading={loading}
          setLoading={setLoading}
          onboardingStage={CHAT_STAGES.INITIAL}
        />
      ),
    },
    {
      title: '需求反思',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.REFLECTION}
          initialMessages={[
            {
              role: 'assistant',
              content: '感谢您分享您的项目想法！我已经对您的需求进行了分析，下面是我的反思结果：',
              type: 'reflection',
              metadata: reflectionData || {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.CLARIFICATION) {
              handleReflectionConfirm();
            }
          }}
          stageData={{
            reflection: { reflectionData },
            clarification: { clarificationData }
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: '需求澄清',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.CLARIFICATION}
          initialMessages={[
            {
              role: 'assistant',
              content: '为了更好地理解您的需求，我有一些澄清问题需要您回答：',
              type: 'clarification',
              metadata: clarificationData || {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.CONFIRMATION) {
              handleClarificationConfirm();
            }
          }}
          stageData={{
            clarification: { clarificationData },
            confirmation: { requirements }
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: '需求确认',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.CONFIRMATION}
          initialMessages={[
            {
              role: 'assistant',
              content: '根据我们的交流，我总结了以下需求，请确认是否准确：',
              type: 'confirmation',
              metadata: requirements || {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.AI_DESCRIPTION) {
              handleFormSubmit(requirements);
            }
          }}
          stageData={{
            confirmation: { requirements },
            ai_description: { aiDescription }
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: 'AI描述',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.AI_DESCRIPTION}
          initialMessages={[
            {
              role: 'assistant',
              content: aiDescription || '以下是转换后的AI描述，这将用于指导代码生成和DevOps流程：',
              type: 'ai_description',
              metadata: {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.DEVOPS_RECOMMENDATION) {
              handleAIDescriptionConfirm();
            }
          }}
          stageData={{
            ai_description: { aiDescription },
            devops_recommendation: { devopsRecommendation }
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: 'DevOps推荐',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.DEVOPS_RECOMMENDATION}
          initialMessages={[
            {
              role: 'assistant',
              content: '基于您的需求，以下是我推荐的DevOps方案：',
              type: 'devops_recommendation',
              metadata: devopsRecommendation || {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.KNOWLEDGE_SUGGESTION) {
              handleDevOpsRecommendationConfirm();
            }
          }}
          stageData={{
            devops_recommendation: { devopsRecommendation },
            knowledge_suggestion: { knowledgeSuggestions }
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: '知识建议',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.KNOWLEDGE_SUGGESTION}
          initialMessages={[
            {
              role: 'assistant',
              content: '基于您的项目需求，以下是一些相关的知识建议：',
              type: 'knowledge_suggestion',
              metadata: knowledgeSuggestions || {}
            }
          ]}
          onStageChange={(currentStage, nextStage, messages) => {
            if (nextStage === CHAT_STAGES.SOLUTION) {
              handleKnowledgeConfirm();
            }
          }}
          stageData={{
            knowledge_suggestion: { knowledgeSuggestions },
            solution: {}
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
    {
      title: '方案生成',
      content: (
        <ChatContainer
          initialStage={CHAT_STAGES.SOLUTION}
          initialMessages={[
            {
              role: 'assistant',
              content: '基于我们的讨论，我已经生成了完整的项目方案：',
              type: 'solution',
              metadata: {
                overview: '内部创新引擎平台，支持业务部门从想法到上线的全流程，提高创新效率，体现"Attention is all you need"的理念。',
                architecture: '微服务架构，前后端分离，使用API网关统一接入',
                techStack: [
                  '前端：React + Ant Design',
                  '后端：CloudWeGo生态（Eino、Kitex、Hertz）',
                  '数据存储：MySQL + Redis',
                  '部署：Kubernetes'
                ],
                modules: [
                  '需求收集与分析',
                  'AI代码生成',
                  '自动化部署',
                  '知识建议'
                ],
                timeline: [
                  '第1个月：需求分析和架构设计',
                  '第2个月：核心功能开发',
                  '第3个月：测试、优化和部署'
                ],
                resources: {
                  '开发人员': '前端2人，后端3人',
                  '基础设施': 'Kubernetes集群，AI模型服务器'
                }
              }
            }
          ]}
          onComplete={(allMessages) => {
            message.success('引导过程已完成，方案已生成！');
          }}
          apiEndpoint="http://localhost:3003/api/onboarding/message"
        />
      ),
    },
  ];
  
  const Toast = ({ message, type, show }) => {
    if (!show) return null;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    'bg-blue-500';
    
    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
        <i className={`mr-2 ${
          type === 'success' ? 'fas fa-check-circle' : 
          type === 'error' ? 'fas fa-exclamation-circle' : 
          'fas fa-info-circle'
        }`}></i>
        <span>{message}</span>
      </div>
    );
  };

  const showMessage = (content, type = 'info') => {
    setToastMessage(content);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const message = {
    success: (content) => showMessage(content, 'success'),
    error: (content) => showMessage(content, 'error'),
    info: (content) => showMessage(content, 'info')
  };

  const steps = chatBasedSteps;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toast message={toastMessage} type={toastType} show={showToast} />
      
      <header className="bg-white dark:bg-gray-800 shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">EinoDevOps助手</h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-2">从想法到上线的全流程支持</p>
            </div>
            <button 
              onClick={handleOpenSettings}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              项目设置
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center mx-4 first:ml-0 last:mr-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`text-sm mt-2 whitespace-nowrap ${
                  index === currentStep ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mt-5 ${
                    index < currentStep ? 'bg-green-500' :
                    'bg-gray-200 dark:bg-gray-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          {steps[currentStep].content}
        </div>
      </div>
      
      <ProjectSettingsModal 
        visible={settingsModalVisible} 
        onClose={handleCloseSettings} 
        projectData={{
          name: requirements.projectName || "抖音AI分身",
          description: requirements.description || "基于抖音视频内容的AI问答助手",
          id: "douyin-ai-avatar-" + Math.floor(Math.random() * 10000)
        }}
      />
    </div>
  );
};

export default OnboardingPage;
