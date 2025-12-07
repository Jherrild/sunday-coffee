#!/usr/bin/env node

/**
 * MCP Server for Sunday Coffee Status
 * 
 * This server provides tools for LLMs to control the Sunday coffee status
 * by triggering the GitHub Actions workflow.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// GitHub API configuration
const GITHUB_OWNER = process.env.GITHUB_OWNER || "Jherrild";
const GITHUB_REPO = process.env.GITHUB_REPO || "sunday-coffee";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const WORKFLOW_FILE = "update-coffee-status.yml";

/**
 * Trigger the GitHub Actions workflow to update coffee status
 */
async function triggerCoffeeWorkflow(status) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        coffee_status: status.toString(),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return {
    success: true,
    status: status,
    message: `Coffee status workflow triggered successfully. Coffee will be ${status ? "ON" : "OFF"} for next Sunday.`,
  };
}

/**
 * Create and configure the MCP server
 */
function createServer() {
  const server = new Server(
    {
      name: "sunday-coffee-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "turn_coffee_on",
          description: "Turn coffee ON for next Sunday. This triggers the GitHub workflow to update the status page, indicating that coffee will be available next Sunday from 9:00 AM to 11:00 AM.",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "turn_coffee_off",
          description: "Turn coffee OFF for next Sunday. This triggers the GitHub workflow to update the status page, indicating that coffee will NOT be available next Sunday.",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "set_coffee_status",
          description: "Set the coffee status (on or off) for next Sunday. This triggers the GitHub workflow to update the status page accordingly.",
          inputSchema: {
            type: "object",
            properties: {
              status: {
                type: "boolean",
                description: "Coffee status: true for ON, false for OFF",
              },
            },
            required: ["status"],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "turn_coffee_on": {
          const result = await triggerCoffeeWorkflow(true);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "turn_coffee_off": {
          const result = await triggerCoffeeWorkflow(false);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "set_coffee_status": {
          if (typeof args.status !== "boolean") {
            throw new Error("status must be a boolean (true or false)");
          }
          const result = await triggerCoffeeWorkflow(args.status);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error.message,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Main entry point
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  // Log to stderr since stdout is used for MCP communication
  console.error("Sunday Coffee MCP Server running on stdio");
  console.error(`Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.error(`GitHub Token: ${GITHUB_TOKEN ? "Set" : "Not set (required)"}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
