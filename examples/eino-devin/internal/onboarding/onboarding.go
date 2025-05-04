package onboarding

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/bytedance/eino-devin-implementation/internal/config"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
)

type BusinessOnboarding struct {
	config *config.Config
	
	onboardingGraph compose.Runnable[*OnboardingRequest, *OnboardingResponse]
	
	reflectionChain compose.Runnable[*ReflectionRequest, *ReflectionResponse]
	
	clarificationChain compose.Runnable[*ClarificationRequest, *ClarificationResponse]
	
	aiDescriptionChain compose.Runnable[*AIDescriptionRequest, *AIDescriptionResponse]
	
	devopsRecommendationChain compose.Runnable[*DevOpsRecommendationRequest, *DevOpsRecommendationResponse]
}

type OnboardingRequest struct {
	UserID string `json:"user_id"`
	
	Department string `json:"department"`
	
	ProjectName string `json:"project_name"`
	
	ProjectDescription string `json:"project_description"`
	
	ProjectType string `json:"project_type"`
	
	TechPreferences []string `json:"tech_preferences"`
	
	BusinessScale string `json:"business_scale"`
	
	TimeRequirement string `json:"time_requirement"`
}

type OnboardingResponse struct {
	SessionID string `json:"session_id"`
	
	Status string `json:"status"`
	
	NextStep string `json:"next_step"`
	
	Reflection *ReflectionResponse `json:"reflection,omitempty"`
	
	Clarification *ClarificationResponse `json:"clarification,omitempty"`
	
	AIDescription *AIDescriptionResponse `json:"ai_description,omitempty"`
	
	DevOpsRecommendation *DevOpsRecommendationResponse `json:"devops_recommendation,omitempty"`
}

type ReflectionRequest struct {
	ProjectDescription string `json:"project_description"`
	
	ProjectType string `json:"project_type"`
	
	TechPreferences []string `json:"tech_preferences"`
}

type ReflectionResponse struct {
	BusinessValue string `json:"business_value"`
	
	TechnicalFeasibility string `json:"technical_feasibility"`
	
	PotentialChallenges []string `json:"potential_challenges"`
	
	SuggestedImprovements []string `json:"suggested_improvements"`
}

type ClarificationRequest struct {
	ProjectDescription string `json:"project_description"`
	
	Reflection *ReflectionResponse `json:"reflection"`
}

type ClarificationResponse struct {
	Questions []ClarificationQuestion `json:"questions"`
	
	RequirementPoints []string `json:"requirement_points"`
	
	FunctionalScope string `json:"functional_scope"`
	
	NonFunctionalRequirements []string `json:"non_functional_requirements"`
}

type ClarificationQuestion struct {
	ID string `json:"id"`
	
	Question string `json:"question"`
	
	Type string `json:"type"`
	
	Description string `json:"description"`
	
	Answer string `json:"answer"`
}

type AIDescriptionRequest struct {
	ProjectDescription string `json:"project_description"`
	
	Clarification *ClarificationResponse `json:"clarification"`
}

type AIDescriptionResponse struct {
	AITaskDescription string `json:"ai_task_description"`
	
	SystemPrompt string `json:"system_prompt"`
	
	UserPrompt string `json:"user_prompt"`
	
	Constraints []string `json:"constraints"`
	
	EvaluationCriteria []string `json:"evaluation_criteria"`
}

type DevOpsRecommendationRequest struct {
	ProjectDescription string `json:"project_description"`
	
	AIDescription *AIDescriptionResponse `json:"ai_description"`
	
	TechPreferences []string `json:"tech_preferences"`
	
	BusinessScale string `json:"business_scale"`
	
	PerformanceRequirements string `json:"performance_requirements"`
}

type DevOpsRecommendationResponse struct {
	Architecture string `json:"architecture"`
	
	ArchitectureDiagram string `json:"architecture_diagram"`
	
	TechStack []string `json:"tech_stack"`
	
	CloudWeGoComponents []CloudWeGoComponent `json:"cloudwego_components"`
	
	PipelineConfig string `json:"pipeline_config"`
	
	Stages []PipelineStage `json:"stages"`
	
	ToolRecommendations []ToolRecommendation `json:"tool_recommendations"`
	
	BestPractices []string `json:"best_practices"`
}

type CloudWeGoComponent struct {
	Name string `json:"name"`
	
	Description string `json:"description"`
	
	UsageScenario string `json:"usage_scenario"`
	
	Benefits []string `json:"benefits"`
	
	DocumentationURL string `json:"documentation_url"`
}

type PipelineStage struct {
	Name string `json:"name"`
	
	Description string `json:"description"`
	
	Steps []string `json:"steps"`
}

type ToolRecommendation struct {
	Name string `json:"name"`
	
	Type string `json:"type"`
	
	Description string `json:"description"`
	
	Alternatives []string `json:"alternatives"`
}

func NewBusinessOnboarding(ctx context.Context, cfg *config.Config, chatModel model.ToolCallingChatModel) (*BusinessOnboarding, error) {
	onboardingGraph, err := createOnboardingGraph(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建引导流程图失败: %w", err)
	}
	
	reflectionChain, err := createReflectionChain(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建需求反思链失败: %w", err)
	}
	
	clarificationChain, err := createClarificationChain(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建需求澄清链失败: %w", err)
	}
	
	aiDescriptionChain, err := createAIDescriptionChain(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建AI描述转换链失败: %w", err)
	}
	
	devopsRecommendationChain, err := createDevOpsRecommendationChain(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建DevOps推荐链失败: %w", err)
	}
	
	return &BusinessOnboarding{
		config:                   cfg,
		onboardingGraph:          onboardingGraph,
		reflectionChain:          reflectionChain,
		clarificationChain:       clarificationChain,
		aiDescriptionChain:       aiDescriptionChain,
		devopsRecommendationChain: devopsRecommendationChain,
	}, nil
}

