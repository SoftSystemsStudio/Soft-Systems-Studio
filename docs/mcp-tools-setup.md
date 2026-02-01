# MCP Tools & Claude Code Extensions

This document covers the MCP servers and Claude Code tools configured for this repository.

---

## n8n MCP Server

Enables Claude to interact with your n8n instance - list workflows, execute them, manage executions, and trigger webhooks.

### Setup

1. **Set environment variables** (add to your shell profile or `.env.local`):

```bash
export N8N_API_URL="https://your-n8n-instance.com/api/v1"
export N8N_API_KEY="your_n8n_api_key"
export N8N_WEBHOOK_USERNAME="webhook_user"      # Optional
export N8N_WEBHOOK_PASSWORD="webhook_password"  # Optional
```

2. **Get your n8n API key**:
   - Open n8n → Settings → API → Create API Key

3. **Restart Claude Code** to load the MCP server

### Available Tools

| Tool                  | Description                 |
| --------------------- | --------------------------- |
| `list_workflows`      | List all workflows          |
| `get_workflow`        | Get workflow details by ID  |
| `create_workflow`     | Create a new workflow       |
| `update_workflow`     | Update an existing workflow |
| `delete_workflow`     | Delete a workflow           |
| `activate_workflow`   | Activate a workflow         |
| `deactivate_workflow` | Deactivate a workflow       |
| `execute_workflow`    | Execute a workflow via API  |
| `get_execution`       | Get execution details       |
| `list_executions`     | List execution history      |
| `run_webhook`         | Trigger a webhook workflow  |

### Usage Examples

```
"List all my n8n workflows"
"Execute the 'intake-processor' workflow"
"Show me the last 5 executions of workflow 123"
"Create a new workflow that sends a Slack message when triggered"
```

### Source

- Repository: [leonardsellem/n8n-mcp-server](https://github.com/leonardsellem/n8n-mcp-server)
- npm: `@leonardsellem/n8n-mcp-server`

---

## Claude Skills MCP Server

Enables semantic search across Claude Agent Skills - find relevant skills, read skill documents, and browse the complete skill inventory. Works with your local `.claude/skills/` directory.

### Setup

1. **Install uv** (Python package manager) if not already installed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. **Restart Claude Code** to load the MCP server

No API keys or environment variables required - works offline with local caching.

### Available Tools

| Tool                  | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `find_helpful_skills` | Semantic search to find skills matching your task description    |
| `read_skill_document` | Retrieve specific files (scripts, data, references) from a skill |
| `list_skills`         | Browse complete inventory of all available skills                |

### Skill Sources

The server automatically loads skills from:

- **Anthropic's Official Skills** (~15 skills)
- **K-Dense AI Scientific Skills** (~78+ specialized skills)
- **Local skills** from `~/.claude/skills/` and your repo's `.claude/skills/`

### Usage Examples

```
"Find skills that help with PDF generation"
"What skills are available for data visualization?"
"Read the SKILL.md from the pdf skill"
"List all available skills"
```

### Source

- Repository: [K-Dense-AI/claude-skills-mcp](https://github.com/K-Dense-AI/claude-skills-mcp)
- Package: `claude-skills-mcp` (via uvx)

---

## Get Shit Done (GSD)

A meta-prompting and context engineering system for Claude Code. Helps manage context quality, structured development phases, and verification workflows.

### What It Does

- **Prevents context rot** - Maintains quality as context window fills
- **Atomic planning** - Breaks work into verified steps
- **Fresh context per task** - Starts clean for each unit of work
- **Verification gates** - Ensures each step completes correctly

### Installation

Run this once to install globally:

```bash
npx get-shit-done-cc --claude --global
```

Or for this project only:

```bash
npx get-shit-done-cc --claude --local
```

### Verify Installation

In Claude Code, type:

```
/gsd:help
```

### Keep Updated

```bash
npx get-shit-done-cc@latest
```

### Available Commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `/gsd:help`        | Show all available commands       |
| `/gsd:new-project` | Initialize a new project with GSD |
| `/gsd:plan`        | Create an atomic development plan |
| `/gsd:task`        | Start working on a specific task  |
| `/gsd:verify`      | Run verification on current work  |
| `/gsd:status`      | Show current project status       |

### Recommended Usage

Run Claude Code with permissions for smoother automation:

```bash
claude --dangerously-skip-permissions
```

### Source

- Repository: [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)
- npm: `get-shit-done-cc`

---

## Configuration File

MCP servers are configured in `.mcp.json` at the repository root:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@leonardsellem/n8n-mcp-server"],
      "env": {
        "N8N_API_URL": "${N8N_API_URL}",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    },
    "claude-skills": {
      "command": "uvx",
      "args": ["claude-skills-mcp"]
    }
  }
}
```

---

## Troubleshooting

### n8n MCP Server not connecting

1. Verify environment variables are set: `echo $N8N_API_URL`
2. Test API key manually: `curl -H "X-N8N-API-KEY: $N8N_API_KEY" $N8N_API_URL/workflows`
3. Restart Claude Code after setting env vars

### GSD commands not found

1. Re-run installer: `npx get-shit-done-cc@latest --claude --global`
2. Check installation: Look for `.claude/commands/` directory
3. Restart Claude Code

### Claude Skills MCP not loading

1. Verify uv is installed: `uv --version`
2. If not installed: `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. Test manually: `uvx claude-skills-mcp --help`
4. Restart Claude Code

### MCP server errors in Claude Code

Check the MCP server logs:

```bash
claude --mcp-debug
```
