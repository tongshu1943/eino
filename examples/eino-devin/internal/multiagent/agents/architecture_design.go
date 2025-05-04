package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type ArchitectureDesignAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewArchitectureDesignAgent() *ArchitectureDesignAgent {
	return &ArchitectureDesignAgent{
		capabilities: []string{
			"system_architecture_design",
			"component_design",
			"technology_selection",
			"scalability_planning",
			"security_architecture",
			"integration_design",
		},
	}
}

func (a *ArchitectureDesignAgent) GetRole() interfaces.AgentRole {
	return interfaces.ArchitectureDesignRole
}

func (a *ArchitectureDesignAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("ArchitectureDesignAgent processing input: %s", input.Prompt)
	
	var requirements, businessValue map[string]interface{}
	if input.Context != nil {
		if reqData, ok := input.Context[string(interfaces.RequirementAnalysisRole)]; ok {
			requirements = reqData.(map[string]interface{})
		}
		if bvData, ok := input.Context[string(interfaces.BusinessValueRole)]; ok {
			businessValue = bvData.(map[string]interface{})
		}
	}
	
	architecture, err := a.designArchitecture(input.Prompt, requirements, businessValue)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to design architecture: %w", err)
	}
	
	technologies, err := a.selectTechnologies(architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to select technologies: %w", err)
	}
	
	components, err := a.designComponents(architecture, technologies)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to design components: %w", err)
	}
	
	outputData := map[string]interface{}{
		"architecture":  architecture,
		"technologies":  technologies,
		"components":    components,
	}
	
	summary := a.generateArchitectureSummary(architecture, technologies, components)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(architecture),
		Data:       outputData,
	}, nil
}

func (a *ArchitectureDesignAgent) CanHandle(input interfaces.AgentInput) bool {
	architectureKeywords := []string{
		"architecture", "design", "system design", "component", "microservice",
		"monolith", "技术架构", "系统设计", "组件", "微服务",
	}
	
	for _, keyword := range architectureKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *ArchitectureDesignAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *ArchitectureDesignAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *ArchitectureDesignAgent) designArchitecture(prompt string, requirements, businessValue map[string]interface{}) (map[string]interface{}, error) {
	
	architecture := map[string]interface{}{
		"type": "microservices",
		"layers": []string{
			"presentation",
			"application",
			"domain",
			"infrastructure",
		},
		"patterns": []string{
			"CQRS",
			"Event Sourcing",
			"API Gateway",
			"Service Discovery",
		},
		"communication": "async_messaging",
		"data_management": "polyglot_persistence",
		"scalability_approach": "horizontal_scaling",
		"security_model": "zero_trust",
	}
	
	return architecture, nil
}

func (a *ArchitectureDesignAgent) selectTechnologies(architecture map[string]interface{}) (map[string]interface{}, error) {
	
	technologies := map[string]interface{}{
		"frontend": []string{
			"React",
			"TypeScript",
			"Tailwind CSS",
		},
		"backend": []string{
			"Go (CloudWeGo生态)",
			"Eino",
			"Kitex",
			"Hertz",
		},
		"database": []string{
			"MySQL",
			"Redis",
			"Elasticsearch",
		},
		"messaging": []string{
			"Kafka",
			"RabbitMQ",
		},
		"deployment": []string{
			"Kubernetes",
			"Docker",
			"Helm",
		},
		"monitoring": []string{
			"Prometheus",
			"Grafana",
			"Jaeger",
		},
	}
	
	return technologies, nil
}

