package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type ContinuousDeliveryAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewContinuousDeliveryAgent() *ContinuousDeliveryAgent {
	return &ContinuousDeliveryAgent{
		capabilities: []string{
			"ci_cd_pipeline_design",
			"deployment_strategy",
			"release_management",
			"environment_configuration",
			"monitoring_setup",
			"infrastructure_as_code",
		},
	}
}

func (a *ContinuousDeliveryAgent) GetRole() interfaces.AgentRole {
	return interfaces.ContinuousDeliveryRole
}

func (a *ContinuousDeliveryAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("ContinuousDeliveryAgent processing input: %s", input.Prompt)
	
	var requirements, architecture, softwareEngineering map[string]interface{}
	if input.Context != nil {
		if reqData, ok := input.Context[string(interfaces.RequirementAnalysisRole)]; ok {
			requirements = reqData.(map[string]interface{})
		}
		if archData, ok := input.Context[string(interfaces.ArchitectureDesignRole)]; ok {
			architecture = archData.(map[string]interface{})
		}
		if seData, ok := input.Context[string(interfaces.SoftwareEngineeringRole)]; ok {
			softwareEngineering = seData.(map[string]interface{})
		}
	}
	
	pipeline, err := a.designCICDPipeline(input.Prompt, requirements, architecture, softwareEngineering)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to design CI/CD pipeline: %w", err)
	}
	
	deploymentStrategy, err := a.defineDeploymentStrategy(pipeline, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to define deployment strategy: %w", err)
	}
	
	monitoring, err := a.setupMonitoring(deploymentStrategy, requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to setup monitoring: %w", err)
	}
	
	infrastructure, err := a.generateInfrastructureAsCode(pipeline, deploymentStrategy, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate infrastructure as code: %w", err)
	}
	
	outputData := map[string]interface{}{
		"ci_cd_pipeline":       pipeline,
		"deployment_strategy":  deploymentStrategy,
		"monitoring":           monitoring,
		"infrastructure_code":  infrastructure,
	}
	
	summary := a.generateContinuousDeliverySummary(pipeline, deploymentStrategy, monitoring, infrastructure)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(pipeline, deploymentStrategy, monitoring),
		Data:       outputData,
	}, nil
}

func (a *ContinuousDeliveryAgent) CanHandle(input interfaces.AgentInput) bool {
	cdKeywords := []string{
		"continuous delivery", "ci/cd", "pipeline", "deployment", "release",
		"devops", "infrastructure", "monitoring", "持续交付", "部署", "发布",
	}
	
	for _, keyword := range cdKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *ContinuousDeliveryAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *ContinuousDeliveryAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *ContinuousDeliveryAgent) designCICDPipeline(prompt string, requirements, architecture, softwareEngineering map[string]interface{}) (map[string]interface{}, error) {
	
	pipeline := map[string]interface{}{
		"type": "github_actions",
		"stages": []map[string]interface{}{
			{
				"name": "代码检查",
				"steps": []string{
					"代码风格检查",
					"静态代码分析",
					"依赖安全扫描",
				},
				"tools": []string{
					"golangci-lint",
					"SonarQube",
					"Snyk",
				},
				"parallel": true,
			},
			{
				"name": "构建",
				"steps": []string{
					"编译代码",
					"构建Docker镜像",
				},
				"tools": []string{
					"Go Build",
					"Docker",
				},
				"artifacts": []string{
					"二进制文件",
					"Docker镜像",
				},
			},
			{
				"name": "测试",
				"steps": []string{
					"单元测试",
					"集成测试",
					"端到端测试",
				},
				"tools": []string{
					"Go Test",
					"Jest",
					"Cypress",
				},
				"reports": []string{
					"测试覆盖率报告",
					"测试结果报告",
				},
			},
			{
				"name": "部署到测试环境",
				"steps": []string{
					"部署到Kubernetes测试集群",
					"运行冒烟测试",
					"运行性能测试",
				},
				"tools": []string{
					"Helm",
					"k6",
				},
				"environment": "测试环境",
				"approval": "自动",
			},
			{
				"name": "部署到预生产环境",
				"steps": []string{
					"部署到Kubernetes预生产集群",
					"运行冒烟测试",
					"运行集成测试",
				},
				"tools": []string{
					"Helm",
					"Cypress",
				},
				"environment": "预生产环境",
				"approval": "手动",
			},
			{
				"name": "部署到生产环境",
				"steps": []string{
					"部署到Kubernetes生产集群",
					"运行冒烟测试",
					"监控系统健康状况",
				},
				"tools": []string{
					"Helm",
					"Prometheus",
				},
				"environment": "生产环境",
				"approval": "手动",
			},
		],
		"triggers": []string{
			"代码推送到主分支",
			"拉取请求",
			"定时触发",
			"手动触发",
		},
		"artifacts_storage": "GitHub Packages",
		"secrets_management": "GitHub Secrets",
	}
	
	return pipeline, nil
}

