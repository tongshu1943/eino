package handler

import (
	"encoding/json"
	"net/http"
	"os/exec"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	// 这是一个简单的适配器，用于在 Vercel 上运行 Go 服务
	// 在实际部署中，您需要根据 Eino 服务的 API 进行适当的调整
	
	if r.Method == "OPTIONS" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}
	
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	
	// 这里只是一个示例，实际应该调用 Eino 服务的 API
	response := map[string]interface{}{
		"status": "success",
		"message": "Eino 服务已成功响应",
	}
	
	json.NewEncoder(w).Encode(response)
}
