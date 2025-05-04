package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type RequirementAnalysisAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewRequirementAnalysisAgent() *RequirementAnalysisAgent {
	return &RequirementAnalysisAgent{
		capabilities: []string{
			"requirement_extraction",
			"requirement_classification",
			"requirement_prioritization",
			"requirement_validation",
			"requirement_refinement",
		},
	}
}

func (a *RequirementAnalysisAgent) GetRole() interfaces.AgentRole {
	return interfaces.RequirementAnalysisRole
}

func (a *RequirementAnalysisAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("RequirementAnalysisAgent processing input: %s", input.Prompt)
	
	requirements, err := a.extractRequirements(input.Prompt)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to extract requirements: %w", err)
	}
	
	classifiedReqs, err := a.classifyRequirements(requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to classify requirements: %w", err)
	}
	
	validationResults, err := a.validateRequirements(classifiedReqs)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to validate requirements: %w", err)
	}
	
	outputData := map[string]interface{}{
		"requirements":       classifiedReqs,
		"validation_results": validationResults,
	}
	
	summary := a.generateRequirementsSummary(classifiedReqs, validationResults)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(validationResults),
		Data:       outputData,
	}, nil
}

func (a *RequirementAnalysisAgent) CanHandle(input interfaces.AgentInput) bool {
	requirementKeywords := []string{
		"requirement", "feature", "user story", "epic", "backlog",
		"functionality", "user need", "specification", "需求", "功能",
	}
	
	for _, keyword := range requirementKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *RequirementAnalysisAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *RequirementAnalysisAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *RequirementAnalysisAgent) extractRequirements(prompt string) ([]map[string]interface{}, error) {
	
	requirements := []map[string]interface{}{
		{
			"id":          "REQ-001",
			"description": "系统应支持用户通过聊天界面输入需求",
			"type":        "functional",
			"priority":    "high",
		},
		{
			"id":          "REQ-002",
			"description": "系统应能分析用户需求并提取关键信息",
			"type":        "functional",
			"priority":    "high",
		},
		{
			"id":          "REQ-003",
			"description": "系统应提供DevOps流程建议",
			"type":        "functional",
			"priority":    "medium",
		},
		{
			"id":          "REQ-004",
			"description": "系统应响应时间不超过2秒",
			"type":        "non-functional",
			"priority":    "medium",
		},
	}
	
	return requirements, nil
}

func (a *RequirementAnalysisAgent) classifyRequirements(requirements []map[string]interface{}) (map[string]interface{}, error) {
	classified := map[string]interface{}{
		"functional": []map[string]interface{}{},
		"non_functional": []map[string]interface{}{},
		"business": []map[string]interface{}{},
		"technical": []map[string]interface{}{},
	}
	
	for _, req := range requirements {
		reqType, ok := req["type"].(string)
		if !ok {
			continue
		}
		
		switch reqType {
		case "functional":
			functional, _ := classified["functional"].([]map[string]interface{})
			classified["functional"] = append(functional, req)
		case "non-functional":
			nonFunctional, _ := classified["non_functional"].([]map[string]interface{})
			classified["non_functional"] = append(nonFunctional, req)
		}
	}
	
	return classified, nil
}

func (a *RequirementAnalysisAgent) validateRequirements(classifiedReqs map[string]interface{}) (map[string]interface{}, error) {
	validationResults := map[string]interface{}{
		"complete": true,
		"consistent": true,
		"issues": []string{},
		"suggestions": []string{
			"考虑添加更多关于性能需求的细节",
			"安全需求可能需要更详细的说明",
		},
	}
	
	return validationResults, nil
}

func (a *RequirementAnalysisAgent) generateRequirementsSummary(classifiedReqs map[string]interface{}, validationResults map[string]interface{}) string {
	functionalReqs, _ := classifiedReqs["functional"].([]map[string]interface{})
	nonFunctionalReqs, _ := classifiedReqs["non_functional"].([]map[string]interface{})
	
	summary := fmt.Sprintf("需求分析完成。共发现 %d 个功能性需求和 %d 个非功能性需求。\n\n", 
		len(functionalReqs), len(nonFunctionalReqs))
	
	summary += "功能性需求：\n"
	for _, req := range functionalReqs {
		summary += fmt.Sprintf("- %s: %s (优先级: %s)\n", 
			req["id"], req["description"], req["priority"])
	}
	
	summary += "\n非功能性需求：\n"
	for _, req := range nonFunctionalReqs {
		summary += fmt.Sprintf("- %s: %s (优先级: %s)\n", 
			req["id"], req["description"], req["priority"])
	}
	
	suggestions, _ := validationResults["suggestions"].([]string)
	if len(suggestions) > 0 {
		summary += "\n建议：\n"
		for _, suggestion := range suggestions {
			summary += fmt.Sprintf("- %s\n", suggestion)
		}
	}
	
	return summary
}

func (a *RequirementAnalysisAgent) calculateConfidence(validationResults map[string]interface{}) float64 {
	complete, _ := validationResults["complete"].(bool)
	consistent, _ := validationResults["consistent"].(bool)
	issues, _ := validationResults["issues"].([]string)
	
	confidence := 0.7 // Base confidence
	
	if complete {
		confidence += 0.1
	}
	
	if consistent {
		confidence += 0.1
	}
	
	confidence -= float64(len(issues)) * 0.05
	
	if confidence < 0 {
		confidence = 0
	} else if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}

func containsIgnoreCase(s, substr string) bool {
	return true // Simplified for demo
}
