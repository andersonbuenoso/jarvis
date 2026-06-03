# Jarvis

Jarvis e um assistente pessoal de produtividade para capturar, organizar, priorizar e acompanhar tarefas.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Lucide, TanStack Query, React Hook Form, Zod, Axios e React Router DOM
- Backend: FastAPI, SQLAlchemy, Pydantic, SQLite e Uvicorn
- Infra: Docker e Docker Compose

## Rodar com Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Docs: http://localhost:8000/docs

## Rodar localmente

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

No Windows PowerShell, ative a venv com:

```powershell
.\.venv\Scripts\Activate.ps1
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Variaveis de ambiente

Backend:

```txt
APP_NAME=Jarvis
DATABASE_URL=sqlite:///./data/jarvis.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
TIMEZONE=America/Sao_Paulo
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CHANNEL_ID=C0123456789
SLACK_DAILY_SUMMARY_HOUR=8
SLACK_DAILY_SUMMARY_MINUTE=0
SLACK_FOCUS_REMINDER_START_HOUR=8
SLACK_FOCUS_REMINDER_END_HOUR=18
LONG_RUNNING_DAYS=3
```

Frontend:

```txt
VITE_API_URL=http://localhost:8000
```

## Endpoints principais

- `GET /health`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`
- `GET /api/dashboard/summary`
- `GET /api/daily-plan`
- `POST /api/tasks/quick-capture`
- `POST /api/slack/commands`
- `POST /api/slack/interactions`
- `POST /api/slack/send-daily-summary`
- `POST /api/slack/send-focus-reminder`

## Slack

O Jarvis envia no Slack:

- Um resumo diario as 08:00 com prioridades primeiro.
- Atividades demorando muito, travadas ou em andamento.
- Demais atividades abertas.
- Um lembrete a cada hora depois das 08:00, ate 18:00, se voce nao registrar o foco da hora.

Crie um Slack App e configure:

- Bot Token Scopes: `chat:write` e `commands`.
- Slash Command: `/jarvis`.
- Request URL do comando: `https://SEU_DOMINIO/api/slack/commands`.
- Interactivity Request URL: `https://SEU_DOMINIO/api/slack/interactions`.
- Instale o app no workspace e copie o `Bot User OAuth Token` para `SLACK_BOT_TOKEN`.
- Copie o `Signing Secret` para `SLACK_SIGNING_SECRET`.
- Informe o canal de destino em `SLACK_CHANNEL_ID`.

Se estiver rodando localmente, exponha o backend com um tunel HTTPS, por exemplo ngrok ou Cloudflare Tunnel, e use a URL publica no Slack.

Comandos no canal:

```txt
/jarvis hoje
/jarvis nova revisar deploy hoje, responder email da recrutadora
/jarvis foco 12 validando ambiente de producao
/jarvis concluir 12
/jarvis cancelar 12
```

## Estrutura

```txt
backend/
  app/
frontend/
  src/
docker-compose.yml
README.md
```

## Proximas melhorias

- Autenticacao e usuarios
- Integracao com Google Calendar e Gmail
- Notificacoes
- Captura por audio
- Camada de IA para transformar texto livre em plano diario
