package coordinator

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
	"github.com/bytedance/eino-devin-implementation/internal/multiagent/workflows"
)

type AgentCoordinator struct {
	agents map[interfaces.AgentRole]interfaces.Agent
	
	mu sync.RWMutex
	
	workflows map[string][]interfaces.AgentRole
	
	globalContext map[string]interface{}
}

func NewAgentCoordinator() *AgentCoordinator {
	return &AgentCoordinator{
		agents:        make(map[interfaces.AgentRole]interfaces.Agent),
		workflows:     make(map[string][]interfaces.AgentRole),
		globalContext: make(map[string]interface{}),
	}
}

func (c *AgentCoordinator) Initialize() error {
	workflowDefs := workflows.GetWorkflowDefinitions()
	for name, def := range workflowDefs {
		if err := c.DefineWorkflow(name, def.Sequence); err != nil {
			return fmt.Errorf("初始化工作流 %s 失败: %w", name, err)
		}
	}
	
	log.Printf("初始化了 %d 个预定义工作流", len(workflowDefs))
	return nil
}

func (c *AgentCoordinator) RegisterAgent(agent interfaces.Agent) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	role := agent.GetRole()
	if _, exists := c.agents[role]; exists {
		return fmt.Errorf("agent with role %s already registered", role)
	}
	
	c.agents[role] = agent
	log.Printf("Registered agent with role: %s", role)
	return nil
}

func (c *AgentCoordinator) GetAgent(role interfaces.AgentRole) (interfaces.Agent, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	agent, exists := c.agents[role]
	if !exists {
		return nil, fmt.Errorf("no agent registered for role: %s", role)
	}
	
	return agent, nil
}

func (c *AgentCoordinator) DefineWorkflow(name string, sequence []interfaces.AgentRole) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	if _, exists := c.workflows[name]; exists {
		return fmt.Errorf("workflow %s already defined", name)
	}
	
	for _, role := range sequence {
		if _, exists := c.agents[role]; !exists {
			return fmt.Errorf("no agent registered for role %s in workflow %s", role, name)
		}
	}
	
	c.workflows[name] = sequence
	log.Printf("Defined workflow %s with %d steps", name, len(sequence))
	return nil
}

func (c *AgentCoordinator) ExecuteWorkflow(ctx context.Context, workflowName string, initialInput interfaces.AgentInput) ([]interfaces.AgentOutput, error) {
	c.mu.RLock()
	sequence, exists := c.workflows[workflowName]
	c.mu.RUnlock()
	
	if !exists {
		return nil, fmt.Errorf("workflow %s not defined", workflowName)
	}
	
	var results []interfaces.AgentOutput
	currentInput := initialInput
	
	for i, role := range sequence {
		c.mu.RLock()
		agent, exists := c.agents[role]
		c.mu.RUnlock()
		
		if !exists {
			return results, fmt.Errorf("agent for role %s not found at step %d", role, i)
		}
		
		log.Printf("Executing agent %s (step %d/%d) in workflow %s", role, i+1, len(sequence), workflowName)
		
		output, err := agent.Process(ctx, currentInput)
		if err != nil {
			return results, fmt.Errorf("error at step %d (%s): %w", i, role, err)
		}
		
		results = append(results, output)
		
		if i < len(sequence)-1 {
			if currentInput.Context == nil {
				currentInput.Context = make(map[string]interface{})
			}
			
			currentInput.Context[string(role)] = output.Data
			
			if output.Content != "" {
				currentInput.Prompt = output.Content
			}
		}
	}
	
	return results, nil
}

func (c *AgentCoordinator) ExecuteSingleAgent(ctx context.Context, role interfaces.AgentRole, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	c.mu.RLock()
	agent, exists := c.agents[role]
	c.mu.RUnlock()
	
	if !exists {
		return interfaces.AgentOutput{}, fmt.Errorf("no agent registered for role: %s", role)
	}
	
	return agent.Process(ctx, input)
}

func (c *AgentCoordinator) FindBestAgent(input interfaces.AgentInput) (interfaces.Agent, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	var bestAgent interfaces.Agent
	
	for _, agent := range c.agents {
		if agent.CanHandle(input) {
			bestAgent = agent
			break
		}
	}
	
	if bestAgent == nil {
		return nil, errors.New("no suitable agent found for the given input")
	}
	
	return bestAgent, nil
}

func (c *AgentCoordinator) UpdateGlobalContext(key string, value interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	c.globalContext[key] = value
}

func (c *AgentCoordinator) GetGlobalContext(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	value, exists := c.globalContext[key]
	return value, exists
}

func (c *AgentCoordinator) GetAvailableWorkflows() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	workflowNames := make([]string, 0, len(c.workflows))
	for name := range c.workflows {
		workflowNames = append(workflowNames, name)
	}
	
	return workflowNames
}
