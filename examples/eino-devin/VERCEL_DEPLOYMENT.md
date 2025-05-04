# Vercel 部署指南

本文档提供了将 Eino 版 Devin 部署到 Vercel 的详细步骤。

## 前端部署

1. 登录 Vercel 账户
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 选择 `examples/eino-devin/frontend` 目录
5. 配置环境变量（如需要）:
   - `REACT_APP_API_URL`: API 服务器的 URL
   - `REACT_APP_EINO_URL`: Eino 服务的 URL
6. 点击 "Deploy"

## API 服务器部署

1. 登录 Vercel 账户
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 选择 `examples/eino-devin/api-server` 目录
5. 配置环境变量（如需要）:
   - `EINO_SERVICE_URL`: Eino 服务的 URL
6. 点击 "Deploy"

## Eino 服务部署

由于 Vercel 主要支持 Node.js、Python、Go 等语言的 Serverless Functions，我们需要将 Eino 服务包装为 API:

1. 创建一个新的 Vercel 项目
2. 选择 `examples/eino-devin/eino-service` 目录
3. 配置环境变量（如需要）
4. 点击 "Deploy"

## 连接服务

部署完成后，您需要更新各服务之间的连接:

1. 获取 API 服务器的部署 URL，例如 `https://eino-devin-api.vercel.app`
2. 获取 Eino 服务的部署 URL，例如 `https://eino-devin-service.vercel.app`
3. 在前端项目的环境变量中设置:
   - `REACT_APP_API_URL`: API 服务器的 URL
   - `REACT_APP_EINO_URL`: Eino 服务的 URL
4. 在 API 服务器的环境变量中设置:
   - `EINO_SERVICE_URL`: Eino 服务的 URL

## 验证部署

部署完成后，访问前端项目的 URL 即可使用系统。
