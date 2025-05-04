import React, { useState } from 'react';
import { Card, Typography, List, Tag, Button, Divider, Spin, Alert, Space } from 'antd';
import '../styles/ReflectionComponent.css';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ReflectionComponent = ({ reflectionData, loading, onConfirm, onRequestChanges }) => {
  const [expandedSections, setExpandedSections] = useState({
    businessValue: false,
    technicalFeasibility: false,
    challenges: false,
    improvements: false
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  if (loading) {
    return (
      <div className="reflection-loading">
        <Spin size="large" />
        <Paragraph className="mt-4">
          正在进行项目反思分析，请稍候...
        </Paragraph>
      </div>
    );
  }

  if (!reflectionData) {
    return (
      <Alert
        message="反思数据不可用"
        description="无法获取项目反思数据，请重试或联系支持团队。"
        type="error"
        showIcon
      />
    );
  }

  const { businessValue, technicalFeasibility, potentialChallenges, suggestedImprovements } = reflectionData;

  return (
    <div className="reflection-container">
      <Card className="reflection-card">
        <Title level={3} className="text-center mb-6">项目反思分析</Title>
        <Paragraph className="text-center text-gray-500 mb-8">
          以下是基于您提供的项目信息进行的反思分析，请仔细审阅并确认或提出修改意见。
        </Paragraph>

        <div className="reflection-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('businessValue')}
          >
            <Title level={4}>
              <span className="text-primary-dark">业务价值评估</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.businessValue ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.businessValue && (
            <div className="section-content">
              <Paragraph>
                {businessValue}
              </Paragraph>
            </div>
          )}
        </div>

        <Divider />

        <div className="reflection-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('technicalFeasibility')}
          >
            <Title level={4}>
              <span className="text-primary-dark">技术可行性分析</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.technicalFeasibility ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.technicalFeasibility && (
            <div className="section-content">
              <Paragraph>
                {technicalFeasibility}
              </Paragraph>
            </div>
          )}
        </div>

        <Divider />

        <div className="reflection-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('challenges')}
          >
            <Title level={4}>
              <span className="text-primary-dark">潜在挑战</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.challenges ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.challenges && (
            <div className="section-content">
              <List
                dataSource={potentialChallenges}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                      title={`挑战 ${index + 1}`}
                      description={item}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>

        <Divider />

        <div className="reflection-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('improvements')}
          >
            <Title level={4}>
              <span className="text-primary-dark">改进建议</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.improvements ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.improvements && (
            <div className="section-content">
              <List
                dataSource={suggestedImprovements}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<BulbOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                      title={`建议 ${index + 1}`}
                      description={item}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>

        <div className="reflection-actions">
          <Space size="large">
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              size="large"
              onClick={onConfirm}
            >
              确认反思结果
            </Button>
            <Button 
              danger
              icon={<CloseCircleOutlined />} 
              size="large"
              onClick={onRequestChanges}
            >
              请求修改
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ReflectionComponent;
