import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import ChatInterface from './ChatInterface';
import ChatMessage from './ChatMessage';

const Toast = ({ message, type, show }) => {
  if (!show) return null;
  
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  'bg-yellow-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
      <i className={`mr-2 ${
        type === 'success' ? 'fas fa-check-circle' : 
        type === 'error' ? 'fas fa-exclamation-circle' : 
        'fas fa-exclamation-triangle'
      }`}></i>
      <span>{message}</span>
    </div>
  );
};

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

const ChatContainer = ({ 
  initialStage = CHAT_STAGES.INITIAL,
  initialMessages = [],
  onStageChange,
  onComplete,
  apiEndpoint = '/api/chat',
  stageData = {}
}) => {
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [stageMessages, setStageMessages] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  
  const showMessage = (content, type = 'info') => {
    setToastMessage(content);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const message = {
    success: (content) => showMessage(content, 'success'),
    error: (content) => showMessage(content, 'error'),
    info: (content) => showMessage(content, 'info'),
    warning: (content) => showMessage(content, 'warning')
  };

  const getDefaultMessages = (stage) => {
    switch (stage) {
      case CHAT_STAGES.INITIAL:
        return [
          {
            id: 'welcome-1',
            role: 'assistant',
            content: '欢迎使用EinoDevOps助手！我是您的AI引导专家，将帮助您将想法转化为可实现的项目。请告诉我您的项目想法是什么？'
          }
        ];
      case CHAT_STAGES.REFLECTION:
        return [
          {
            id: 'reflection-1',
            role: 'assistant',
            content: '感谢您分享您的项目想法！我已经对您的需求进行了分析，下面是我的反思结果：',
            type: 'reflection',
            metadata: stageData.reflectionData || {}
          }
        ];
      case CHAT_STAGES.CLARIFICATION:
        return [
          {
            id: 'clarification-1',
            role: 'assistant',
            content: '为了更好地理解您的需求，我有一些澄清问题需要您回答：',
            type: 'clarification',
            metadata: stageData.clarificationData || {}
          }
        ];
      case CHAT_STAGES.CONFIRMATION:
        return [
          {
            id: 'confirmation-1',
            role: 'assistant',
            content: '根据我们的交流，我总结了以下需求，请确认是否准确：',
            type: 'confirmation',
            metadata: stageData.requirements || {}
          }
        ];
      case CHAT_STAGES.AI_DESCRIPTION:
        return [
          {
            id: 'ai-description-1',
            role: 'assistant',
            content: stageData.aiDescription || '以下是转换后的AI描述，这将用于指导代码生成和DevOps流程：',
            type: 'ai_description',
            metadata: {}
          }
        ];
      case CHAT_STAGES.DEVOPS_RECOMMENDATION:
        return [
          {
            id: 'devops-recommendation-1',
            role: 'assistant',
            content: '基于您的需求，以下是我推荐的DevOps方案：',
            type: 'devops_recommendation',
            metadata: stageData.devopsRecommendation || {}
          }
        ];
      case CHAT_STAGES.KNOWLEDGE_SUGGESTION:
        return [
          {
            id: 'knowledge-suggestion-1',
            role: 'assistant',
            content: '基于您的项目需求，以下是一些相关的知识建议：',
            type: 'knowledge_suggestion',
            metadata: stageData.knowledgeSuggestions || {}
          }
        ];
      case CHAT_STAGES.SOLUTION:
        return [
          {
            id: 'solution-1',
            role: 'assistant',
            content: '基于我们的讨论，我已经生成了完整的项目方案：',
            type: 'solution',
            metadata: stageData.solution || {}
          }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    if (initialMessages.length > 0) {
      setStageMessages({
        ...stageMessages,
        [initialStage]: initialMessages
      });
    }
  }, [initialMessages]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
    setMessages,
    isLoading,
    error,
    append
  } = useChat({
    api: apiEndpoint,
    initialMessages: stageMessages[currentStage] || getDefaultMessages(currentStage),
    body: {
      stage: currentStage,
      stageData: stageData[currentStage] || {}
    },
    onFinish: (message) => {
      setStageMessages({
        ...stageMessages,
        [currentStage]: messages
      });
      
      checkForStageTransition(message);
    }
  });

  const checkForStageTransition = (message) => {
    if (message.content.includes('STAGE_TRANSITION') || message.metadata?.transition) {
      const nextStage = message.metadata?.nextStage || getNextStage(currentStage);
      if (nextStage) {
        transitionToStage(nextStage);
      }
    }
  };

  const getNextStage = (stage) => {
    switch (stage) {
      case CHAT_STAGES.INITIAL:
        return CHAT_STAGES.REQUIREMENT;
      case CHAT_STAGES.REQUIREMENT:
        return CHAT_STAGES.REFLECTION;
      case CHAT_STAGES.REFLECTION:
        return CHAT_STAGES.CLARIFICATION;
      case CHAT_STAGES.CLARIFICATION:
        return CHAT_STAGES.CONFIRMATION;
      case CHAT_STAGES.CONFIRMATION:
        return CHAT_STAGES.AI_DESCRIPTION;
      case CHAT_STAGES.AI_DESCRIPTION:
        return CHAT_STAGES.DEVOPS_RECOMMENDATION;
      case CHAT_STAGES.DEVOPS_RECOMMENDATION:
        return CHAT_STAGES.KNOWLEDGE_SUGGESTION;
      case CHAT_STAGES.KNOWLEDGE_SUGGESTION:
        return CHAT_STAGES.SOLUTION;
      default:
        return null;
    }
  };

  const transitionToStage = (stage) => {
    setIsTransitioning(true);
    
    setStageMessages({
      ...stageMessages,
      [currentStage]: messages
    });
    
    if (onStageChange) {
      onStageChange(currentStage, stage, messages);
    }
    
    setTimeout(() => {
      setCurrentStage(stage);
      
      const newStageMessages = stageMessages[stage] || getDefaultMessages(stage);
      setMessages(newStageMessages);
      
      setIsTransitioning(false);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    aiHandleSubmit(e);
  };

  const handleMessageAction = (action, data) => {
    switch (action) {
      case 'confirm':
        handleConfirmAction(data);
        break;
      case 'edit':
        handleEditAction(data);
        break;
      case 'answer':
        handleAnswerAction(data);
        break;
      case 'search':
        handleSearchAction(data);
        break;
      case 'download':
        handleDownloadAction(data);
        break;
      case 'start':
        handleStartAction(data);
        break;
      default:
        console.log('未知操作:', action, data);
    }
  };

  const handleConfirmAction = (data) => {
    const { type } = data;
    
    append({
      role: 'user',
      content: `我确认${type === 'reflection' ? '反思结果' : 
                type === 'requirements' ? '需求' : 
                type === 'aiDescription' ? 'AI描述' : 
                type === 'devopsRecommendation' ? 'DevOps推荐方案' : 
                type === 'knowledgeSuggestion' ? '知识建议' : ''}`,
    });
    
    setTimeout(() => {
      const nextStage = getNextStage(currentStage);
      if (nextStage) {
        transitionToStage(nextStage);
      } else if (onComplete) {
        onComplete(stageMessages);
      }
    }, 1000);
  };

  const handleEditAction = (data) => {
    message.info('请在聊天中告诉我您想要修改的内容');
  };

  const handleAnswerAction = (data) => {
    const { questionId, answer } = data;
    append({
      role: 'user',
      content: answer,
      metadata: { questionId }
    });
  };

  const handleSearchAction = (data) => {
    message.info('正在搜索更多知识资源...');
  };

  const handleDownloadAction = (data) => {
    message.success('正在准备下载方案文档...');
  };

  const handleStartAction = (data) => {
    message.success('正在准备开始实施...');
    if (onComplete) {
      onComplete(stageMessages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isUser = msg.role === 'user';
      
      return (
        <div
          key={msg.id || `msg-${index}`}
          className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isUser && (
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <i className="fas fa-robot"></i>
              </div>
            </div>
          )}
          
          <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white rounded-tr-none' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
          }`}>
            {msg.type ? (
              <ChatMessage 
                message={msg} 
                onAction={handleMessageAction}
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {msg.content}
              </div>
            )}
          </div>
          
          {isUser && (
            <div className="flex-shrink-0 ml-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                <i className="fas fa-user"></i>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      <Toast message={toastMessage} type={toastType} show={showToast} />
      
      <div className="h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {renderMessages()}
        
        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <i className="fas fa-robot"></i>
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex mb-4 justify-center">
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">
              <p>发生错误: {error.message}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="请输入您的回复..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading || isTransitioning}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              !input.trim() || isLoading || isTransitioning
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
            }`}
            disabled={!input.trim() || isLoading || isTransitioning}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>发送</span>
                <i className="fas fa-paper-plane ml-2"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
