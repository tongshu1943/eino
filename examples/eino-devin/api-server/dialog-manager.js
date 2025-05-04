/**
 * 对话管理器
 * 负责维护对话历史、跟踪当前阶段和管理上下文信息
 */
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const Stage = {
  INITIAL: 'initial',
  REQUIREMENT: 'requirement',
  REFLECTION: 'reflection',
  CLARIFICATION: 'clarification',
  CONFIRMATION: 'confirmation',
  AI_DESCRIPTION: 'ai_description',
  DEVOPS: 'devops',
  KNOWLEDGE: 'knowledge',
  SOLUTION: 'solution'
};

class DialogManager {
  constructor(sessionId = null) {
    this.sessionId = sessionId || uuidv4();
    this.history = [];
    this.currentStage = Stage.INITIAL;
    this.stageData = {
      [Stage.INITIAL]: {},
      [Stage.REQUIREMENT]: {},
      [Stage.REFLECTION]: {},
      [Stage.CLARIFICATION]: {},
      [Stage.CONFIRMATION]: {},
      [Stage.AI_DESCRIPTION]: {},
      [Stage.DEVOPS]: {},
      [Stage.KNOWLEDGE]: {},
      [Stage.SOLUTION]: {}
    };
    this.userInfo = {};
    this.requirements = {};
    this.lastUpdated = new Date();
  }

  addMessage(role, content, type = 'text', metadata = {}) {
    const message = {
      id: uuidv4(),
      role,
      type,
      content,
      timestamp: new Date(),
      metadata
    };
    this.history.push(message);
    this.lastUpdated = new Date();
    return message;
  }

  setStage(stage) {
    this.currentStage = stage;
    this.lastUpdated = new Date();
    console.log(`对话阶段变更为: ${stage}`);
  }

  setStageData(stage, data) {
    this.stageData[stage] = { ...this.stageData[stage], ...data };
    this.lastUpdated = new Date();
  }

  getStageData(stage) {
    return this.stageData[stage] || {};
  }

  getCurrentStageData() {
    return this.getStageData(this.currentStage);
  }

  async save() {
    try {
      const sessionsDir = path.join(__dirname, 'sessions', this.sessionId);
      await fs.mkdir(sessionsDir, { recursive: true });
      
      await fs.writeFile(
        path.join(sessionsDir, 'metadata.json'),
        JSON.stringify({
          sessionId: this.sessionId,
          currentStage: this.currentStage,
          userInfo: this.userInfo,
          requirements: this.requirements,
          lastUpdated: new Date()
        }, null, 2)
      );
      
      await fs.writeFile(
        path.join(sessionsDir, 'messages.json'),
        JSON.stringify(this.history, null, 2)
      );
      
      await fs.writeFile(
        path.join(sessionsDir, 'stage_data.json'),
        JSON.stringify(this.stageData, null, 2)
      );
      
      this.lastUpdated = new Date();
      console.log(`会话 ${this.sessionId} 已保存`);
    } catch (error) {
      console.error('保存会话失败:', error);
    }
  }
  
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      currentStage: this.currentStage,
      lastUpdated: this.lastUpdated,
      messageCount: this.history.length,
      stageData: this.stageData
    };
  }

  static async load(sessionId) {
    try {
      const sessionsDir = path.join(__dirname, 'sessions', sessionId);
      
      const metadata = JSON.parse(
        await fs.readFile(path.join(sessionsDir, 'metadata.json'), 'utf8')
      );
      
      const messages = JSON.parse(
        await fs.readFile(path.join(sessionsDir, 'messages.json'), 'utf8')
      );
      
      const stageData = JSON.parse(
        await fs.readFile(path.join(sessionsDir, 'stage_data.json'), 'utf8')
      );
      
      const manager = new DialogManager(sessionId);
      manager.currentStage = metadata.currentStage;
      manager.userInfo = metadata.userInfo;
      manager.requirements = metadata.requirements;
      manager.history = messages;
      manager.stageData = stageData;
      manager.lastUpdated = new Date(metadata.lastUpdated);
      
      console.log(`会话 ${sessionId} 已加载`);
      return manager;
    } catch (error) {
      console.error('加载会话失败:', error);
      return null;
    }
  }
}

module.exports = {
  DialogManager,
  Stage
};
