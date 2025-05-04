package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type CodeImplementationAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewCodeImplementationAgent() *CodeImplementationAgent {
	return &CodeImplementationAgent{
		capabilities: []string{
			"code_generation",
			"api_implementation",
			"data_model_creation",
			"ui_component_development",
			"test_case_generation",
			"documentation_generation",
		},
	}
}

func (a *CodeImplementationAgent) GetRole() interfaces.AgentRole {
	return interfaces.CodeImplementationRole
}

func (a *CodeImplementationAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("CodeImplementationAgent processing input: %s", input.Prompt)
	
	var requirements, architecture, softwareEngineering, continuousDelivery map[string]interface{}
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
		if cdData, ok := input.Context[string(interfaces.ContinuousDeliveryRole)]; ok {
			continuousDelivery = cdData.(map[string]interface{})
		}
	}
	
	projectStructure, err := a.generateProjectStructure(input.Prompt, requirements, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate project structure: %w", err)
	}
	
	apiDefinitions, err := a.generateAPIDefinitions(projectStructure, requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate API definitions: %w", err)
	}
	
	dataModels, err := a.generateDataModels(apiDefinitions, requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate data models: %w", err)
	}
	
	codeSamples, err := a.generateCodeSamples(projectStructure, apiDefinitions, dataModels, softwareEngineering)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate code samples: %w", err)
	}
	
	testCases, err := a.generateTestCases(apiDefinitions, dataModels, codeSamples)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to generate test cases: %w", err)
	}
	
	outputData := map[string]interface{}{
		"project_structure": projectStructure,
		"api_definitions":   apiDefinitions,
		"data_models":       dataModels,
		"code_samples":      codeSamples,
		"test_cases":        testCases,
	}
	
	summary := a.generateCodeImplementationSummary(projectStructure, apiDefinitions, dataModels, codeSamples, testCases)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(projectStructure, apiDefinitions, dataModels),
		Data:       outputData,
	}, nil
}

func (a *CodeImplementationAgent) CanHandle(input interfaces.AgentInput) bool {
	codeKeywords := []string{
		"code", "implementation", "api", "data model", "ui", "test", "documentation",
		"代码", "实现", "接口", "数据模型", "用户界面", "测试", "文档",
	}
	
	for _, keyword := range codeKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *CodeImplementationAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *CodeImplementationAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *CodeImplementationAgent) generateProjectStructure(prompt string, requirements, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	projectStructure := map[string]interface{}{
		"root_directory": "eino-devin-implementation",
		"directories": []map[string]interface{}{
			{
				"name": "cmd",
				"description": "应用程序入口点",
				"subdirectories": []map[string]interface{}{
					{
						"name": "server",
						"description": "服务器入口",
						"files": []string{
							"main.go",
						},
					},
				},
			},
			{
				"name": "internal",
				"description": "内部包，不对外暴露",
				"subdirectories": []map[string]interface{}{
					{
						"name": "api",
						"description": "API定义和处理器",
						"files": []string{
							"handlers.go",
							"middleware.go",
							"routes.go",
						},
					},
					{
						"name": "models",
						"description": "数据模型",
						"files": []string{
							"user.go",
							"project.go",
							"requirement.go",
						},
					},
					{
						"name": "multiagent",
						"description": "多智能体系统",
						"subdirectories": []map[string]interface{}{
							{
								"name": "interfaces",
								"description": "智能体接口定义",
								"files": []string{
									"agent.go",
								},
							},
							{
								"name": "coordinator",
								"description": "智能体协调器",
								"files": []string{
									"coordinator.go",
								},
							},
							{
								"name": "agents",
								"description": "各种专业智能体",
								"files": []string{
									"requirement_analysis.go",
									"business_value.go",
									"architecture_design.go",
									"software_engineering.go",
									"continuous_delivery.go",
									"code_implementation.go",
								},
							},
						},
					},
				},
			},
			{
				"name": "web",
				"description": "Web前端",
				"subdirectories": []map[string]interface{}{
					{
						"name": "src",
						"description": "源代码",
						"files": []string{
							"App.jsx",
							"index.jsx",
						},
					},
				},
			},
		},
	}
	
	return projectStructure, nil
}

