# Quick Start: Using the MCP Server

This is a quick reference guide for setting up and using the Sunday Coffee MCP Server.

## Prerequisites

1. **Node.js 18+** - Install from [nodejs.org](https://nodejs.org/)
2. **GitHub Token** - Generate at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Required permissions: `repo` and `workflow`

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Your GitHub Token

**macOS/Linux:**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
```

### 3. Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS:**
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

Add this configuration (replace the path):

```json
{
  "mcpServers": {
    "sunday-coffee": {
      "command": "node",
      "args": ["/full/path/to/sunday-coffee/mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

Completely quit and restart Claude Desktop to load the new configuration.

## Usage Examples

Once configured, you can use natural language with Claude:

- "Turn the coffee on for next Sunday"
- "Turn off the coffee for next Sunday"
- "Set the coffee status to on"
- "Make sure coffee is available next Sunday"

## Verification

To verify the MCP server is working:

1. Open Claude Desktop
2. Start a new conversation
3. Look for a small tool icon or indicator that shows available tools
4. Try one of the example commands above
5. Claude should acknowledge the request and call the appropriate tool

## Troubleshooting

### Can't see the MCP server in Claude Desktop

1. Check the config file path is correct
2. Make sure the path to `mcp-server.js` is absolute (not relative)
3. Verify your GitHub token is set in the config
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for errors

### "GITHUB_TOKEN environment variable is required" error

- The token is not being passed correctly
- Make sure it's in the `env` section of the config file
- The token should start with `ghp_` for personal access tokens

### Token doesn't have correct permissions

Generate a new token at https://github.com/settings/tokens with:
- ✅ `repo` (Full control of private repositories)
- ✅ `workflow` (Update GitHub Action workflows)

## What Happens When You Use It

1. You tell Claude to turn coffee on/off
2. Claude calls the MCP server tool
3. The MCP server triggers the GitHub Actions workflow
4. The workflow updates the status page
5. Changes are committed and deployed to GitHub Pages
6. The website at [your-site] updates automatically

## More Information

- Full documentation: [MCP-SERVER-DOCS.md](MCP-SERVER-DOCS.md)
- Update script docs: [UPDATE-SCRIPT-DOCS.md](UPDATE-SCRIPT-DOCS.md)
- MCP Protocol: https://modelcontextprotocol.io/

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full documentation
3. Verify your GitHub token has the correct permissions
4. Check that the workflow file exists: `.github/workflows/update-coffee-status.yml`