func createOnboardingGraph(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*OnboardingRequest, *OnboardingResponse], error) {
	onboardingGraph := compose.NewGraph[*OnboardingRequest, *OnboardingResponse]()
	
	initLambda := compose.InvokableLambda(initOnboarding)
	onboardingGraph.AddNode("init", initLambda)
	
	reflectLambda := compose.InvokableLambda(reflectOnIdea)
	onboardingGraph.AddNode("reflect", reflectLambda)
	
	clarifyLambda := compose.InvokableLambda(clarifyRequirements)
	onboardingGraph.AddNode("clarify", clarifyLambda)
	
	convertToAILambda := compose.InvokableLambda(convertToAIDescription)
	onboardingGraph.AddNode("convert_to_ai", convertToAILambda)
	
	recommendDevOpsLambda := compose.InvokableLambda(recommendDevOps)
	onboardingGraph.AddNode("recommend_devops", recommendDevOpsLambda)
	
	summarizeLambda := compose.InvokableLambda(summarizeOnboarding)
	onboardingGraph.AddNode("summarize", summarizeLambda)
	
	onboardingGraph.AddEdge(compose.START, "init")
	onboardingGraph.AddEdge("init", "reflect")
	onboardingGraph.AddEdge("reflect", "clarify")
	onboardingGraph.AddEdge("clarify", "convert_to_ai")
	onboardingGraph.AddEdge("convert_to_ai", "recommend_devops")
	onboardingGraph.AddEdge("recommend_devops", "summarize")
	onboardingGraph.AddEdge("summarize", compose.END)
	
	runnable, err := onboardingGraph.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译引导流程图失败: %w", err)
	}
	
	return runnable, nil
}

func createReflectionChain(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*ReflectionRequest, *ReflectionResponse], error) {
	reflectionChain := compose.NewChain[*ReflectionRequest, *ReflectionResponse]()
	
	analyzeBusinessValuePrompt := `你是一位经验丰富的业务分析师，专注于评估软件项目的业务价值。
请分析以下项目描述，并提供详细的业务价值评估：

项目描述：{{.ProjectDescription}}
项目类型：{{.ProjectType}}
技术偏好：{{.TechPreferences}}

请从以下几个方面进行分析：
1. 业务影响：该项目如何影响业务运营和效率
2. 市场价值：该项目如何提升市场竞争力
3. 用户价值：该项目如何改善用户体验
4. 投资回报：该项目的投资回报预期

请提供一个全面的业务价值评估，不超过300字。`
	
	analyzeBusinessValueNode := compose.NewLLMChainNode[*ReflectionRequest, *ReflectionResponse](
		chatModel,
		analyzeBusinessValuePrompt,
		func(ctx context.Context, input *ReflectionRequest, output string) (*ReflectionResponse, error) {
			return &ReflectionResponse{
				BusinessValue: output,
			}, nil
		},
	)
	reflectionChain.AppendNode(analyzeBusinessValueNode, compose.WithNodeName("analyze_business_value"))
	
	assessTechnicalFeasibilityPrompt := `你是一位技术架构师，专注于评估软件项目的技术可行性。
请分析以下项目描述，并提供详细的技术可行性评估：

项目描述：{{.ProjectDescription}}
项目类型：{{.ProjectType}}
技术偏好：{{.TechPreferences}}
已识别的业务价值：{{.BusinessValue}}

请从以下几个方面进行分析：
1. 技术栈选择：推荐使用CloudWeGo生态中的哪些组件
2. 架构设计：适合该项目的架构模式
3. 性能考量：可能的性能瓶颈和解决方案
4. 扩展性：系统如何支持未来扩展

请提供一个全面的技术可行性评估，不超过300字。`
	
	assessTechnicalFeasibilityNode := compose.NewLLMChainNode[*ReflectionResponse, *ReflectionResponse](
		chatModel,
		assessTechnicalFeasibilityPrompt,
		func(ctx context.Context, input *ReflectionResponse, output string) (*ReflectionResponse, error) {
			input.TechnicalFeasibility = output
			return input, nil
		},
	)
	reflectionChain.AppendNode(assessTechnicalFeasibilityNode, compose.WithNodeName("assess_technical_feasibility"))
	
	identifyChallengesPrompt := `你是一位经验丰富的项目经理，专注于识别软件项目的潜在挑战。
请分析以下项目信息，并列出可能面临的主要挑战：

项目描述：{{.ProjectDescription}}
项目类型：{{.ProjectType}}
技术偏好：{{.TechPreferences}}
业务价值：{{.BusinessValue}}
技术可行性：{{.TechnicalFeasibility}}

请识别该项目在以下方面可能面临的挑战：
1. 技术挑战
2. 业务挑战
3. 团队挑战
4. 时间和资源挑战

请列出5-8个具体的挑战点，每个挑战点简洁明了。`
	
	identifyChallengesNode := compose.NewLLMChainNode[*ReflectionResponse, *ReflectionResponse](
		chatModel,
		identifyChallengesPrompt,
		func(ctx context.Context, input *ReflectionResponse, output string) (*ReflectionResponse, error) {
			challenges := []string{}
			lines := strings.Split(output, "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.HasPrefix(line, "挑战") && !strings.HasPrefix(line, "技术挑战") && !strings.HasPrefix(line, "业务挑战") && !strings.HasPrefix(line, "团队挑战") && !strings.HasPrefix(line, "时间和资源挑战") {
					challenges = append(challenges, line)
				}
			}
			input.PotentialChallenges = challenges
			return input, nil
		},
	)
	reflectionChain.AppendNode(identifyChallengesNode, compose.WithNodeName("identify_challenges"))
	
	suggestImprovementsPrompt := `你是一位解决方案架构师，专注于为软件项目提供改进建议。
请基于以下项目信息，提出具体的改进建议：

项目描述：{{.ProjectDescription}}
项目类型：{{.ProjectType}}
技术偏好：{{.TechPreferences}}
业务价值：{{.BusinessValue}}
技术可行性：{{.TechnicalFeasibility}}
潜在挑战：{{.PotentialChallenges}}

请提出针对以下方面的改进建议：
1. 技术选型优化（特别是CloudWeGo生态的应用）
2. 架构设计优化
3. 开发流程优化
4. 性能和可扩展性优化

请列出5-8个具体的改进建议，每个建议应该简洁明了，并且直接针对已识别的挑战。`
	
	suggestImprovementsNode := compose.NewLLMChainNode[*ReflectionResponse, *ReflectionResponse](
		chatModel,
		suggestImprovementsPrompt,
		func(ctx context.Context, input *ReflectionResponse, output string) (*ReflectionResponse, error) {
			improvements := []string{}
			lines := strings.Split(output, "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.HasPrefix(line, "建议") && !strings.HasPrefix(line, "技术选型优化") && !strings.HasPrefix(line, "架构设计优化") && !strings.HasPrefix(line, "开发流程优化") && !strings.HasPrefix(line, "性能和可扩展性优化") {
					improvements = append(improvements, line)
				}
			}
			input.SuggestedImprovements = improvements
			return input, nil
		},
	)
	reflectionChain.AppendNode(suggestImprovementsNode, compose.WithNodeName("suggest_improvements"))
	
	runnable, err := reflectionChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译需求反思链失败: %w", err)
	}
	
	return runnable, nil
}

