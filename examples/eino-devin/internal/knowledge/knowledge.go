package knowledge

import (
	"context"
	"fmt"
	"strings"

	"github.com/bytedance/eino-devin-implementation/internal/config"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"
)

type KnowledgeSuggester interface {
	SuggestKnowledge(ctx context.Context, input *KnowledgeRequest) (*KnowledgeResponse, error)
	
	StreamSuggestKnowledge(ctx context.Context, input *KnowledgeRequest) (*schema.StreamReader[*KnowledgeResponse], error)
}

type KnowledgeRequest struct {
	Context string `json:"context"`
	
	Query string `json:"query"`
	
	Domain string `json:"domain"`
	
	MaxSuggestions int `json:"max_suggestions"`
}

type KnowledgeResponse struct {
	Suggestions []*KnowledgeSuggestion `json:"suggestions"`
	
	RelatedQueries []string `json:"related_queries"`
	
	Explanation string `json:"explanation"`
}

type KnowledgeSuggestion struct {
	Title string `json:"title"`
	
	Content string `json:"content"`
	
	Source string `json:"source"`
	
	Relevance float64 `json:"relevance"`
	
	Type string `json:"type"`
}

type KnowledgeManager struct {
	config *config.Config
	
	knowledgeAgent *react.Agent
	
	contextRecognizer tool.Tool
	
	knowledgeRetriever tool.Tool
	
	suggestionGenerator tool.Tool
}

func NewKnowledgeManager(ctx context.Context, cfg *config.Config, llmModel model.ToolCallingChatModel) (*KnowledgeManager, error) {
	contextRecognizer := NewContextRecognitionTool()
	
	knowledgeRetriever := NewKnowledgeRetrievalTool()
	
	suggestionGenerator := NewSuggestionGenerationTool()
	
	agentConfig := &react.AgentConfig{
		ToolCallingModel: llmModel,
		ToolsConfig: compose.ToolsNodeConfig{
			Tools: []tool.Tool{
				contextRecognizer,
				knowledgeRetriever,
				suggestionGenerator,
			},
		},
		MessageModifier: func(ctx context.Context, input []*schema.Message) []*schema.Message {
			systemPrompt := `你是一个专业的知识建议助手，你的任务是根据用户的上下文和查询提供相关的知识建议。
你有以下工具可以使用：
1. recognize_context - 识别用户上下文中的关键信息
2. retrieve_knowledge - 检索相关知识
3. generate_suggestions - 生成知识建议

请按照以下步骤工作：
1. 使用recognize_context工具分析用户的上下文和查询
2. 使用retrieve_knowledge工具检索相关知识
3. 使用generate_suggestions工具生成知识建议
4. 返回最终的知识建议

请确保你的建议是相关的、有用的，并且符合用户的需求。`
			
			result := make([]*schema.Message, 0, len(input)+1)
			result = append(result, schema.SystemMessage(systemPrompt))
			result = append(result, input...)
			
			return result
		},
		MaxStep: 10,
	}
	
	agent, err := react.NewAgent(ctx, agentConfig)
	if err != nil {
		return nil, fmt.Errorf("创建知识图谱代理失败: %w", err)
	}
	
	return &KnowledgeManager{
		config:             cfg,
		knowledgeAgent:     agent,
		contextRecognizer:  contextRecognizer,
		knowledgeRetriever: knowledgeRetriever,
		suggestionGenerator: suggestionGenerator,
	}, nil
}

func (km *KnowledgeManager) SuggestKnowledge(ctx context.Context, input *KnowledgeRequest) (*KnowledgeResponse, error) {
	userMessage := buildUserMessage(input)
	
	response, err := km.knowledgeAgent.Generate(ctx, []*schema.Message{userMessage})
	if err != nil {
		return nil, fmt.Errorf("生成知识建议失败: %w", err)
	}
	
	return parseResponse(response)
}

func (km *KnowledgeManager) StreamSuggestKnowledge(ctx context.Context, input *KnowledgeRequest) (*schema.StreamReader[*KnowledgeResponse], error) {
	userMessage := buildUserMessage(input)
	
	responseStream, err := km.knowledgeAgent.Stream(ctx, []*schema.Message{userMessage})
	if err != nil {
		return nil, fmt.Errorf("流式生成知识建议失败: %w", err)
	}
	
	return schema.StreamReaderWithConvert(responseStream, parseResponse)
}

func buildUserMessage(input *KnowledgeRequest) *schema.Message {
	content := fmt.Sprintf(`我需要关于以下内容的知识建议：

上下文：
%s

查询：
%s

领域：
%s

请提供最多%d条相关的知识建议。`, input.Context, input.Query, input.Domain, input.MaxSuggestions)
	
	return schema.UserMessage(content)
}

