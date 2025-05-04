package tools

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type KubernetesTool struct {
	BaseToolImpl
	kubeConfig string
}

func NewKubernetesTool(kubeConfig string) (*KubernetesTool, error) {
	tool := &KubernetesTool{
		BaseToolImpl: BaseToolImpl{
			name:        "kubernetes_tool",
			description: "执行Kubernetes操作，包括部署应用、查看资源、扩缩容等",
			parameters: schema.ParamsOneOf{
				ParameterInfo: map[string]schema.ParameterInfo{
					"operation": {
						Type:        "string",
						Description: "Kubernetes操作类型，支持apply、get、describe、scale、logs、delete等",
						Required:    true,
					},
					"resource_type": {
						Type:        "string",
						Description: "资源类型，如deployment、service、pod等",
						Required:    false,
					},
					"resource_name": {
						Type:        "string",
						Description: "资源名称",
						Required:    false,
					},
					"namespace": {
						Type:        "string",
						Description: "命名空间",
						Required:    false,
					},
					"file_path": {
						Type:        "string",
						Description: "YAML文件路径",
						Required:    false,
					},
					"replicas": {
						Type:        "integer",
						Description: "副本数",
						Required:    false,
					},
					"container": {
						Type:        "string",
						Description: "容器名称",
						Required:    false,
					},
					"labels": {
						Type:        "object",
						Description: "标签",
						Required:    false,
					},
				},
			},
		},
		kubeConfig: kubeConfig,
	}
	
	return tool, nil
}

func (t *KubernetesTool) Execute(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	operation, ok := args["operation"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: operation必须是字符串")
	}
	
	switch operation {
	case "apply":
		return t.apply(args)
	case "get":
		return t.get(args)
	case "describe":
		return t.describe(args)
	case "scale":
		return t.scale(args)
	case "logs":
		return t.logs(args)
	case "delete":
		return t.delete(args)
	case "create_deployment":
		return t.createDeployment(args)
	case "create_service":
		return t.createService(args)
	case "create_ingress":
		return t.createIngress(args)
	case "create_configmap":
		return t.createConfigMap(args)
	case "create_secret":
		return t.createSecret(args)
	default:
		return nil, fmt.Errorf("不支持的Kubernetes操作: %s", operation)
	}
}

func (t *KubernetesTool) setKubeConfig() error {
	if t.kubeConfig != "" {
		if _, err := os.Stat(t.kubeConfig); err == nil {
			os.Setenv("KUBECONFIG", t.kubeConfig)
		} else {
			tmpDir, err := os.MkdirTemp("", "kube")
			if err != nil {
				return fmt.Errorf("创建临时目录失败: %w", err)
			}
			
			tmpFile := filepath.Join(tmpDir, "config")
			if err := os.WriteFile(tmpFile, []byte(t.kubeConfig), 0600); err != nil {
				return fmt.Errorf("写入临时文件失败: %w", err)
			}
			
			os.Setenv("KUBECONFIG", tmpFile)
		}
	}
	
	return nil
}

