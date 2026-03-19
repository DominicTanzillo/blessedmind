import { createClient } from "@supabase/supabase-js";
import express from "express";
import { randomUUID } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://lxpaqthbqnfnozuvcoaz.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGFxdGhicW5mbm96dXZjb2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTUwMzcsImV4cCI6MjA4NjY3MTAzN30.g2Cufdgdg4Vg_EGeM5VTeS2sGyAdevV3zLjS3H7Ll9Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Tool definitions ─────────────────────────────────

const TOOLS = [
  {
    name: "get_dashboard",
    description: "Get today's summary: pending habits, focus batch tasks, overdue items, recent pomodoros.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_tasks",
    description: "List tasks. Filter by completed, waiting, category, priority, or starred.",
    inputSchema: {
      type: "object",
      properties: {
        completed: { type: "boolean", description: "Filter by completion status" },
        waiting: { type: "boolean", description: "Filter by waiting status" },
        category: { type: "string", description: "Filter by category" },
        priority: { type: "number", description: "1=urgent, 2=normal, 3=low" },
        starred: { type: "boolean", description: "Filter by starred status" },
        limit: { type: "number", description: "Max results (default 50)" },
      },
    },
  },
  {
    name: "create_task",
    description: "Create a new task.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        due_date: { type: "string", description: "Due date YYYY-MM-DD" },
        priority: { type: "number", description: "1=urgent, 2=normal(default), 3=low" },
        category: { type: "string", description: "Category name" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task",
    description: "Update a task by ID. Only pass fields you want to change.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task UUID" },
        title: { type: "string" }, description: { type: "string" },
        due_date: { type: "string", description: "YYYY-MM-DD or null" },
        priority: { type: "number" }, category: { type: "string" },
        starred: { type: "boolean" }, waiting: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed.",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "Task UUID" } }, required: ["id"] },
  },
  {
    name: "delete_task",
    description: "Permanently delete a task.",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "Task UUID" } }, required: ["id"] },
  },
  {
    name: "list_grinds",
    description: "List habits/grinds with streaks and health.",
    inputSchema: { type: "object", properties: { include_retired: { type: "boolean", description: "Include retired (default false)" } } },
  },
  {
    name: "create_grind",
    description: "Create a new daily habit.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Habit title" },
        description: { type: "string" },
        disabled_days: { type: "array", items: { type: "number" }, description: "Days off: 0=Sun..6=Sat" },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_grind",
    description: "Mark a habit as completed for today.",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "Grind UUID" } }, required: ["id"] },
  },
  {
    name: "list_pomodoros",
    description: "List recent pomodoro focus sessions.",
    inputSchema: { type: "object", properties: { limit: { type: "number", description: "Max results (default 20)" } } },
  },
  {
    name: "create_pomodoro",
    description: "Record a completed focus session.",
    inputSchema: {
      type: "object",
      properties: {
        task_title: { type: "string", description: "What was worked on" },
        duration_minutes: { type: "number", description: "Duration in minutes" },
        grind_id: { type: "string", description: "Associated grind UUID" },
      },
      required: ["task_title", "duration_minutes"],
    },
  },
];

// ── Tool handlers ────────────────────────────────────

