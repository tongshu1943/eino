package agent

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/eino-devin-implementation/internal/api"
	"github.com/bytedance/eino-devin-implementation/internal/codegen"
	"github.com/bytedance/eino-devin-implementation/internal/config"
	"github.com/bytedance/eino-devin-implementation/internal/devops"
	"github.com/bytedance/eino-devin-implementation/internal/multiagent"
	"github.com/bytedance/eino-devin-implementation/internal/onboarding"
	"github.com/bytedance/eino-devin-implementation/internal/planner"
	"github.com/bytedance/eino-devin-implementation/internal/tools"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

type DevinAgent struct {
	config *config.Config
	
	dialogManager compose.Runnable[[]*schema.Message, *schema.Message]
	
	taskPlanner *planner.TaskPlanner
	
	codeGenerator *codegen.CodeGenerator
	
	devopsManager *devops.DevOpsManager
	
	businessOnboarding *onboarding.BusinessOnboarding
	
	onboardingAPI *api.OnboardingAPI
	
	multiAgentSystem *multiagent.MultiAgentSystem
	
	multiAgentAPI *api.MultiAgentAPI
	
	tools []schema.Tool
	
	server *server.Hertz
}

func NewDevinAgent(ctx context.Context, cfg *config.Config) (*DevinAgent, error) {
	toolSet, err := createTools(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("创建工具集失败: %w", err)
	}
	
	chatModel, err := createChatModel(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("创建对话模型失败: %w", err)
	}
	
	codeModel, err := createCodeModel(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("创建代码模型失败: %w", err)
	}
	
	embeddingModel, err := createEmbeddingModel(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("创建嵌入模型失败: %w", err)
	}
	
	taskPlanner, err := planner.NewTaskPlanner(ctx, cfg, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建任务规划模块失败: %w", err)
	}
	
	codeGenerator, err := codegen.NewCodeGenerator(ctx, cfg, codeModel)
	if err != nil {
		return nil, fmt.Errorf("创建代码生成模块失败: %w", err)
	}
	
	devopsManager, err := devops.NewDevOpsManager(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("创建DevOps模块失败: %w", err)
	}
	
	businessOnboarding, err := onboarding.NewBusinessOnboarding(ctx, cfg, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建业务引导模块失败: %w", err)
	}
	
	onboardingAPI := api.NewOnboardingAPI(businessOnboarding)
	
	multiAgentSystem := multiagent.NewMultiAgentSystem()
	if err := multiAgentSystem.Initialize(); err != nil {
		return nil, fmt.Errorf("初始化多智能体系统失败: %w", err)
	}
	
	multiAgentAPI := api.NewMultiAgentAPI(multiAgentSystem)
	
	dialogManager, err := createDialogManager(ctx, chatModel, toolSet, taskPlanner, codeGenerator, devopsManager, businessOnboarding)
	if err != nil {
		return nil, fmt.Errorf("创建对话管理模块失败: %w", err)
	}
	
	h := server.Default(
		server.WithHostPorts(":" + strconv.Itoa(cfg.Server.Port)),
	)
	
	return &DevinAgent{
		config:             cfg,
		dialogManager:      dialogManager,
		taskPlanner:        taskPlanner,
		codeGenerator:      codeGenerator,
		devopsManager:      devopsManager,
		businessOnboarding: businessOnboarding,
		onboardingAPI:      onboardingAPI,
		multiAgentSystem:   multiAgentSystem,
		multiAgentAPI:      multiAgentAPI,
		tools:              toolSet,
		server:             h,
	}, nil
}

func createTools(ctx context.Context, cfg *config.Config) ([]schema.Tool, error) {
	var toolSet []schema.Tool
	
	intentTool := &tools.IntentRecognitionTool{}
	toolSet = append(toolSet, intentTool)
	
	requirementTool := &tools.RequirementExtractionTool{}
	toolSet = append(toolSet, requirementTool)
	
	if cfg.Tools.Git.Enabled {
		gitTool, err := tools.NewGitTool(cfg.Tools.Git.Token)
		if err != nil {
			return nil, fmt.Errorf("创建Git工具失败: %w", err)
		}
		toolSet = append(toolSet, gitTool)
	}
	
	if cfg.Tools.CICD.Enabled {
		cicdTool, err := tools.NewCICDTool(cfg.Tools.CICD.Type, cfg.Tools.CICD.Endpoint, cfg.Tools.CICD.Token)
		if err != nil {
			return nil, fmt.Errorf("创建CI/CD工具失败: %w", err)
		}
		toolSet = append(toolSet, cicdTool)
	}
	
	if cfg.Tools.Kubernetes.Enabled {
		kubeTool, err := tools.NewKubernetesTool(cfg.Tools.Kubernetes.KubeConfig)
		if err != nil {
			return nil, fmt.Errorf("创建Kubernetes工具失败: %w", err)
		}
		toolSet = append(toolSet, kubeTool)
	}
	
	return toolSet, nil
}