func createClarificationChain(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*ClarificationRequest, *ClarificationResponse], error) {
	clarificationChain := compose.NewChain[*ClarificationRequest, *ClarificationResponse]()
	
	generateQuestionsLambda := compose.InvokableLambda(generateClarificationQuestions)
	clarificationChain.AppendLambda(generateQuestionsLambda, compose.WithNodeName("generate_questions"))
	
	extractRequirementPointsLambda := compose.InvokableLambda(extractRequirementPoints)
	clarificationChain.AppendLambda(extractRequirementPointsLambda, compose.WithNodeName("extract_requirement_points"))
	
	defineFunctionalScopeLambda := compose.InvokableLambda(defineFunctionalScope)
	clarificationChain.AppendLambda(defineFunctionalScopeLambda, compose.WithNodeName("define_functional_scope"))
	
	identifyNonFunctionalRequirementsLambda := compose.InvokableLambda(identifyNonFunctionalRequirements)
	clarificationChain.AppendLambda(identifyNonFunctionalRequirementsLambda, compose.WithNodeName("identify_non_functional_requirements"))
	
	runnable, err := clarificationChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译需求澄清链失败: %w", err)
	}
	
	return runnable, nil
}

func createAIDescriptionChain(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*AIDescriptionRequest, *AIDescriptionResponse], error) {
	aiDescriptionChain := compose.NewChain[*AIDescriptionRequest, *AIDescriptionResponse]()
	
	generateAITaskDescriptionLambda := compose.InvokableLambda(generateAITaskDescription)
	aiDescriptionChain.AppendLambda(generateAITaskDescriptionLambda, compose.WithNodeName("generate_ai_task_description"))
	
	generateSystemPromptLambda := compose.InvokableLambda(generateSystemPrompt)
	aiDescriptionChain.AppendLambda(generateSystemPromptLambda, compose.WithNodeName("generate_system_prompt"))
	
	generateUserPromptLambda := compose.InvokableLambda(generateUserPrompt)
	aiDescriptionChain.AppendLambda(generateUserPromptLambda, compose.WithNodeName("generate_user_prompt"))
	
	defineConstraintsLambda := compose.InvokableLambda(defineConstraints)
	aiDescriptionChain.AppendLambda(defineConstraintsLambda, compose.WithNodeName("define_constraints"))
	
	defineEvaluationCriteriaLambda := compose.InvokableLambda(defineEvaluationCriteria)
	aiDescriptionChain.AppendLambda(defineEvaluationCriteriaLambda, compose.WithNodeName("define_evaluation_criteria"))
	
	runnable, err := aiDescriptionChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译AI描述转换链失败: %w", err)
	}
	
	return runnable, nil
}

func createDevOpsRecommendationChain(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*DevOpsRecommendationRequest, *DevOpsRecommendationResponse], error) {
	devopsRecommendationChain := compose.NewChain[*DevOpsRecommendationRequest, *DevOpsRecommendationResponse]()
	
	analyzeRequirementsLambda := compose.InvokableLambda(analyzeDevOpsRequirements)
	devopsRecommendationChain.AppendLambda(analyzeRequirementsLambda, compose.WithNodeName("analyze_requirements"))
	
	recommendArchitectureLambda := compose.InvokableLambda(recommendArchitecture)
	devopsRecommendationChain.AppendLambda(recommendArchitectureLambda, compose.WithNodeName("recommend_architecture"))
	
	recommendCloudWeGoComponentsLambda := compose.InvokableLambda(recommendCloudWeGoComponents)
	devopsRecommendationChain.AppendLambda(recommendCloudWeGoComponentsLambda, compose.WithNodeName("recommend_cloudwego_components"))
	
	recommendPipelineLambda := compose.InvokableLambda(recommendPipeline)
	devopsRecommendationChain.AppendLambda(recommendPipelineLambda, compose.WithNodeName("recommend_pipeline"))
	
	recommendToolsLambda := compose.InvokableLambda(recommendTools)
	devopsRecommendationChain.AppendLambda(recommendToolsLambda, compose.WithNodeName("recommend_tools"))
	
	provideBestPracticesLambda := compose.InvokableLambda(provideBestPractices)
	devopsRecommendationChain.AppendLambda(provideBestPracticesLambda, compose.WithNodeName("provide_best_practices"))
	
	runnable, err := devopsRecommendationChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译DevOps推荐链失败: %w", err)
	}
	
	return runnable, nil
}


func initOnboarding(ctx context.Context, request *OnboardingRequest) (*OnboardingRequest, error) {
	
	return request, nil
}

func reflectOnIdea(ctx context.Context, request *OnboardingRequest) (*ReflectionRequest, error) {
	reflectionRequest := &ReflectionRequest{
		ProjectDescription: request.ProjectDescription,
		ProjectType:        request.ProjectType,
		TechPreferences:    request.TechPreferences,
	}
	
	fmt.Printf("开始对项目 '%s' 进行反思分析\n", request.ProjectName)
	
	return reflectionRequest, nil
}

func clarifyRequirements(ctx context.Context, reflection *ReflectionResponse) (*ClarificationRequest, error) {
	clarificationRequest := &ClarificationRequest{
		ProjectDescription: "项目描述", // 这里应该从上下文中获取
		Reflection:         reflection,
	}
	
	fmt.Printf("基于反思结果开始需求澄清过程\n")
	fmt.Printf("业务价值: %s\n", reflection.BusinessValue)
	fmt.Printf("技术可行性: %s\n", reflection.TechnicalFeasibility)
	fmt.Printf("潜在挑战: %v\n", reflection.PotentialChallenges)
	fmt.Printf("改进建议: %v\n", reflection.SuggestedImprovements)
	
	return clarificationRequest, nil
}