async function handleTool(name, args) {
  switch (name) {
    case "get_dashboard": {
      const today = new Date().toLocaleDateString("en-CA");
      const dayOfWeek = new Date().getDay();
      const [tasksRes, grindsRes, pomodorosRes, batchRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("completed", false).eq("waiting", false),
        supabase.from("grinds").select("*").eq("retired", false),
        supabase.from("pomodoros").select("*").order("completed_at", { ascending: false }).limit(10),
        supabase.from("active_batch").select("*").order("created_at", { ascending: false }).limit(1).single(),
      ]);
      const tasks = tasksRes.data ?? [], grinds = grindsRes.data ?? [], pomodoros = pomodorosRes.data ?? [];
      const batch = batchRes.data;
      const activeGrinds = grinds.filter(g => !g.disabled_days.includes(dayOfWeek));
      const batchTasks = batch ? tasks.filter(t => batch.task_ids.includes(t.id)) : [];
      return JSON.stringify({
        date: today,
        habits: {
          completed: activeGrinds.filter(g => g.last_completed_date === today).map(g => `${g.title} (${g.current_streak}d)`),
          pending: activeGrinds.filter(g => g.last_completed_date !== today).map(g => `${g.title} (${g.current_streak}d)`),
        },
        focus_batch: batchTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, due: t.due_date, completed: t.completed })),
        overdue: tasks.filter(t => t.due_date && t.due_date < today).map(t => ({ id: t.id, title: t.title, due: t.due_date })),
        due_today: tasks.filter(t => t.due_date === today).map(t => ({ id: t.id, title: t.title })),
        total_incomplete: tasks.length,
        recent_pomodoros: pomodoros.slice(0, 5).map(p => ({ task: p.task_title, min: p.duration_minutes, when: p.completed_at })),
      }, null, 2);
    }
    case "list_tasks": {
      let q = supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(args.limit ?? 50);
      if (args.completed !== undefined) q = q.eq("completed", args.completed);
      if (args.waiting !== undefined) q = q.eq("waiting", args.waiting);
      if (args.category) q = q.eq("category", args.category);
      if (args.priority) q = q.eq("priority", args.priority);
      if (args.starred !== undefined) q = q.eq("starred", args.starred);
      const { data, error } = await q;
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data, null, 2);
    }
    case "create_task": {
      const { data, error } = await supabase.from("tasks")
        .insert({ title: args.title, description: args.description ?? "", due_date: args.due_date ?? null, priority: args.priority ?? 2, category: args.category ?? "general", completed: false, waiting: false, starred: false })
        .select().single();
      if (error) return `Error: ${error.message}`;
      return `Created: ${data.title} (${data.id})`;
    }
    case "update_task": {
      const { id, ...updates } = args;
      const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
      const { data, error } = await supabase.from("tasks").update(clean).eq("id", id).select().single();
      if (error) return `Error: ${error.message}`;
      return `Updated: ${data.title}`;
    }
    case "complete_task": {
      const { data, error } = await supabase.from("tasks").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", args.id).select().single();
      if (error) return `Error: ${error.message}`;
      return `Completed: ${data.title}`;
    }
    case "delete_task": {
      const { error } = await supabase.from("tasks").delete().eq("id", args.id);
      if (error) return `Error: ${error.message}`;
      return "Deleted.";
    }
    case "list_grinds": {
      let q = supabase.from("grinds").select("*").order("created_at", { ascending: false });
      if (!args.include_retired) q = q.eq("retired", false);
      const { data, error } = await q;
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data, null, 2);
    }
    case "create_grind": {
      const { data, error } = await supabase.from("grinds").insert({ title: args.title, description: args.description ?? "", disabled_days: args.disabled_days ?? [] }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created grind: ${data.title} (${data.id})`;
    }
    case "complete_grind": {
      const today = new Date().toLocaleDateString("en-CA");
      const { data: g, error: e1 } = await supabase.from("grinds").select("*").eq("id", args.id).single();
      if (e1) return `Error: ${e1.message}`;
      if (g.last_completed_date === today) return `Already done today: ${g.title}`;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const streak = g.last_completed_date === yesterday.toLocaleDateString("en-CA") ? g.current_streak + 1 : 1;
      const { data, error } = await supabase.from("grinds")
        .update({ last_completed_date: today, last_checked_date: today, current_streak: streak, best_streak: Math.max(g.best_streak, streak) })
        .eq("id", args.id).select().single();
      if (error) return `Error: ${error.message}`;
      return `Done: ${data.title} — ${data.current_streak}d streak`;
    }
    case "list_pomodoros": {
      const { data, error } = await supabase.from("pomodoros").select("*").order("completed_at", { ascending: false }).limit(args.limit ?? 20);
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data, null, 2);
    }
    case "create_pomodoro": {
      const { data, error } = await supabase.from("pomodoros").insert({ task_title: args.task_title, duration_minutes: args.duration_minutes, grind_id: args.grind_id ?? null }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Recorded ${args.duration_minutes}min pomodoro: ${args.task_title}`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

// ── JSON-RPC handler (fully stateless) ───────────────

function handleJsonRpc(msg) {
  const { method, id, params } = msg;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0", id,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "BlessedMind", version: "1.0.0" },
        },
      };

    case "notifications/initialized":
      return null; // No response needed

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call":
      return null; // Handled async

    case "ping":
      return { jsonrpc: "2.0", id, result: {} };

    default:
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

// ── Express app ──────────────────────────────────────

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.post("/mcp", async (req, res) => {
  // Always return a session ID for clients that expect one
  const sessionId = req.headers["mcp-session-id"] || randomUUID();
  res.setHeader("Mcp-Session-Id", sessionId);

  const body = req.body;
  const messages = Array.isArray(body) ? body : [body];
  const responses = [];

  for (const msg of messages) {
    if (msg.method === "tools/call") {
      try {
        const result = await handleTool(msg.params.name, msg.params.arguments || {});
        responses.push({
          jsonrpc: "2.0", id: msg.id,
          result: { content: [{ type: "text", text: result }] },
        });
      } catch (err) {
        responses.push({
          jsonrpc: "2.0", id: msg.id,
          error: { code: -32000, message: err.message },
        });
      }
    } else {
      const resp = handleJsonRpc(msg);
      if (resp) responses.push(resp);
    }
  }

  if (responses.length === 0) {
    res.status(202).end();
  } else if (responses.length === 1) {
    res.json(responses[0]);
  } else {
    res.json(responses);
  }
});

app.get("/mcp", (req, res) => {
  // SSE endpoint — send endpoint event
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.write("event: endpoint\ndata: /mcp\n\n");
  setTimeout(() => res.end(), 500);
});

app.delete("/mcp", (_, res) => res.status(200).end());

app.get("/", (_, res) => res.json({ status: "ok", name: "BlessedMind MCP", tools: TOOLS.length }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BlessedMind MCP server on port ${PORT}`));

export default app;
