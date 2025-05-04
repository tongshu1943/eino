package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	Server ServerConfig `json:"server"`
	
	Models ModelsConfig `json:"models"`
	
	Tools ToolsConfig `json:"tools"`
	
	Knowledge KnowledgeConfig `json:"knowledge"`
}

type ServerConfig struct {
	Port int `json:"port"`
}

type ModelsConfig struct {
	ChatModel ChatModelConfig `json:"chat_model"`
	
	CodeModel CodeModelConfig `json:"code_model"`
	
	EmbeddingModel EmbeddingModelConfig `json:"embedding_model"`
}

type ChatModelConfig struct {
	Type    string `json:"type"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
}

type CodeModelConfig struct {
	Type    string `json:"type"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
}

type EmbeddingModelConfig struct {
	Type    string `json:"type"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
}

type ToolsConfig struct {
	Git GitConfig `json:"git"`
	
	CICD CICDConfig `json:"cicd"`
	
	Kubernetes KubernetesConfig `json:"kubernetes"`
}

type GitConfig struct {
	Enabled bool   `json:"enabled"`
	Token   string `json:"token"`
}

type CICDConfig struct {
	Enabled  bool   `json:"enabled"`
	Type     string `json:"type"`
	Endpoint string `json:"endpoint"`
	Token    string `json:"token"`
}

type KubernetesConfig struct {
	Enabled    bool   `json:"enabled"`
	KubeConfig string `json:"kube_config"`
}

type KnowledgeConfig struct {
	Enabled bool   `json:"enabled"`
	Path    string `json:"path"`
}

func DefaultConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: 8080,
		},
		Models: ModelsConfig{
			ChatModel: ChatModelConfig{
				Type:    "openai",
				APIKey:  "",
				BaseURL: "https://api.openai.com/v1",
			},
			CodeModel: CodeModelConfig{
				Type:    "openai",
				APIKey:  "",
				BaseURL: "https://api.openai.com/v1",
			},
			EmbeddingModel: EmbeddingModelConfig{
				Type:    "openai",
				APIKey:  "",
				BaseURL: "https://api.openai.com/v1",
			},
		},
		Tools: ToolsConfig{
			Git: GitConfig{
				Enabled: true,
				Token:   "",
			},
			CICD: CICDConfig{
				Enabled:  true,
				Type:     "jenkins",
				Endpoint: "",
				Token:    "",
			},
			Kubernetes: KubernetesConfig{
				Enabled:    true,
				KubeConfig: "",
			},
		},
		Knowledge: KnowledgeConfig{
			Enabled: true,
			Path:    "./knowledge",
		},
	}
}

func Load() (*Config, error) {
	config := DefaultConfig()
	
	configPath := os.Getenv("EINO_DEVIN_CONFIG")
	if configPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return config, nil // 返回默认配置
		}
		configPath = filepath.Join(homeDir, ".eino-devin", "config.json")
	}
	
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return config, nil
	}
	
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}
	
	if err := json.Unmarshal(data, config); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}
	
	return config, nil
}

func Save(config *Config) error {
	configPath := os.Getenv("EINO_DEVIN_CONFIG")
	if configPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return fmt.Errorf("获取用户目录失败: %w", err)
		}
		configDir := filepath.Join(homeDir, ".eino-devin")
		if err := os.MkdirAll(configDir, 0755); err != nil {
			return fmt.Errorf("创建配置目录失败: %w", err)
		}
		configPath = filepath.Join(configDir, "config.json")
	}
	
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化配置失败: %w", err)
	}
	
	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("写入配置文件失败: %w", err)
	}
	
	return nil
}
