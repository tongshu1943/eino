package tools

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
)

type GitTool struct {
	BaseToolImpl
	token string
}

func NewGitTool(token string) (*GitTool, error) {
	tool := &GitTool{
		BaseToolImpl: BaseToolImpl{
			name:        "git_tool",
			description: "执行Git操作，包括克隆仓库、创建分支、提交代码、推送代码等",
			parameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"operation": {
						Type:        "string",
						Description: "Git操作类型，支持clone、checkout、branch、add、commit、push等",
						Required:    true,
					},
					"repo_url": {
						Type:        "string",
						Description: "Git仓库URL",
						Required:    false,
					},
					"branch": {
						Type:        "string",
						Description: "分支名称",
						Required:    false,
					},
					"commit_message": {
						Type:        "string",
						Description: "提交消息",
						Required:    false,
					},
					"files": {
						Type:        "array",
						Description: "文件列表",
						Required:    false,
					},
					"directory": {
						Type:        "string",
						Description: "目标目录",
						Required:    false,
					},
				},
			},
		},
		token: token,
	}
	
	return tool, nil
}

func (t *GitTool) Execute(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	operation, ok := args["operation"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: operation必须是字符串")
	}
	
	switch operation {
	case "clone":
		return t.clone(args)
	case "checkout":
		return t.checkout(args)
	case "branch":
		return t.branch(args)
	case "add":
		return t.add(args)
	case "commit":
		return t.commit(args)
	case "push":
		return t.push(args)
	case "pull":
		return t.pull(args)
	case "status":
		return t.status(args)
	case "log":
		return t.log(args)
	default:
		return nil, fmt.Errorf("不支持的Git操作: %s", operation)
	}
}

func (t *GitTool) clone(args map[string]interface{}) (interface{}, error) {
	repoURL, ok := args["repo_url"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: repo_url必须是字符串")
	}
	
	directory, _ := args["directory"].(string)
	
	cmd := exec.Command("git", "clone")
	
	if t.token != "" {
		urlParts := strings.Split(repoURL, "//")
		if len(urlParts) == 2 {
			repoURL = fmt.Sprintf("%s//%s:%s@%s", urlParts[0], "oauth2", t.token, urlParts[1])
		}
	}
	
	cmd.Args = append(cmd.Args, repoURL)
	
	if directory != "" {
		cmd.Args = append(cmd.Args, directory)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("克隆仓库失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "仓库克隆成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) checkout(args map[string]interface{}) (interface{}, error) {
	branch, ok := args["branch"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: branch必须是字符串")
	}
	
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "checkout", branch)
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("检出分支失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("分支 %s 检出成功", branch),
		"output":  string(output),
	}, nil
}

func (t *GitTool) branch(args map[string]interface{}) (interface{}, error) {
	branch, ok := args["branch"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: branch必须是字符串")
	}
	
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "branch", branch)
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建分支失败: %w, 输出: %s", err, string(output))
	}
	
	checkoutCmd := exec.Command("git", "checkout", branch)
	checkoutCmd.Dir = directory
	
	checkoutOutput, err := checkoutCmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("检出新分支失败: %w, 输出: %s", err, string(checkoutOutput))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("分支 %s 创建并检出成功", branch),
		"output":  string(output) + "\n" + string(checkoutOutput),
	}, nil
}

func (t *GitTool) add(args map[string]interface{}) (interface{}, error) {
	var files []string
	
	filesInterface, ok := args["files"]
	if ok {
		filesSlice, ok := filesInterface.([]interface{})
		if ok {
			for _, file := range filesSlice {
				if fileStr, ok := file.(string); ok {
					files = append(files, fileStr)
				}
			}
		} else if fileStr, ok := filesInterface.(string); ok {
			files = append(files, fileStr)
		}
	}
	
	if len(files) == 0 {
		files = []string{"."}
	}
	
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", append([]string{"add"}, files...)...)
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("添加文件失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "文件添加成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) commit(args map[string]interface{}) (interface{}, error) {
	commitMessage, ok := args["commit_message"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: commit_message必须是字符串")
	}
	
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "commit", "-m", commitMessage)
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("提交代码失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "代码提交成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) push(args map[string]interface{}) (interface{}, error) {
	branch, _ := args["branch"].(string)
	
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "push")
	
	if branch != "" {
		cmd.Args = append(cmd.Args, "origin", branch)
	}
	
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("推送代码失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "代码推送成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) pull(args map[string]interface{}) (interface{}, error) {
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "pull")
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("拉取代码失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "代码拉取成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) status(args map[string]interface{}) (interface{}, error) {
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "status")
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("查看状态失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "查看状态成功",
		"output":  string(output),
	}, nil
}

func (t *GitTool) log(args map[string]interface{}) (interface{}, error) {
	directory, _ := args["directory"].(string)
	if directory == "" {
		directory = "."
	}
	
	cmd := exec.Command("git", "log", "--oneline", "-n", "10")
	cmd.Dir = directory
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("查看日志失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "查看日志成功",
		"output":  string(output),
	}, nil
}