func (t *KubernetesTool) apply(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	filePath, ok := args["file_path"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: file_path必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "apply", "-f", filePath)
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("应用资源失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "资源应用成功",
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) get(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	resourceType, ok := args["resource_type"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_type必须是字符串")
	}
	
	resourceName, _ := args["resource_name"].(string)
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "get", resourceType)
	
	if resourceName != "" {
		cmd.Args = append(cmd.Args, resourceName)
	}
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	cmd.Args = append(cmd.Args, "-o", "wide")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("获取资源失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "资源获取成功",
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) describe(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	resourceType, ok := args["resource_type"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_type必须是字符串")
	}
	
	resourceName, ok := args["resource_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_name必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "describe", resourceType, resourceName)
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("描述资源失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "资源描述成功",
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) scale(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	resourceType, ok := args["resource_type"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_type必须是字符串")
	}
	
	resourceName, ok := args["resource_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_name必须是字符串")
	}
	
	replicas, ok := args["replicas"].(float64)
	if !ok {
		return nil, fmt.Errorf("参数错误: replicas必须是整数")
	}
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "scale", fmt.Sprintf("%s/%s", resourceType, resourceName), fmt.Sprintf("--replicas=%d", int(replicas)))
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("扩缩容失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("%s %s 扩缩容到 %d 副本成功", resourceType, resourceName, int(replicas)),
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) logs(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	resourceName, ok := args["resource_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_name必须是字符串")
	}
	
	container, _ := args["container"].(string)
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "logs", resourceName)
	
	if container != "" {
		cmd.Args = append(cmd.Args, "-c", container)
	}
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("获取日志失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": "日志获取成功",
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) delete(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	resourceType, ok := args["resource_type"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_type必须是字符串")
	}
	
	resourceName, ok := args["resource_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: resource_name必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	
	cmd := exec.Command("kubectl", "delete", resourceType, resourceName)
	
	if namespace != "" {
		cmd.Args = append(cmd.Args, "-n", namespace)
	}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("删除资源失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("%s %s 删除成功", resourceType, resourceName),
		"output":  string(output),
	}, nil
}

func (t *KubernetesTool) createDeployment(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	appName, ok := args["app_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: app_name必须是字符串")
	}
	
	image, ok := args["image"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: image必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	if namespace == "" {
		namespace = "default"
	}
	
	replicas, _ := args["replicas"].(float64)
	if replicas <= 0 {
		replicas = 1
	}
	
	port, _ := args["port"].(float64)
	if port <= 0 {
		port = 8080
	}
	
	env, _ := args["env"].(map[string]interface{})
	
	tmpDir, err := os.MkdirTemp("", "kube")
	if err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}
	
	deploymentYAML := fmt.Sprintf(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: %s
  namespace: %s
  labels:
    app: %s
spec:
  replicas: %d
  selector:
    matchLabels:
      app: %s
  template:
    metadata:
      labels:
        app: %s
    spec:
      containers:
      - name: %s
        image: %s
        ports:
        - containerPort: %d
`, appName, namespace, appName, int(replicas), appName, appName, appName, image, int(port))
	
	if len(env) > 0 {
		deploymentYAML += "        env:\n"
		for k, v := range env {
			deploymentYAML += fmt.Sprintf("        - name: %s\n          value: \"%v\"\n", k, v)
		}
	}
	
	deploymentFile := filepath.Join(tmpDir, "deployment.yaml")
	if err := os.WriteFile(deploymentFile, []byte(deploymentYAML), 0600); err != nil {
		return nil, fmt.Errorf("写入临时文件失败: %w", err)
	}
	
	cmd := exec.Command("kubectl", "apply", "-f", deploymentFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建Deployment失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Deployment %s 创建成功", appName),
		"output":  string(output),
		"yaml":    deploymentYAML,
	}, nil
}

func (t *KubernetesTool) createService(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	appName, ok := args["app_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: app_name必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	if namespace == "" {
		namespace = "default"
	}
	
	port, _ := args["port"].(float64)
	if port <= 0 {
		port = 8080
	}
	
	targetPort, _ := args["target_port"].(float64)
	if targetPort <= 0 {
		targetPort = port
	}
	
	serviceType, _ := args["service_type"].(string)
	if serviceType == "" {
		serviceType = "ClusterIP"
	}
	
	tmpDir, err := os.MkdirTemp("", "kube")
	if err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}
	
	serviceYAML := fmt.Sprintf(`apiVersion: v1
kind: Service
metadata:
  name: %s
  namespace: %s
  labels:
    app: %s
spec:
  type: %s
  ports:
  - port: %d
    targetPort: %d
    protocol: TCP
  selector:
    app: %s
`, appName, namespace, appName, serviceType, int(port), int(targetPort), appName)
	
	serviceFile := filepath.Join(tmpDir, "service.yaml")
	if err := os.WriteFile(serviceFile, []byte(serviceYAML), 0600); err != nil {
		return nil, fmt.Errorf("写入临时文件失败: %w", err)
	}
	
	cmd := exec.Command("kubectl", "apply", "-f", serviceFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建Service失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Service %s 创建成功", appName),
		"output":  string(output),
		"yaml":    serviceYAML,
	}, nil
}

func (t *KubernetesTool) createIngress(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	appName, ok := args["app_name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: app_name必须是字符串")
	}
	
	host, ok := args["host"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: host必须是字符串")
	}
	
	path, _ := args["path"].(string)
	if path == "" {
		path = "/"
	}
	
	serviceName, _ := args["service_name"].(string)
	if serviceName == "" {
		serviceName = appName
	}
	
	servicePort, _ := args["service_port"].(float64)
	if servicePort <= 0 {
		servicePort = 80
	}
	
	namespace, _ := args["namespace"].(string)
	if namespace == "" {
		namespace = "default"
	}
	
	tmpDir, err := os.MkdirTemp("", "kube")
	if err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}
	
	ingressYAML := fmt.Sprintf(`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: %s
  namespace: %s
  labels:
    app: %s
spec:
  rules:
  - host: %s
    http:
      paths:
      - path: %s
        pathType: Prefix
        backend:
          service:
            name: %s
            port:
              number: %d
`, appName, namespace, appName, host, path, serviceName, int(servicePort))
	
	ingressFile := filepath.Join(tmpDir, "ingress.yaml")
	if err := os.WriteFile(ingressFile, []byte(ingressYAML), 0600); err != nil {
		return nil, fmt.Errorf("写入临时文件失败: %w", err)
	}
	
	cmd := exec.Command("kubectl", "apply", "-f", ingressFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建Ingress失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Ingress %s 创建成功", appName),
		"output":  string(output),
		"yaml":    ingressYAML,
	}, nil
}

func (t *KubernetesTool) createConfigMap(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	name, ok := args["name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: name必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	if namespace == "" {
		namespace = "default"
	}
	
	data, ok := args["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("参数错误: data必须是对象")
	}
	
	tmpDir, err := os.MkdirTemp("", "kube")
	if err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}
	
	configMapYAML := fmt.Sprintf(`apiVersion: v1
kind: ConfigMap
metadata:
  name: %s
  namespace: %s
data:
`, name, namespace)
	
	for k, v := range data {
		configMapYAML += fmt.Sprintf("  %s: \"%v\"\n", k, v)
	}
	
	configMapFile := filepath.Join(tmpDir, "configmap.yaml")
	if err := os.WriteFile(configMapFile, []byte(configMapYAML), 0600); err != nil {
		return nil, fmt.Errorf("写入临时文件失败: %w", err)
	}
	
	cmd := exec.Command("kubectl", "apply", "-f", configMapFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建ConfigMap失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("ConfigMap %s 创建成功", name),
		"output":  string(output),
		"yaml":    configMapYAML,
	}, nil
}

func (t *KubernetesTool) createSecret(args map[string]interface{}) (interface{}, error) {
	if err := t.setKubeConfig(); err != nil {
		return nil, err
	}
	
	name, ok := args["name"].(string)
	if !ok {
		return nil, fmt.Errorf("参数错误: name必须是字符串")
	}
	
	namespace, _ := args["namespace"].(string)
	if namespace == "" {
		namespace = "default"
	}
	
	secretType, _ := args["type"].(string)
	if secretType == "" {
		secretType = "Opaque"
	}
	
	data, ok := args["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("参数错误: data必须是对象")
	}
	
	tmpDir, err := os.MkdirTemp("", "kube")
	if err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}
	
	secretYAML := fmt.Sprintf(`apiVersion: v1
kind: Secret
metadata:
  name: %s
  namespace: %s
type: %s
stringData:
`, name, namespace, secretType)
	
	for k, v := range data {
		secretYAML += fmt.Sprintf("  %s: \"%v\"\n", k, v)
	}
	
	secretFile := filepath.Join(tmpDir, "secret.yaml")
	if err := os.WriteFile(secretFile, []byte(secretYAML), 0600); err != nil {
		return nil, fmt.Errorf("写入临时文件失败: %w", err)
	}
	
	cmd := exec.Command("kubectl", "apply", "-f", secretFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("创建Secret失败: %w, 输出: %s", err, string(output))
	}
	
	return map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Secret %s 创建成功", name),
		"output":  string(output),
		"yaml":    secretYAML,
	}, nil
}
