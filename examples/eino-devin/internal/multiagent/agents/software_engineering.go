package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type SoftwareEngineeringAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewSoftwareEngineeringAgent() *SoftwareEngineeringAgent {
	return &SoftwareEngineeringAgent{
		capabilities: []string{
			"development_process_design",
			"coding_standards_definition",
			"testing_strategy_planning",
			"code_review_process",
			"technical_debt_management",
			"development_tooling",
		},
	}
}

func (a *SoftwareEngineeringAgent) GetRole() interfaces.AgentRole {
	return interfaces.SoftwareEngineeringRole
}

func (a *SoftwareEngineeringAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("SoftwareEngineeringAgent processing input: %s", input.Prompt)
	
	var requirements, businessValue, architecture map[string]interface{}
	if input.Context != nil {
		if reqData, ok := input.Context[string(interfaces.RequirementAnalysisRole)]; ok {
			requirements = reqData.(map[string]interface{})
		}
		if bvData, ok := input.Context[string(interfaces.BusinessValueRole)]; ok {
			businessValue = bvData.(map[string]interface{})
		}
		if archData, ok := input.Context[string(interfaces.ArchitectureDesignRole)]; ok {
			architecture = archData.(map[string]interface{})
		}
	}
	
	process, err := a.designDevelopmentProcess(input.Prompt, requirements, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to design development process: %w", err)
	}
	
	standards, err := a.defineCodingStandards(process, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to define coding standards: %w", err)
	}
	
	testingStrategy, err := a.planTestingStrategy(process, requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to plan testing strategy: %w", err)
	}
	
	tools, err := a.recommendDevelopmentTools(process, standards, architecture)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to recommend development tools: %w", err)
	}
	
	outputData := map[string]interface{}{
		"development_process": process,
		"coding_standards":    standards,
		"testing_strategy":    testingStrategy,
		"development_tools":   tools,
	}
	
	summary := a.generateSoftwareEngineeringSummary(process, standards, testingStrategy, tools)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(process, standards, testingStrategy),
		Data:       outputData,
	}, nil
}

func (a *SoftwareEngineeringAgent) CanHandle(input interfaces.AgentInput) bool {
	seKeywords := []string{
		"software engineering", "development process", "coding standards", "testing",
		"code review", "technical debt", "软件工程", "开发流程", "编码规范", "测试",
	}
	
	for _, keyword := range seKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *SoftwareEngineeringAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *SoftwareEngineeringAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *SoftwareEngineeringAgent) designDevelopmentProcess(prompt string, requirements, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	process := map[string]interface{}{
		"methodology": "agile_scrum",
		"sprint_length": 2, // 2周
		"ceremonies": []string{
			"每日站会",
			"冲刺规划",
			"冲刺评审",
			"回顾会议",
			"产品待办事项梳理",
		},
		"roles": []string{
			"产品负责人",
			"Scrum Master",
			"开发团队",
			"质量保障",
			"DevOps工程师",
		},
		"workflow": []string{
			"需求分析",
			"设计",
			"开发",
			"测试",
			"部署",
			"监控",
		},
		"quality_gates": []map[string]interface{}{
			{
				"name": "代码审查",
				"criteria": []string{
					"至少一名高级开发人员的批准",
					"所有自动化测试通过",
					"代码风格检查通过",
				},
			},
			{
				"name": "测试通过",
				"criteria": []string{
					"单元测试覆盖率达到80%以上",
					"集成测试通过",
					"性能测试达到基准",
				},
			},
			{
				"name": "部署准备",
				"criteria": []string{
					"所有功能测试通过",
					"安全扫描无高危漏洞",
					"文档已更新",
				},
			},
		},
	}
	
	return process, nil
}

func (a *SoftwareEngineeringAgent) defineCodingStandards(process, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	standards := map[string]interface{}{
		"general": []string{
			"使用有意义的命名",
			"保持函数和方法简短",
			"编写单元测试",
			"遵循SOLID原则",
			"避免重复代码",
		},
		"go": []string{
			"遵循Go官方代码规范",
			"使用gofmt格式化代码",
			"错误处理必须明确",
			"避免使用全局变量",
			"使用接口进行依赖注入",
		},
		"javascript": []string{
			"使用ESLint进行代码检查",
			"使用Prettier格式化代码",
			"使用TypeScript进行类型检查",
			"避免使用var",
			"使用async/await代替Promise链",
		},
		"documentation": []string{
			"为所有公共API编写文档",
			"使用示例说明用法",
			"保持文档与代码同步",
			"记录设计决策",
		},
		"version_control": []string{
			"使用功能分支工作流",
			"提交消息应遵循约定式提交规范",
			"定期合并主分支",
			"避免提交二进制文件",
		},
	}
	
	return standards, nil
}

