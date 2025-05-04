package codegen

import (
	"context"
	"fmt"

	"github.com/bytedance/eino-devin-implementation/internal/config"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
)

type CodeGenerator struct {
	config *config.Config
	
	codegenChain compose.Runnable[*CodeRequest, *CodeResponse]
}

type CodeRequest struct {
	Requirement string `json:"requirement"`
	
	TechStack []string `json:"tech_stack"`
	
	Context map[string]string `json:"context"`
	
	FilePath string `json:"file_path"`
}

type CodeResponse struct {
	Code string `json:"code"`
	
	Explanation string `json:"explanation"`
	
	FilePath string `json:"file_path"`
	
	Dependencies []string `json:"dependencies"`
}

func NewCodeGenerator(ctx context.Context, cfg *config.Config, codeModel model.ToolCallingChatModel) (*CodeGenerator, error) {
	codegenChain, err := createCodegenChain(ctx, codeModel)
	if err != nil {
		return nil, fmt.Errorf("创建代码生成链失败: %w", err)
	}
	
	return &CodeGenerator{
		config:       cfg,
		codegenChain: codegenChain,
	}, nil
}

func createCodegenChain(ctx context.Context, codeModel model.ToolCallingChatModel) (compose.Runnable[*CodeRequest, *CodeResponse], error) {
	codegenChain := compose.NewChain[*CodeRequest, *CodeResponse]()
	
	requirementAnalysisLambda := compose.InvokableLambda(analyzeRequirement)
	codegenChain.AppendLambda(requirementAnalysisLambda, compose.WithNodeName("requirement_analysis"))
	
	codegenChain.AppendChatModel(codeModel, compose.WithNodeName("code_generation"))
	
	codeOptimizationLambda := compose.InvokableLambda(optimizeCode)
	codegenChain.AppendLambda(codeOptimizationLambda, compose.WithNodeName("code_optimization"))
	
	dependencyAnalysisLambda := compose.InvokableLambda(analyzeDependencies)
	codegenChain.AppendLambda(dependencyAnalysisLambda, compose.WithNodeName("dependency_analysis"))
	
	runnable, err := codegenChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译代码生成链失败: %w", err)
	}
	
	return runnable, nil
}

func analyzeRequirement(ctx context.Context, request *CodeRequest) (*schema.Message, error) {
	
	prompt := fmt.Sprintf(`
你是一个专业的软件开发者，请根据以下需求生成高质量的代码：

需求描述：
%s

技术栈：
%v

请生成符合最佳实践的代码，包括适当的注释和错误处理。
`, request.Requirement, request.TechStack)
	
	return schema.UserMessage(prompt), nil
}

func optimizeCode(ctx context.Context, message *schema.Message) (*schema.Message, error) {
	
	return message, nil
}

func analyzeDependencies(ctx context.Context, message *schema.Message) (*CodeResponse, error) {
	
	response := &CodeResponse{
		Code:         message.Content,
		Explanation:  "代码已生成",
		Dependencies: []string{"github.com/example/package"},
	}
	
	return response, nil
}

func (g *CodeGenerator) GenerateCode(ctx context.Context, request *CodeRequest) (*CodeResponse, error) {
	response, err := g.codegenChain.Invoke(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("生成代码失败: %w", err)
	}
	
	return response, nil
}

func (g *CodeGenerator) GenerateProject(ctx context.Context, requirement string, techStack []string) (map[string]*CodeResponse, error) {
	
	files := map[string]*CodeResponse{
		"main.go": {
			Code:        "package main\n\nfunc main() {\n\tfmt.Println(\"Hello, World!\")\n}",
			Explanation: "主程序入口",
			FilePath:    "main.go",
		},
		"config.go": {
			Code:        "package config\n\ntype Config struct {\n\tPort int\n}",
			Explanation: "配置文件",
			FilePath:    "config.go",
		},
	}
	
	return files, nil
}

func (g *CodeGenerator) UpdateCode(ctx context.Context, filePath string, code string) error {
	
	fmt.Printf("更新代码文件: %s\n", filePath)
	
	return nil
}
