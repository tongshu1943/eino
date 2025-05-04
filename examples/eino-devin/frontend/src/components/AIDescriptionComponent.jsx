import React, { useState } from 'react';
import { Card, Typography, Button, Spin, Alert, Tabs, Space, Divider, Tag } from 'antd';
import { RobotOutlined, CodeOutlined, SettingOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import '../styles/AIDescriptionComponent.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const AIDescriptionComponent = ({ aiDescription, loading, onConfirm, onEdit }) => {
  const [activeTab, setActiveTab] = useState('1');

  if (loading) {
    return (
      <div className="ai-description-loading">
        <Spin size="large" />
        <Paragraph className="loading-text">
          正在生成AI描述，请稍候...
        </Paragraph>
      </div>
    );
  }

  if (!aiDescription) {
    return (
      <Alert
        message="暂无AI描述"
        description="系统尚未生成AI描述，请先完成需求澄清步骤。"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="ai-description-container">
      <Card className="ai-description-card">
        <Title level={3} className="card-title">
          <RobotOutlined /> AI描述转换
        </Title>
        <Paragraph className="card-description">
          我们已将您的需求转换为面向AI的任务描述，这将帮助AI更好地理解您的需求并生成符合要求的代码。
        </Paragraph>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="ai-description-tabs">
          <TabPane 
            tab={<span><RobotOutlined /> AI任务描述</span>} 
            key="1"
          >
            <div className="description-section">
              <Paragraph className="description-box">
                {aiDescription.aiTaskDescription || "正在生成AI任务描述..."}
              </Paragraph>
              <div className="section-actions">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit && onEdit('aiTaskDescription')}
                >
                  编辑
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><SettingOutlined /> 系统提示词</span>} 
            key="2"
          >
            <div className="description-section">
              <Paragraph className="description-box">
                {aiDescription.systemPrompt || "正在生成系统提示词..."}
              </Paragraph>
              <div className="section-actions">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit && onEdit('systemPrompt')}
                >
                  编辑
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><CodeOutlined /> 用户提示词</span>} 
            key="3"
          >
            <div className="description-section">
              <Paragraph className="description-box">
                {aiDescription.userPrompt || "正在生成用户提示词..."}
              </Paragraph>
              <div className="section-actions">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit && onEdit('userPrompt')}
                >
                  编辑
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><SettingOutlined /> 约束条件</span>} 
            key="4"
          >
            <div className="description-section">
              <div className="description-box">
                {aiDescription.constraints && aiDescription.constraints.length > 0 ? (
                  <ul className="constraint-list">
                    {aiDescription.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                ) : (
                  <Paragraph>正在生成约束条件...</Paragraph>
                )}
              </div>
              <div className="section-actions">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit && onEdit('constraints')}
                >
                  编辑
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><CheckCircleOutlined /> 评估标准</span>} 
            key="5"
          >
            <div className="description-section">
              <div className="description-box">
                {aiDescription.evaluationCriteria && aiDescription.evaluationCriteria.length > 0 ? (
                  <ul className="criteria-list">
                    {aiDescription.evaluationCriteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                ) : (
                  <Paragraph>正在生成评估标准...</Paragraph>
                )}
              </div>
              <div className="section-actions">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit && onEdit('evaluationCriteria')}
                >
                  编辑
                </Button>
              </div>
            </div>
          </TabPane>
        </Tabs>

        <Divider />
        
        <div className="ai-description-summary">
          <Title level={4}>AI描述总结</Title>
          <Paragraph>
            我们已将您的需求转换为AI可理解的格式，包括任务描述、系统提示词、用户提示词、约束条件和评估标准。
            这些描述将指导AI生成符合您需求的代码和解决方案。
          </Paragraph>
          <div className="summary-tags">
            <Tag color="blue">AI任务描述</Tag>
            <Tag color="green">系统提示词</Tag>
            <Tag color="purple">用户提示词</Tag>
            <Tag color="orange">约束条件</Tag>
            <Tag color="cyan">评估标准</Tag>
          </div>
        </div>

        <div className="ai-description-actions">
          <Space>
            <Button onClick={() => onEdit && onEdit('all')}>编辑全部</Button>
            <Button type="primary" onClick={onConfirm}>确认并继续</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default AIDescriptionComponent;
