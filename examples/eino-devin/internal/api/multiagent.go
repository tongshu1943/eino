package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent"
	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

type MultiAgentAPI struct {
	multiAgentSystem *multiagent.MultiAgentSystem
}

func NewMultiAgentAPI(mas *multiagent.MultiAgentSystem) *MultiAgentAPI {
	return &MultiAgentAPI{
		multiAgentSystem: mas,
	}
}

func (api *MultiAgentAPI) RegisterRoutes(h *server.Hertz) {
	h.POST("/api/multiagent/process", api.handleProcess)
	
	h.GET("/api/multiagent/workflows", api.handleGetWorkflows)
	
	h.GET("/api/multiagent/roles", api.handleGetRoles)
	
	h.POST("/api/multiagent/agent/:role", api.handleAgentProcess)
}

func (api *MultiAgentAPI) handleProcess(ctx context.Context, c *app.RequestContext) {
	var request struct {
		Input       string                 `json:"input"`
		WorkflowName string                `json:"workflow_name"`
		Context     map[string]interface{} `json:"context,omitempty"`
	}
	
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("解析请求失败: %v", err),
		})
		return
	}
	
	log.Printf("处理多智能体请求: %s, 工作流: %s", request.Input, request.WorkflowName)
	
	outputs, err := api.multiAgentSystem.ProcessInput(ctx, request.Input, request.WorkflowName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": fmt.Sprintf("处理多智能体请求失败: %v", err),
		})
		return
	}
	
	jsonOutputs := make([]map[string]interface{}, 0, len(outputs))
	for _, output := range outputs {
		jsonOutput := map[string]interface{}{
			"content":    output.Content,
			"confidence": output.Confidence,
			"data":       output.Data,
		}
		if output.Error != "" {
			jsonOutput["error"] = output.Error
		}
		jsonOutputs = append(jsonOutputs, jsonOutput)
	}
	
	c.JSON(http.StatusOK, map[string]interface{}{
		"outputs": jsonOutputs,
	})
}

func (api *MultiAgentAPI) handleGetWorkflows(ctx context.Context, c *app.RequestContext) {
	workflows := api.multiAgentSystem.GetAvailableWorkflows()
	
	c.JSON(http.StatusOK, map[string]interface{}{
		"workflows": workflows,
	})
}

func (api *MultiAgentAPI) handleGetRoles(ctx context.Context, c *app.RequestContext) {
	roles := api.multiAgentSystem.GetAgentRoles()
	
	roleStrings := make([]string, 0, len(roles))
	for _, role := range roles {
		roleStrings = append(roleStrings, string(role))
	}
	
	c.JSON(http.StatusOK, map[string]interface{}{
		"roles": roleStrings,
	})
}

func (api *MultiAgentAPI) handleAgentProcess(ctx context.Context, c *app.RequestContext) {
	roleParam := c.Param("role")
	role := interfaces.AgentRole(roleParam)
	
	var request struct {
		Input   string                 `json:"input"`
		Context map[string]interface{} `json:"context,omitempty"`
	}
	
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("解析请求失败: %v", err),
		})
		return
	}
	
	log.Printf("处理特定智能体请求: %s, 角色: %s", request.Input, role)
	
	agent, err := api.multiAgentSystem.GetAgent(role)
	if err != nil {
		c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": fmt.Sprintf("找不到角色为 %s 的智能体: %v", role, err),
		})
		return
	}
	
	agentInput := interfaces.AgentInput{
		Prompt:  request.Input,
		Context: request.Context,
	}
	
	output, err := agent.Process(ctx, agentInput)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": fmt.Sprintf("处理智能体请求失败: %v", err),
		})
		return
	}
	
	jsonOutput := map[string]interface{}{
		"content":    output.Content,
		"confidence": output.Confidence,
		"data":       output.Data,
	}
	if output.Error != "" {
		jsonOutput["error"] = output.Error
	}
	
	c.JSON(http.StatusOK, jsonOutput)
}
