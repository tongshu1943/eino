package multiagent

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/agents"
	"github.com/bytedance/eino-devin-implementation/internal/multiagent/coordinator"
	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type MultiAgentSystem struct {
	coordinator *coordinator.AgentCoordinator
	agents      map[interfaces.AgentRole]interfaces.Agent
}

func NewMultiAgentSystem() *MultiAgentSystem {
	return &MultiAgentSystem{
		coordinator: coordinator.NewAgentCoordinator(),
		agents:      make(map[interfaces.AgentRole]interfaces.Agent),
	}
}

func (s *MultiAgentSystem) Initialize() error {
	requirementAnalysisAgent := agents.NewRequirementAnalysisAgent()
	businessValueAgent := agents.NewBusinessValueAgent()
	architectureDesignAgent := agents.NewArchitectureDesignAgent()
	softwareEngineeringAgent := agents.NewSoftwareEngineeringAgent()
	continuousDeliveryAgent := agents.NewContinuousDeliveryAgent()
	codeImplementationAgent := agents.NewCodeImplementationAgent()

	s.registerAgent(requirementAnalysisAgent)
	s.registerAgent(businessValueAgent)
	s.registerAgent(architectureDesignAgent)
	s.registerAgent(softwareEngineeringAgent)
	s.registerAgent(continuousDeliveryAgent)
	s.registerAgent(codeImplementationAgent)

	if err := s.coordinator.Initialize(); err != nil {
		return fmt.Errorf("failed to initialize coordinator: %w", err)
	}

	log.Println("Multi-agent system initialized successfully")
	return nil
}

func (s *MultiAgentSystem) registerAgent(agent interfaces.Agent) {
	s.agents[agent.GetRole()] = agent
	s.coordinator.RegisterAgent(agent)
	log.Printf("Registered agent with role: %s", agent.GetRole())
}

func (s *MultiAgentSystem) ProcessInput(ctx context.Context, input string, workflowName string) ([]interfaces.AgentOutput, error) {
	agentInput := interfaces.AgentInput{
		Prompt:  input,
		Context: make(map[string]interface{}),
	}

	outputs, err := s.coordinator.ExecuteWorkflow(ctx, workflowName, agentInput)
	if err != nil {
		return nil, fmt.Errorf("failed to execute workflow %s: %w", workflowName, err)
	}

	return outputs, nil
}

func (s *MultiAgentSystem) GetAgent(role interfaces.AgentRole) (interfaces.Agent, error) {
	agent, exists := s.agents[role]
	if !exists {
		return nil, fmt.Errorf("agent with role %s not found", role)
	}
	return agent, nil
}

func (s *MultiAgentSystem) GetAvailableWorkflows() []string {
	return s.coordinator.GetAvailableWorkflows()
}

func (s *MultiAgentSystem) GetAgentRoles() []interfaces.AgentRole {
	roles := make([]interfaces.AgentRole, 0, len(s.agents))
	for role := range s.agents {
		roles = append(roles, role)
	}
	return roles
}
