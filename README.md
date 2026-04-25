# Expense AI Demo

这是一个云原生票据识别 demo，基于 Next.js App Router、Mistral OCR、Zod 和 shadcn/ui 构建。用户上传票据图片后，后端调用 Mistral OCR 并返回结构化的票据 JSON，方便后续接入报销、财务审核或归档流程。

## 获取 API Key

Mistral API Key：

1. 打开 https://console.mistral.ai/ 并注册或登录账号。
2. 进入 API Keys 页面。
3. 创建一个新的 API key，用于调用 Mistral OCR。

Google AI API Key：

1. 打开 https://aistudio.google.com/ 并注册或登录账号。
2. 进入 Get API key / API keys 页面。
3. 创建一个新的 Google AI API key。当前 demo 预留了该变量，后续可接入 Gemini 作为第二识别引擎。

## 配置环境变量

复制示例文件并填入自己的 key：

```bash
cp .env.local.example .env.local
```

`.env.local` 内容：

```bash
MISTRAL_API_KEY=your_mistral_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## 启动开发服务

```bash
pnpm dev
```

启动后打开 http://localhost:3000 上传票据图片进行测试。
