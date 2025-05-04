import React, { useState, useEffect } from 'react';
import { Card, Tabs, Collapse, Typography, Tag, List, Divider, Button, Spin, Alert, Space } from 'antd';
import { CodeOutlined, ApiOutlined, RocketOutlined, ToolOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import '../styles/DevOpsRecommendationComponent.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const DevOpsRecommendationComponent = ({ recommendation, loading, onNext, onPrevious }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [processedRecommendation, setProcessedRecommendation] = useState(null);

  useEffect(() => {
    if (recommendation) {
      const safeRecommendation = {
        architecture: typeof recommendation.architecture === 'object' 
          ? JSON.stringify(recommendation.architecture) 
          : recommendation.architecture || '基于微服务架构的DevOps平台',
        
        architectureDiagram: recommendation.architectureDiagram || '架构图占位符',
        
        techStack: Array.isArray(recommendation.techStack) 
          ? recommendation.techStack 
          : ['React', 'CloudWeGo Eino', 'CloudWeGo Kitex'],
        
        cloudWeGoComponents: Array.isArray(recommendation.cloudWeGoComponents) 
          ? recommendation.cloudWeGoComponents 
          : [],
        
        pipelineConfig: recommendation.pipelineConfig || '流水线配置占位符',
        
        stages: Array.isArray(recommendation.stages) 
          ? recommendation.stages 
          : [],
        
        toolRecommendations: Array.isArray(recommendation.toolRecommendations) 
          ? recommendation.toolRecommendations 
          : [],
        
        bestPractices: Array.isArray(recommendation.bestPractices) 
          ? recommendation.bestPractices 
          : []
      };
      
      setProcessedRecommendation(safeRecommendation);
    }
  }, [recommendation]);

  if (loading) {
    return (
      <div className="devops-loading">
        <Spin size="large" />
        <Paragraph className="loading-text">
          正在生成DevOps推荐方案，请稍候...
        </Paragraph>
      </div>
    );
  }

  if (!recommendation || !processedRecommendation) {
    return (
      <Alert
        message="暂无推荐方案"
        description="系统尚未生成DevOps推荐方案，请先完成需求澄清和AI描述转换步骤。"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="devops-container">
      <Card className="devops-card">
        <Title level={3} className="card-title">
          <RocketOutlined /> DevOps推荐方案
        </Title>
        <Paragraph className="card-description">
          基于您的需求，我们为您推荐以下DevOps方案，包括架构设计、技术栈、流水线配置和最佳实践。
        </Paragraph>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="devops-tabs">
          <TabPane 
            tab={<span><ApiOutlined /> 架构推荐</span>} 
            key="1"
          >
            <div className="architecture-section">
              <Title level={4}>{processedRecommendation.architecture}</Title>
              <div className="architecture-diagram">
                <pre>{processedRecommendation.architectureDiagram}</pre>
              </div>
              <Divider orientation="left">技术栈</Divider>
              <div className="tech-stack">
                {processedRecommendation.techStack && processedRecommendation.techStack.map((tech, index) => (
                  <Tag key={index} color="blue">{tech}</Tag>
                ))}
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><CodeOutlined /> CloudWeGo组件</span>} 
            key="2"
          >
            <List
              itemLayout="vertical"
              dataSource={processedRecommendation.cloudWeGoComponents || []}
              renderItem={item => (
                <List.Item
                  key={item.name}
                  className="component-item"
                  extra={
                    <Button type="link" href={item.url} target="_blank">
                      <CodeOutlined /> 查看源码
                    </Button>
                  }
                >
                  <List.Item.Meta
                    title={<Text strong>{item.name}</Text>}
                    description={item.description}
                  />
                  <div className="component-details">
                    <Paragraph><Text strong>用途：</Text>{item.usage}</Paragraph>
                    <div className="component-benefits">
                      <Text strong>优势：</Text>
                      {item.benefits && item.benefits.map((benefit, index) => (
                        <Tag key={index} color="green">{benefit}</Tag>
                      ))}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><RocketOutlined /> 流水线配置</span>} 
            key="3"
          >
            <div className="pipeline-section">
              <Collapse defaultActiveKey={['1']} className="pipeline-collapse">
                <Panel header="流水线配置代码" key="1">
                  <pre className="pipeline-code">{processedRecommendation.pipelineConfig}</pre>
                  <Button type="primary" icon={<DownloadOutlined />} className="download-button">
                    下载配置
                  </Button>
                </Panel>
              </Collapse>
              
              <Divider orientation="left">流水线阶段</Divider>
              <List
                itemLayout="horizontal"
                dataSource={processedRecommendation.stages || []}
                renderItem={(stage, index) => (
                  <List.Item className="stage-item">
                    <List.Item.Meta
                      avatar={<div className="stage-number">{index + 1}</div>}
                      title={stage.name}
                      description={stage.description}
                    />
                    <div className="stage-tools">
                      {stage.tools && stage.tools.map((tool, idx) => (
                        <Tag key={idx} color="purple">{tool}</Tag>
                      ))}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><ToolOutlined /> 工具推荐</span>} 
            key="4"
          >
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={processedRecommendation.toolRecommendations || []}
              renderItem={item => (
                <List.Item>
                  <Card className="tool-card">
                    <Title level={5}>{item.name}</Title>
                    <Paragraph>{item.description}</Paragraph>
                    <Divider />
                    <Paragraph><Text strong>用途：</Text>{item.usage}</Paragraph>
                    <div className="tool-benefits">
                      <Text strong>优势：</Text>
                      <div>
                        {item.benefits && item.benefits.map((benefit, index) => (
                          <Tag key={index} color="cyan">{benefit}</Tag>
                        ))}
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><CheckCircleOutlined /> 最佳实践</span>} 
            key="5"
          >
            <List
              dataSource={processedRecommendation.bestPractices || []}
              renderItem={(practice, index) => (
                <List.Item className="practice-item">
                  <Text>{index + 1}. {practice}</Text>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>

        <div className="devops-actions">
          <Space>
            <Button onClick={onPrevious}>上一步</Button>
            <Button type="primary" onClick={onNext}>下一步</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default DevOpsRecommendationComponent;