func createChatModel(ctx context.Context, cfg *config.Config) (model.ToolCallingChatModel, error) {
	mockModel := model.NewMockToolCallingChatModel()
	
	mockModel.SetResponse(&schema.Message{
		Role:    schema.RoleAssistant,
		Content: "我是Eino版的Devin助手，可以帮助您从想法到上线的全流程。请告诉我您的项目需求。",
	})
	
	return mockModel, nil
}

func createCodeModel(ctx context.Context, cfg *config.Config) (model.ToolCallingChatModel, error) {
	mockModel := model.NewMockToolCallingChatModel()
	
	mockModel.SetResponse(&schema.Message{
		Role:    schema.RoleAssistant,
		Content: "```go\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"Hello, Eino!\")\n}\n```",
	})
	
	return mockModel, nil
}

func createEmbeddingModel(ctx context.Context, cfg *config.Config) (model.Embedder, error) {
	mockEmbedder := model.NewMockEmbedder()
	
	return mockEmbedder, nil
}

func createDialogManager(
	ctx context.Context,
	chatModel model.ToolCallingChatModel,
	tools []schema.Tool,
	taskPlanner *planner.TaskPlanner,
	codeGenerator *codegen.CodeGenerator,
	devopsManager *devops.DevOpsManager,
	businessOnboarding *onboarding.BusinessOnboarding,
) (compose.Runnable[[]*schema.Message, *schema.Message], error) {
	agentConfig := &react.AgentConfig{
		ToolCallingModel: chatModel,
		ToolsConfig: compose.ToolsNodeConfig{
			Tools: tools,
		},
		MessageModifier: react.NewPersonaModifier("你是Devin，一个基于AI的软件开发助手，能够帮助用户从想法到上线的全流程。你擅长理解用户需求，规划任务，生成代码，以及部署应用。你注重业务需求，遵循'Attention is all you need'的理念，让业务方专注于创意，而你负责技术实现细节。"),
	}
	
	reactAgent, err := react.NewAgent(ctx, agentConfig)
	if err != nil {
		return nil, fmt.Errorf("创建ReAct Agent失败: %w", err)
	}
	
	dialogGraph := compose.NewGraph[[]*schema.Message, *schema.Message]()
	
	intentRecognitionLambda := compose.InvokableLambda(func(ctx context.Context, messages []*schema.Message) (string, error) {
		if len(messages) == 0 {
			return "general", nil
		}
		
		lastMessage := messages[len(messages)-1]
		if lastMessage.Role != schema.RoleUser {
			return "general", nil
		}
		
		content := strings.ToLower(lastMessage.Content)
		
		if strings.Contains(content, "需求") || 
		   strings.Contains(content, "想法") || 
		   strings.Contains(content, "创意") || 
		   strings.Contains(content, "项目") || 
		   strings.Contains(content, "业务") ||
		   strings.Contains(content, "功能") {
			return "business_requirement", nil
		}
		
		if strings.Contains(content, "代码") || 
		   strings.Contains(content, "编程") || 
		   strings.Contains(content, "实现") || 
		   strings.Contains(content, "开发") {
			return "code", nil
		}
		
		if strings.Contains(content, "部署") || 
		   strings.Contains(content, "上线") || 
		   strings.Contains(content, "发布") || 
		   strings.Contains(content, "运维") {
			return "devops", nil
		}
		
		return "general", nil
	})
	
	dialogGraph.AddNode("intent_recognition", intentRecognitionLambda)
	
	businessRequirementLambda := compose.InvokableLambda(func(ctx context.Context, messages []*schema.Message) (*schema.Message, error) {
		if len(messages) == 0 {
			return &schema.Message{
				Role:    schema.RoleAssistant,
				Content: "请告诉我您的业务需求或项目想法，我将帮助您从想法到上线的全流程。",
			}, nil
		}
		
		lastMessage := messages[len(messages)-1]
		
		onboardingRequest := &onboarding.OnboardingRequest{
			ProjectDescription: lastMessage.Content,
			ProjectType:        "未指定",
			TechPreferences:    []string{},
			BusinessScale:      "中型",
			TimeRequirement:    "未指定",
		}
		
		response, err := businessOnboarding.StartOnboarding(ctx, onboardingRequest)
		if err != nil {
			return &schema.Message{
				Role:    schema.RoleAssistant,
				Content: fmt.Sprintf("处理您的业务需求时出现错误: %v", err),
			}, nil
		}
		
		content := "感谢您分享您的业务需求！我已经开始分析您的需求。\n\n"
		
		if response.Reflection != nil {
			content += "## 业务价值分析\n\n"
			content += response.Reflection.BusinessValue + "\n\n"
			content += "## 技术可行性\n\n"
			content += response.Reflection.TechnicalFeasibility + "\n\n"
			content += "## 潜在挑战\n\n"
			for _, challenge := range response.Reflection.PotentialChallenges {
				content += "- " + challenge + "\n"
			}
			content += "\n"
			content += "## 改进建议\n\n"
			for _, improvement := range response.Reflection.SuggestedImprovements {
				content += "- " + improvement + "\n"
			}
			content += "\n"
		}
		
		content += "接下来，我需要更详细地了解您的需求。请问您是否希望我继续进行需求澄清？"
		
		return &schema.Message{
			Role:    schema.RoleAssistant,
			Content: content,
		}, nil
	})
	
	dialogGraph.AddNode("business_requirement", businessRequirementLambda)
	
	codeGenerationLambda := compose.InvokableLambda(func(ctx context.Context, messages []*schema.Message) (*schema.Message, error) {
		return &schema.Message{
			Role:    schema.RoleAssistant,
			Content: "我将帮助您实现代码。请告诉我更多关于您需要实现的功能细节。",
		}, nil
	})
	
	dialogGraph.AddNode("code_generation", codeGenerationLambda)
	
	devOpsLambda := compose.InvokableLambda(func(ctx context.Context, messages []*schema.Message) (*schema.Message, error) {
		return &schema.Message{
			Role:    schema.RoleAssistant,
			Content: "我将帮助您部署应用。请告诉我更多关于您的部署需求。",
		}, nil
	})
	
	dialogGraph.AddNode("devops", devOpsLambda)
	
	reactGraph, reactOpts := reactAgent.ExportGraph()
	if err := dialogGraph.AddGraph("react_agent", reactGraph, reactOpts...); err != nil {
		return nil, fmt.Errorf("添加ReAct Agent节点失败: %w", err)
	}
	
	dialogGraph.AddEdge(compose.START, "intent_recognition")
	dialogGraph.AddEdge("intent_recognition", "business_requirement", compose.WithCondition(func(intent string) bool {
		return intent == "business_requirement"
	}))
	dialogGraph.AddEdge("intent_recognition", "code_generation", compose.WithCondition(func(intent string) bool {
		return intent == "code"
	}))
	dialogGraph.AddEdge("intent_recognition", "devops", compose.WithCondition(func(intent string) bool {
		return intent == "devops"
	}))
	dialogGraph.AddEdge("intent_recognition", "react_agent", compose.WithCondition(func(intent string) bool {
		return intent == "general"
	}))
	dialogGraph.AddEdge("business_requirement", compose.END)
	dialogGraph.AddEdge("code_generation", compose.END)
	dialogGraph.AddEdge("devops", compose.END)
	dialogGraph.AddEdge("react_agent", compose.END)
	
	dialogManager, err := dialogGraph.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译对话管理图失败: %w", err)
	}
	
	return dialogManager, nil
}

