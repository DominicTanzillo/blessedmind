import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const server = new McpServer({
  name: "BlessedMind",
  version: "1.0.0",
});

// ── TASKS ────────────────────────────────────────────

server.tool(
  "list_tasks",
  "List tasks. Filter by completed, waiting, category, priority, or starred status.",
  {
    completed: z.boolean().optional().describe("Filter by completion status"),
    waiting: z.boolean().optional().describe("Filter by waiting status"),
    category: z.string().optional().describe("Filter by category"),
    priority: z.number().optional().describe("Filter by priority (1=urgent, 2=normal, 3=low)"),
    starred: z.boolean().optional().describe("Filter by starred status"),
    limit: z.number().optional().describe("Max results (default 50)"),
  },
  async ({ completed, waiting, category, priority, starred, limit }) => {
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);

    if (completed !== undefined) query = query.eq("completed", completed);
    if (waiting !== undefined) query = query.eq("waiting", waiting);
    if (category) query = query.eq("category", category);
    if (priority) query = query.eq("priority", priority);
    if (starred !== undefined) query = query.eq("starred", starred);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_task",
  "Create a new task. Returns the created task.",
  {
    title: z.string().describe("Task title"),
    description: z.string().optional().describe("Task description"),
    due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
    priority: z.number().optional().describe("1=urgent, 2=normal (default), 3=low"),
    category: z.string().optional().describe("Category name"),
  },
  async ({ title, description, due_date, priority, category }) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: description ?? "",
        due_date: due_date ?? null,
        priority: priority ?? 2,
        category: category ?? "general",
        completed: false,
        waiting: false,
        starred: false,
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Created task: ${JSON.stringify(data, null, 2)}` }] };
  }
);

server.tool(
  "update_task",
  "Update an existing task by ID. Only pass fields you want to change.",
  {
    id: z.string().describe("Task UUID"),
    title: z.string().optional(),
    description: z.string().optional(),
    due_date: z.string().optional().describe("YYYY-MM-DD or null to clear"),
    priority: z.number().optional().describe("1=urgent, 2=normal, 3=low"),
    category: z.string().optional(),
    starred: z.boolean().optional(),
    waiting: z.boolean().optional(),
  },
  async ({ id, ...updates }) => {
    const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    if (Object.keys(clean).length === 0) {
      return { content: [{ type: "text", text: "No fields to update." }] };
    }
    const { data, error } = await supabase
      .from("tasks")
      .update(clean)
      .eq("id", id)
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Updated: ${JSON.stringify(data, null, 2)}` }] };
  }
);

server.tool(
  "complete_task",
  "Mark a task as completed.",
  { id: z.string().describe("Task UUID") },
  async ({ id }) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Completed: ${data.title}` }] };
  }
);

server.tool(
  "delete_task",
  "Permanently delete a task by ID.",
  { id: z.string().describe("Task UUID") },
  async ({ id }) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: "Deleted." }] };
  }
);

// ── GRINDS (habits) ──────────────────────────────────

server.tool(
  "list_grinds",
  "List habits/grinds. Shows title, streak, health, and schedule.",
  {
    include_retired: z.boolean().optional().describe("Include retired grinds (default false)"),
  },
  async ({ include_retired }) => {
    let query = supabase
      .from("grinds")
      .select("*")
      .order("created_at", { ascending: false });

    if (!include_retired) query = query.eq("retired", false);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_grind",
  "Create a new daily habit/grind.",
  {
    title: z.string().describe("Habit title"),
    description: z.string().optional(),
    disabled_days: z.array(z.number()).optional().describe("Days off: 0=Sun, 1=Mon, ..., 6=Sat"),
  },
  async ({ title, description, disabled_days }) => {
    const { data, error } = await supabase
      .from("grinds")
      .insert({
        title,
        description: description ?? "",
        disabled_days: disabled_days ?? [],
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Created grind: ${JSON.stringify(data, null, 2)}` }] };
  }
);

