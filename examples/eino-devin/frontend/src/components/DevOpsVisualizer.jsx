import React, { useState } from 'react';
import { Tabs, Card, Progress, Timeline, Tag, Button, Tooltip, Collapse } from 'antd';
import { 
  RocketOutlined, 
  CodeOutlined, 
  BuildOutlined, 
  DeploymentUnitOutlined,
  MonitorOutlined,
  BranchesOutlined,
  ApiOutlined,
  CloudServerOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const DevOpsVisualizer = ({ projectData }) => {
  const [activeTab, setActiveTab] = useState('1');
  
  const data = projectData || {
    projectName: '抖音AI分身',
    architecture: {
      frontend: {
        framework: 'React',
        components: ['ChatInterface', 'AIAvatar', 'VideoContentAnalyzer'],
        status: 'in-progress'
      },
      backend: {
        framework: 'Node.js + Eino',
        components: ['DialogManager', 'ContentProcessor', 'AIEngine'],
        status: 'in-progress'
      },
      infrastructure: {
        provider: 'ByteDance Cloud',
        components: ['Kubernetes', 'Docker', 'Prometheus'],
        status: 'planning'
      }
    },
    pipeline: {
      stages: [
        { name: '代码提交', status: 'active', metrics: { avgTime: '2小时', successRate: 98 } },
        { name: '自动化测试', status: 'active', metrics: { avgTime: '45分钟', successRate: 92 } },
        { name: '代码审查', status: 'active', metrics: { avgTime: '4小时', successRate: 95 } },
        { name: '构建', status: 'active', metrics: { avgTime: '15分钟', successRate: 97 } },
        { name: '部署测试环境', status: 'active', metrics: { avgTime: '10分钟', successRate: 99 } },
        { name: '集成测试', status: 'active', metrics: { avgTime: '2小时', successRate: 90 } },
        { name: '部署生产环境', status: 'pending', metrics: { avgTime: '30分钟', successRate: 98 } },
        { name: '监控', status: 'pending', metrics: { avgTime: '持续', successRate: 99 } }
      ],
      currentStage: 5,
      deployments: [
        { version: 'v0.1.0', date: '2025-04-01', environment: '开发', status: 'success' },
        { version: 'v0.1.1', date: '2025-04-03', environment: '测试', status: 'success' },
        { version: 'v0.1.2', date: '2025-04-05', environment: '测试', status: 'failed' },
        { version: 'v0.1.3', date: '2025-04-06', environment: '测试', status: 'success' }
      ]
    },
    collaboration: {
      teams: [
        { name: '前端团队', members: 3, tasks: { total: 12, completed: 8 } },
        { name: 'AI团队', members: 4, tasks: { total: 15, completed: 10 } },
        { name: '后端团队', members: 3, tasks: { total: 14, completed: 9 } },
        { name: 'DevOps团队', members: 2, tasks: { total: 10, completed: 7 } }
      ],
      pullRequests: [
        { id: 'PR-123', title: '实现基础聊天界面', author: '张三', status: 'merged' },
        { id: 'PR-124', title: '添加AI模型集成', author: '李四', status: 'open' },
        { id: 'PR-125', title: '优化视频内容分析', author: '王五', status: 'open' }
      ]
    },
    cicd: {
      builds: [
        { id: 'build-456', branch: 'main', commit: 'a1b2c3d', status: 'success', duration: '12分钟' },
        { id: 'build-457', branch: 'feature/chat', commit: 'e4f5g6h', status: 'success', duration: '15分钟' },
        { id: 'build-458', branch: 'feature/avatar', commit: 'i7j8k9l', status: 'failed', duration: '8分钟' },
        { id: 'build-459', branch: 'feature/avatar', commit: 'm1n2o3p', status: 'success', duration: '14分钟' }
      ],
      environments: [
        { name: '开发环境', status: 'healthy', version: 'v0.1.3', lastDeployed: '2025-04-06' },
        { name: '测试环境', status: 'healthy', version: 'v0.1.3', lastDeployed: '2025-04-06' },
        { name: '预发布环境', status: 'not-deployed', version: 'N/A', lastDeployed: 'N/A' },
        { name: '生产环境', status: 'not-deployed', version: 'N/A', lastDeployed: 'N/A' }
      ]
    },
    operations: {
      metrics: [
        { name: '系统可用性', value: 99.95, unit: '%', status: 'good' },
        { name: '平均响应时间', value: 120, unit: 'ms', status: 'good' },
        { name: '错误率', value: 0.5, unit: '%', status: 'good' },
        { name: 'CPU使用率', value: 45, unit: '%', status: 'good' },
        { name: '内存使用率', value: 60, unit: '%', status: 'warning' }
      ],
      alerts: [
        { id: 'alert-001', severity: 'warning', message: '内存使用率超过60%', time: '2025-04-06 14:30', status: 'active' }
      ],
      scaling: {
        current: 3,
        min: 2,
        max: 10,
        autoScaling: true
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success':
      case 'active':
      case 'merged':
      case 'healthy':
      case 'good':
        return 'green';
      case 'in-progress':
      case 'open':
      case 'warning':
        return 'blue';
      case 'planning':
      case 'pending':
      case 'not-deployed':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
      case 'active':
      case 'merged':
      case 'healthy':
      case 'good':
        return <CheckCircleOutlined />;
      case 'in-progress':
      case 'open':
        return <SyncOutlined spin />;
      case 'planning':
      case 'pending':
      case 'not-deployed':
        return <ClockCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return <QuestionCircleOutlined />;
    }
  };

  return (
    <div className="devops-visualizer-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 transform hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <RocketOutlined className="mr-2 text-blue-500" /> 
          DevOps可视化: {data.projectName}
        </h2>
        <div className="flex space-x-2">
          <Tooltip title="刷新数据">
            <Button 
              type="default" 
              shape="circle" 
              icon={<SyncOutlined />} 
              className="hover:rotate-180 transition-all duration-500"
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button type="primary">详情</Button>
          </Tooltip>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="devops-tabs"
        animated={{ inkBar: true, tabPane: true }}
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <ApiOutlined className="mr-2" />
              架构设计
            </span>
          } 
          key="1"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              title={
                <div className="flex items-center">
                  <CodeOutlined className="mr-2" />
                  前端架构
                </div>
              }
              extra={
                <Tag color={getStatusColor(data.architecture.frontend.status)}>
                  {data.architecture.frontend.status === 'in-progress' ? '进行中' : data.architecture.frontend.status}
                </Tag>
              }
              className="architecture-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              <p className="mb-2"><strong>框架:</strong> {data.architecture.frontend.framework}</p>
              <div className="mb-2">
                <strong>组件:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.architecture.frontend.components.map((comp, idx) => (
                    <Tag key={idx} color="blue">{comp}</Tag>
                  ))}
                </div>
              </div>
              <Button type="link" className="p-0">查看详细架构</Button>
            </Card>

            <Card 
              title={
                <div className="flex items-center">
                  <CloudServerOutlined className="mr-2" />
                  后端架构
                </div>
              }
              extra={
                <Tag color={getStatusColor(data.architecture.backend.status)}>
                  {data.architecture.backend.status === 'in-progress' ? '进行中' : data.architecture.backend.status}
                </Tag>
              }
              className="architecture-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              <p className="mb-2"><strong>框架:</strong> {data.architecture.backend.framework}</p>
              <div className="mb-2">
                <strong>组件:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.architecture.backend.components.map((comp, idx) => (
                    <Tag key={idx} color="green">{comp}</Tag>
                  ))}
                </div>
              </div>
              <Button type="link" className="p-0">查看详细架构</Button>
            </Card>

            <Card 
              title={
                <div className="flex items-center">
                  <SettingOutlined className="mr-2" />
                  基础设施
                </div>
              }
              extra={
                <Tag color={getStatusColor(data.architecture.infrastructure.status)}>
                  {data.architecture.infrastructure.status === 'planning' ? '规划中' : data.architecture.infrastructure.status}
                </Tag>
              }
              className="architecture-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              <p className="mb-2"><strong>提供商:</strong> {data.architecture.infrastructure.provider}</p>
              <div className="mb-2">
                <strong>组件:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.architecture.infrastructure.components.map((comp, idx) => (
                    <Tag key={idx} color="purple">{comp}</Tag>
                  ))}
                </div>
              </div>
              <Button type="link" className="p-0">查看详细架构</Button>
            </Card>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <BranchesOutlined className="mr-2" />
              流水线
            </span>
          } 
          key="2"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">CI/CD流水线</h3>
            <div className="pipeline-stages flex flex-wrap md:flex-nowrap overflow-x-auto pb-4">
              {data.pipeline.stages.map((stage, index) => (
                <div 
                  key={index} 
                  className={`pipeline-stage flex-shrink-0 w-40 mx-2 p-3 rounded-lg border-2 ${
                    index < data.pipeline.currentStage ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20' : 
                    index === data.pipeline.currentStage ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : 
                    'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  } transition-all duration-300`}
                >
                  <div className="text-center mb-2">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      index < data.pipeline.currentStage ? 'bg-green-500' : 
                      index === data.pipeline.currentStage ? 'bg-blue-500' : 
                      'bg-gray-300 dark:bg-gray-700'
                    } text-white`}>
                      {index + 1}
                    </div>
                  </div>
                  <h4 className="text-center font-medium mb-2">{stage.name}</h4>
                  <div className="text-xs text-center">
                    <p className="mb-1">平均时间: {stage.metrics.avgTime}</p>
                    <p>成功率: {stage.metrics.successRate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              title={
                <div className="flex items-center">
                  <DeploymentUnitOutlined className="mr-2" />
                  部署历史
                </div>
              }
              className="deployments-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              <Timeline>
                {data.pipeline.deployments.map((deployment, index) => (
                  <Timeline.Item 
                    key={index}
                    color={deployment.status === 'success' ? 'green' : 'red'}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{deployment.version}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {deployment.date} - {deployment.environment}环境
                        </p>
                      </div>
                      <Tag color={deployment.status === 'success' ? 'green' : 'red'}>
                        {deployment.status === 'success' ? '成功' : '失败'}
                      </Tag>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Card 
              title={
                <div className="flex items-center">
                  <BuildOutlined className="mr-2" />
                  构建历史
                </div>
              }
              className="builds-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              <Timeline>
                {data.cicd.builds.map((build, index) => (
                  <Timeline.Item 
                    key={index}
                    color={build.status === 'success' ? 'green' : 'red'}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{build.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          分支: {build.branch} | 提交: {build.commit.substring(0, 7)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Tag color={build.status === 'success' ? 'green' : 'red'}>
                          {build.status === 'success' ? '成功' : '失败'}
                        </Tag>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{build.duration}</p>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <TeamOutlined className="mr-2" />
              协作
            </span>
          } 
          key="3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">团队进度</h3>
              {data.collaboration.teams.map((team, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{team.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({team.members}人)
                      </span>
                    </div>
                    <span className="text-sm">
                      {team.tasks.completed}/{team.tasks.total} 任务
                    </span>
                  </div>
                  <Progress 
                    percent={Math.round((team.tasks.completed / team.tasks.total) * 100)} 
                    status="active"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">拉取请求</h3>
              <Collapse 
                defaultActiveKey={['1']} 
                className="pr-collapse"
              >
                {data.collaboration.pullRequests.map((pr, index) => (
                  <Panel 
                    key={index + 1} 
                    header={
                      <div className="flex justify-between items-center">
                        <span>{pr.id}: {pr.title}</span>
                        <Tag color={pr.status === 'merged' ? 'green' : 'blue'}>
                          {pr.status === 'merged' ? '已合并' : '开放'}
                        </Tag>
                      </div>
                    }
                  >
                    <p><strong>作者:</strong> {pr.author}</p>
                    <p><strong>状态:</strong> {pr.status === 'merged' ? '已合并' : '开放'}</p>
                    <div className="mt-2">
                      <Button type="link" size="small" className="p-0">查看详情</Button>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </div>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <MonitorOutlined className="mr-2" />
              运维
            </span>
          } 
          key="4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              title={
                <div className="flex items-center">
                  <MonitorOutlined className="mr-2" />
                  系统指标
                </div>
              }
              className="metrics-card hover:shadow-md transition-all duration-300"
              hoverable
            >
              {data.operations.metrics.map((metric, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span>{metric.name}</span>
                    <span className={`font-medium ${
                      metric.status === 'good' ? 'text-green-500' : 
                      metric.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <Progress 
                    percent={
                      metric.name === '错误率' ? 100 - metric.value * 20 :
                      metric.name === '平均响应时间' ? 100 - (metric.value / 5) :
                      metric.value
                    } 
                    status={
                      metric.status === 'good' ? 'success' : 
                      metric.status === 'warning' ? 'normal' : 'exception'
                    }
                    size="small"
                  />
                </div>
              ))}
            </Card>

            <div>
              <Card 
                title={
                  <div className="flex items-center">
                    <AlertOutlined className="mr-2" />
                    告警
                  </div>
                }
                className="alerts-card hover:shadow-md transition-all duration-300 mb-4"
                hoverable
              >
                {data.operations.alerts.length > 0 ? (
                  <Timeline>
                    {data.operations.alerts.map((alert, index) => (
                      <Timeline.Item 
                        key={index}
                        color={
                          alert.severity === 'critical' ? 'red' : 
                          alert.severity === 'warning' ? 'orange' : 'blue'
                        }
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{alert.message}</span>
                            <Tag color={
                              alert.severity === 'critical' ? 'red' : 
                              alert.severity === 'warning' ? 'orange' : 'blue'
                            }>
                              {alert.severity}
                            </Tag>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{alert.time}</p>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircleOutlined className="text-green-500 text-2xl mb-2" />
                    <p>没有活跃告警</p>
                  </div>
                )}
              </Card>

              <Card 
                title={
                  <div className="flex items-center">
                    <CloudServerOutlined className="mr-2" />
                    环境状态
                  </div>
                }
                className="environments-card hover:shadow-md transition-all duration-300"
                hoverable
              >
                <div className="grid grid-cols-2 gap-2">
                  {data.cicd.environments.map((env, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        env.status === 'healthy' ? 'border-green-500' : 
                        env.status === 'not-deployed' ? 'border-gray-300 dark:border-gray-700' : 
                        'border-red-500'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          env.status === 'healthy' ? 'bg-green-500' : 
                          env.status === 'not-deployed' ? 'bg-gray-400' : 
                          'bg-red-500'
                        }`}></span>
                        <span className="font-medium">{env.name}</span>
                      </div>
                      <div className="text-xs">
                        <p>版本: {env.version}</p>
                        <p>最后部署: {env.lastDeployed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DevOpsVisualizer;