func convertToAIDescription(ctx context.Context, clarification *ClarificationResponse) (*AIDescriptionRequest, error) {
	aiDescriptionRequest := &AIDescriptionRequest{
		ProjectDescription: "项目描述", // 这里应该从上下文中获取
		Clarification:      clarification,
	}
	
	fmt.Printf("开始将需求转换为AI友好描述\n")
	fmt.Printf("功能范围: %s\n", clarification.FunctionalScope)
	fmt.Printf("非功能需求: %v\n", clarification.NonFunctionalRequirements)
	
	return aiDescriptionRequest, nil
}

func recommendDevOps(ctx context.Context, aiDescription *AIDescriptionResponse) (*DevOpsRecommendationRequest, error) {
	devopsRecommendationRequest := &DevOpsRecommendationRequest{
		ProjectDescription:       "项目描述", // 这里应该从上下文中获取
		AIDescription:            aiDescription,
		TechPreferences:          []string{"Go", "CloudWeGo", "Kubernetes"},
		BusinessScale:            "中型",
		PerformanceRequirements:  "高性能、高可靠性、高可扩展性",
	}
	
	fmt.Printf("开始生成DevOps推荐方案\n")
	fmt.Printf("AI任务描述: %s\n", aiDescription.AITaskDescription)
	fmt.Printf("系统提示词: %s\n", aiDescription.SystemPrompt)
	fmt.Printf("约束条件: %v\n", aiDescription.Constraints)
	
	return devopsRecommendationRequest, nil
}

func summarizeOnboarding(ctx context.Context, devopsRecommendation *DevOpsRecommendationResponse) (*OnboardingResponse, error) {
	sessionID := fmt.Sprintf("session-%d", time.Now().Unix())
	
	onboardingResponse := &OnboardingResponse{
		SessionID:            sessionID,
		Status:               "completed",
		NextStep:             "task_planning",
		DevOpsRecommendation: devopsRecommendation,
	}
	
	fmt.Printf("引导过程完成，会话ID: %s\n", sessionID)
	fmt.Printf("架构推荐: %s\n", devopsRecommendation.Architecture)
	fmt.Printf("技术栈: %v\n", devopsRecommendation.TechStack)
	fmt.Printf("CloudWeGo组件: %d个\n", len(devopsRecommendation.CloudWeGoComponents))
	fmt.Printf("流水线配置: %s\n", devopsRecommendation.PipelineConfig)
	
	return onboardingResponse, nil
}

func analyzeDevOpsRequirements(ctx context.Context, req *DevOpsRecommendationRequest) (*DevOpsRecommendationRequest, error) {
	fmt.Printf("分析DevOps需求...\n")
	fmt.Printf("项目描述: %s\n", req.ProjectDescription)
	fmt.Printf("技术偏好: %v\n", req.TechPreferences)
	fmt.Printf("业务规模: %s\n", req.BusinessScale)
	fmt.Printf("性能需求: %s\n", req.PerformanceRequirements)
	
	
	return req, nil
}

// recommendArchitecture 推荐架构
func recommendArchitecture(ctx context.Context, req *DevOpsRecommendationRequest) (*DevOpsRecommendationResponse, error) {
	fmt.Printf("推荐架构...\n")
	
	
	response := &DevOpsRecommendationResponse{
		Architecture: "基于CloudWeGo的微服务架构",
		ArchitectureDiagram: `
		+------------------+      +------------------+      +------------------+
		|   API Gateway    |      |  Service Mesh    |      |   Observability  |
		|   (Hertz)        |----->|  (Volo)          |----->|   (Tracing)      |
		+------------------+      +------------------+      +------------------+
		         |                        |                         |
		         v                        v                         v
		+------------------+      +------------------+      +------------------+
		|  Microservices   |      |   Data Storage   |      |   Message Queue  |
		|  (Kitex)         |----->|   (MySQL/Redis)  |----->|   (Kafka)        |
		+------------------+      +------------------+      +------------------+
		`,
		TechStack: []string{
			"Go",
			"CloudWeGo",
			"Kubernetes",
			"Docker",
			"MySQL",
			"Redis",
			"Kafka",
		},
	}
	
	return response, nil
}

// recommendCloudWeGoComponents 推荐CloudWeGo组件
func recommendCloudWeGoComponents(ctx context.Context, resp *DevOpsRecommendationResponse) (*DevOpsRecommendationResponse, error) {
	fmt.Printf("推荐CloudWeGo组件...\n")
	
	resp.CloudWeGoComponents = []CloudWeGoComponent{
		{
			Name:        "Kitex",
			Description: "高性能、强可扩展的Go微服务RPC框架",
			Usage:       "用于微服务间通信",
			Benefits:    []string{"高性能", "强扩展性", "多协议支持", "服务治理"},
			URL:         "https://github.com/cloudwego/kitex",
		},
		{
			Name:        "Hertz",
			Description: "Go HTTP框架，专注于高性能和强大的扩展能力",
			Usage:       "用于API网关和HTTP服务",
			Benefits:    []string{"高性能", "可观测性", "可扩展性", "易用性"},
			URL:         "https://github.com/cloudwego/hertz",
		},
		{
			Name:        "Volo",
			Description: "基于Rust的高性能RPC框架",
			Usage:       "用于服务网格和高性能服务",
			Benefits:    []string{"极致性能", "内存安全", "异步编程"},
			URL:         "https://github.com/cloudwego/volo",
		},
		{
			Name:        "Netpoll",
			Description: "高性能非阻塞I/O网络库",
			Usage:       "用于网络通信底层",
			Benefits:    []string{"高性能", "低延迟", "低内存占用"},
			URL:         "https://github.com/cloudwego/netpoll",
		},
		{
			Name:        "Frugal",
			Description: "高效的序列化库",
			Usage:       "用于数据序列化",
			Benefits:    []string{"高性能", "兼容Thrift", "低内存占用"},
			URL:         "https://github.com/cloudwego/frugal",
		},
	}
	
	return resp, nil
}

