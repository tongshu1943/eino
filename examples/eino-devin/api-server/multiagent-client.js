const axios = require('axios');

class MultiAgentClient {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async processMultiAgent(input, workflowName, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/multiagent/process`, {
        input,
        workflow_name: workflowName,
        context
      });
      
      return response.data;
    } catch (error) {
      console.error('处理多智能体请求失败:', error);
      throw error;
    }
  }

  async getWorkflows() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/multiagent/workflows`);
      return response.data.workflows;
    } catch (error) {
      console.error('获取工作流失败:', error);
      throw error;
    }
  }

  async getRoles() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/multiagent/roles`);
      return response.data.roles;
    } catch (error) {
      console.error('获取角色失败:', error);
      throw error;
    }
  }

  async processAgent(role, input, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/multiagent/agent/${role}`, {
        input,
        context
      });
      
      return response.data;
    } catch (error) {
      console.error(`处理${role}智能体请求失败:`, error);
      throw error;
    }
  }
}

module.exports = MultiAgentClient;
