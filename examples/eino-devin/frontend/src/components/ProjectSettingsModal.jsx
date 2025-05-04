import React, { useState } from 'react';
import { Modal, Tabs, Card, Button, Tooltip, Input, Switch, Tag, Divider } from 'antd';
import { 
  CloseOutlined, 
  InfoCircleOutlined, 
  PlusOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudServerOutlined,
  RocketOutlined,
  SettingOutlined,
  TeamOutlined,
  BookOutlined,
  GlobalOutlined,
  LockOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const ProjectSettingsModal = ({ visible, onClose, projectData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const integrations = [
    {
      id: 'redis',
      name: 'Upstash for Redis',
      description: 'Redis 兼容数据库',
      icon: <img src="https://upstash.com/static/favicon/favicon.ico" alt="Upstash" className="w-10 h-10" />
    },
    {
      id: 'postgres',
      name: 'Neon',
      description: '无服务器 Postgres',
      icon: <img src="https://neon.tech/favicon/favicon.ico" alt="Neon" className="w-10 h-10" />
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Postgres 后端',
      icon: <img src="https://supabase.com/favicon.ico" alt="Supabase" className="w-10 h-10" />
    },
    {
      id: 'groq',
      name: 'Groq',
      description: '快速 AI 推理',
      icon: <img src="https://groq.com/favicon.ico" alt="Groq" className="w-10 h-10" />
    },
    {
      id: 'fal',
      name: 'fal',
      description: '大规模运行 AI 模型',
      icon: <img src="https://fal.ai/favicon.ico" alt="fal" className="w-10 h-10" />
    },
    {
      id: 'deepinfra',
      name: 'Deep Infra',
      description: 'Deep Infra',
      icon: <img src="https://deepinfra.com/favicon.ico" alt="Deep Infra" className="w-10 h-10" />
    },
    {
      id: 'grok',
      name: 'Grok',
      description: 'Grok by xAI',
      icon: <img src="https://grok.x.ai/favicon.ico" alt="Grok" className="w-10 h-10" />
    },
    {
      id: 'blob',
      name: 'Blob',
      description: '快速对象存储',
      icon: <img src="https://blob.io/favicon.ico" alt="Blob" className="w-10 h-10" />
    }
  ];

  const [envVars, setEnvVars] = useState([
    { key: 'API_KEY', value: '••••••••••••••••', isSecret: true },
    { key: 'DATABASE_URL', value: 'postgres://user:pass@localhost:5432/db', isSecret: true },
    { key: 'ENVIRONMENT', value: 'production', isSecret: false },
    { key: 'DEBUG_MODE', value: 'false', isSecret: false }
  ]);

  const knowledgeSources = [
    { id: 'docs', name: '项目文档', count: 24, enabled: true },
    { id: 'code', name: '代码库', count: 156, enabled: true },
    { id: 'issues', name: '问题跟踪', count: 78, enabled: true },
    { id: 'wiki', name: 'Wiki', count: 12, enabled: false }
  ];

  const communitySettings = {
    isPublic: true,
    allowContributions: true,
    requireApproval: true,
    notifyOnChanges: true
  };

  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvIsSecret, setNewEnvIsSecret] = useState(false);

  const handleAddEnvVar = () => {
    if (newEnvKey && newEnvValue) {
      setEnvVars([...envVars, { key: newEnvKey, value: newEnvValue, isSecret: newEnvIsSecret }]);
      setNewEnvKey('');
      setNewEnvValue('');
      setNewEnvIsSecret(false);
    }
  };

  const handleDeleteEnvVar = (index) => {
    const updatedVars = [...envVars];
    updatedVars.splice(index, 1);
    setEnvVars(updatedVars);
  };

  const toggleKnowledgeSource = (id) => {
    const updatedSources = knowledgeSources.map(source => 
      source.id === id ? { ...source, enabled: !source.enabled } : source
    );
    console.log('更新知识源:', updatedSources);
  };

  const updateCommunitySetting = (key, value) => {
    console.log('更新社区设置:', key, value);
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-xl font-medium">项目设置</span>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          />
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="project-settings-modal"
      closable={false}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="settings-tabs"
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <SettingOutlined className="mr-2" />
              概览
            </span>
          } 
          key="overview"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">项目信息</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目名称
                </label>
                <Input 
                  value={projectData?.name || "抖音AI分身"} 
                  placeholder="输入项目名称"
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  描述
                </label>
                <Input.TextArea 
                  value={projectData?.description || "基于抖音视频内容的AI问答助手"} 
                  placeholder="输入项目描述"
                  rows={3}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  项目ID
                </label>
                <div className="flex items-center">
                  <Input 
                    value={projectData?.id || "douyin-ai-avatar-12345"} 
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                  <Tooltip title="项目ID不可更改">
                    <InfoCircleOutlined className="ml-2 text-gray-400" />
                  </Tooltip>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">状态与统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center">
                  <div className="text-3xl font-bold text-blue-500">99.9%</div>
                  <div className="text-sm text-gray-500">可用性</div>
                </Card>
                <Card className="text-center">
                  <div className="text-3xl font-bold text-green-500">12ms</div>
                  <div className="text-sm text-gray-500">平均响应时间</div>
                </Card>
                <Card className="text-center">
                  <div className="text-3xl font-bold text-purple-500">1.2K</div>
                  <div className="text-sm text-gray-500">每日请求</div>
                </Card>
                <Card className="text-center">
                  <div className="text-3xl font-bold text-orange-500">3</div>
                  <div className="text-sm text-gray-500">集成服务</div>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">项目URL</h4>
                <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <code className="text-sm flex-1 text-gray-700 dark:text-gray-300">
                    https://eino-devin.bytedance.com/douyin-ai-avatar
                  </code>
                  <Button size="small" type="text">
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-4">危险区域</h3>
            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-red-600 dark:text-red-400 font-medium">删除项目</h4>
              <p className="text-red-600 dark:text-red-400 opacity-80 text-sm mt-1 mb-3">
                此操作不可逆。将永久删除项目及其所有资源。
              </p>
              <Button danger>删除项目</Button>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <ApiOutlined className="mr-2" />
              集成
            </span>
          } 
          key="integrations"
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              可用集成
              <Tooltip title="连接第三方服务以增强您的项目功能">
                <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
              </Tooltip>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              选择并配置与您项目集成的服务
            </p>
          </div>
          
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {integration.icon || <DatabaseOutlined className="text-2xl" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <Button>创建</Button>
              </div>
            ))}
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <KeyOutlined className="mr-2" />
              环境变量
            </span>
          } 
          key="env-vars"
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              环境变量
              <Tooltip title="安全地存储配置和密钥">
                <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
              </Tooltip>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              管理项目的环境变量和密钥
            </p>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-sm text-gray-500">
              <div className="col-span-4">键</div>
              <div className="col-span-6">值</div>
              <div className="col-span-1 text-center">密钥</div>
              <div className="col-span-1"></div>
            </div>
            
            {envVars.map((envVar, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-2 items-center">
                <div className="col-span-4">
                  <Input value={envVar.key} disabled className="font-mono" />
                </div>
                <div className="col-span-6">
                  <Input.Password 
                    value={envVar.value} 
                    disabled 
                    className="font-mono"
                    visibilityToggle={!envVar.isSecret}
                  />
                </div>
                <div className="col-span-1 text-center">
                  {envVar.isSecret ? (
                    <LockOutlined className="text-blue-500" />
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <Button 
                    type="text" 
                    danger 
                    icon={<CloseOutlined />} 
                    onClick={() => handleDeleteEnvVar(index)}
                  />
                </div>
              </div>
            ))}
            
            <Divider />
            
            <div className="grid grid-cols-12 gap-4 mb-2 items-center">
              <div className="col-span-4">
                <Input 
                  placeholder="新键名" 
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="col-span-6">
                <Input.Password 
                  placeholder="新值" 
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  className="font-mono"
                  visibilityToggle
                />
              </div>
              <div className="col-span-1 text-center">
                <Switch 
                  size="small" 
                  checked={newEnvIsSecret}
                  onChange={(checked) => setNewEnvIsSecret(checked)}
                />
              </div>
              <div className="col-span-1 text-right">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddEnvVar}
                  disabled={!newEnvKey || !newEnvValue}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <BookOutlined className="mr-2" />
              知识
            </span>
          } 
          key="knowledge"
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              知识库
              <Tooltip title="管理AI助手可以访问的知识来源">
                <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
              </Tooltip>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              配置AI助手可以访问的知识来源
            </p>
          </div>
          
          <div className="space-y-4">
            {knowledgeSources.map((source) => (
              <div 
                key={source.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {source.id === 'docs' ? <FileTextOutlined className="text-2xl text-blue-500" /> :
                     source.id === 'code' ? <CodeOutlined className="text-2xl text-green-500" /> :
                     source.id === 'issues' ? <BugOutlined className="text-2xl text-red-500" /> :
                     <BookOutlined className="text-2xl text-purple-500" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {source.count} 个文件
                    </p>
                  </div>
                </div>
                <Switch checked={source.enabled} onChange={() => toggleKnowledgeSource(source.id)} />
              </div>
            ))}
            
            <div className="mt-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
              <Button icon={<PlusOutlined />}>添加知识源</Button>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <TeamOutlined className="mr-2" />
              社区
            </span>
          } 
          key="community"
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              社区设置
              <Tooltip title="管理项目的社区访问和贡献">
                <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
              </Tooltip>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              配置项目的社区访问权限和贡献方式
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">公开项目</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  允许任何人查看此项目
                </p>
              </div>
              <Switch 
                checked={communitySettings.isPublic} 
                onChange={(checked) => updateCommunitySetting('isPublic', checked)} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">允许社区贡献</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  允许社区成员提交贡献
                </p>
              </div>
              <Switch 
                checked={communitySettings.allowContributions} 
                onChange={(checked) => updateCommunitySetting('allowContributions', checked)} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">需要审批</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  所有贡献需要管理员审批
                </p>
              </div>
              <Switch 
                checked={communitySettings.requireApproval} 
                onChange={(checked) => updateCommunitySetting('requireApproval', checked)} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">变更通知</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  当项目有更新时接收通知
                </p>
              </div>
              <Switch 
                checked={communitySettings.notifyOnChanges} 
                onChange={(checked) => updateCommunitySetting('notifyOnChanges', checked)} 
              />
            </div>
            
            <Divider />
            
            <div>
              <h4 className="font-medium mb-2">团队成员</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                      JC
                    </div>
                    <div>
                      <div className="font-medium">陈俊通</div>
                      <div className="text-xs text-gray-500">所有者</div>
                    </div>
                  </div>
                  <Tag color="blue">管理员</Tag>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">
                      ZL
                    </div>
                    <div>
                      <div className="font-medium">张磊</div>
                      <div className="text-xs text-gray-500">开发者</div>
                    </div>
                  </div>
                  <Tag color="green">编辑者</Tag>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">
                      WY
                    </div>
                    <div>
                      <div className="font-medium">王颖</div>
                      <div className="text-xs text-gray-500">设计师</div>
                    </div>
                  </div>
                  <Tag color="purple">查看者</Tag>
                </div>
              </div>
              
              <Button icon={<PlusOutlined />} className="mt-4">
                邀请团队成员
              </Button>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ProjectSettingsModal;
