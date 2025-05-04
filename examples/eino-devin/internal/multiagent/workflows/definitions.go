package workflows

import (
	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

const (
	FullDevelopmentWorkflow = "full_development"
	
	RequirementAnalysisWorkflow = "requirement_analysis"
	
	BusinessValueWorkflow = "business_value"
	
	ArchitectureDesignWorkflow = "architecture_design"
	
	DevOpsRecommendationWorkflow = "devops_recommendation"
	
	KnowledgeSuggestionsWorkflow = "knowledge_suggestions"
	
	ProjectPlanWorkflow = "project_plan"
)

type WorkflowDefinition struct {
	Name        string
	Description string
	Sequence    []interfaces.AgentRole
}

func GetWorkflowDefinitions() map[string]WorkflowDefinition {
	return map[string]WorkflowDefinition{
		FullDevelopmentWorkflow: {
			Name:        "完整开发流程",
			Description: "从需求分析到项目计划的完整开发流程",
			Sequence: []interfaces.AgentRole{
				interfaces.RequirementAnalysisRole,
				interfaces.BusinessValueRole,
				interfaces.ArchitectureDesignRole,
				interfaces.SoftwareEngineeringRole,
				interfaces.ContinuousDeliveryRole,
				interfaces.CodeImplementationRole,
				interfaces.ProjectManagementRole,
			},
		},
		RequirementAnalysisWorkflow: {
			Name:        "需求分析",
			Description: "分析用户需求并提取结构化信息",
			Sequence: []interfaces.AgentRole{
				interfaces.RequirementAnalysisRole,
			},
		},
		BusinessValueWorkflow: {
			Name:        "业务价值评估",
			Description: "评估项目的业务价值和投资回报率",
			Sequence: []interfaces.AgentRole{
				interfaces.BusinessValueRole,
			},
		},
		ArchitectureDesignWorkflow: {
			Name:        "架构设计",
			Description: "设计系统架构和技术选型",
			Sequence: []interfaces.AgentRole{
				interfaces.ArchitectureDesignRole,
			},
		},
		DevOpsRecommendationWorkflow: {
			Name:        "DevOps推荐",
			Description: "提供DevOps最佳实践和工具推荐",
			Sequence: []interfaces.AgentRole{
				interfaces.ContinuousDeliveryRole,
			},
		},
		KnowledgeSuggestionsWorkflow: {
			Name:        "知识建议",
			Description: "提供相关知识资源和最佳实践",
			Sequence: []interfaces.AgentRole{
				interfaces.KnowledgeManagementRole,
			},
		},
		ProjectPlanWorkflow: {
			Name:        "项目计划",
			Description: "生成项目计划和资源需求",
			Sequence: []interfaces.AgentRole{
				interfaces.ProjectManagementRole,
			},
		},
	}
}

func GetWorkflowByName(name string) (WorkflowDefinition, bool) {
	workflows := GetWorkflowDefinitions()
	workflow, exists := workflows[name]
	return workflow, exists
}

func GetAvailableWorkflows() []string {
	workflows := GetWorkflowDefinitions()
	names := make([]string, 0, len(workflows))
	
	for name := range workflows {
		names = append(names, name)
	}
	
	return names
}