func (a *ContinuousDeliveryAgent) defineDeploymentStrategy(pipeline, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	deploymentStrategy := map[string]interface{}{
		"strategy": "blue_green",
		"environments": []map[string]interface{}{
			{
				"name": "开发环境",
				"purpose": "开发人员测试",
				"deployment_frequency": "每次提交",
				"automation_level": "完全自动化",
				"infrastructure": "Kubernetes开发集群",
			},
			{
				"name": "测试环境",
				"purpose": "QA测试",
				"deployment_frequency": "每日",
				"automation_level": "完全自动化",
				"infrastructure": "Kubernetes测试集群",
			},
			{
				"name": "预生产环境",
				"purpose": "最终验证",
				"deployment_frequency": "每周",
				"automation_level": "半自动化",
				"infrastructure": "Kubernetes预生产集群",
			},
			{
				"name": "生产环境",
				"purpose": "用户使用",
				"deployment_frequency": "按需",
				"automation_level": "半自动化",
				"infrastructure": "Kubernetes生产集群",
			},
		},
		"rollout_strategies": map[string]interface{}{
			"blue_green": map[string]interface{}{
				"description": "维护两个相同的生产环境，一个活跃，一个待机",
				"benefits": []string{
					"零停机时间",
					"快速回滚",
					"完整的测试",
				},
				"drawbacks": []string{
					"资源成本高",
					"需要负载均衡器支持",
				},
			},
			"canary": map[string]interface{}{
				"description": "逐步将流量从旧版本转移到新版本",
				"benefits": []string{
					"风险降低",
					"可以进行A/B测试",
					"逐步验证",
				},
				"drawbacks": []string{
					"部署时间长",
					"需要复杂的监控",
				},
			},
			"rolling": map[string]interface{}{
				"description": "逐个替换实例",
				"benefits": []string{
					"资源利用率高",
					"简单易实现",
				},
				"drawbacks": []string{
					"回滚复杂",
					"可能导致不一致",
				},
			},
		},
		"feature_flags": map[string]interface{}{
			"enabled": true,
			"tool": "LaunchDarkly",
			"strategies": []string{
				"按用户群体",
				"按地理位置",
				"按百分比",
				"按时间",
			},
		},
	}
	
	return deploymentStrategy, nil
}

func (a *ContinuousDeliveryAgent) setupMonitoring(deploymentStrategy, requirements map[string]interface{}) (map[string]interface{}, error) {
	
	monitoring := map[string]interface{}{
		"tools": map[string]interface{}{
			"metrics": []string{
				"Prometheus",
				"Grafana",
			},
			"logging": []string{
				"ELK Stack",
				"Loki",
			},
			"tracing": []string{
				"Jaeger",
				"Zipkin",
			},
			"alerting": []string{
				"Alertmanager",
				"PagerDuty",
			},
		},
		"metrics": []map[string]interface{}{
			{
				"category": "系统指标",
				"metrics": []string{
					"CPU使用率",
					"内存使用率",
					"磁盘使用率",
					"网络流量",
				},
				"thresholds": map[string]interface{}{
					"CPU使用率": "80%",
					"内存使用率": "85%",
					"磁盘使用率": "90%",
				},
			},
			{
				"category": "应用指标",
				"metrics": []string{
					"请求响应时间",
					"请求吞吐量",
					"错误率",
					"成功率",
				},
				"thresholds": map[string]interface{}{
					"请求响应时间": "500ms",
					"错误率": "1%",
				},
			},
			{
				"category": "业务指标",
				"metrics": []string{
					"活跃用户数",
					"转化率",
					"会话时长",
					"功能使用率",
				},
			},
		},
		"dashboards": []string{
			"系统概览",
			"应用性能",
			"业务指标",
			"错误分析",
			"用户体验",
		},
		"alerts": []map[string]interface{}{
			{
				"name": "高CPU使用率",
				"condition": "CPU使用率 > 80% 持续5分钟",
				"severity": "警告",
				"notification_channels": []string{
					"Slack",
					"Email",
				},
			},
			{
				"name": "高错误率",
				"condition": "错误率 > 1% 持续2分钟",
				"severity": "严重",
				"notification_channels": []string{
					"Slack",
					"Email",
					"PagerDuty",
				},
			},
			{
				"name": "服务不可用",
				"condition": "服务健康检查失败持续1分钟",
				"severity": "紧急",
				"notification_channels": []string{
					"Slack",
					"Email",
					"PagerDuty",
					"SMS",
				},
			},
		},
	}
	
	return monitoring, nil
}

