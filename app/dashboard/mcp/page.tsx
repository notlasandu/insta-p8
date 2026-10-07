"use client"

import { useState } from "react"
import {
  Cpu,
  Terminal,
  Shield,
  Check,
  Copy,
  Database,
  MessageSquare,
  BarChart3,
  Bot,
  Layers,
  Send,
  Zap,
  Code
} from "lucide-react"
import { toast } from "sonner"

interface ToolSpec {
  name: string
  category: "analytics" | "inbox" | "automations" | "content"
  description: string
  guardrails: string
  params: { name: string; type: string; required?: boolean; desc: string }[]
  example: Record<string, any>
}

const TOOLS: ToolSpec[] = [
  // Analytics
  {
    name: "get_account_overview",
    category: "analytics",
    description: "Get profile details, follower counts, and account metadata across Instagram and Facebook.",
    guardrails: "Cached responses; sensitive internal credentials masked.",
    params: [{ name: "accountId", type: "string", desc: "Account identifier (default: berl_view)" }],
    example: { accountId: "berl_view" }
  },
  {
    name: "get_historical_analytics",
    category: "analytics",
    description: "Fetch daily time-series analytics (reach, engagement, views, followers) across Instagram and Facebook.",
    guardrails: "Max query window capped at 365 days; validated YYYY-MM-DD date inputs.",
    params: [
      { name: "accountId", type: "string", desc: "Account identifier" },
      { name: "startDate", type: "string", desc: "Start date (YYYY-MM-DD)" },
      { name: "endDate", type: "string", desc: "End date (YYYY-MM-DD)" },
      { name: "limit", type: "number", desc: "Max records (default: 30)" }
    ],
    example: { accountId: "berl_view", limit: 7 }
  },
  {
    name: "get_top_posts",
    category: "analytics",
    description: "Retrieve published posts ranked by engagement, likes, comments, or reach.",
    guardrails: "Result limit hard-clamped to 50 posts max.",
    params: [
      { name: "sortBy", type: "'likes' | 'comments' | 'shares'", desc: "Metric to sort by" },
      { name: "limit", type: "number", desc: "Number of posts to return" }
    ],
    example: { sortBy: "likes", limit: 5 }
  },
  {
    name: "get_growth_summary",
    category: "analytics",
    description: "Calculate recent audience growth, 24h reach momentum, and engagement deltas.",
    guardrails: "Pre-aggregated math prevents division-by-zero or NaN errors.",
    params: [{ name: "accountId", type: "string", desc: "Account identifier" }],
    example: { accountId: "berl_view" }
  },

  // Inbox & Comments
  {
    name: "list_conversations",
    category: "inbox",
    description: "List active direct message conversations across Instagram Direct and Facebook Messenger.",
    guardrails: "Restricted to current authenticated workspace account.",
    params: [
      { name: "platform", type: "'all' | 'instagram' | 'facebook'", desc: "Filter by channel" },
      { name: "limit", type: "number", desc: "Max threads (default: 20, max: 100)" }
    ],
    example: { platform: "all", limit: 10 }
  },
  {
    name: "get_conversation_messages",
    category: "inbox",
    description: "Get full message thread history for a specific conversation ID.",
    guardrails: "Validates thread existence and scopes messages to active user.",
    params: [
      { name: "conversationId", type: "string", required: true, desc: "Conversation UUID" },
      { name: "limit", type: "number", desc: "Max messages (default: 50)" }
    ],
    example: { conversationId: "97bd7265-5577-44ac-9487-cbb89cb99105" }
  },
  {
    name: "send_direct_message",
    category: "inbox",
    description: "Send a direct message reply to an Instagram or Facebook contact.",
    guardrails: "Strict safety: requires verified conversationId, max 1000 chars, non-empty, duplicate block.",
    params: [
      { name: "conversationId", type: "string", required: true, desc: "Conversation UUID" },
      { name: "message", type: "string", required: true, desc: "Outbound text copy (max 1000 chars)" }
    ],
    example: { conversationId: "97bd7265-5577-44ac-9487-cbb89cb99105", message: "Hi! Thanks for reaching out." }
  },
  {
    name: "search_inbox",
    category: "inbox",
    description: "Search messages across threads for customer objections, questions, feedback, or keywords.",
    guardrails: "Query must be at least 2 characters; sanitized against SQL injection.",
    params: [
      { name: "query", type: "string", required: true, desc: "Search term" },
      { name: "platform", type: "'all' | 'instagram' | 'facebook'", desc: "Channel filter" }
    ],
    example: { query: "price" }
  },
  {
    name: "list_post_comments",
    category: "inbox",
    description: "List recent comments on Instagram and Facebook posts/reels.",
    guardrails: "Results clamped to max 100 comments.",
    params: [
      { name: "platform", type: "'all' | 'instagram' | 'facebook'", desc: "Channel filter" },
      { name: "postId", type: "string", desc: "Specific media ID filter" }
    ],
    example: { platform: "all", limit: 20 }
  },
  {
    name: "reply_to_comment",
    category: "inbox",
    description: "Post a public reply to a comment on an Instagram or Facebook post.",
    guardrails: "Length clamped to 300 characters; requires valid parent comment ID.",
    params: [
      { name: "commentId", type: "string", required: true, desc: "Parent comment ID" },
      { name: "message", type: "string", required: true, desc: "Public comment reply" }
    ],
    example: { commentId: "18099159200073066_123", message: "Sent you a DM with details!" }
  },

  // Automations & AI
  {
    name: "list_automations",
    category: "automations",
    description: "List all automated comment-to-DM, story reply, and direct message keyword rules.",
    guardrails: "Scoped strictly to authenticated account.",
    params: [
      { name: "triggerSource", type: "'all' | 'comment' | 'dm' | 'story'", desc: "Trigger source" },
      { name: "activeOnly", type: "boolean", desc: "Filter active rules only" }
    ],
    example: { triggerSource: "all" }
  },
  {
    name: "create_automation",
    category: "automations",
    description: "Create a new automated reply workflow for post comments, direct messages, or stories.",
    guardrails: "Full Zod schema validation; required fields validated before insertion.",
    params: [
      { name: "name", type: "string", required: true, desc: "Rule name" },
      { name: "triggerSource", type: "'comment' | 'dm' | 'story'", required: true, desc: "Trigger source" },
      { name: "triggerValue", type: "string", required: true, desc: "Comma-separated keywords" },
      { name: "responseMessage", type: "string", required: true, desc: "Reply copy" },
      { name: "checkFollow", type: "boolean", desc: "Require follow gate" }
    ],
    example: { name: "Reply to Price", triggerSource: "dm", triggerValue: "price, cost", responseMessage: "Our plans start at $49." }
  },
  {
    name: "toggle_automation",
    category: "automations",
    description: "Activate or pause an existing automation rule.",
    guardrails: "User ownership verified before status mutation.",
    params: [
      { name: "automationId", type: "string", required: true, desc: "Rule UUID" },
      { name: "isActive", type: "boolean", required: true, desc: "Target status" }
    ],
    example: { automationId: "bd69c31b-cf57-4d9d-a503-d8e022212edb", isActive: false }
  },
  {
    name: "delete_automation",
    category: "automations",
    description: "Permanently remove an automation rule.",
    guardrails: "Destructive operation: checks rule ID belongs to authenticated user.",
    params: [{ name: "automationId", type: "string", required: true, desc: "Rule UUID" }],
    example: { automationId: "bd69c31b-cf57-4d9d-a503-d8e022212edb" }
  },
  {
    name: "get_assistant_settings",
    category: "automations",
    description: "Get current AI Assistant configuration (Groq auto-reply toggle, system context, model).",
    guardrails: "Internal API keys masked from output.",
    params: [],
    example: {}
  },
  {
    name: "update_assistant_settings",
    category: "automations",
    description: "Update the AI Assistant system prompt context or enable/disable automatic Groq DM replies.",
    guardrails: "Context string sanitized against prompt-injection escapes.",
    params: [
      { name: "enabled", type: "boolean", desc: "Toggle AI auto-reply" },
      { name: "contextPrompt", type: "string", desc: "System tone and rules" }
    ],
    example: { enabled: true, contextPrompt: "You are a friendly customer concierge." }
  },

  // Content Strategy & Bullseye
  {
    name: "list_content_pipeline",
    category: "content",
    description: "List all content posts in the pipeline (ideas, drafts, ready, posted) with metrics and captions.",
    guardrails: "Read-only pipeline access.",
    params: [
      { name: "accountId", type: "string", desc: "Account identifier" },
      { name: "status", type: "'ALL' | 'IDEA' | 'DRAFT' | 'READY' | 'POSTED'", desc: "Status filter" }
    ],
    example: { status: "ALL" }
  },
  {
    name: "create_or_update_content_post",
    category: "content",
    description: "Add a new post idea/draft or update an existing post in the content pipeline.",
    guardrails: "Title required; validated enum status.",
    params: [
      { name: "title", type: "string", required: true, desc: "Working title/hook" },
      { name: "status", type: "'IDEA' | 'DRAFT' | 'READY' | 'POSTED'", desc: "Pipeline status" },
      { name: "description", type: "string", desc: "Script or caption copy" }
    ],
    example: { title: "5 AI Workflows for Small Business", status: "DRAFT", description: "Hook: Stop doing manual data entry..." }
  },
  {
    name: "get_topic_bullseye",
    category: "content",
    description: "Fetch the 5-Ring Topic Bullseye audience targeting model (Ring 1 Ideal Viewer -> Ring 5 Broad).",
    guardrails: "Guaranteed structural schema returning 5 distinct rings.",
    params: [{ name: "accountId", type: "string", desc: "Account identifier" }],
    example: { accountId: "berl_view" }
  },
  {
    name: "update_topic_bullseye",
    category: "content",
    description: "Update the 5-Ring Topic Bullseye audience descriptions and mapped post IDs.",
    guardrails: "Validates all rings maintain valid numeric levels (1 to 5).",
    params: [
      { name: "rings", type: "Array<{ ring: number, audience: string, post_ids: string[] }>", required: true, desc: "5-ring configuration" }
    ],
    example: { rings: [{ ring: 1, audience: "Business owners needing automation", post_ids: [] }] }
  },
  {
    name: "get_post_analysis",
    category: "content",
    description: "Get deep content performance learnings, top hooks, and conversion takeaways.",
    guardrails: "Returns structured learnings array.",
    params: [{ name: "accountId", type: "string", desc: "Account identifier" }],
    example: { accountId: "berl_view" }
  }
]

