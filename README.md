## OPENAI/CLAUDE REVERSE-PROXY API

This repo combined both Openai/Anthropic into one single endpoint.

### Features

- Basic rate limiter.
- Proxy for both OpenAI and Anthropic APIs.

### Available Routes

- `GET /`: Returns the status of the API and its uptime.
- `GET /v1/models`: Returns a list of models (OpenAI only).
- `POST /v1/chat/completions`: Creates a chat completion (OpenAI).
- `POST /v1/complete`: Completions (Claude).

- #### Installation

1. Clone repo
```
git clone https://github.com/yongli233/reverse-proxy.git
```
2. Install dependencies
```
npm install
```
3. Rename example.env to .env and configure your own settings:
```
PORT=3000
OPENAI_API_URL=https://api.openai.com/v1
CLAUDE_API_URL=https://api.anthropic.com/v1
OPENAI_API_KEY=sk-yourkeyxx
CLAUDE_API_KEY=sk-ant-api03-yourkeyxx
PROXY_API_KEY=123456
```
4. Launch server
```
npm start
```
