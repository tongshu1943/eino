import React, { useState } from 'react';
import { CodeBlock, atomOneDark } from 'react-code-blocks';
import ReactMarkdown from 'react-markdown';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-3 px-4 text-left font-medium focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-800 dark:text-gray-200">{title}</span>
        <i className={`fas fa-chevron-down text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  QUESTION: 'question',
  REFLECTION: 'reflection',
  CLARIFICATION: 'clarification',
  CONFIRMATION: 'confirmation',
  AI_DESCRIPTION: 'ai_description',
  DEVOPS_RECOMMENDATION: 'devops_recommendation',
  KNOWLEDGE_SUGGESTION: 'knowledge_suggestion',
  SOLUTION: 'solution',
  CODE: 'code',
  ERROR: 'error'
};

const ChatMessage = ({ message, onAction }) => {
  const { type = MESSAGE_TYPES.TEXT, content, metadata = {} } = message;

  const renderCode = (code, language = 'javascript') => {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden my-4 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-400">{language}</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        <CodeBlock
          text={code}
          language={language}
          showLineNumbers={true}
          theme={atomOneDark}
          wrapLongLines
          customStyle={{
            borderRadius: '0',
            margin: '0',
            padding: '1rem',
            fontSize: '0.875rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }}
        />
      </div>
    );
  };

  const renderQuestion = () => {
    const { question, options = [], allowFreeform = true } = metadata;
    
    return (
      <div className="question-message">
        <p className="font-medium mb-3">{question || content}</p>
        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="py-1">
                <button 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
                  onClick={() => onAction && onAction('answer', { questionId: metadata.id, answer: option.value })}
                >
                  {option.label}
                </button>
              </div>
            ))}
          </div>
        )}
        {allowFreeform && (
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            您也可以直接输入您的回答
          </p>
        )}
      </div>
    );
  };

  const renderReflection = () => {
    const { businessValue, technicalFeasibility, potentialChallenges, suggestedImprovements } = metadata;
    
    return (
      <div className="reflection-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4">
          {businessValue && (
            <Accordion title="业务价值评估" defaultOpen={true}>
              <p className="text-gray-700 dark:text-gray-300">{businessValue}</p>
            </Accordion>
          )}
          
          {technicalFeasibility && (
            <Accordion title="技术可行性分析">
              <p className="text-gray-700 dark:text-gray-300">{technicalFeasibility}</p>
            </Accordion>
          )}
          
          {potentialChallenges && potentialChallenges.length > 0 && (
            <Accordion title="潜在挑战">
              <ul className="space-y-2">
                {potentialChallenges.map((challenge, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <i className="fas fa-exclamation-circle text-yellow-500 mr-2 mt-1"></i>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          
          {suggestedImprovements && suggestedImprovements.length > 0 && (
            <Accordion title="建议改进">
              <ul className="space-y-2">
                {suggestedImprovements.map((improvement, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <i className="fas fa-lightbulb text-blue-500 mr-2 mt-1"></i>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('confirm', { type: 'reflection' })}
          >
            确认
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('requestChanges', { type: 'reflection' })}
          >
            请求修改
          </button>
        </div>
      </div>
    );
  };

  const renderClarification = () => {
    const { questions = [] } = metadata;
    
    return (
      <div className="clarification-message">
        <p className="mb-4 text-gray-700 dark:text-gray-300">{content}</p>
        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-gray-800 dark:text-gray-200 font-medium">{question.question}</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{question.description}</p>
                  {question.answer ? (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full mb-2">已回答</span>
                      <p className="text-gray-700 dark:text-gray-300">{question.answer}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm italic">请在下方输入框回答此问题</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderConfirmation = () => {
    const { 
      projectName, 
      description, 
      targetUsers, 
      keyFeatures = [], 
      technicalStack = [],
      timeline
    } = metadata;
    
    return (
      <div className="confirmation-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-blue-50 dark:bg-blue-900 px-4 py-3 border-b border-blue-100 dark:border-blue-800">
            <h3 className="text-blue-800 dark:text-blue-200 font-medium">需求确认</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {projectName && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">项目名称：</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{projectName}</p>
              </div>
            )}
            
            {description && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">项目描述：</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            )}
            
            {targetUsers && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">目标用户：</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{targetUsers}</p>
              </div>
            )}
            
            {keyFeatures.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">核心功能：</span>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {keyFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {technicalStack.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">技术栈：</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {technicalStack.map((tech, index) => (
                    <span key={index} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {timeline && (
              <div className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">项目周期：</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{timeline}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('confirm', { type: 'requirements' })}
          >
            确认
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('edit', { type: 'requirements' })}
          >
            编辑
          </button>
        </div>
      </div>
    );
  };

  const renderAIDescription = () => {
    return (
      <div className="ai-description-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-purple-50 dark:bg-purple-900 px-4 py-3 border-b border-purple-100 dark:border-purple-800">
            <h3 className="text-purple-800 dark:text-purple-200 font-medium">AI描述</h3>
          </div>
          
          <div className="p-4">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('confirm', { type: 'aiDescription' })}
          >
            确认
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('edit', { type: 'aiDescription' })}
          >
            编辑
          </button>
        </div>
      </div>
    );
  };

  const renderDevOpsRecommendation = () => {
    const { 
      architecture, 
      techStack = {}, 
      cloudWegoComponents = [], 
      pipelineConfig,
      bestPractices = []
    } = metadata;
    
    return (
      <div className="devops-recommendation-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-green-50 dark:bg-green-900 px-4 py-3 border-b border-green-100 dark:border-green-800">
            <h3 className="text-green-800 dark:text-green-200 font-medium">DevOps推荐方案</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {architecture && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">架构推荐</h4>
                <p className="text-gray-700 dark:text-gray-300">{architecture}</p>
              </div>
            )}
            
            {Object.keys(techStack).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">技术栈</h4>
                <div className="space-y-2">
                  {Object.entries(techStack).map(([category, techs], index) => (
                    <div key={index} className="mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{category}：</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(techs) ? techs.join(', ') : techs}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {cloudWegoComponents.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">CloudWeGo组件</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {cloudWegoComponents.map((component, index) => (
                    <li key={index}>{component}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {pipelineConfig && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">流水线配置</h4>
                {renderCode(pipelineConfig, 'yaml')}
              </div>
            )}
            
            {bestPractices.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">最佳实践</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {bestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('confirm', { type: 'devopsRecommendation' })}
          >
            确认
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('edit', { type: 'devopsRecommendation' })}
          >
            编辑
          </button>
        </div>
      </div>
    );
  };

  const renderKnowledgeSuggestion = () => {
    const { 
      resources = [], 
      bestPractices = [], 
      guides = [],
      patterns = []
    } = metadata;
    
    return (
      <div className="knowledge-suggestion-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 px-4 py-3 border-b border-yellow-100 dark:border-yellow-800">
            <h3 className="text-yellow-800 dark:text-yellow-200 font-medium">知识建议</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {resources.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">学习资源</h4>
                <ul className="space-y-2">
                  {resources.map((resource, index) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-external-link-alt text-blue-500 mr-2 mt-1"></i>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {bestPractices.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">最佳实践</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {bestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {guides.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">指南</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {guides.map((guide, index) => (
                    <li key={index}>{guide}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {patterns.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">设计模式</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {patterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('confirm', { type: 'knowledgeSuggestion' })}
          >
            确认
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('search', { type: 'knowledgeSuggestion' })}
          >
            搜索更多
          </button>
        </div>
      </div>
    );
  };

  const renderSolution = () => {
    const { 
      overview, 
      architecture, 
      techStack = [], 
      modules = [],
      timeline = [],
      resources = {}
    } = metadata;
    
    return (
      <div className="solution-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800">
            <h3 className="text-indigo-800 dark:text-indigo-200 font-medium">项目方案</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {overview && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">项目概述</h4>
                <p className="text-gray-700 dark:text-gray-300">{overview}</p>
              </div>
            )}
            
            {architecture && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">架构设计</h4>
                <p className="text-gray-700 dark:text-gray-300">{architecture}</p>
              </div>
            )}
            
            {techStack.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">技术栈</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {techStack.map((tech, index) => (
                    <li key={index}>{tech}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {modules.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">功能模块</h4>
                <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {modules.map((module, index) => (
                    <li key={index}>{module}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {timeline.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">实施计划</h4>
                <ol className="space-y-1 list-decimal list-inside text-gray-600 dark:text-gray-400">
                  {timeline.map((phase, index) => (
                    <li key={index}>{phase}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {Object.keys(resources).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">资源需求</h4>
                <div className="space-y-2">
                  {Object.entries(resources).map(([category, requirement], index) => (
                    <div key={index} className="mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{category}：</span>
                      <span className="text-gray-600 dark:text-gray-400">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('download', { type: 'solution' })}
          >
            <i className="fas fa-download mr-2"></i>
            下载方案
          </button>
          <button 
            className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md transition-colors duration-200"
            onClick={() => onAction && onAction('start', { type: 'implementation' })}
          >
            <i className="fas fa-play mr-2"></i>
            开始实施
          </button>
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className="error-message">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-exclamation-circle text-red-500 dark:text-red-400 mr-3 mt-0.5"></i>
            <p className="text-red-700 dark:text-red-300">{content}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case MESSAGE_TYPES.QUESTION:
        return renderQuestion();
      case MESSAGE_TYPES.REFLECTION:
        return renderReflection();
      case MESSAGE_TYPES.CLARIFICATION:
        return renderClarification();
      case MESSAGE_TYPES.CONFIRMATION:
        return renderConfirmation();
      case MESSAGE_TYPES.AI_DESCRIPTION:
        return renderAIDescription();
      case MESSAGE_TYPES.DEVOPS_RECOMMENDATION:
        return renderDevOpsRecommendation();
      case MESSAGE_TYPES.KNOWLEDGE_SUGGESTION:
        return renderKnowledgeSuggestion();
      case MESSAGE_TYPES.SOLUTION:
        return renderSolution();
      case MESSAGE_TYPES.CODE:
        return renderCode(content, metadata.language);
      case MESSAGE_TYPES.ERROR:
        return renderError();
      case MESSAGE_TYPES.TEXT:
      default:
        return (
          <div className="text-message prose dark:prose-invert max-w-none">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        );
    }
  };

  return (
    <div className="chat-message-content w-full mb-4 animate-fadeIn">
      {renderContent()}
    </div>
  );
};

export default ChatMessage;
