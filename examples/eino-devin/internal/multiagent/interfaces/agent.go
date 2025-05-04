package interfaces

import (
	"context"
)

type AgentRole string

const (
	RequirementAnalysisRole   AgentRole = "requirement_analysis"
	BusinessValueRole         AgentRole = "business_value"
	ArchitectureDesignRole    AgentRole = "architecture_design"
	SoftwareEngineeringRole   AgentRole = "software_engineering"
	ContinuousDeliveryRole    AgentRole = "continuous_delivery"
	CodeImplementationRole    AgentRole = "code_implementation"
	KnowledgeManagementRole   AgentRole = "knowledge_management"
	ProjectManagementRole     AgentRole = "project_management"
)

type AgentInput struct {
	Prompt string `json:"prompt"`
	
	Context map[string]interface{} `json:"context"`
	
	Metadata map[string]interface{} `json:"metadata"`
}

type AgentOutput struct {
	Content string `json:"content"`
	
	Confidence float64 `json:"confidence"`
	
	Data map[string]interface{} `json:"data"`
	
	Error string `json:"error,omitempty"`
}

type Agent interface {
	GetRole() AgentRole
	
	Process(ctx context.Context, input AgentInput) (AgentOutput, error)
	
	CanHandle(input AgentInput) bool
	
	GetCapabilities() []string
	
	Initialize(config map[string]interface{}) error
}