// recommendPipeline 推荐流水线
func recommendPipeline(ctx context.Context, resp *DevOpsRecommendationResponse) (*DevOpsRecommendationResponse, error) {
	fmt.Printf("推荐流水线...\n")
	
	resp.PipelineConfig = `
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: golang
    image: golang:1.20
    command:
    - cat
    tty: true
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }
    
    stages {
        stage('代码检查') {
            steps {
                container('golang') {
                    sh 'go vet ./...'
                    sh 'golangci-lint run'
                }
            }
        }
        
        stage('单元测试') {
            steps {
                container('golang') {
                    sh 'go test -v ./...'
                }
            }
        }
        
        stage('构建') {
            steps {
                container('golang') {
                    sh 'go build -o app ./cmd/server'
                }
            }
        }
        
        stage('容器化') {
            steps {
                container('docker') {
                    sh 'docker build -t myapp:${BUILD_NUMBER} .'
                }
            }
        }
        
        stage('部署') {
            steps {
                container('docker') {
                    sh 'kubectl apply -f k8s/deployment.yaml'
                }
            }
        }
    }
}
`
	
	resp.Stages = []PipelineStage{
		{
			Name:        "代码检查",
			Description: "使用go vet和golangci-lint进行代码质量检查",
			Tools:       []string{"go vet", "golangci-lint"},
		},
		{
			Name:        "单元测试",
			Description: "运行单元测试并生成覆盖率报告",
			Tools:       []string{"go test"},
		},
		{
			Name:        "构建",
			Description: "编译应用程序",
			Tools:       []string{"go build"},
		},
		{
			Name:        "容器化",
			Description: "构建Docker镜像",
			Tools:       []string{"docker build"},
		},
		{
			Name:        "部署",
			Description: "部署到Kubernetes集群",
			Tools:       []string{"kubectl"},
		},
	}
	
	return resp, nil
}

// recommendTools 推荐工具
func recommendTools(ctx context.Context, resp *DevOpsRecommendationResponse) (*DevOpsRecommendationResponse, error) {
	fmt.Printf("推荐工具...\n")
	
	resp.ToolRecommendations = []ToolRecommendation{
		{
			Name:        "Jenkins",
			Description: "开源自动化服务器",
			Usage:       "用于CI/CD流水线",
			Benefits:    []string{"灵活性", "插件生态", "社区支持"},
		},
		{
			Name:        "Kubernetes",
			Description: "容器编排平台",
			Usage:       "用于容器化应用部署和管理",
			Benefits:    []string{"自动扩缩容", "服务发现", "负载均衡", "滚动更新"},
		},
		{
			Name:        "Prometheus",
			Description: "监控系统和时间序列数据库",
			Usage:       "用于系统和应用监控",
			Benefits:    []string{"高可用", "多维数据模型", "强大的查询语言"},
		},
		{
			Name:        "Grafana",
			Description: "可视化和分析平台",
			Usage:       "用于监控数据可视化",
			Benefits:    []string{"丰富的图表", "多数据源支持", "告警功能"},
		},
		{
			Name:        "Jaeger",
			Description: "分布式追踪系统",
			Usage:       "用于微服务调用链追踪",
			Benefits:    []string{"分布式上下文传播", "性能瓶颈分析", "根因分析"},
		},
	}
	
	return resp, nil
}

// provideBestPractices 提供最佳实践
func provideBestPractices(ctx context.Context, resp *DevOpsRecommendationResponse) (*DevOpsRecommendationResponse, error) {
	fmt.Printf("提供最佳实践...\n")
	
	resp.BestPractices = []string{
		"采用微服务架构，将应用拆分为小型、独立的服务",
		"使用CloudWeGo的Kitex框架实现高性能RPC通信",
		"使用CloudWeGo的Hertz框架构建API网关",
		"实现自动化测试，包括单元测试、集成测试和端到端测试",
		"采用基础设施即代码(IaC)管理基础设施",
		"实现持续集成和持续部署(CI/CD)",
		"使用Prometheus和Grafana进行监控和告警",
		"使用Jaeger进行分布式追踪",
		"实现自动扩缩容，根据负载动态调整资源",
		"采用蓝绿部署或金丝雀部署策略",
		"实现熔断和限流机制，提高系统弹性",
		"使用服务网格管理服务间通信",
	}
	
	return resp, nil
}



func generateClarificationQuestions(ctx context.Context, request *ClarificationRequest) (*ClarificationResponse, error) {
	prompt := `你是一位经验丰富的需求分析师，专注于帮助业务人员澄清软件项目需求。
请基于以下项目信息，生成5-8个关键问题，这些问题将帮助进一步澄清项目需求：

项目描述：{{.ProjectDescription}}
业务价值：{{.BusinessValue}}
技术可行性：{{.TechnicalFeasibility}}
潜在挑战：{{.PotentialChallenges}}
改进建议：{{.SuggestedImprovements}}

请生成不同类型的问题，包括但不限于：
1. 功能需求问题（功能范围、用户操作等）
2. 非功能需求问题（性能、安全、可用性等）
3. 用户需求问题（用户群体、用户行为等）
4. 业务需求问题（业务流程、业务规则等）
5. 技术需求问题（技术栈、集成需求等）

对于每个问题，请提供以下信息：
- 问题ID（q1, q2, q3...）
- 问题内容
- 问题类型（functional, non_functional, user, business, technical）
- 问题描述（为什么这个问题重要）

请以JSON格式返回，格式如下：
{
  "questions": [
    {
      "id": "q1",
      "question": "问题内容",
      "type": "问题类型",
      "description": "问题描述"
    },
    ...
  ]
}
`

	response := &ClarificationResponse{
		Questions: []ClarificationQuestion{
			{
				ID:          "q1",
				Question:    "系统需要支持多少并发用户？",
				Type:        "performance",
				Description: "了解系统的性能需求，确保系统能够满足业务规模要求",
			},
			{
				ID:          "q2",
				Question:    "系统需要与哪些现有系统集成？",
				Type:        "integration",
				Description: "了解系统的集成需求，确保系统能够与现有业务系统无缝衔接",
			},
			{
				ID:          "q3",
				Question:    "系统的主要用户群体是谁？他们的技术水平如何？",
				Type:        "user",
				Description: "了解系统的用户需求，确保系统的用户体验符合目标用户群体的期望",
			},
			{
				ID:          "q4",
				Question:    "系统需要支持哪些核心业务流程？",
				Type:        "business",
				Description: "了解系统的业务需求，确保系统能够支持关键业务流程",
			},
			{
				ID:          "q5",
				Question:    "系统的数据安全要求是什么？",
				Type:        "security",
				Description: "了解系统的安全需求，确保系统能够保护敏感数据",
			},
			{
				ID:          "q6",
				Question:    "系统的部署环境是什么？",
				Type:        "deployment",
				Description: "了解系统的部署需求，确保系统能够在目标环境中正常运行",
			},
			{
				ID:          "q7",
				Question:    "系统的可扩展性要求是什么？",
				Type:        "scalability",
				Description: "了解系统的扩展需求，确保系统能够随业务增长而扩展",
			},
		},
	}
	
	fmt.Printf("生成了%d个澄清问题\n", len(response.Questions))
	
	return response, nil
}

