package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/bytedance/eino-devin-implementation/internal/onboarding"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

type OnboardingAPI struct {
	onboardingService *onboarding.BusinessOnboarding
}

type OnboardingStatusResponse struct {
	InProgress   bool                        `json:"inProgress"`
	CurrentStep  int                         `json:"currentStep"`
	ChatHistory  []ChatMessage               `json:"chatHistory,omitempty"`
	Requirements *onboarding.OnboardingRequest `json:"requirements,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type SendMessageRequest struct {
	Message     string        `json:"message"`
	ChatHistory []ChatMessage `json:"chatHistory"`
}

type SendMessageResponse struct {
	Message              string                      `json:"message"`
	ShouldComplete       bool                        `json:"shouldComplete"`
	ExtractedRequirements *onboarding.OnboardingRequest `json:"extractedRequirements,omitempty"`
}

type AnalyzeRequirementsRequest struct {
	ChatHistory []ChatMessage `json:"chatHistory"`
}

type AnalyzeRequirementsResponse struct {
	ShouldComplete       bool                        `json:"shouldComplete"`
	ExtractedRequirements *onboarding.OnboardingRequest `json:"extractedRequirements,omitempty"`
}

func NewOnboardingAPI(onboardingService *onboarding.BusinessOnboarding) *OnboardingAPI {
	return &OnboardingAPI{
		onboardingService: onboardingService,
	}
}

func (api *OnboardingAPI) RegisterRoutes(h *server.Hertz) {
	onboardingGroup := h.Group("/api/onboarding")
	{
		onboardingGroup.GET("/status", api.GetOnboardingStatus)
		onboardingGroup.POST("/start", api.StartOnboarding)
		onboardingGroup.POST("/message", api.SendMessage)
		onboardingGroup.POST("/analyze", api.AnalyzeRequirements)
		onboardingGroup.POST("/submit", api.SubmitRequirements)
		onboardingGroup.POST("/generate-plan", api.GenerateProjectPlan)
	}
}

func (api *OnboardingAPI) GetOnboardingStatus(ctx context.Context, c *app.RequestContext) {
	response := OnboardingStatusResponse{
		InProgress:  false,
		CurrentStep: 0,
	}

	c.JSON(http.StatusOK, response)
}

func (api *OnboardingAPI) StartOnboarding(ctx context.Context, c *app.RequestContext) {
	c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "引导过程已开始",
	})
}

func (api *OnboardingAPI) SendMessage(ctx context.Context, c *app.RequestContext) {
	var request SendMessageRequest
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("请求参数错误: %v", err),
		})
		return
	}

	response := SendMessageResponse{
		Message:        "感谢您的信息！请告诉我更多关于您项目的细节，比如目标用户、核心功能等。",
		ShouldComplete: false,
	}

	if len(request.ChatHistory) >= 5 {
		response.ShouldComplete = true
		response.Message = "感谢您提供的信息！我已经收集了足够的需求信息，接下来我将为您生成一份需求表单，请您确认这些信息是否准确。"
		
		response.ExtractedRequirements = &onboarding.OnboardingRequest{
			ProjectName:        "内容管理系统",
			ProjectDescription: "一个支持用户注册、登录、内容发布、管理和互动的系统",
			ProjectType:        "Web应用",
			TechPreferences:    []string{"golang", "react"},
			BusinessScale:      "中型",
			TimeRequirement:    "3个月",
		}
	}

	c.JSON(http.StatusOK, response)
}

func (api *OnboardingAPI) AnalyzeRequirements(ctx context.Context, c *app.RequestContext) {
	var request AnalyzeRequirementsRequest
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("请求参数错误: %v", err),
		})
		return
	}

	response := AnalyzeRequirementsResponse{
		ShouldComplete: true,
		ExtractedRequirements: &onboarding.OnboardingRequest{
			ProjectName:        "内容管理系统",
			ProjectDescription: "一个支持用户注册、登录、内容发布、管理和互动的系统",
			ProjectType:        "Web应用",
			TechPreferences:    []string{"golang", "react"},
			BusinessScale:      "中型",
			TimeRequirement:    "3个月",
		},
	}

	c.JSON(http.StatusOK, response)
}

func (api *OnboardingAPI) SubmitRequirements(ctx context.Context, c *app.RequestContext) {
	var request onboarding.OnboardingRequest
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("请求参数错误: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "需求已提交",
	})
}

func (api *OnboardingAPI) GenerateProjectPlan(ctx context.Context, c *app.RequestContext) {
	var request struct {
		Requirements onboarding.OnboardingRequest `json:"requirements"`
	}
	if err := c.BindAndValidate(&request); err != nil {
		c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": fmt.Sprintf("请求参数错误: %v", err),
		})
		return
	}

	onboardingResponse, err := api.onboardingService.StartOnboarding(ctx, &request.Requirements)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": fmt.Sprintf("生成项目方案失败: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, onboardingResponse)
}
