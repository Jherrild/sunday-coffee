# Sunday Coffee MCP Server

This directory contains an MCP (Model Context Protocol) server that allows LLMs to control the Sunday Coffee status by triggering the GitHub Actions workflow.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. MCP servers expose tools, prompts, and resources that LLMs can use to perform actions.

## Overview

The Sunday Coffee MCP Server provides three tools that LLMs can use:

1. **turn_coffee_on** - Turns coffee ON for next Sunday
2. **turn_coffee_off** - Turns coffee OFF for next Sunday  
3. **set_coffee_status** - Sets coffee status to a specific value (true/false)

When called, these tools trigger the GitHub Actions workflow that:
- Calculates the next Sunday date
- Updates the status page (index.html)
- Creates a pull request
- Automatically merges it to main
- Deploys to GitHub Pages

## Installation

### Prerequisites

- Node.js 18 or higher
- GitHub Personal Access Token with `repo` and `workflow` permissions

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your GitHub token as an environment variable:
```bash
export GITHUB_TOKEN="your_github_token_here"
```

Optional environment variables:
- `GITHUB_OWNER` - Repository owner (defaults to "Jherrild")
- `GITHUB_REPO` - Repository name (defaults to "sunday-coffee")

## Usage

### Running the Server

The MCP server runs on stdio (standard input/output) and is designed to be used by MCP clients:

```bash
node mcp-server.js
```

Or using the npm script:

```bash
npm start
```

### Configuring with Claude Desktop

To use this MCP server with Claude Desktop, add it to your Claude configuration file:

**On macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**On Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sunday-coffee": {
      "command": "node",
      "args": ["/absolute/path/to/sunday-coffee/mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/sunday-coffee/` with the actual path to this repository.

### Configuring with Other MCP Clients

For other MCP clients, configure them to run the server using:
- **Command:** `node`
- **Args:** `["/path/to/mcp-server.js"]`
- **Environment:** `GITHUB_TOKEN=your_token`

## Available Tools

### 1. turn_coffee_on

Turns coffee ON for next Sunday.

**Example prompt for LLM:**
> "Turn the coffee on for next Sunday"

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "status": true,
  "message": "Coffee status workflow triggered successfully. Coffee will be ON for next Sunday."
}
```

### 2. turn_coffee_off

Turns coffee OFF for next Sunday.

**Example prompt for LLM:**
> "Turn the coffee off for next Sunday"

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "status": false,
  "message": "Coffee status workflow triggered successfully. Coffee will be OFF for next Sunday."
}
```

### 3. set_coffee_status

Sets the coffee status to a specific value.

**Example prompt for LLM:**
> "Set the coffee status to on"

**Parameters:**
- `status` (boolean, required): true for ON, false for OFF

**Response:**
```json
{
  "success": true,
  "status": true,
  "message": "Coffee status workflow triggered successfully. Coffee will be ON for next Sunday."
}
```

## How It Works

1. The MCP server exposes tools through the Model Context Protocol
2. An LLM using an MCP client can discover and call these tools
3. When a tool is called, the server makes an authenticated API request to GitHub
4. This triggers the `update-coffee-status.yml` workflow with the specified status
5. The workflow updates the status page and deploys it to GitHub Pages

## Security Considerations

- **GitHub Token**: Keep your `GITHUB_TOKEN` secure and never commit it to the repository
- **Token Permissions**: The token needs `repo` and `workflow` permissions to trigger workflows
- **Rate Limits**: GitHub API has rate limits; the MCP server doesn't implement rate limiting

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"

Make sure you've set the `GITHUB_TOKEN` environment variable with a valid GitHub Personal Access Token:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

### "GitHub API error: 404"

This usually means:
- The workflow file doesn't exist or has a different name
- The repository owner/name is incorrect
- The token doesn't have access to the repository

Verify the workflow exists:
```bash
ls .github/workflows/update-coffee-status.yml
```

### "GitHub API error: 401"

Your GitHub token is invalid or expired. Generate a new token at:
https://github.com/settings/tokens

Required permissions:
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

### Server not appearing in Claude Desktop

1. Check that the path in `claude_desktop_config.json` is absolute
2. Restart Claude Desktop after changing the configuration
3. Check Claude Desktop logs for error messages

## Development

### Testing the Server Locally

You can test the MCP server without an MCP client by using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node mcp-server.js
```

This will open a web interface where you can test the tools interactively.

### Debugging

The server logs to stderr (since stdout is used for MCP communication). To see debug logs:

```bash
node mcp-server.js 2> debug.log
```

## Architecture

```
┌─────────────┐
│   LLM       │  (e.g., Claude)
│   Client    │
└──────┬──────┘
       │ MCP Protocol (stdio)
       │
┌──────▼──────┐
│ MCP Server  │  (mcp-server.js)
│ (Node.js)   │
└──────┬──────┘
       │ GitHub API (HTTPS)
       │
┌──────▼──────────────┐
│ GitHub Actions      │
│ Workflow            │
│ update-coffee-      │
│ status.yml          │
└──────┬──────────────┘
       │
┌──────▼──────┐
│ index.html  │  (Status Page)
│ on GitHub   │
│ Pages       │
└─────────────┘
```

## Related Documentation

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [GitHub Actions API](https://docs.github.com/en/rest/actions/workflows)
- [Update Script Documentation](UPDATE-SCRIPT-DOCS.md)

## License

Same as the repository license.