func extractRequirementPoints(ctx context.Context, response *ClarificationResponse) (*ClarificationResponse, error) {
	prompt := `你是一位经验丰富的需求分析师，专注于从用户回答中提取关键需求点。
请基于以下问题和回答，提取关键需求点：

{{range .Questions}}
问题：{{.Question}}
回答：{{.Answer}}
{{end}}

请提取10-15个关键需求点，每个需求点应该简洁明了，直接描述系统需要实现的功能或满足的条件。
需求点应该涵盖功能需求和非功能需求。
每个需求点应该以"系统需要..."或"系统应该..."开头。

请以JSON数组格式返回，格式如下：
["需求点1", "需求点2", ...]
`

	response.RequirementPoints = []string{
		"系统需要支持用户注册和登录，包括第三方账号集成",
		"系统需要支持内容发布和管理，包括多媒体内容",
		"系统需要支持用户互动和评论，包括点赞、收藏和分享",
		"系统需要支持搜索功能，包括全文搜索和标签搜索",
		"系统需要支持用户权限管理，包括角色和权限配置",
		"系统需要支持数据分析和报表生成",
		"系统需要支持多语言和国际化",
		"系统需要支持移动端适配",
		"系统需要支持高并发访问，峰值QPS不低于10000",
		"系统需要支持数据备份和恢复",
		"系统需要支持监控和告警",
		"系统需要支持灰度发布和A/B测试",
	}
	
	fmt.Printf("提取了%d个需求点\n", len(response.RequirementPoints))
	
	return response, nil
}

func defineFunctionalScope(ctx context.Context, response *ClarificationResponse) (*ClarificationResponse, error) {
	prompt := `你是一位经验丰富的产品经理，专注于定义软件项目的功能范围。
请基于以下需求点，定义系统的功能范围：

需求点：
{{range .RequirementPoints}}
- {{.}}
{{end}}

请提供一个全面的功能范围定义，包括：
1. 系统将包括哪些核心模块
2. 每个模块的主要功能
3. 明确指出不包括在范围内的功能

请用300字左右的中文段落描述功能范围，语言应该清晰、专业，适合技术团队理解。
`

	response.FunctionalScope = "系统将包括用户管理、内容管理、互动管理、搜索功能、权限管理、数据分析六个核心模块。用户管理模块负责用户注册、登录、个人信息管理和第三方账号集成；内容管理模块负责内容发布、编辑、审核和多媒体内容处理；互动管理模块负责评论、点赞、收藏和分享功能；搜索功能模块负责全文搜索和标签搜索；权限管理模块负责角色定义和权限配置；数据分析模块负责数据统计和报表生成。系统不包括支付和订单管理功能，不包括实时音视频通话功能，不包括复杂的工作流引擎，这些功能将在后续版本中考虑。"
	
	fmt.Printf("定义了功能范围，长度为%d字符\n", len(response.FunctionalScope))
	
	return response, nil
}

func identifyNonFunctionalRequirements(ctx context.Context, response *ClarificationResponse) (*ClarificationResponse, error) {
	prompt := `你是一位经验丰富的系统架构师，专注于识别软件项目的非功能需求。
请基于以下需求点和功能范围，识别系统的非功能需求：

需求点：
{{range .RequirementPoints}}
- {{.}}
{{end}}

功能范围：
{{.FunctionalScope}}

请识别系统的非功能需求，包括但不限于以下方面：
1. 性能需求（响应时间、吞吐量、并发用户数等）
2. 可用性需求（系统可用性、故障恢复时间等）
3. 可扩展性需求（水平扩展、垂直扩展等）
4. 安全性需求（认证、授权、数据加密等）
5. 可维护性需求（监控、日志、告警等）
6. 兼容性需求（浏览器兼容性、设备兼容性等）
7. 国际化需求（多语言、时区等）

请列出10-15个具体的非功能需求，每个需求应该简洁明了，直接描述系统需要满足的条件。
每个需求应该以"系统需要..."或"系统应该..."开头。

请以JSON数组格式返回，格式如下：
["非功能需求1", "非功能需求2", ...]
`

	response.NonFunctionalRequirements = []string{
		"系统响应时间不超过200ms",
		"系统可用性不低于99.9%",
		"系统需要支持水平扩展，能够处理峰值QPS不低于10000",
		"系统需要支持数据加密存储和传输",
		"系统需要支持RBAC权限控制",
		"系统需要支持完整的审计日志",
		"系统需要支持多浏览器兼容（Chrome、Firefox、Safari、Edge）",
		"系统需要支持移动端自适应布局",
		"系统需要支持多语言和国际化",
		"系统需要支持监控和告警",
		"系统需要支持自动化测试，测试覆盖率不低于80%",
		"系统需要支持灰度发布和回滚",
		"系统需要支持容器化部署",
		"系统需要符合GDPR和国内数据安全法规",
	}
	
	fmt.Printf("识别了%d个非功能需求\n", len(response.NonFunctionalRequirements))
	
	return response, nil
}


func extractProjectType(functionalScope string) string {
	projectTypes := []string{
		"内容管理系统", "CMS", "电商平台", "社交网络", "即时通讯", 
		"数据分析", "监控系统", "DevOps平台", "API网关", "微服务框架",
		"任务调度", "工作流引擎", "搜索引擎", "推荐系统", "用户管理系统",
	}
	
	for _, pt := range projectTypes {
		if strings.Contains(functionalScope, pt) {
			return pt
		}
	}
	
	return "应用服务"
}

