import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Input, Button, Divider, Spin, Alert, Space, Tag, Collapse } from 'antd';
import '../styles/ClarificationComponent.css';
import { QuestionCircleOutlined, CheckCircleOutlined, EditOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const ClarificationComponent = ({ 
  clarificationData, 
  loading, 
  onAnswerQuestion, 
  onConfirmRequirements,
  onAddRequirement 
}) => {
  const [answers, setAnswers] = useState({});
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    questions: true,
    requirements: true,
    functionalScope: false,
    nonFunctionalRequirements: false
  });

  useEffect(() => {
    if (clarificationData?.questions) {
      const initialAnswers = {};
      clarificationData.questions.forEach(q => {
        initialAnswers[q.id] = q.answer || '';
      });
      setAnswers(initialAnswers);
    }
  }, [clarificationData]);

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmitAnswer = (questionId) => {
    if (answers[questionId] && answers[questionId].trim() !== '') {
      onAnswerQuestion(questionId, answers[questionId]);
    }
  };

  const handleEditRequirement = (index) => {
    setEditingRequirement(index);
  };

  const handleSaveRequirement = (index) => {
    setEditingRequirement(null);
  };

  const handleAddRequirement = () => {
    if (newRequirementText.trim() !== '') {
      onAddRequirement(newRequirementText);
      setNewRequirementText('');
    }
  };

  if (loading) {
    return (
      <div className="clarification-loading">
        <Spin size="large" />
        <Paragraph className="mt-4">
          正在进行需求澄清分析，请稍候...
        </Paragraph>
      </div>
    );
  }

  if (!clarificationData) {
    return (
      <Alert
        message="需求澄清数据不可用"
        description="无法获取需求澄清数据，请重试或联系支持团队。"
        type="error"
        showIcon
      />
    );
  }

  const { questions, requirementPoints, functionalScope, nonFunctionalRequirements } = clarificationData;

  const allQuestionsAnswered = questions && questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  return (
    <div className="clarification-container">
      <Card className="clarification-card">
        <Title level={3} className="text-center mb-6">需求澄清</Title>
        <Paragraph className="text-center text-gray-500 mb-8">
          请回答以下问题，帮助我们更好地理解您的需求。您的回答将用于生成更准确的项目方案。
        </Paragraph>

        <div className="clarification-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('questions')}
          >
            <Title level={4}>
              <span className="text-primary-dark">关键问题</span>
              {!allQuestionsAnswered && (
                <Tag color="warning" className="ml-2">需要回答</Tag>
              )}
            </Title>
            <Text className="expand-toggle">
              {expandedSections.questions ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.questions && (
            <div className="section-content">
              <List
                itemLayout="vertical"
                dataSource={questions}
                renderItem={(question) => (
                  <List.Item key={question.id} className="question-item">
                    <div className="question-header">
                      <div className="question-title">
                        <QuestionCircleOutlined className="question-icon" />
                        <Text strong>{question.question}</Text>
                      </div>
                      <Tag color={getQuestionTypeColor(question.type)}>{getQuestionTypeLabel(question.type)}</Tag>
                    </div>
                    <Paragraph className="question-description">{question.description}</Paragraph>
                    <div className="answer-section">
                      <TextArea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="请输入您的回答..."
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        className="answer-input"
                      />
                      <Button 
                        type="primary" 
                        onClick={() => handleSubmitAnswer(question.id)}
                        disabled={!answers[question.id] || answers[question.id].trim() === ''}
                        className="answer-button"
                      >
                        提交回答
                      </Button>
                    </div>
                    {question.answer && (
                      <div className="saved-answer">
                        <CheckCircleOutlined className="saved-icon" />
                        <Text type="secondary">已保存的回答: {question.answer}</Text>
                      </div>
                    )}
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>

        <Divider />

        <div className="clarification-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('requirements')}
          >
            <Title level={4}>
              <span className="text-primary-dark">需求点</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.requirements ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.requirements && (
            <div className="section-content">
              <List
                dataSource={requirementPoints}
                renderItem={(requirement, index) => (
                  <List.Item key={index} className="requirement-item">
                    {editingRequirement === index ? (
                      <div className="requirement-edit">
                        <TextArea
                          value={requirement}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          className="requirement-input"
                        />
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />}
                          onClick={() => handleSaveRequirement(index)}
                          className="requirement-save-button"
                        >
                          保存
                        </Button>
                      </div>
                    ) : (
                      <div className="requirement-display">
                        <Text>{requirement}</Text>
                        <Button 
                          type="text" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditRequirement(index)}
                          className="requirement-edit-button"
                        />
                      </div>
                    )}
                  </List.Item>
                )}
                footer={
                  <div className="add-requirement">
                    <TextArea
                      value={newRequirementText}
                      onChange={(e) => setNewRequirementText(e.target.value)}
                      placeholder="添加新需求点..."
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      className="add-requirement-input"
                    />
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddRequirement}
                      disabled={!newRequirementText || newRequirementText.trim() === ''}
                      className="add-requirement-button"
                    >
                      添加
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </div>

        <Divider />

        <div className="clarification-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('functionalScope')}
          >
            <Title level={4}>
              <span className="text-primary-dark">功能范围</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.functionalScope ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.functionalScope && (
            <div className="section-content">
              <Paragraph>
                {functionalScope}
              </Paragraph>
            </div>
          )}
        </div>

        <Divider />

        <div className="clarification-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('nonFunctionalRequirements')}
          >
            <Title level={4}>
              <span className="text-primary-dark">非功能需求</span>
            </Title>
            <Text className="expand-toggle">
              {expandedSections.nonFunctionalRequirements ? '收起' : '展开'}
            </Text>
          </div>
          {expandedSections.nonFunctionalRequirements && (
            <div className="section-content">
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={nonFunctionalRequirements}
                renderItem={(requirement, index) => (
                  <List.Item key={index}>
                    <div className="nfr-item">
                      <CheckCircleOutlined className="nfr-icon" />
                      <Text>{requirement}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>

        <div className="clarification-actions">
          <Button 
            type="primary" 
            size="large"
            onClick={onConfirmRequirements}
            disabled={!allQuestionsAnswered}
          >
            确认需求
          </Button>
        </div>
      </Card>
    </div>
  );
};

const getQuestionTypeColor = (type) => {
  const typeColors = {
    'functional': 'blue',
    'non_functional': 'purple',
    'user': 'green',
    'business': 'orange',
    'technical': 'cyan',
    'performance': 'red',
    'integration': 'geekblue',
    'security': 'volcano',
    'deployment': 'gold',
    'scalability': 'lime'
  };
  return typeColors[type] || 'default';
};

const getQuestionTypeLabel = (type) => {
  const typeLabels = {
    'functional': '功能需求',
    'non_functional': '非功能需求',
    'user': '用户需求',
    'business': '业务需求',
    'technical': '技术需求',
    'performance': '性能需求',
    'integration': '集成需求',
    'security': '安全需求',
    'deployment': '部署需求',
    'scalability': '可扩展性'
  };
  return typeLabels[type] || type;
};

export default ClarificationComponent;
