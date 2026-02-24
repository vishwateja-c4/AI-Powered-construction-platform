# TorchBearers

A 3-layer architecture system for orchestrating tasks with Google Cloud integrations.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Layer 1: Directives    (directives/*.md)   │
│  → SOPs: what to do, inputs, outputs        │
├─────────────────────────────────────────────┤
│  Layer 2: Orchestration (AI Agent)          │
│  → Decisions: routing, sequencing, errors   │
├─────────────────────────────────────────────┤
│  Layer 3: Execution     (execution/*.py)    │
│  → Deterministic scripts: APIs, data, I/O   │
└─────────────────────────────────────────────┘
```

## Quick Start

1. **Clone & install**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure**
   - Fill in `.env` with your API keys and credentials
   - Place `credentials.json` (Google OAuth) in the project root

3. **Authenticate Google APIs**
   ```bash
   python execution/google_auth.py
   ```

## Directory Structure

```
TorchBearers/
├── claude.md             # Agent instructions
├── directives/           # Markdown SOPs
│   └── _template.md      # Directive template
├── execution/            # Python scripts
│   ├── env_loader.py     # Environment config
│   ├── logger.py         # Logging utility
│   └── google_auth.py    # Google OAuth setup
├── .env                  # Secrets (not committed)
├── .tmp/                 # Temp processing files
├── requirements.txt      # Dependencies
├── CHANGELOG.md          # Version history
└── README.md             # This file
```

## Integrations

| Service          | Purpose                        |
|------------------|--------------------------------|
| Google Calendar  | Timetable & calendar sync      |
| Google Drive     | Study materials & resources    |
| Email (SMTP)     | Notifications & reminders      |