func extractMainFeatures(requirementPoints []string) string {
	if len(requirementPoints) == 0 {
		return "基础功能"
	}
	
	features := []string{}
	count := 0
	
	for _, req := range requirementPoints {
		if strings.Contains(strings.ToLower(req), "性能") ||
		   strings.Contains(strings.ToLower(req), "安全") ||
		   strings.Contains(strings.ToLower(req), "可靠") ||
		   strings.Contains(strings.ToLower(req), "扩展") {
			continue
		}
		
		feature := req
		if len(feature) > 15 {
			feature = feature[:15] + "..."
		}
		
		features = append(features, feature)
		count++
		
		if count >= 3 {
			break
		}
	}
	
	if len(features) == 0 {
		return "基础功能"
	}
	
	return strings.Join(features, "、")
}

func extractKeyNonFunctionalRequirements(nonFunctionalRequirements []string) string {
	if len(nonFunctionalRequirements) == 0 {
		return "高性能、高可靠性"
	}
	
	keyTypes := map[string]bool{
		"性能": true,
		"安全": true,
		"可靠": true,
		"扩展": true,
		"可用": true,
		"维护": true,
	}
	
	keyNFRs := []string{}
	
	for _, nfr := range nonFunctionalRequirements {
		for keyType := range keyTypes {
			if strings.Contains(nfr, keyType) {
				if len(nfr) > 10 {
					nfr = nfr[:10] + "..."
				}
				keyNFRs = append(keyNFRs, nfr)
				break
			}
		}
		
		if len(keyNFRs) >= 2 {
			break
		}
	}
	
	if len(keyNFRs) == 0 {
		return "高性能、高可靠性"
	}
	
	return strings.Join(keyNFRs, "、")
}

func generateAITaskDescription(ctx context.Context, request *AIDescriptionRequest) (*AIDescriptionResponse, error) {
	prompt := `你是一位专业的AI任务描述专家，擅长将业务需求转化为面向AI代码生成的任务描述。
请基于以下需求信息，生成一个清晰、结构化的AI任务描述：

功能范围：
{{.FunctionalScope}}

非功能需求：
{{range .NonFunctionalRequirements}}
- {{.}}
{{end}}

需求点：
{{range .RequirementPoints}}
- {{.}}
{{end}}

你的任务描述应该：
1. 简洁明了地概括项目目标
2. 清晰描述主要功能模块
3. 明确指出技术栈要求（特别是CloudWeGo生态组件的使用）
4. 包含关键的非功能需求
5. 使用中文，面向AI代码生成系统

请生成一个不超过300字的任务描述。`

	tmpl, err := template.New("task_description").Parse(prompt)
	if err != nil {
		return nil, fmt.Errorf("解析任务描述模板失败: %w", err)
	}

	var promptBuf bytes.Buffer
	err = tmpl.Execute(&promptBuf, map[string]interface{}{
		"FunctionalScope":           request.Clarification.FunctionalScope,
		"NonFunctionalRequirements": request.Clarification.NonFunctionalRequirements,
		"RequirementPoints":         request.Clarification.RequirementPoints,
	})
	if err != nil {
		return nil, fmt.Errorf("填充任务描述模板失败: %w", err)
	}

	// taskDescription, err := llm.GenerateContent(ctx, promptBuf.String())
	
	taskDescription := fmt.Sprintf("开发一个基于CloudWeGo生态的%s系统，具备%s等核心功能。系统应满足%s等非功能需求。使用Kitex作为RPC框架，Hertz作为HTTP框架，实现高性能、高可靠性的微服务架构。",
		extractProjectType(request.Clarification.FunctionalScope),
		extractMainFeatures(request.Clarification.RequirementPoints),
		extractKeyNonFunctionalRequirements(request.Clarification.NonFunctionalRequirements))
	
	response := &AIDescriptionResponse{
		AITaskDescription: taskDescription,
	}
	
	return response, nil
}

func generateSystemPrompt(ctx context.Context, response *AIDescriptionResponse) (*AIDescriptionResponse, error) {
	prompt := `你是一位专业的系统提示词工程师，擅长为AI代码生成系统创建高效的系统提示词。
请基于以下AI任务描述，生成一个详细的系统提示词：

AI任务描述：
{{.AITaskDescription}}

你的系统提示词应该：
1. 定义AI助手的角色和专业领域
2. 明确AI助手的技术专长（特别是CloudWeGo生态）
3. 设定AI助手的行为准则和回答风格
4. 指导AI助手如何处理代码生成请求
5. 使用中文，面向AI代码生成系统

请生成一个不超过300字的系统提示词。`

	tmpl, err := template.New("system_prompt").Parse(prompt)
	if err != nil {
		return nil, fmt.Errorf("解析系统提示词模板失败: %w", err)
	}

	var promptBuf bytes.Buffer
	err = tmpl.Execute(&promptBuf, map[string]interface{}{
		"AITaskDescription": response.AITaskDescription,
	})
	if err != nil {
		return nil, fmt.Errorf("填充系统提示词模板失败: %w", err)
	}

	
	systemPrompt := fmt.Sprintf(`你是一位专业的软件开发专家，擅长使用CloudWeGo生态开发高性能、高可靠性的微服务应用。你精通Kitex、Hertz等框架，并且了解微服务架构设计最佳实践。

你的任务是帮助用户实现以下项目：
%s

在回答用户问题时，你应该：
1. 提供清晰、结构化的代码，并附带必要的注释
2. 优先考虑性能、可靠性和可扩展性
3. 遵循Go语言最佳实践和CloudWeGo生态的设计理念
4. 主动提出架构和实现建议，帮助用户做出最佳技术决策
5. 使用中文回答，保持专业、简洁的表达方式`, response.AITaskDescription)
	
	response.SystemPrompt = systemPrompt
	
	return response, nil
}

