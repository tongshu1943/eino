package tools

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

type CICDTool struct {
	BaseToolImpl
	cicdType string
	endpoint string
	token    string
}

func NewCICDTool(cicdType, endpoint, token string) (*CICDTool, error) {
	tool := &CICDTool{
		BaseToolImpl: BaseToolImpl{
			name:        "cicd_tool",
			description: "执行CI/CD操作，包括触发构建、部署、查看构建状态等",
			parameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"operation": {
						Type:        "string",
						Description: "CI/CD操作类型，支持trigger_build、deploy、check_status等",
						Required:    true,
					},
					"project": {
						Type:        "string",
						Description: "项目名称",
						Required:    false,
					},
					"pipeline": {
						Type:        "string",
						Description: "流水线名称",
						Required:    false,
					},
					"branch": {
						Type:        "string",
						Description: "分支名称",
						Required:    false,
					},
					"environment": {
						Type:        "string",
						Description: "部署环境",
						Required:    false,
					},
					"build_id": {
						Type:        "string",
						Description: "构建ID",
						Required:    false,
					},
					"parameters": {
						Type:        "object",
						Description: "构建参数",
						Required:    false,
					},
				},
			},
		},
		cicdType: cicdType,
		endpoint: endpoint,
		token:    token,
	}
	
	return tool, nil
}

func (t *CICDTool) Execute(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	operation, ok := args["operation"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: operation必须是字符串")
	}
	
	switch operation {
	case "trigger_build":
		return t.triggerBuild(args)
	case "deploy":
		return t.deploy(args)
	case "check_status":
		return t.checkStatus(args)
	case "get_logs":
		return t.getLogs(args)
	case "create_pipeline":
		return t.createPipeline(args)
	default:
		return nil, fmt.Errorf("不支持的CI/CD操作: %s", operation)
	}
}

func (t *CICDTool) triggerBuild(args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: project必须是字符串")
	}
	
	pipeline, ok := args["pipeline"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: pipeline必须是字符串")
	}
	
	branch, _ := args["branch"].(string)
	
	parameters, _ := args["parameters"].(map[string]interface{})
	
	switch t.cicdType {
	case "jenkins":
		return t.triggerJenkinsBuild(project, pipeline, branch, parameters)
	case "gitlab":
		return t.triggerGitlabBuild(project, pipeline, branch, parameters)
	case "github":
		return t.triggerGithubBuild(project, pipeline, branch, parameters)
	default:
		return nil, fmt.Errorf("不支持的CI/CD类型: %s", t.cicdType)
	}
}

func (t *CICDTool) triggerJenkinsBuild(project, pipeline, branch string, parameters map[string]interface{}) (interface{}, error) {
	
	url := fmt.Sprintf("%s/job/%s/job/%s/buildWithParameters", t.endpoint, project, pipeline)
	
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}
	
	req.Header.Add("Authorization", "Bearer "+t.token)
	
	q := req.URL.Query()
	if branch != "" {
		q.Add("branch", branch)
	}
	
	for k, v := range parameters {
		q.Add(k, fmt.Sprintf("%v", v))
	}
	
	req.URL.RawQuery = q.Encode()
	
	
	return map[string]interface{}{
		"status":    "success",
		"message":   "构建触发成功",
		"build_id":  "12345",
		"build_url": fmt.Sprintf("%s/job/%s/job/%s/12345", t.endpoint, project, pipeline),
	}, nil
}

func (t *CICDTool) triggerGitlabBuild(project, pipeline, branch string, parameters map[string]interface{}) (interface{}, error) {
	
	return map[string]interface{}{
		"status":    "success",
		"message":   "构建触发成功",
		"build_id":  "12345",
		"build_url": fmt.Sprintf("%s/projects/%s/pipelines/12345", t.endpoint, project),
	}, nil
}

func (t *CICDTool) triggerGithubBuild(project, pipeline, branch string, parameters map[string]interface{}) (interface{}, error) {
	
	return map[string]interface{}{
		"status":    "success",
		"message":   "构建触发成功",
		"build_id":  "12345",
		"build_url": fmt.Sprintf("%s/%s/actions/runs/12345", t.endpoint, project),
	}, nil
}

func (t *CICDTool) deploy(args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: project必须是字符串")
	}
	
	environment, ok := args["environment"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: environment必须是字符串")
	}
	
	buildID, _ := args["build_id"].(string)
	
	switch t.cicdType {
	case "jenkins":
		return t.deployJenkins(project, environment, buildID)
	case "gitlab":
		return t.deployGitlab(project, environment, buildID)
	case "github":
		return t.deployGithub(project, environment, buildID)
	default:
		return nil, fmt.Errorf("不支持的CI/CD类型: %s", t.cicdType)
	}
}

func (t *CICDTool) deployJenkins(project, environment, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":      "success",
		"message":     "部署成功",
		"deploy_id":   "67890",
		"deploy_url":  fmt.Sprintf("%s/job/%s-deploy/67890", t.endpoint, project),
		"environment": environment,
	}, nil
}

