package tools

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/cloudwego/eino/schema"
)

type BaseTool interface {
	schema.Tool
	
	Execute(ctx context.Context, args map[string]interface{}) (interface{}, error)
}

type BaseToolImpl struct {
	name        string
	description string
	parameters  schema.ParamsOneOf
}

func (t *BaseToolImpl) Name() string {
	return t.name
}

func (t *BaseToolImpl) Description() string {
	return t.description
}

func (t *BaseToolImpl) Parameters() schema.ParamsOneOf {
	return t.parameters
}

func (t *BaseToolImpl) Call(ctx context.Context, args json.RawMessage) (interface{}, error) {
	var params map[string]interface{}
	if err := json.Unmarshal(args, &params); err != nil {
		return nil, fmt.Errorf("解析参数失败: %w", err)
	}
	
	return t.Execute(ctx, params)
}

type IntentRecognitionTool struct {
	BaseToolImpl
}

func NewIntentRecognitionTool() *IntentRecognitionTool {
	tool := &IntentRecognitionTool{
		BaseToolImpl: BaseToolImpl{
			name:        "recognize_intent",
			description: "识别用户输入的意图，包括需求类型、优先级等",
			parameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"input": {
						Type:        "string",
						Description: "用户输入的文本",
						Required:    true,
					},
				},
			},
		},
	}
	
	return tool
}

func (t *IntentRecognitionTool) Execute(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	input, ok := args["input"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: input必须是字符串")
	}
	
	
	intent := map[string]interface{}{
		"type":        "feature_request",
		"priority":    "high",
		"description": input,
	}
	
	return intent, nil
}

type RequirementExtractionTool struct {
	BaseToolImpl
}

func NewRequirementExtractionTool() *RequirementExtractionTool {
	tool := &RequirementExtractionTool{
		BaseToolImpl: BaseToolImpl{
			name:        "extract_requirements",
			description: "从用户输入中提取具体需求，包括功能需求、非功能需求等",
			parameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"input": {
						Type:        "string",
						Description: "用户输入的文本",
						Required:    true,
					},
				},
			},
		},
	}
	
	return tool
}

func (t *RequirementExtractionTool) Execute(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	input, ok := args["input"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: input必须是字符串")
	}
	
	
	requirements := map[string]interface{}{
		"functional": []string{
			"用户注册和登录",
			"内容发布和管理",
			"用户互动和评论",
		},
		"non_functional": []string{
			"系统响应时间不超过200ms",
			"支持并发用户数不少于1000",
			"数据备份和恢复机制",
		},
		"constraints": []string{
			"使用Go语言开发后端",
			"使用React开发前端",
			"使用MySQL作为数据库",
		},
	}
	
	return requirements, nil
}
