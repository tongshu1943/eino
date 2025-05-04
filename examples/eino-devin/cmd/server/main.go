package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bytedance/eino-devin-implementation/internal/agent"
	"github.com/bytedance/eino-devin-implementation/internal/config"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-signalChan
		fmt.Println("\n收到退出信号，正在优雅退出...")
		cancel()
	}()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	devinAgent, err := agent.NewDevinAgent(ctx, cfg)
	if err != nil {
		log.Fatalf("初始化Devin助手失败: %v", err)
	}

	if err := devinAgent.Serve(ctx); err != nil {
		log.Fatalf("服务运行失败: %v", err)
	}
}