func (a *ContinuousDeliveryAgent) generateInfrastructureAsCode(pipeline, deploymentStrategy, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	infrastructure := map[string]interface{}{
		"tools": []string{
			"Terraform",
			"Kubernetes",
			"Helm",
		},
		"components": []map[string]interface{}{
			{
				"name": "Kubernetes集群",
				"tool": "Terraform",
				"description": "用于部署和管理容器化应用",
				"resources": []string{
					"节点池",
					"网络策略",
					"存储类",
				},
			},
			{
				"name": "数据库",
				"tool": "Terraform",
				"description": "管理MySQL和Redis实例",
				"resources": []string{
					"MySQL实例",
					"Redis集群",
					"备份策略",
				},
			},
			{
				"name": "应用部署",
				"tool": "Helm",
				"description": "管理应用的Kubernetes部署",
				"resources": []string{
					"部署",
					"服务",
					"Ingress",
					"配置映射",
					"密钥",
				},
			},
			{
				"name": "监控系统",
				"tool": "Terraform & Helm",
				"description": "部署和配置监控系统",
				"resources": []string{
					"Prometheus",
					"Grafana",
					"Alertmanager",
				},
			},
			{
				"name": "日志系统",
				"tool": "Terraform & Helm",
				"description": "部署和配置日志系统",
				"resources": []string{
					"Elasticsearch",
					"Logstash",
					"Kibana",
				},
			},
		},
		"environments": []string{
			"开发环境",
			"测试环境",
			"预生产环境",
			"生产环境",
		},
		"best_practices": []string{
			"使用模块化设计",
			"版本控制所有配置",
			"使用变量和输出",
			"实现状态管理",
			"使用工作空间分离环境",
		},
	}
	
	return infrastructure, nil
}

func (a *ContinuousDeliveryAgent) generateContinuousDeliverySummary(pipeline, deploymentStrategy, monitoring, infrastructure map[string]interface{}) string {
	
	summary := "持续交付方案建议完成。\n\n"
	
	pipelineType, _ := pipeline["type"].(string)
	stages, _ := pipeline["stages"].([]map[string]interface{})
	
	summary += fmt.Sprintf("CI/CD流水线类型: %s\n", pipelineType)
	summary += fmt.Sprintf("流水线阶段数: %d\n", len(stages))
	
	if len(stages) > 0 {
		summary += "主要阶段:\n"
		for _, stage := range stages {
			name, _ := stage["name"].(string)
			approval, _ := stage["approval"].(string)
			
			if approval == "手动" {
				summary += fmt.Sprintf("- %s (需要手动批准)\n", name)
			} else {
				summary += fmt.Sprintf("- %s\n", name)
			}
		}
	}
	
	strategy, _ := deploymentStrategy["strategy"].(string)
	environments, _ := deploymentStrategy["environments"].([]map[string]interface{})
	
	summary += fmt.Sprintf("\n部署策略: %s\n", strategy)
	
	if len(environments) > 0 {
		summary += "环境配置:\n"
		for _, env := range environments {
			name, _ := env["name"].(string)
			purpose, _ := env["purpose"].(string)
			frequency, _ := env["deployment_frequency"].(string)
			
			summary += fmt.Sprintf("- %s: %s (部署频率: %s)\n", name, purpose, frequency)
		}
	}
	
	if tools, ok := monitoring["tools"].(map[string]interface{}); ok {
		summary += "\n监控工具:\n"
		
		if metrics, ok := tools["metrics"].([]string); ok && len(metrics) > 0 {
			summary += fmt.Sprintf("- 指标监控: %s\n", metrics[0])
		}
		
		if logging, ok := tools["logging"].([]string); ok && len(logging) > 0 {
			summary += fmt.Sprintf("- 日志管理: %s\n", logging[0])
		}
		
		if alerting, ok := tools["alerting"].([]string); ok && len(alerting) > 0 {
			summary += fmt.Sprintf("- 告警系统: %s\n", alerting[0])
		}
	}
	
	if tools, ok := infrastructure["tools"].([]string); ok && len(tools) > 0 {
		summary += "\n基础设施即代码:\n"
		for i, tool := range tools {
			if i < 3 {
				summary += fmt.Sprintf("- %s\n", tool)
			}
		}
	}
	
	return summary
}

func (a *ContinuousDeliveryAgent) calculateConfidence(pipeline, deploymentStrategy, monitoring map[string]interface{}) float64 {
	
	confidence := 0.7 // Base confidence
	
	if stages, ok := pipeline["stages"].([]map[string]interface{}); ok && len(stages) > 0 {
		confidence += 0.05
	}
	
	if _, ok := deploymentStrategy["strategy"]; ok {
		confidence += 0.05
	}
	
	if environments, ok := deploymentStrategy["environments"].([]map[string]interface{}); ok && len(environments) > 0 {
		confidence += 0.05
	}
	
	if tools, ok := monitoring["tools"].(map[string]interface{}); ok && len(tools) > 0 {
		confidence += 0.05
	}
	
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}
