#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { analyticsTools, handleAnalyticsTools } from './tools/analytics.js';
import { inboxTools, handleInboxTools } from './tools/inbox.js';
import { automationTools, handleAutomationTools } from './tools/automations.js';
import { contentTools, handleContentTools } from './tools/content.js';
const allTools = [
    ...analyticsTools,
    ...inboxTools,
    ...automationTools,
    ...contentTools
];
const server = new Server({
    name: 'copium-builder-mcp',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: allTools
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (analyticsTools.some((t) => t.name === name)) {
            return await handleAnalyticsTools(name, args);
        }
        if (inboxTools.some((t) => t.name === name)) {
            return await handleInboxTools(name, args);
        }
        if (automationTools.some((t) => t.name === name)) {
            return await handleAutomationTools(name, args);
        }
        if (contentTools.some((t) => t.name === name)) {
            return await handleContentTools(name, args);
        }
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Unknown tool: ${name}`
                }
            ]
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Error executing ${name}: ${error?.message || String(error)}`
                }
            ]
        };
    }
});
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('copium-builder-mcp running on stdio');
}
run().catch((error) => {
    console.error('Fatal error in copium-builder-mcp server:', error);
    process.exit(1);
});
