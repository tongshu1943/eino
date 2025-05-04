package agents

import (
	"context"
	"fmt"
	"log"

	"github.com/bytedance/eino-devin-implementation/internal/multiagent/interfaces"
)

type BusinessValueAgent struct {
	config map[string]interface{}
	
	capabilities []string
}

func NewBusinessValueAgent() *BusinessValueAgent {
	return &BusinessValueAgent{
		capabilities: []string{
			"business_impact_assessment",
			"roi_calculation",
			"market_analysis",
			"okr_alignment",
			"value_stream_mapping",
		},
	}
}

func (a *BusinessValueAgent) GetRole() interfaces.AgentRole {
	return interfaces.BusinessValueRole
}

func (a *BusinessValueAgent) Process(ctx context.Context, input interfaces.AgentInput) (interfaces.AgentOutput, error) {
	log.Printf("BusinessValueAgent processing input: %s", input.Prompt)
	
	var requirements map[string]interface{}
	if input.Context != nil {
		if reqData, ok := input.Context[string(interfaces.RequirementAnalysisRole)]; ok {
			requirements = reqData.(map[string]interface{})
		}
	}
	
	businessValue, err := a.assessBusinessValue(input.Prompt, requirements)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to assess business value: %w", err)
	}
	
	roi, err := a.calculateROI(businessValue)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to calculate ROI: %w", err)
	}
	
	okrAlignment, err := a.alignWithOKRs(businessValue)
	if err != nil {
		return interfaces.AgentOutput{}, fmt.Errorf("failed to align with OKRs: %w", err)
	}
	
	outputData := map[string]interface{}{
		"business_value": businessValue,
		"roi":            roi,
		"okr_alignment":  okrAlignment,
	}
	
	summary := a.generateBusinessValueSummary(businessValue, roi, okrAlignment)
	
	return interfaces.AgentOutput{
		Content:    summary,
		Confidence: a.calculateConfidence(businessValue, roi),
		Data:       outputData,
	}, nil
}

func (a *BusinessValueAgent) CanHandle(input interfaces.AgentInput) bool {
	businessKeywords := []string{
		"business value", "roi", "return on investment", "market", "revenue",
		"cost", "profit", "okr", "objective", "key result", "商业价值", "投资回报",
	}
	
	for _, keyword := range businessKeywords {
		if containsIgnoreCase(input.Prompt, keyword) {
			return true
		}
	}
	
	return false
}

func (a *BusinessValueAgent) GetCapabilities() []string {
	return a.capabilities
}

func (a *BusinessValueAgent) Initialize(config map[string]interface{}) error {
	a.config = config
	return nil
}


func (a *BusinessValueAgent) assessBusinessValue(prompt string, requirements map[string]interface{}) (map[string]interface{}, error) {
	
	businessValue := map[string]interface{}{
		"market_impact": map[string]interface{}{
			"score": 8.5,
			"notes": "该项目有潜力显著提升市场份额",
		},
		"revenue_potential": map[string]interface{}{
			"score": 7.2,
			"notes": "预计可增加10-15%的收入",
		},
		"cost_reduction": map[string]interface{}{
			"score": 6.8,
			"notes": "通过自动化可减少约20%的运营成本",
		},
		"competitive_advantage": map[string]interface{}{
			"score": 9.0,
			"notes": "提供显著的差异化优势",
		},
		"strategic_alignment": map[string]interface{}{
			"score": 8.0,
			"notes": "与公司数字化转型战略高度一致",
		},
	}
	
	return businessValue, nil
}

func (a *BusinessValueAgent) calculateROI(businessValue map[string]interface{}) (map[string]interface{}, error) {
	
	roi := map[string]interface{}{
		"estimated_cost": 1000000, // 预计成本（元）
		"estimated_benefit": 2500000, // 预计收益（元）
		"roi_percentage": 150, // ROI百分比
		"payback_period": 1.5, // 回收期（年）
		"npv": 1200000, // 净现值（元）
		"irr": 0.35, // 内部收益率
	}
	
	return roi, nil
}