func (a *DevinAgent) Serve(ctx context.Context) error {
	a.server.POST("/chat", func(c context.Context, ctx *app.RequestContext) {
		a.handleChat(ctx)
	})
	
	a.onboardingAPI.RegisterRoutes(a.server)
	
	a.multiAgentAPI.RegisterRoutes(a.server)
	
	log.Printf("Devin助手服务启动，监听端口: %d", a.config.Server.Port)
	log.Printf("多智能体系统已初始化，可用工作流: %v", a.multiAgentSystem.GetAvailableWorkflows())
	log.Printf("多智能体系统已初始化，可用角色: %v", a.multiAgentSystem.GetAgentRoles())
	
	go func() {
		if err := a.server.Run(); err != nil {
			log.Printf("HTTP服务器错误: %v", err)
		}
	}()
	
	<-ctx.Done()
	
	return nil
}

func (a *DevinAgent) handleChat(ctx *app.RequestContext) {
	var request struct {
		Messages []*schema.Message `json:"messages"`
	}
	
	if err := ctx.BindAndValidate(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("解析请求失败: %v", err),
		})
		return
	}
	
	response, err := a.dialogManager.Invoke(ctx.Request.Context(), request.Messages)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": fmt.Sprintf("处理聊天失败: %v", err),
		})
		return
	}
	
	ctx.JSON(http.StatusOK, response)
}
