package planner

import (
	"context"
	"fmt"

	"github.com/bytedance/eino-devin-implementation/internal/config"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
)

type TaskPlanner struct {
	config *config.Config
	
	plannerChain compose.Runnable[*schema.Intent, *schema.Plan]
}

type Intent struct {
	Description string `json:"description"`
	
	Type string `json:"type"`
	
	Priority string `json:"priority"`
}

type Plan struct {
	ID string `json:"id"`
	
	Name string `json:"name"`
	
	Description string `json:"description"`
	
	Tasks []*Task `json:"tasks"`
}

type Task struct {
	ID string `json:"id"`
	
	Name string `json:"name"`
	
	Description string `json:"description"`
	
	Type string `json:"type"`
	
	Status string `json:"status"`
	
	Dependencies []string `json:"dependencies"`
}

func NewTaskPlanner(ctx context.Context, cfg *config.Config, chatModel model.ToolCallingChatModel) (*TaskPlanner, error) {
	plannerChain, err := createPlannerChain(ctx, chatModel)
	if err != nil {
		return nil, fmt.Errorf("创建任务规划链失败: %w", err)
	}
	
	return &TaskPlanner{
		config:       cfg,
		plannerChain: plannerChain,
	}, nil
}

func createPlannerChain(ctx context.Context, chatModel model.ToolCallingChatModel) (compose.Runnable[*schema.Intent, *schema.Plan], error) {
	plannerChain := compose.NewChain[*schema.Intent, *schema.Plan]()
	
	plannerChain.AppendChatModel(chatModel, compose.WithNodeName("requirement_analysis"))
	
	taskDecompositionLambda := compose.InvokableLambda(decomposeTask)
	plannerChain.AppendLambda(taskDecompositionLambda, compose.WithNodeName("task_decomposition"))
	
	dependencyAnalysisLambda := compose.InvokableLambda(analyzeDependency)
	plannerChain.AppendLambda(dependencyAnalysisLambda, compose.WithNodeName("dependency_analysis"))
	
	planGenerationLambda := compose.InvokableLambda(generatePlan)
	plannerChain.AppendLambda(planGenerationLambda, compose.WithNodeName("plan_generation"))
	
	runnable, err := plannerChain.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("编译任务规划链失败: %w", err)
	}
	
	return runnable, nil
}

func decomposeTask(ctx context.Context, input *schema.Message) ([]*Task, error) {
	
	tasks := []*Task{
		{
			ID:          "task-1",
			Name:        "需求分析",
			Description: "分析用户需求，确定功能范围",
			Type:        "analysis",
			Status:      "pending",
		},
		{
			ID:          "task-2",
			Name:        "架构设计",
			Description: "设计系统架构，确定技术栈",
			Type:        "design",
			Status:      "pending",
		},
		{
			ID:          "task-3",
			Name:        "代码实现",
			Description: "实现核心功能代码",
			Type:        "implementation",
			Status:      "pending",
		},
		{
			ID:          "task-4",
			Name:        "测试验证",
			Description: "编写测试用例，验证功能正确性",
			Type:        "testing",
			Status:      "pending",
		},
		{
			ID:          "task-5",
			Name:        "部署上线",
			Description: "配置CI/CD，部署到生产环境",
			Type:        "deployment",
			Status:      "pending",
		},
	}
	
	return tasks, nil
}

func analyzeDependency(ctx context.Context, tasks []*Task) ([]*Task, error) {
	
	for i := 1; i < len(tasks); i++ {
		tasks[i].Dependencies = []string{tasks[i-1].ID}
	}
	
	return tasks, nil
}

func generatePlan(ctx context.Context, tasks []*Task) (*schema.Plan, error) {
	
	plan := &schema.Plan{
		ID:          "plan-1",
		Name:        "示例项目计划",
		Description: "从需求分析到部署上线的完整计划",
		Tasks:       tasks,
	}
	
	return plan, nil
}

func (p *TaskPlanner) GeneratePlan(ctx context.Context, intent *schema.Intent) (*schema.Plan, error) {
	plan, err := p.plannerChain.Invoke(ctx, intent)
	if err != nil {
		return nil, fmt.Errorf("生成执行计划失败: %w", err)
	}
	
	return plan, nil
}

func (p *TaskPlanner) UpdateTaskStatus(ctx context.Context, planID string, taskID string, status string) error {
	
	fmt.Printf("更新任务状态: 计划=%s, 任务=%s, 状态=%s\n", planID, taskID, status)
	
	return nil
}

func (p *TaskPlanner) GetNextTask(ctx context.Context, planID string) (*Task, error) {
	
	task := &Task{
		ID:          "task-1",
		Name:        "需求分析",
		Description: "分析用户需求，确定功能范围",
		Type:        "analysis",
		Status:      "pending",
	}
	
	return task, nil
}
