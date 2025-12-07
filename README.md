# sunday-coffee
A static web page with the status of Sunday coffee

## Updating the Status

This repository includes multiple ways to update the coffee status:

### 1. MCP Server Integration (Recommended for LLMs)

Use the MCP (Model Context Protocol) server to allow LLMs like Claude to control the coffee status. See [MCP-SERVER-DOCS.md](MCP-SERVER-DOCS.md) for setup instructions.

**Quick Setup:**
```bash
npm install
export GITHUB_TOKEN="your_github_token"
node mcp-server.js
```

Configure with Claude Desktop to enable voice/chat commands like "Turn the coffee on for next Sunday."

### 2. Command Line Scripts

For manual updates or automation, use the update scripts. See [UPDATE-SCRIPT-DOCS.md](UPDATE-SCRIPT-DOCS.md) for detailed usage instructions.

```bash
# Update coffee status to ON
./update-status.sh on

# Update coffee status to OFF
./update-status.sh off
```

### 3. Webhook Integration

The repository includes a GitHub Actions workflow that can be triggered via webhook, making it easy to integrate with Google Assistant or Home Assistant. See the documentation for setup instructions.