func parseResponse(response *schema.Message) (*KnowledgeResponse, error) {
	
	suggestions := []*KnowledgeSuggestion{
		{
			Title:     "Golang并发编程最佳实践",
			Content:   "在Golang中，goroutine是轻量级线程，可以通过go关键字启动。通过channel进行goroutine之间的通信是推荐的做法。",
			Source:    "Golang官方文档",
			Relevance: 0.95,
			Type:      "document",
		},
	}
	
	relatedQueries := []string{
		"Golang channel使用方法",
		"Golang并发模式",
		"Golang context包使用",
	}
	
	return &KnowledgeResponse{
		Suggestions:    suggestions,
		RelatedQueries: relatedQueries,
		Explanation:    response.Content,
	}, nil
}

type ContextRecognitionTool struct {
	schema.BaseTool
}

func NewContextRecognitionTool() *ContextRecognitionTool {
	return &ContextRecognitionTool{
		BaseTool: schema.BaseTool{
			ToolName:        "recognize_context",
			ToolDescription: "识别用户上下文中的关键信息，包括编程语言、框架、技术栈等",
			ToolParameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"context": {
						Type:        "string",
						Description: "用户的上下文，可以是代码、对话历史等",
						Required:    true,
					},
					"query": {
						Type:        "string",
						Description: "用户的查询，可以是问题、关键词等",
						Required:    true,
					},
				},
			},
		},
	}
}

func (t *ContextRecognitionTool) Call(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	context, ok := args["context"].(string)
	if !ok {
		return nil, fmt.Errorf("context参数类型错误")
	}
	
	query, ok := args["query"].(string)
	if !ok {
		return nil, fmt.Errorf("query参数类型错误")
	}
	
	
	keywords := []string{}
	
	languages := []string{"golang", "python", "java", "javascript", "typescript", "rust", "c++", "c#"}
	for _, lang := range languages {
		if strings.Contains(strings.ToLower(context), lang) || strings.Contains(strings.ToLower(query), lang) {
			keywords = append(keywords, lang)
		}
	}
	
	frameworks := []string{"gin", "echo", "fasthttp", "django", "flask", "spring", "react", "vue", "angular", "kitex", "hertz"}
	for _, framework := range frameworks {
		if strings.Contains(strings.ToLower(context), framework) || strings.Contains(strings.ToLower(query), framework) {
			keywords = append(keywords, framework)
		}
	}
	
	domains := []string{"web", "api", "microservice", "database", "cache", "message queue", "devops", "kubernetes", "docker", "ci/cd"}
	for _, domain := range domains {
		if strings.Contains(strings.ToLower(context), domain) || strings.Contains(strings.ToLower(query), domain) {
			keywords = append(keywords, domain)
		}
	}
	
	return map[string]interface{}{
		"keywords": keywords,
		"language": getFirstMatch(keywords, languages),
		"framework": getFirstMatch(keywords, frameworks),
		"domain": getFirstMatch(keywords, domains),
	}, nil
}

func getFirstMatch(keywords []string, candidates []string) string {
	for _, keyword := range keywords {
		for _, candidate := range candidates {
			if keyword == candidate {
				return keyword
			}
		}
	}
	return ""
}

type KnowledgeRetrievalTool struct {
	schema.BaseTool
}

func NewKnowledgeRetrievalTool() *KnowledgeRetrievalTool {
	return &KnowledgeRetrievalTool{
		BaseTool: schema.BaseTool{
			ToolName:        "retrieve_knowledge",
			ToolDescription: "检索相关知识，包括文档、教程、代码示例等",
			ToolParameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"keywords": {
						Type:        "array",
						Description: "关键词列表",
						Required:    true,
					},
					"language": {
						Type:        "string",
						Description: "编程语言",
						Required:    false,
					},
					"framework": {
						Type:        "string",
						Description: "框架",
						Required:    false,
					},
					"domain": {
						Type:        "string",
						Description: "技术领域",
						Required:    false,
					},
					"max_results": {
						Type:        "integer",
						Description: "最大结果数量",
						Required:    false,
					},
				},
			},
		},
	}
}

