import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Tag, Button, Input, Spin, Empty, Divider, Space, Tabs } from 'antd';
import { BulbOutlined, SearchOutlined, BookOutlined, LinkOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import '../styles/KnowledgeSuggestionsComponent.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const KnowledgeSuggestionsComponent = ({ suggestions, loading, onSearch, onSave, onNext, onPrevious }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [savedItems, setSavedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (suggestions && suggestions.savedItems) {
      setSavedItems(suggestions.savedItems);
    }
  }, [suggestions]);

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSave = (item) => {
    const isAlreadySaved = savedItems.some(saved => saved.id === item.id);
    
    if (isAlreadySaved) {
      const newSavedItems = savedItems.filter(saved => saved.id !== item.id);
      setSavedItems(newSavedItems);
      onSave && onSave(newSavedItems);
    } else {
      const newSavedItems = [...savedItems, item];
      setSavedItems(newSavedItems);
      onSave && onSave(newSavedItems);
    }
  };

  const renderSuggestionItem = (item) => {
    const isExpanded = expandedItems[item.id];
    const isSaved = savedItems.some(saved => saved.id === item.id);
    
    return (
      <List.Item 
        key={item.id}
        className="suggestion-item"
        actions={[
          <Button 
            type="text" 
            onClick={() => toggleSave(item)}
            icon={isSaved ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          >
            {isSaved ? '已收藏' : '收藏'}
          </Button>,
          <Button 
            type="text" 
            onClick={() => toggleExpand(item.id)}
          >
            {isExpanded ? '收起' : '展开'}
          </Button>,
          item.url && (
            <Button 
              type="link" 
              href={item.url} 
              target="_blank"
              icon={<LinkOutlined />}
            >
              查看源码
            </Button>
          )
        ]}
      >
        <List.Item.Meta
          title={
            <div className="suggestion-title">
              <Text strong>{item.title}</Text>
              {item.tags && item.tags.map((tag, index) => (
                <Tag key={index} color={tag.color || 'blue'}>{tag.name}</Tag>
              ))}
            </div>
          }
          description={
            <div className="suggestion-description">
              <Paragraph ellipsis={{ rows: isExpanded ? 100 : 2, expandable: false }}>
                {item.description}
              </Paragraph>
              {isExpanded && item.codeSnippet && (
                <div className="code-snippet">
                  <Divider orientation="left">代码示例</Divider>
                  <pre>{item.codeSnippet}</pre>
                </div>
              )}
              {isExpanded && item.usageExample && (
                <div className="usage-example">
                  <Divider orientation="left">使用示例</Divider>
                  <Paragraph>{item.usageExample}</Paragraph>
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  if (loading) {
    return (
      <div className="knowledge-loading">
        <Spin size="large" />
        <Paragraph className="loading-text">
          正在生成知识建议，请稍候...
        </Paragraph>
      </div>
    );
  }

  return (
    <div className="knowledge-container">
      <Card className="knowledge-card">
        <Title level={3} className="card-title">
          <BulbOutlined /> 知识建议
        </Title>
        <Paragraph className="card-description">
          基于您的需求，我们为您推荐以下知识资源，帮助您更好地理解和实现项目。
        </Paragraph>

        <div className="search-section">
          <Search
            placeholder="搜索知识资源"
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={value => onSearch && onSearch(value)}
          />
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="knowledge-tabs">
          <TabPane 
            tab={<span><BookOutlined /> 推荐资源</span>} 
            key="1"
          >
            {suggestions && suggestions.items && suggestions.items.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={suggestions.items}
                renderItem={renderSuggestionItem}
                pagination={{
                  onChange: page => {
                    console.log(page);
                  },
                  pageSize: 5,
                }}
              />
            ) : (
              <Empty 
                description="暂无推荐资源" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={<span><StarOutlined /> 已收藏</span>} 
            key="2"
          >
            {savedItems && savedItems.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={savedItems}
                renderItem={renderSuggestionItem}
                pagination={{
                  onChange: page => {
                    console.log(page);
                  },
                  pageSize: 5,
                }}
              />
            ) : (
              <Empty 
                description="暂无收藏资源" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </TabPane>
        </Tabs>

        <div className="knowledge-actions">
          <Space>
            <Button onClick={onPrevious}>上一步</Button>
            <Button type="primary" onClick={onNext}>下一步</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgeSuggestionsComponent;
