import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { analyzeRequirements } from '../api/onboarding';
import { Button, Tooltip, Badge, Dropdown, Menu, Spin, Alert } from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import '../styles/enhanced-components.css';

const EnhancedChatInterface = ({ chatHistory, setChatHistory, onComplete, loading, setLoading, onboardingStage }) => {
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
  const [showSettings, setShowSettings] = useState(false);

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
  
  const settingsMenu = (
    <Menu>
      <Menu.Item key="1" onClick={toggleTheme}>
        {themeMode === 'dark' ? (
          <span className="flex items-center">
            <SunOutlined className="mr-2" />
            切换到亮色模式
          </span>
        ) : (
          <span className="flex items-center">
            <MoonOutlined className="mr-2" />
            切换到暗色模式
          </span>
        )}
      </Menu.Item>
      <Menu.Item key="2">
        <span className="flex items-center">
          <InfoCircleOutlined className="mr-2" />
          关于EinoDevOps助手
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="enhanced-chat-container max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
      {/* Header */}
      <div className="enhanced-chat-header flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
            <RobotOutlined className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">EinoDevOps助手</h1>
            <p className="text-xs text-blue-100">从想法到实现的全流程支持</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge status="success" text={<span className="text-white">在线</span>} />
          <Dropdown overlay={settingsMenu} placement="bottomRight" trigger={['click']}>
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              className="text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
            />
          </Dropdown>
        </div>
      </div>

      {/* Messages Container */}
      <div className="enhanced-chat-messages h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`enhanced-message flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {msg.role !== 'user' && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <RobotOutlined className="text-lg" />
                </div>
              </div>
            )}
            
            <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-md ${
              msg.role === 'user' 
                ? 'enhanced-user-message' 
                : 'enhanced-assistant-message'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <UserOutlined className="text-lg" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isComponentLoading && (
          <div className="enhanced-message flex mb-4 justify-start animate-fadeIn">
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <RobotOutlined className="text-lg" />
              </div>
            </div>
            <div className="enhanced-assistant-message max-w-[70%] rounded-2xl px-5 py-3 shadow-md">
              <Spin 
                indicator={
                  <LoadingOutlined style={{ fontSize: 24 }} spin />
                } 
                className="flex justify-center"
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex mb-4 justify-center">
            <Alert
              message="发生错误"
              description={error}
              type="error"
              showIcon
              className="max-w-[80%] animate-fadeIn"
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <div className="enhanced-chat-input p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="enhanced-input w-full px-5 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
              placeholder="请输入您的想法或需求..."
              value={input}
              onChange={handleInputChange}
              disabled={isComponentLoading || conversationComplete}
              autoFocus
            />
            <Tooltip title="发送消息">
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                disabled={!input.trim() || isComponentLoading || conversationComplete}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-300 hover:scale-110"
              />
            </Tooltip>
          </div>
          
          {!conversationComplete && (
            <Tooltip title="完成对话并生成方案">
              <Button
                type="primary"
                onClick={handleManualComplete}
                className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 border-0 rounded-full px-6 py-2 h-auto transition-all duration-300 transform hover:scale-105"
                icon={<CheckCircleOutlined />}
              >
                完成对话
              </Button>
            </Tooltip>
          )}
        </form>
      </div>
    </div>
  );
};

EnhancedChatInterface.defaultProps = {
  chatHistory: [],
  setChatHistory: null,
  loading: undefined,
  setLoading: null
};

export default EnhancedChatInterface;