func generateUserPrompt(ctx context.Context, response *AIDescriptionResponse) (*AIDescriptionResponse, error) {
	prompt := `你是一位专业的用户提示词工程师，擅长为AI代码生成系统创建高效的用户提示词。
请基于以下AI任务描述和系统提示词，生成一个详细的用户提示词：

AI任务描述：
{{.AITaskDescription}}

系统提示词：
{{.SystemPrompt}}

你的用户提示词应该：
1. 清晰表达用户的具体需求和期望
2. 提供必要的技术细节和约束条件
3. 设定明确的交付标准和验收标准
4. 使用中文，面向AI代码生成系统
5. 采用友好、专业的语气

请生成一个不超过300字的用户提示词。`

	tmpl, err := template.New("user_prompt").Parse(prompt)
	if err != nil {
		return nil, fmt.Errorf("解析用户提示词模板失败: %w", err)
	}

	var promptBuf bytes.Buffer
	err = tmpl.Execute(&promptBuf, map[string]interface{}{
		"AITaskDescription": response.AITaskDescription,
		"SystemPrompt":      response.SystemPrompt,
	})
	if err != nil {
		return nil, fmt.Errorf("填充用户提示词模板失败: %w", err)
	}

	
	userPrompt := fmt.Sprintf(`请帮我实现以下项目：

%s

我需要你提供完整的代码实现，包括：
1. 项目结构设计
2. 核心模块实现
3. API接口定义
4. 数据模型设计
5. 配置文件示例

请特别注意以下要点：
1. 代码必须基于CloudWeGo生态，使用Kitex作为RPC框架，Hertz作为HTTP框架
2. 实现高性能、高可靠性的微服务架构
3. 提供详细的部署说明和使用文档
4. 代码应当遵循Go语言最佳实践

请先给出整体架构设计，然后逐步实现各个模块。`, response.AITaskDescription)
	
	response.UserPrompt = userPrompt
	
	return response, nil
}

func defineConstraints(ctx context.Context, response *AIDescriptionResponse) (*AIDescriptionResponse, error) {
	prompt := `你是一位专业的AI约束条件工程师，擅长为AI代码生成系统定义明确的约束条件。
请基于以下AI任务描述、系统提示词和用户提示词，生成一组明确的约束条件：

AI任务描述：
{{.AITaskDescription}}

系统提示词：
{{.SystemPrompt}}

用户提示词：
{{.UserPrompt}}

你的约束条件应该：
1. 明确技术栈要求（特别是CloudWeGo生态组件的使用）
2. 定义代码质量标准
3. 设定性能和可靠性要求
4. 规定架构设计原则
5. 使用中文，面向AI代码生成系统

请生成5-8个具体的约束条件，每个约束条件简洁明了。`

	tmpl, err := template.New("constraints").Parse(prompt)
	if err != nil {
		return nil, fmt.Errorf("解析约束条件模板失败: %w", err)
	}

	var promptBuf bytes.Buffer
	err = tmpl.Execute(&promptBuf, map[string]interface{}{
		"AITaskDescription": response.AITaskDescription,
		"SystemPrompt":      response.SystemPrompt,
		"UserPrompt":        response.UserPrompt,
	})
	if err != nil {
		return nil, fmt.Errorf("填充约束条件模板失败: %w", err)
	}

	
	response.Constraints = []string{
		"必须使用CloudWeGo的Kitex作为RPC框架",
		"必须使用Hertz作为HTTP框架",
		"必须遵循微服务架构设计原则",
		"代码必须符合Go语言最佳实践",
		"API响应时间不得超过200ms",
		"系统可用性不低于99.9%",
		"必须提供完整的单元测试和集成测试",
		"必须实现优雅启动和优雅关闭",
	}
	
	return response, nil
}

func defineEvaluationCriteria(ctx context.Context, response *AIDescriptionResponse) (*AIDescriptionResponse, error) {
	prompt := `你是一位专业的AI评估标准工程师，擅长为AI代码生成系统定义明确的评估标准。
请基于以下AI任务描述、系统提示词、用户提示词和约束条件，生成一组明确的评估标准：

AI任务描述：
{{.AITaskDescription}}

系统提示词：
{{.SystemPrompt}}

用户提示词：
{{.UserPrompt}}

约束条件：
{{range .Constraints}}
- {{.}}
{{end}}

你的评估标准应该：
1. 明确定义成功的标准
2. 包含功能性和非功能性评估标准
3. 设定可量化的指标
4. 涵盖代码质量、性能和可靠性
5. 使用中文，面向AI代码生成系统

请生成5-8个具体的评估标准，每个评估标准简洁明了。`

	tmpl, err := template.New("evaluation_criteria").Parse(prompt)
	if err != nil {
		return nil, fmt.Errorf("解析评估标准模板失败: %w", err)
	}

	var promptBuf bytes.Buffer
	err = tmpl.Execute(&promptBuf, map[string]interface{}{
		"AITaskDescription": response.AITaskDescription,
		"SystemPrompt":      response.SystemPrompt,
		"UserPrompt":        response.UserPrompt,
		"Constraints":       response.Constraints,
	})
	if err != nil {
		return nil, fmt.Errorf("填充评估标准模板失败: %w", err)
	}

	
	response.EvaluationCriteria = []string{
		"系统能否正常启动和运行",
		"API响应时间是否符合性能要求（<200ms）",
		"系统是否实现了所有核心功能",
		"代码是否符合Go语言最佳实践",
		"系统是否正确使用了CloudWeGo生态组件",
		"系统是否具备高可用性和容错能力",
		"系统是否提供了完整的文档和测试",
		"系统架构是否符合微服务设计原则",
	}
	
	return response, nil
}

func (b *BusinessOnboarding) StartOnboarding(ctx context.Context, request *OnboardingRequest) (*OnboardingResponse, error) {
	response, err := b.onboardingGraph.Invoke(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("引导流程失败: %w", err)
	}
	
	return response, nil
}

func (b *BusinessOnboarding) ReflectOnIdea(ctx context.Context, request *ReflectionRequest) (*ReflectionResponse, error) {
	response, err := b.reflectionChain.Invoke(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("反思想法失败: %w", err)
	}
	
	return response, nil
}

func (b *BusinessOnboarding) ClarifyRequirements(ctx context.Context, request *ClarificationRequest) (*ClarificationResponse, error) {
	response, err := b.clarificationChain.Invoke(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("澄清需求失败: %w", err)
	}
	
	return response, nil
}

func (b *BusinessOnboarding) ConvertToAIDescription(ctx context.Context, request *AIDescriptionRequest) (*AIDescriptionResponse, error) {
	response, err := b.aiDescriptionChain.Invoke(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("转换为AI描述失败: %w", err)
	}
	
	return response, nil
}

func (b *BusinessOnboarding) AnswerQuestion(ctx context.Context, questionID string, answer string) error {
	
	fmt.Printf("回答问题: 问题ID=%s, 回答=%s\n", questionID, answer)
	
	return nil
}
