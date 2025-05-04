import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取引导状态
 * @returns {Promise<Object>} 引导状态
 */
export const getOnboardingStatus = async () => {
  try {
    const response = await apiClient.get('/api/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('获取引导状态失败:', error);
    throw error;
  }
};

/**
 * 开始引导过程
 * @returns {Promise<Object>} 引导初始化结果
 */
export const startOnboarding = async () => {
  try {
    const response = await apiClient.post('/api/onboarding/start');
    return response.data;
  } catch (error) {
    console.error('开始引导过程失败:', error);
    throw error;
  }
};

/**
 * 发送消息
 * @param {string} message 用户消息
 * @param {Array} chatHistory 聊天历史
 * @returns {Promise<Object>} 助手响应
 */
export const sendMessage = async (message, chatHistory) => {
  try {
    const messages = chatHistory ? 
      [...chatHistory, { role: 'user', content: message }] : 
      [{ role: 'user', content: message }];
    
    const response = await apiClient.post('/api/onboarding/message', {
      messages,
      stage: 'initial'
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
};

/**
 * 分析需求
 * @param {Array} messages 聊天消息数组
 * @returns {Promise<Object>} 分析结果
 */
export const analyzeRequirements = async (messages) => {
  try {
    const messageArray = Array.isArray(messages) 
      ? messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      : [];
    
    const response = await apiClient.post('/api/onboarding/analyze-requirements', messageArray);
    return response.data;
  } catch (error) {
    console.error('分析需求失败:', error);
    throw error;
  }
};

/**
 * 澄清需求
 * @param {Object} data 包含聊天历史和反思数据的对象
 * @returns {Promise<Object>} 澄清结果
 */
export const clarifyRequirements = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/clarify-requirements', data);
    return response.data;
  } catch (error) {
    console.error('澄清需求失败:', error);
    throw error;
  }
};

/**
 * 回答澄清问题
 * @param {Object} data 包含问题ID、回答和澄清数据的对象
 * @returns {Promise<Object>} 回答结果
 */
export const answerQuestion = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/answer-question', data);
    return response.data;
  } catch (error) {
    console.error('回答问题失败:', error);
    throw error;
  }
};

/**
 * 添加需求点
 * @param {Object} data 包含需求点和澄清数据的对象
 * @returns {Promise<Object>} 添加结果
 */
export const addRequirement = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/add-requirement', data);
    return response.data;
  } catch (error) {
    console.error('添加需求点失败:', error);
    throw error;
  }
};

/**
 * 转换为AI描述
 * @param {Object} data 包含需求和澄清数据的对象
 * @returns {Promise<Object>} AI描述
 */
export const convertToAIDescription = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/convert-to-ai-description', data);
    return response.data;
  } catch (error) {
    console.error('转换为AI描述失败:', error);
    throw error;
  }
};

/**
 * 获取DevOps推荐方案
 * @param {Object} data 包含AI描述和需求的对象
 * @returns {Promise<Object>} DevOps推荐方案
 */
export const getDevOpsRecommendations = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/get-devops-recommendations', data);
    return response.data;
  } catch (error) {
    console.error('获取DevOps推荐方案失败:', error);
    throw error;
  }
};

/**
 * 获取知识建议
 * @param {Object} data 包含需求和DevOps推荐的对象
 * @returns {Promise<Object>} 知识建议
 */
export const getKnowledgeSuggestions = async (data) => {
  try {
    const response = await apiClient.post('/api/onboarding/get-knowledge-suggestions', data);
    return response.data;
  } catch (error) {
    console.error('获取知识建议失败:', error);
    throw error;
  }
};

/**
 * 提交需求表单
 * @param {Object} formData 表单数据
 * @returns {Promise<Object>} 提交结果
 */
export const submitRequirements = async (formData) => {
  try {
    const response = await apiClient.post('/api/onboarding/submit', formData);
    return response.data;
  } catch (error) {
    console.error('提交需求失败:', error);
    throw error;
  }
};

/**
 * 生成项目方案
 * @param {Object} requirements 需求数据
 * @returns {Promise<Object>} 项目方案
 */
export const generateProjectPlan = async (requirements) => {
  try {
    const response = await apiClient.post('/api/onboarding/generate-plan', {
      requirements,
    });
    return response.data;
  } catch (error) {
    console.error('生成项目方案失败:', error);
    throw error;
  }
};