func (t *KnowledgeRetrievalTool) Call(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	keywordsRaw, ok := args["keywords"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("keywords参数类型错误")
	}
	
	keywords := make([]string, len(keywordsRaw))
	for i, k := range keywordsRaw {
		keywords[i], ok = k.(string)
		if !ok {
			return nil, fmt.Errorf("keywords参数中的元素类型错误")
		}
	}
	
	language, _ := args["language"].(string)
	framework, _ := args["framework"].(string)
	domain, _ := args["domain"].(string)
	
	maxResults := 5
	if maxResultsRaw, ok := args["max_results"].(float64); ok {
		maxResults = int(maxResultsRaw)
	}
	
	
	knowledgeBase := []map[string]interface{}{
		{
			"title":     "Golang并发编程最佳实践",
			"content":   "在Golang中，goroutine是轻量级线程，可以通过go关键字启动。通过channel进行goroutine之间的通信是推荐的做法。",
			"source":    "Golang官方文档",
			"relevance": 0.95,
			"type":      "document",
			"tags":      []string{"golang", "concurrency", "goroutine", "channel"},
		},
		{
			"title":     "Kitex快速入门",
			"content":   "Kitex是字节跳动开源的高性能RPC框架，支持多种协议，如Thrift、Protobuf等。使用Kitex可以快速构建微服务应用。",
			"source":    "CloudWeGo文档",
			"relevance": 0.9,
			"type":      "tutorial",
			"tags":      []string{"golang", "kitex", "rpc", "microservice", "cloudwego"},
		},
		{
			"title":     "Hertz Web框架介绍",
			"content":   "Hertz是字节跳动开源的高性能Web框架，基于Netpoll网络库，提供了丰富的中间件和扩展点。",
			"source":    "CloudWeGo文档",
			"relevance": 0.85,
			"type":      "document",
			"tags":      []string{"golang", "hertz", "web", "framework", "cloudwego"},
		},
		{
			"title":     "Kubernetes部署最佳实践",
			"content":   "在Kubernetes中部署应用时，应该使用Deployment而不是直接使用Pod，这样可以获得自动扩缩容、滚动更新等功能。",
			"source":    "Kubernetes文档",
			"relevance": 0.8,
			"type":      "document",
			"tags":      []string{"kubernetes", "devops", "deployment", "container"},
		},
		{
			"title":     "CI/CD流水线设计",
			"content":   "设计CI/CD流水线时，应该考虑代码检查、单元测试、集成测试、构建、部署等环节，确保每个环节都能快速失败并提供反馈。",
			"source":    "DevOps手册",
			"relevance": 0.75,
			"type":      "document",
			"tags":      []string{"devops", "ci/cd", "pipeline", "automation"},
		},
	}
	
	results := []map[string]interface{}{}
	for _, knowledge := range knowledgeBase {
		relevance := 0.0
		
		tags := knowledge["tags"].([]string)
		for _, keyword := range keywords {
			for _, tag := range tags {
				if keyword == tag {
					relevance += 0.2
					break
				}
			}
		}
		
		if language != "" {
			for _, tag := range tags {
				if language == tag {
					relevance += 0.3
					break
				}
			}
		}
		
		if framework != "" {
			for _, tag := range tags {
				if framework == tag {
					relevance += 0.3
					break
				}
			}
		}
		
		if domain != "" {
			for _, tag := range tags {
				if domain == tag {
					relevance += 0.2
					break
				}
			}
		}
		
		if relevance > 0 {
			knowledge["relevance"] = relevance
			results = append(results, knowledge)
		}
	}
	
	for i := 0; i < len(results); i++ {
		for j := i + 1; j < len(results); j++ {
			if results[i]["relevance"].(float64) < results[j]["relevance"].(float64) {
				results[i], results[j] = results[j], results[i]
			}
		}
	}
	
	if len(results) > maxResults {
		results = results[:maxResults]
	}
	
	return map[string]interface{}{
		"results": results,
		"count":   len(results),
	}, nil
}

type SuggestionGenerationTool struct {
	schema.BaseTool
}

func NewSuggestionGenerationTool() *SuggestionGenerationTool {
	return &SuggestionGenerationTool{
		BaseTool: schema.BaseTool{
			ToolName:        "generate_suggestions",
			ToolDescription: "生成知识建议，包括标题、内容、来源等",
			ToolParameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"results": {
						Type:        "array",
						Description: "知识检索结果",
						Required:    true,
					},
					"query": {
						Type:        "string",
						Description: "用户的查询",
						Required:    true,
					},
					"max_suggestions": {
						Type:        "integer",
						Description: "最大建议数量",
						Required:    false,
					},
				},
			},
		},
	}
}

func (t *SuggestionGenerationTool) Call(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	resultsRaw, ok := args["results"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("results参数类型错误")
	}
	
	query, ok := args["query"].(string)
	if !ok {
		return nil, fmt.Errorf("query参数类型错误")
	}
	
	maxSuggestions := 3
	if maxSuggestionsRaw, ok := args["max_suggestions"].(float64); ok {
		maxSuggestions = int(maxSuggestionsRaw)
	}
	
	
	suggestions := []map[string]interface{}{}
	for i, resultRaw := range resultsRaw {
		if i >= maxSuggestions {
			break
		}
		
		result, ok := resultRaw.(map[string]interface{})
		if !ok {
			continue
		}
		
		suggestion := map[string]interface{}{
			"title":     result["title"],
			"content":   result["content"],
			"source":    result["source"],
			"relevance": result["relevance"],
			"type":      result["type"],
		}
		
		suggestions = append(suggestions, suggestion)
	}
	
	
	relatedQueries := []string{}
	if strings.Contains(query, "golang") {
		relatedQueries = append(relatedQueries, "Golang并发编程", "Golang错误处理", "Golang性能优化")
	}
	if strings.Contains(query, "kitex") {
		relatedQueries = append(relatedQueries, "Kitex服务注册发现", "Kitex负载均衡", "Kitex熔断限流")
	}
	if strings.Contains(query, "kubernetes") {
		relatedQueries = append(relatedQueries, "Kubernetes资源管理", "Kubernetes网络策略", "Kubernetes存储卷")
	}
	
	return map[string]interface{}{
		"suggestions":    suggestions,
		"related_queries": relatedQueries,
		"explanation":    fmt.Sprintf("根据你的查询'%s'，我找到了以下相关的知识建议。", query),
	}, nil
}