func (a *CodeImplementationAgent) generateAPIDefinitions(projectStructure, requirements map[string]interface{}) (map[string]interface{}, error) {
	
	apiDefinitions := map[string]interface{}{
		"openapi_version": "3.0.0",
		"info": map[string]interface{}{
			"title": "EinoDevOps API",
			"version": "1.0.0",
			"description": "API for EinoDevOps助手",
		},
		"paths": map[string]interface{}{
			"/conversations": map[string]interface{}{
				"post": map[string]interface{}{
					"summary": "创建新对话",
					"description": "创建一个新的对话会话",
				},
				"get": map[string]interface{}{
					"summary": "获取对话列表",
					"description": "获取用户的对话列表",
				},
			},
			"/conversations/{conversation_id}/messages": map[string]interface{}{
				"post": map[string]interface{}{
					"summary": "发送消息",
					"description": "在对话中发送新消息",
				},
				"get": map[string]interface{}{
					"summary": "获取消息列表",
					"description": "获取对话中的消息列表",
				},
			},
		},
	}
	
	return apiDefinitions, nil
}

func (a *CodeImplementationAgent) generateDataModels(apiDefinitions, requirements map[string]interface{}) (map[string]interface{}, error) {
	
	dataModels := map[string]interface{}{
		"go_models": map[string]interface{}{
			"user.go": "// User represents a user in the system",
			"project.go": "// Project represents a project in the system",
			"requirement.go": "// Requirement represents a requirement in the system",
			"conversation.go": "// Conversation represents a conversation between a user and the assistant",
			"message.go": "// Message represents a message in a conversation",
		},
	}
	
	return dataModels, nil
}

func (a *CodeImplementationAgent) generateCodeSamples(projectStructure, apiDefinitions, dataModels, softwareEngineering map[string]interface{}) (map[string]interface{}, error) {
	
	codeSamples := map[string]interface{}{
		"backend": map[string]interface{}{
			"main.go": "// Main entry point for the application",
			"handlers.go": "// API handlers",
			"coordinator.go": "// Multi-agent coordinator",
		},
		"frontend": map[string]interface{}{
			"ChatInterface.jsx": "// Chat interface component",
			"DevOpsVisualizer.jsx": "// DevOps visualization component",
		},
	}
	
	return codeSamples, nil
}

func (a *CodeImplementationAgent) generateTestCases(apiDefinitions, dataModels, codeSamples map[string]interface{}) (map[string]interface{}, error) {
	
	testCases := map[string]interface{}{
		"unit_tests": []string{
			"测试用户创建",
			"测试项目创建",
			"测试需求分析",
		},
		"integration_tests": []string{
			"测试对话流程",
			"测试多智能体协作",
		},
		"e2e_tests": []string{
			"测试从需求到代码的完整流程",
		},
	}
	
	return testCases, nil
}

func (a *CodeImplementationAgent) generateCodeImplementationSummary(projectStructure, apiDefinitions, dataModels, codeSamples, testCases map[string]interface{}) string {
	
	summary := "代码实现建议完成。\n\n"
	
	summary += "项目结构:\n"
	if dirs, ok := projectStructure["directories"].([]map[string]interface{}); ok && len(dirs) > 0 {
		for i, dir := range dirs {
			if i >= 3 {
				summary += "- ...\n"
				break
			}
			
			name, _ := dir["name"].(string)
			description, _ := dir["description"].(string)
			
			summary += fmt.Sprintf("- %s: %s\n", name, description)
		}
	}
	
	summary += "\nAPI定义:\n"
	if paths, ok := apiDefinitions["paths"].(map[string]interface{}); ok {
		i := 0
		for path, _ := range paths {
			if i >= 3 {
				summary += "- ...\n"
				break
			}
			
			summary += fmt.Sprintf("- %s\n", path)
			i++
		}
	}
	
	summary += "\n数据模型:\n"
	if goModels, ok := dataModels["go_models"].(map[string]interface{}); ok {
		i := 0
		for model, _ := range goModels {
			if i >= 3 {
				summary += "- ...\n"
				break
			}
			
			summary += fmt.Sprintf("- %s\n", model)
			i++
		}
	}
	
	summary += "\n测试用例:\n"
	if unitTests, ok := testCases["unit_tests"].([]string); ok && len(unitTests) > 0 {
		summary += "单元测试:\n"
		for i, test := range unitTests {
			if i >= 3 {
				summary += "- ...\n"
				break
			}
			
			summary += fmt.Sprintf("- %s\n", test)
		}
	}
	
	return summary
}

func (a *CodeImplementationAgent) calculateConfidence(projectStructure, apiDefinitions, dataModels map[string]interface{}) float64 {
	
	confidence := 0.7 // Base confidence
	
	if dirs, ok := projectStructure["directories"].([]map[string]interface{}); ok && len(dirs) > 0 {
		confidence += 0.05
	}
	
	if paths, ok := apiDefinitions["paths"].(map[string]interface{}); ok && len(paths) > 0 {
		confidence += 0.05
	}
	
	if goModels, ok := dataModels["go_models"].(map[string]interface{}); ok && len(goModels) > 0 {
		confidence += 0.05
	}
	
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}
