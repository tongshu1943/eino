import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { analyzeRequirements } from '../api/onboarding';

const ChatInterface = ({ chatHistory, setChatHistory, onComplete, loading, setLoading, onboardingStage }) => {
  const messagesEndRef = useRef(null);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const initialMessages = chatHistory.length > 0 
      ? chatHistory.map((msg, index) => ({
          id: `msg-${index}`,
          role: msg.role,
          content: msg.content
        }))
      : [
          {
            id: '1',
            role: 'assistant',
            content: '您好！我是EinoDevOps助手，可以帮助您将想法转化为可实现的项目。请告诉我您的项目想法或需求，我们一起来探讨如何实现它。'
          }
        ];
    
    setMessages(initialMessages);
  }, [chatHistory]);

  const sendMessage = async (userMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage
      };
      
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      
      const response = await axios.post('http://localhost:3003/api/onboarding/message', {
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stage: onboardingStage || 'initial'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.choices && response.data.choices[0] && response.data.choices[0].message 
            ? response.data.choices[0].message.content 
            : (response.data.message || '抱歉，我无法理解您的请求。')
        };
        
        const newMessages = [...updatedMessages, assistantMsg];
        setMessages(newMessages);
        
        if (setChatHistory) {
          const updatedHistory = newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          setChatHistory(updatedHistory);
        }
        
        if ((response.data.shouldComplete || 
             (response.data.choices && response.data.choices[0] && response.data.choices[0].finish_reason === 'stop')) 
            && !conversationComplete) {
          try {
            if (setLoading) setLoading(true);
            const analysisResponse = await analyzeRequirements(newMessages);
            setConversationComplete(true);
            setTimeout(() => {
              onComplete(newMessages, analysisResponse.extractedRequirements);
            }, 2000);
            if (setLoading) setLoading(false);
          } catch (error) {
            console.error('分析需求失败:', error);
            if (setLoading) setLoading(false);
          }
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('发送消息失败:', err);
      setError(err.message || '发送消息失败');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || conversationComplete) return;
    
    if (setLoading) setLoading(true);
    sendMessage(input);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    localStorage.theme = newTheme;
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleManualComplete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const extractedRequirements = {
        projectName: '抖音AI分身',
        description: '根据发布的视频回答用户问题',
        businessGoals: '提升用户互动体验，增加用户粘性和停留时间',
        targetUsers: '抖音普通用户',
        keyFeatures: [
          '视频内容理解',
          '智能问答生成',
          '个性化回复定制',
          '运营数据监控'
        ]
      };
      
      const systemMsg = {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: '感谢您的信息！我已经收集到足够的需求，现在将为您生成项目方案。'
      };
      
      const updatedMessages = [...messages, systemMsg];
      setMessages(updatedMessages);
      
      if (setChatHistory) {
        const updatedHistory = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        setChatHistory(updatedHistory);
      }
      
      setConversationComplete(true);
      setTimeout(() => {
        onComplete(updatedMessages, extractedRequirements);
      }, 1000);
    } catch (err) {
      console.error('完成对话失败:', err);
      setError(err.message || '完成对话失败');
    } finally {
      setIsLoading(false);
    }
  };

  const isComponentLoading = loading !== undefined ? loading : isLoading;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="flex items-center space-x-2">
          <i className="fas fa-robot text-xl"></i>
          <h1 className="text-xl font-bold">EinoDevOps助手</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors duration-200"
          aria-label={themeMode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {themeMode === 'dark' ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>
      </div>

      {/* Messages Container */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <i className="fas fa-robot"></i>
                </div>
              </div>
            )}
            
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <i className="fas fa-user"></i>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isComponentLoading && (
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
      
      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            placeholder="请输入您的想法或需求..."
            value={input}
            onChange={handleInputChange}
            disabled={isComponentLoading || conversationComplete}
            autoFocus
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              !input.trim() || isComponentLoading || conversationComplete
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
            }`}
            disabled={!input.trim() || isComponentLoading || conversationComplete}
          >
            {isComponentLoading ? (
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
          
          {!conversationComplete && (
            <button
              type="button"
              onClick={handleManualComplete}
              className="px-4 py-2 rounded-lg transition-colors duration-200 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              完成对话
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

ChatInterface.defaultProps = {
  chatHistory: [],
  setChatHistory: null,
  loading: undefined,
  setLoading: null
};

export default ChatInterface;