server.tool(
  "complete_grind",
  "Mark a grind as completed for today.",
  { id: z.string().describe("Grind UUID") },
  async ({ id }) => {
    const today = new Date().toLocaleDateString("en-CA");
    const { data: grind, error: fetchErr } = await supabase
      .from("grinds")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr) return { content: [{ type: "text", text: `Error: ${fetchErr.message}` }] };
    if (grind.last_completed_date === today) {
      return { content: [{ type: "text", text: `Already completed today: ${grind.title}` }] };
    }

    const newStreak = grind.last_completed_date === (() => {
      const y = new Date(); y.setDate(y.getDate() - 1); return y.toLocaleDateString("en-CA");
    })() ? grind.current_streak + 1 : 1;

    const { data, error } = await supabase
      .from("grinds")
      .update({
        last_completed_date: today,
        last_checked_date: today,
        current_streak: newStreak,
        best_streak: Math.max(grind.best_streak, newStreak),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Completed ${data.title} — streak: ${data.current_streak}d` }] };
  }
);

// ── POMODOROS ─────────────────────────────────────────

server.tool(
  "list_pomodoros",
  "List completed pomodoro sessions. Shows task, duration, and when.",
  {
    limit: z.number().optional().describe("Max results (default 20)"),
  },
  async ({ limit }) => {
    const { data, error } = await supabase
      .from("pomodoros")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(limit ?? 20);

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_pomodoro",
  "Record a completed pomodoro focus session.",
  {
    task_title: z.string().describe("What was worked on"),
    duration_minutes: z.number().describe("Duration in minutes"),
    grind_id: z.string().optional().describe("Associated grind UUID if any"),
  },
  async ({ task_title, duration_minutes, grind_id }) => {
    const { data, error } = await supabase
      .from("pomodoros")
      .insert({
        task_title,
        duration_minutes,
        grind_id: grind_id ?? null,
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Recorded ${duration_minutes}min pomodoro: ${task_title}` }] };
  }
);

// ── DASHBOARD SUMMARY ────────────────────────────────

server.tool(
  "get_dashboard",
  "Get a summary of today's focus: active grinds, current batch tasks, recent pomodoros, and stats.",
  {},
  async () => {
    const today = new Date().toLocaleDateString("en-CA");
    const dayOfWeek = new Date().getDay();

    const [tasksRes, grindsRes, pomodorosRes, batchRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("completed", false).eq("waiting", false),
      supabase.from("grinds").select("*").eq("retired", false),
      supabase.from("pomodoros").select("*").order("completed_at", { ascending: false }).limit(10),
      supabase.from("active_batch").select("*").order("created_at", { ascending: false }).limit(1).single(),
    ]);

    const tasks = tasksRes.data ?? [];
    const grinds = grindsRes.data ?? [];
    const pomodoros = pomodorosRes.data ?? [];
    const batch = batchRes.data;

    const activeGrinds = grinds.filter((g) => !g.disabled_days.includes(dayOfWeek));
    const completedGrinds = activeGrinds.filter((g) => g.last_completed_date === today);
    const pendingGrinds = activeGrinds.filter((g) => g.last_completed_date !== today);

    const batchTasks = batch
      ? tasks.filter((t) => batch.task_ids.includes(t.id))
      : [];

    const overdue = tasks.filter((t) => t.due_date && t.due_date < today);
    const dueToday = tasks.filter((t) => t.due_date === today);

    const summary = {
      date: today,
      habits: {
        completed: completedGrinds.map((g) => `${g.title} (${g.current_streak}d streak)`),
        pending: pendingGrinds.map((g) => `${g.title} (${g.current_streak}d streak)`),
      },
      focus_batch: batchTasks.map((t) => ({
        title: t.title,
        priority: t.priority,
        due: t.due_date,
        completed: t.completed,
      })),
      overdue_tasks: overdue.map((t) => ({ title: t.title, due: t.due_date, priority: t.priority })),
      due_today: dueToday.map((t) => ({ title: t.title, priority: t.priority })),
      total_incomplete_tasks: tasks.length,
      recent_pomodoros: pomodoros.slice(0, 5).map((p) => ({
        task: p.task_title,
        minutes: p.duration_minutes,
        when: p.completed_at,
      })),
    };

    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  }
);

// ── Start server ─────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