func (a *ArchitectureDesignAgent) designComponents(architecture map[string]interface{}, technologies map[string]interface{}) ([]map[string]interface{}, error) {
	
	components := []map[string]interface{}{
		{
			"name": "用户界面",
			"type": "frontend",
			"technologies": technologies["frontend"],
			"responsibilities": []string{
				"提供用户交互界面",
				"处理用户输入",
				"展示系统响应",
			},
		},
		{
			"name": "需求分析服务",
			"type": "backend",
			"technologies": []string{"Go", "Eino"},
			"responsibilities": []string{
				"分析用户输入的需求",
				"提取关键信息",
				"生成结构化需求",
			},
		},
		{
			"name": "业务价值评估服务",
			"type": "backend",
			"technologies": []string{"Go", "Eino"},
			"responsibilities": []string{
				"评估项目的业务价值",
				"计算ROI",
				"进行OKR对齐",
			},
		},
		{
			"name": "架构设计服务",
			"type": "backend",
			"technologies": []string{"Go", "Eino"},
			"responsibilities": []string{
				"生成系统架构设计",
				"选择适当的技术栈",
				"设计系统组件",
			},
		},
		{
			"name": "DevOps推荐服务",
			"type": "backend",
			"technologies": []string{"Go", "Eino"},
			"responsibilities": []string{
				"生成CI/CD流程建议",
				"提供部署策略",
				"推荐监控方案",
			},
		},
		{
			"name": "代码生成服务",
			"type": "backend",
			"technologies": []string{"Go", "Eino"},
			"responsibilities": []string{
				"生成项目骨架代码",
				"生成API定义",
				"生成数据模型",
			},
		},
		{
			"name": "知识库服务",
			"type": "backend",
			"technologies": []string{"Go", "Elasticsearch"},
			"responsibilities": []string{
				"存储和检索知识资源",
				"提供相关文档和示例",
				"学习用户偏好",
			},
		},
		{
			"name": "用户数据存储",
			"type": "database",
			"technologies": []string{"MySQL", "Redis"},
			"responsibilities": []string{
				"存储用户信息和项目数据",
				"缓存频繁访问的数据",
				"确保数据一致性",
			},
		},
		{
			"name": "事件总线",
			"type": "messaging",
			"technologies": []string{"Kafka"},
			"responsibilities": []string{
				"处理系统事件",
				"确保组件间通信",
				"支持异步处理",
			},
		},
	}
	
	return components, nil
}

func (a *ArchitectureDesignAgent) generateArchitectureSummary(architecture map[string]interface{}, technologies map[string]interface{}, components []map[string]interface{}) string {
	
	summary := "架构设计完成。\n\n"
	
	archType, _ := architecture["type"].(string)
	patterns, _ := architecture["patterns"].([]string)
	
	summary += fmt.Sprintf("架构类型: %s\n", archType)
	summary += "设计模式:\n"
	for _, pattern := range patterns {
		summary += fmt.Sprintf("- %s\n", pattern)
	}
	
	summary += "\n技术栈:\n"
	
	if frontendTech, ok := technologies["frontend"].([]string); ok {
		summary += "前端: "
		for i, tech := range frontendTech {
			if i > 0 {
				summary += ", "
			}
			summary += tech
		}
		summary += "\n"
	}
	
	if backendTech, ok := technologies["backend"].([]string); ok {
		summary += "后端: "
		for i, tech := range backendTech {
			if i > 0 {
				summary += ", "
			}
			summary += tech
		}
		summary += "\n"
	}
	
	if dbTech, ok := technologies["database"].([]string); ok {
		summary += "数据库: "
		for i, tech := range dbTech {
			if i > 0 {
				summary += ", "
			}
			summary += tech
		}
		summary += "\n"
	}
	
	summary += "\n主要组件:\n"
	for _, component := range components {
		name, _ := component["name"].(string)
		compType, _ := component["type"].(string)
		responsibilities, _ := component["responsibilities"].([]string)
		
		summary += fmt.Sprintf("- %s (%s)\n", name, compType)
		if len(responsibilities) > 0 {
			summary += "  职责: " + responsibilities[0]
			if len(responsibilities) > 1 {
				summary += " 等"
			}
			summary += "\n"
		}
	}
	
	return summary
}

func (a *ArchitectureDesignAgent) calculateConfidence(architecture map[string]interface{}) float64 {
	
	confidence := 0.7 // Base confidence
	
	if _, ok := architecture["type"]; ok {
		confidence += 0.05
	}
	
	if layers, ok := architecture["layers"].([]string); ok && len(layers) > 0 {
		confidence += 0.05
	}
	
	if patterns, ok := architecture["patterns"].([]string); ok && len(patterns) > 0 {
		confidence += 0.05
	}
	
	if _, ok := architecture["communication"]; ok {
		confidence += 0.05
	}
	
	if _, ok := architecture["data_management"]; ok {
		confidence += 0.05
	}
	
	if _, ok := architecture["scalability_approach"]; ok {
		confidence += 0.05
	}
	
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}