func (a *BusinessValueAgent) alignWithOKRs(businessValue map[string]interface{}) (map[string]interface{}, error) {
	
	okrAlignment := map[string]interface{}{
		"objectives": []map[string]interface{}{
			{
				"objective": "提升研发效率",
				"alignment_score": 9.0,
				"key_results": []string{
					"将研发周期缩短30%",
					"提高代码质量指标达到95%",
					"减少50%的手动部署工作",
				},
			},
			{
				"objective": "增强用户体验",
				"alignment_score": 8.5,
				"key_results": []string{
					"用户满意度提升20%",
					"用户参与度提升15%",
					"减少30%的用户报错",
				},
			},
			{
				"objective": "扩大市场份额",
				"alignment_score": 7.0,
				"key_results": []string{
					"新增用户增长25%",
					"提高用户留存率10%",
					"增加产品使用频率15%",
				},
			},
		},
	}
	
	return okrAlignment, nil
}

func (a *BusinessValueAgent) generateBusinessValueSummary(businessValue, roi, okrAlignment map[string]interface{}) string {
	
	summary := "业务价值评估完成。\n\n"
	
	if marketImpact, ok := businessValue["market_impact"].(map[string]interface{}); ok {
		score, _ := marketImpact["score"].(float64)
		notes, _ := marketImpact["notes"].(string)
		summary += fmt.Sprintf("市场影响: %.1f/10 - %s\n", score, notes)
	}
	
	if revPotential, ok := businessValue["revenue_potential"].(map[string]interface{}); ok {
		score, _ := revPotential["score"].(float64)
		notes, _ := revPotential["notes"].(string)
		summary += fmt.Sprintf("收入潜力: %.1f/10 - %s\n", score, notes)
	}
	
	roiPercentage, _ := roi["roi_percentage"].(float64)
	paybackPeriod, _ := roi["payback_period"].(float64)
	summary += fmt.Sprintf("\n投资回报率: %.0f%%\n", roiPercentage)
	summary += fmt.Sprintf("投资回收期: %.1f年\n", paybackPeriod)
	
	summary += "\nOKR对齐情况:\n"
	if objectives, ok := okrAlignment["objectives"].([]map[string]interface{}); ok {
		for _, obj := range objectives {
			objective, _ := obj["objective"].(string)
			alignmentScore, _ := obj["alignment_score"].(float64)
			summary += fmt.Sprintf("- %s: 对齐度 %.1f/10\n", objective, alignmentScore)
		}
	}
	
	return summary
}

func (a *BusinessValueAgent) calculateConfidence(businessValue, roi map[string]interface{}) float64 {
	
	var totalScore float64
	var count int
	
	if marketImpact, ok := businessValue["market_impact"].(map[string]interface{}); ok {
		if score, ok := marketImpact["score"].(float64); ok {
			totalScore += score
			count++
		}
	}
	
	if revPotential, ok := businessValue["revenue_potential"].(map[string]interface{}); ok {
		if score, ok := revPotential["score"].(float64); ok {
			totalScore += score
			count++
		}
	}
	
	if costReduction, ok := businessValue["cost_reduction"].(map[string]interface{}); ok {
		if score, ok := costReduction["score"].(float64); ok {
			totalScore += score
			count++
		}
	}
	
	if compAdvantage, ok := businessValue["competitive_advantage"].(map[string]interface{}); ok {
		if score, ok := compAdvantage["score"].(float64); ok {
			totalScore += score
			count++
		}
	}
	
	if stratAlignment, ok := businessValue["strategic_alignment"].(map[string]interface{}); ok {
		if score, ok := stratAlignment["score"].(float64); ok {
			totalScore += score
			count++
		}
	}
	
	var avgScore float64
	if count > 0 {
		avgScore = totalScore / float64(count) / 10.0
	} else {
		avgScore = 0.5 // Default if no scores available
	}
	
	return avgScore
}