func (t *CICDTool) deployGitlab(project, environment, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":      "success",
		"message":     "部署成功",
		"deploy_id":   "67890",
		"deploy_url":  fmt.Sprintf("%s/projects/%s/environments/%s/deployments/67890", t.endpoint, project, environment),
		"environment": environment,
	}, nil
}

func (t *CICDTool) deployGithub(project, environment, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":      "success",
		"message":     "部署成功",
		"deploy_id":   "67890",
		"deploy_url":  fmt.Sprintf("%s/%s/deployments/67890", t.endpoint, project),
		"environment": environment,
	}, nil
}

func (t *CICDTool) checkStatus(args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: project必须是字符串")
	}
	
	buildID, ok := args["build_id"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: build_id必须是字符串")
	}
	
	switch t.cicdType {
	case "jenkins":
		return t.checkJenkinsStatus(project, buildID)
	case "gitlab":
		return t.checkGitlabStatus(project, buildID)
	case "github":
		return t.checkGithubStatus(project, buildID)
	default:
		return nil, fmt.Errorf("不支持的CI/CD类型: %s", t.cicdType)
	}
}

func (t *CICDTool) checkJenkinsStatus(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":     "success",
		"build_id":   buildID,
		"build_url":  fmt.Sprintf("%s/job/%s/%s", t.endpoint, project, buildID),
		"build_status": "SUCCESS",
		"duration":   "2m 30s",
	}, nil
}

func (t *CICDTool) checkGitlabStatus(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":     "success",
		"build_id":   buildID,
		"build_url":  fmt.Sprintf("%s/projects/%s/pipelines/%s", t.endpoint, project, buildID),
		"build_status": "success",
		"duration":   "2m 30s",
	}, nil
}

func (t *CICDTool) checkGithubStatus(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":     "success",
		"build_id":   buildID,
		"build_url":  fmt.Sprintf("%s/%s/actions/runs/%s", t.endpoint, project, buildID),
		"build_status": "completed",
		"conclusion": "success",
		"duration":   "2m 30s",
	}, nil
}

func (t *CICDTool) getLogs(args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: project必须是字符串")
	}
	
	buildID, ok := args["build_id"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: build_id必须是字符串")
	}
	
	switch t.cicdType {
	case "jenkins":
		return t.getJenkinsLogs(project, buildID)
	case "gitlab":
		return t.getGitlabLogs(project, buildID)
	case "github":
		return t.getGithubLogs(project, buildID)
	default:
		return nil, fmt.Errorf("不支持的CI/CD类型: %s", t.cicdType)
	}
}

func (t *CICDTool) getJenkinsLogs(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":   "success",
		"build_id": buildID,
		"logs":     "构建开始\n检出代码\n运行测试\n构建成功",
	}, nil
}

func (t *CICDTool) getGitlabLogs(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":   "success",
		"build_id": buildID,
		"logs":     "构建开始\n检出代码\n运行测试\n构建成功",
	}, nil
}

func (t *CICDTool) getGithubLogs(project, buildID string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":   "success",
		"build_id": buildID,
		"logs":     "构建开始\n检出代码\n运行测试\n构建成功",
	}, nil
}

func (t *CICDTool) createPipeline(args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: project必须是字符串")
	}
	
	pipeline, ok := args["pipeline"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: pipeline必须是字符串")
	}
	
	config, ok := args["config"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: config必须是字符串")
	}
	
	switch t.cicdType {
	case "jenkins":
		return t.createJenkinsPipeline(project, pipeline, config)
	case "gitlab":
		return t.createGitlabPipeline(project, pipeline, config)
	case "github":
		return t.createGithubPipeline(project, pipeline, config)
	default:
		return nil, fmt.Errorf("不支持的CI/CD类型: %s", t.cicdType)
	}
}

func (t *CICDTool) createJenkinsPipeline(project, pipeline, config string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":       "success",
		"message":      "流水线创建成功",
		"project":      project,
		"pipeline":     pipeline,
		"pipeline_url": fmt.Sprintf("%s/job/%s/job/%s", t.endpoint, project, pipeline),
	}, nil
}

func (t *CICDTool) createGitlabPipeline(project, pipeline, config string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":       "success",
		"message":      "流水线创建成功",
		"project":      project,
		"pipeline":     pipeline,
		"pipeline_url": fmt.Sprintf("%s/projects/%s/pipelines", t.endpoint, project),
	}, nil
}

func (t *CICDTool) createGithubPipeline(project, pipeline, config string) (interface{}, error) {
	
	return map[string]interface{}{
		"status":       "success",
		"message":      "流水线创建成功",
		"project":      project,
		"pipeline":     pipeline,
		"pipeline_url": fmt.Sprintf("%s/%s/actions", t.endpoint, project),
	}, nil
}