export default function McpDocsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  const configSnippet = `{
  "mcpServers": {
    "copium-builder-mcp": {
      "command": "node",
      "args": [
        "c:\\\\Users\\\\Lasandu\\\\SoftwareProjects\\\\Typescript\\\\insta-p8\\\\packages\\\\copium-builder-mcp\\\\dist\\\\index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://exkefrxudvgxymaulopu.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOi..."
      }
    }
  }
}`

  const copyConfig = () => {
    navigator.clipboard.writeText(configSnippet)
    setCopiedSnippet(true)
    toast.success("MCP configuration snippet copied to clipboard!")
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const filteredTools = activeCategory === "all" ? TOOLS : TOOLS.filter((t) => t.category === activeCategory)

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
      {/* Header */}
      <header className="border-b border-border pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Cpu className="size-4" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">Extensibility & AI Tooling</p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">copium-builder-mcp</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Official Model Context Protocol server exposing 100% of dashboard capabilities, unified inbox, historical analytics, and Content Manager data to AI agents.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server Ready (stdio)</span>
          </div>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Terminal className="size-4" />
            <span>Zero-Command Protocol</span>
          </div>
          <p className="mt-3 text-2xl font-semibold">stdio</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Spawns on-demand via Node.js. No terminal commands or background dev servers required.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="size-4" />
            <span>Built-in Guardrails</span>
          </div>
          <p className="mt-3 text-2xl font-semibold">Active</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Message length caps, Zod payload validation, sanitized tokens, and destructive confirmation checks.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Layers className="size-4" />
            <span>Available Tools</span>
          </div>
          <p className="mt-3 text-2xl font-semibold">{TOOLS.length} Tools</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Full parity across Analytics, Unified Inbox, DM Automations, and Content Pipeline.
          </p>
        </div>
      </div>

      {/* Config Snippet Section */}
      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Client Configuration</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add this entry to your <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">~/.gemini/config/mcp_config.json</code> or AI agent config.
            </p>
          </div>
          <button
            onClick={copyConfig}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-foreground transition-all"
          >
            {copiedSnippet ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copiedSnippet ? "Copied" : "Copy Configuration"}</span>
          </button>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground">
          {configSnippet}
        </pre>
      </section>

      {/* Tool Directory Tabs */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Tool Directory</h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {filteredTools.length}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            {[
              { id: "all", label: "All Tools" },
              { id: "analytics", label: "Analytics" },
              { id: "inbox", label: "Inbox & DMs" },
              { id: "automations", label: "Automations" },
              { id: "content", label: "Content Studio" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-md px-3 py-1 font-medium transition-all ${
                  activeCategory === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredTools.map((tool) => (
            <div key={tool.name} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">{tool.name}</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                </div>
              </div>

              {/* Guardrails info */}
              <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Guardrail:</span> {tool.guardrails}
              </div>

              {/* Parameters */}
              <div className="mt-4 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Parameters</p>
                {tool.params.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">None required.</p>
                ) : (
                  <div className="space-y-1.5">
                    {tool.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-2 text-xs">
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] font-medium text-foreground">
                          {p.name}
                        </code>
                        <span className="text-[11px] font-mono text-muted-foreground">({p.type})</span>
                        {p.required && <span className="text-[10px] font-bold text-destructive">required</span>}
                        <span className="text-muted-foreground text-[11px] ml-auto truncate max-w-[200px]">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Example JSON call */}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Example Call</p>
                <pre className="overflow-x-auto rounded bg-muted/60 p-2 font-mono text-[11px] text-muted-foreground">
                  {JSON.stringify(tool.example, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