func (a *SoftwareEngineeringAgent) planTestingStrategy(process, requirements map[string]interface{}) (map[string]interface{}, error) {
	
	testingStrategy := map[string]interface{}{
		"levels": []map[string]interface{}{
			{
				"name": "单元测试",
				"tools": []string{"Go testing", "Jest"},
				"coverage_target": 80,
				"responsibility": "开发人员",
				"automation": "CI管道中自动运行",
			},
			{
				"name": "集成测试",
				"tools": []string{"Testcontainers", "Cypress"},
				"coverage_target": 70,
				"responsibility": "开发人员和QA",
				"automation": "CI管道中自动运行",
			},
			{
				"name": "端到端测试",
				"tools": []string{"Cypress", "Playwright"},
				"coverage_target": 50,
				"responsibility": "QA团队",
				"automation": "每日自动运行",
			},
			{
				"name": "性能测试",
				"tools": []string{"k6", "JMeter"},
				"metrics": []string{"响应时间", "吞吐量", "错误率"},
				"responsibility": "性能工程师",
				"automation": "每周自动运行",
			},
			{
				"name": "安全测试",
				"tools": []string{"OWASP ZAP", "SonarQube"},
				"responsibility": "安全团队",
				"automation": "每周自动运行",
			},
		},
		"practices": []string{
			"测试驱动开发 (TDD)",
			"行为驱动开发 (BDD)",
			"持续测试",
			"测试左移",
			"探索性测试",
		},
		"test_data_management": "使用测试数据生成器和固定的测试数据集",
		"test_environments": []string{
			"开发环境",
			"测试环境",
			"预生产环境",
			"生产环境",
		},
	}
	
	return testingStrategy, nil
}

func (a *SoftwareEngineeringAgent) recommendDevelopmentTools(process, standards, architecture map[string]interface{}) (map[string]interface{}, error) {
	
	tools := map[string]interface{}{
		"ide": []string{
			"GoLand",
			"Visual Studio Code",
		},
		"version_control": []string{
			"Git",
			"GitHub",
		},
		"build_tools": []string{
			"Go Build",
			"npm/yarn",
		},
		"ci_cd": []string{
			"GitHub Actions",
			"Jenkins",
		},
		"code_quality": []string{
			"SonarQube",
			"Golangci-lint",
			"ESLint",
		},
		"testing": []string{
			"Go testing",
			"Jest",
			"Cypress",
		},
		"documentation": []string{
			"Swagger",
			"Storybook",
		},
		"monitoring": []string{
			"Prometheus",
			"Grafana",
		},
		"collaboration": []string{
			"Jira",
			"Confluence",
			"Slack",
		},
	}
	
	return tools, nil
}

func (a *SoftwareEngineeringAgent) generateSoftwareEngineeringSummary(process, standards, testingStrategy, tools map[string]interface{}) string {
	
	summary := "软件工程实践建议完成。\n\n"
	
	methodology, _ := process["methodology"].(string)
	sprintLength, _ := process["sprint_length"].(float64)
	
	summary += fmt.Sprintf("开发方法论: %s\n", methodology)
	summary += fmt.Sprintf("冲刺长度: %.0f周\n", sprintLength)
	
	if ceremonies, ok := process["ceremonies"].([]string); ok && len(ceremonies) > 0 {
		summary += "关键仪式:\n"
		for _, ceremony := range ceremonies[:3] {
			summary += fmt.Sprintf("- %s\n", ceremony)
		}
		if len(ceremonies) > 3 {
			summary += "- ...\n"
		}
	}
	
	summary += "\n编码规范:\n"
	
	if generalStandards, ok := standards["general"].([]string); ok && len(generalStandards) > 0 {
		summary += "通用规范:\n"
		for _, std := range generalStandards[:3] {
			summary += fmt.Sprintf("- %s\n", std)
		}
		if len(generalStandards) > 3 {
			summary += "- ...\n"
		}
	}
	
	summary += "\n测试策略:\n"
	
	if levels, ok := testingStrategy["levels"].([]map[string]interface{}); ok && len(levels) > 0 {
		for i, level := range levels {
			if i >= 3 {
				summary += "- ...\n"
				break
			}
			
			name, _ := level["name"].(string)
			coverageTarget, ok := level["coverage_target"].(float64)
			
			if ok {
				summary += fmt.Sprintf("- %s (目标覆盖率: %.0f%%)\n", name, coverageTarget)
			} else {
				summary += fmt.Sprintf("- %s\n", name)
			}
		}
	}
	
	summary += "\n推荐工具:\n"
	
	toolCategories := []string{"ide", "version_control", "ci_cd", "code_quality"}
	for _, category := range toolCategories {
		if toolList, ok := tools[category].([]string); ok && len(toolList) > 0 {
			summary += fmt.Sprintf("- %s: %s\n", category, toolList[0])
		}
	}
	
	return summary
}

func (a *SoftwareEngineeringAgent) calculateConfidence(process, standards, testingStrategy map[string]interface{}) float64 {
	
	confidence := 0.7 // Base confidence
	
	if _, ok := process["methodology"]; ok {
		confidence += 0.05
	}
	
	if ceremonies, ok := process["ceremonies"].([]string); ok && len(ceremonies) > 0 {
		confidence += 0.05
	}
	
	if generalStandards, ok := standards["general"].([]string); ok && len(generalStandards) > 0 {
		confidence += 0.05
	}
	
	if levels, ok := testingStrategy["levels"].([]map[string]interface{}); ok && len(levels) > 0 {
		confidence += 0.05
	}
	
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}
