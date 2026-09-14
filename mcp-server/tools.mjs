/**
 * BlessedMind tool definitions — shared by every transport.
 *
 * `index.js` serves these over stdio to a Claude app on your own machine;
 * `connector/` serves the same array over authenticated HTTPS to claude.ai and
 * the iPhone. Both import this file, so a tool cannot exist in one and not the
 * other, and neither can drift onto a retired schema the way the plugin's old
 * hand-copied server did.
 *
 * Schemas are plain JSON Schema rather than zod: it is what the MCP wire format
 * carries anyway, it needs no dependency, and it runs unchanged on Node and on
 * Cloudflare's runtime.
 */

/** YYYY-MM-DD in a named zone. Defaults to the host's zone, as the app does. */
export function todayStr(timeZone) {
  return new Date().toLocaleDateString("en-CA", timeZone ? { timeZone } : undefined);
}

const nowIso = () => new Date().toISOString();

/** Unwrap a PostgREST result, turning its error into a thrown one. */
async function q(builder) {
  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return data;
}

const obj = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

const str = (description) => ({ type: "string", description });
const bool = (description) => ({ type: "boolean", description });
const num = (description) => ({ type: "number", description });

/**
 * Build the tool list against a signed-in Supabase client.
 *
 * @param {object} supabase  A client that already carries a user session.
 * @param {object} [options]
 * @param {string} [options.timeZone]  IANA zone for "today". Matters on a
 *   server: Cloudflare runs in UTC, which rolls the date over mid-evening in
 *   the Americas and would mark habits missed a few hours early.
 */
export function createTools(supabase, { timeZone } = {}) {
  const today = () => todayStr(timeZone);

  // ── Tasks ────────────────────────────────────────────
  // Tasks are `items` rows with item_type 'task' and no parent. Multi-step
  // ("hydra") tasks keep their steps as child rows with item_type 'step'.

  /** Attach each task's ordered steps, the way the app's useItems() does. */
  async function withSteps(tasks) {
    if (tasks.length === 0) return tasks;

    const children = await q(
      supabase
        .from("items")
        .select("*")
        .eq("item_type", "step")
        .in("parent_id", tasks.map((t) => t.id))
    );

    const byParent = new Map();
    for (const c of children) {
      const siblings = byParent.get(c.parent_id) ?? [];
      siblings.push(c);
      byParent.set(c.parent_id, siblings);
    }

    return tasks.map((t) => ({
      ...t,
      steps: (byParent.get(t.id) ?? [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed,
          due_date: s.due_date,
        })),
    }));
  }

  return [
    {
      name: "list_tasks",
      description:
        "List tasks. Filter by completed, waiting, category, priority, or starred status. Multi-step tasks include their steps.",
      inputSchema: obj({
        completed: bool("Filter by completion status"),
        waiting: bool("Filter by waiting status"),
        category: str("Filter by category"),
        priority: num("Filter by priority (1=urgent, 2=normal, 3=low)"),
        starred: bool("Filter by starred status"),
        limit: num("Max results (default 50)"),
      }),
      async run({ completed, waiting, category, priority, starred, limit }) {
        let query = supabase
          .from("items")
          .select("*")
          .eq("item_type", "task")
          .is("parent_id", null)
          .order("created_at", { ascending: false })
          .limit(limit ?? 50);

        if (completed !== undefined) query = query.eq("completed", completed);
        if (waiting !== undefined) query = query.eq("waiting", waiting);
        if (category) query = query.eq("category", category);
        if (priority) query = query.eq("priority", priority);
        if (starred !== undefined) query = query.eq("starred", starred);

        return withSteps(await q(query));
      },
    },

    {
      name: "create_task",
      description: "Create a new task, optionally with steps. Returns the created task.",
      inputSchema: obj(
        {
          title: str("Task title"),
          description: str("Task description"),
          due_date: str("Due date in YYYY-MM-DD format"),
          priority: num("1=urgent, 2=normal (default), 3=low"),
          category: str("Category name"),
          steps: {
            type: "array",
            items: { type: "string" },
            description: "Ordered step titles for a multi-step task",
          },
        },
        ["title"]
      ),
      async run({ title, description, due_date, priority, category, steps }) {
        const task = await q(
          supabase
            .from("items")
            .insert({
              title,
              description: description ?? "",
              due_date: due_date ?? null,
              priority: priority ?? 2,
              category: category ?? "general",
              item_type: "task",
            })
            .select()
            .single()
        );

        if (steps && steps.length > 0) {
          await q(
            supabase
              .from("items")
              .insert(
                steps.map((stepTitle, i) => ({
                  title: stepTitle,
                  parent_id: task.id,
                  position: i,
                  item_type: "step",
                  priority: priority ?? 2,
                  category: category ?? "general",
                  description: "",
                }))
              )
              .select()
          );
        }

        return (await withSteps([task]))[0];
      },
    },

    {
      name: "update_task",
      description: "Update an existing task by ID. Only pass fields you want to change.",
      inputSchema: obj(
        {
          id: str("Task ID"),
          title: str("New title"),
          description: str("New description"),
          due_date: {
            type: ["string", "null"],
            description: "YYYY-MM-DD, or null to clear",
          },
          priority: num("1=urgent, 2=normal, 3=low"),
          category: str("New category"),
          starred: bool("Star or unstar"),
          waiting: bool("Mark as waiting or not"),
        },
        ["id"]
      ),
      async run({ id, ...fields }) {
        const updates = { updated_at: nowIso() };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) updates[key] = value;
        }
        // starred_at drives the focus batch's FIFO ordering of starred items.
        if (fields.starred === true) updates.starred_at = nowIso();
        if (fields.starred === false) updates.starred_at = null;

        const rows = await q(supabase.from("items").update(updates).eq("id", id).select());
        if (rows.length === 0) throw new Error(`No task with id ${id}`);
        return rows[0];
      },
    },

    {
      name: "complete_task",
      description:
        "Mark a task or step as completed. Completing the last outstanding step also completes its parent task.",
      inputSchema: obj({ id: str("Task or step ID") }, ["id"]),
      async run({ id }) {
        const now = nowIso();
        const done = { completed: true, completed_at: now, updated_at: now };

        const rows = await q(supabase.from("items").update(done).eq("id", id).select());
        if (rows.length === 0) throw new Error(`No task with id ${id}`);
        const item = rows[0];

        // Mirrors useItems().completeTask: a step finishing its siblings rolls up.
        if (item.parent_id) {
          const siblings = await q(
            supabase.from("items").select("completed").eq("parent_id", item.parent_id)
          );
          if (siblings.every((s) => s.completed)) {
            await q(supabase.from("items").update(done).eq("id", item.parent_id).select());
            return { completed: item, parent_completed: item.parent_id };
          }
        }

        return item;
      },
    },

    {
      name: "delete_task",
      description: "Permanently delete a task by ID. Its steps go with it.",
      destructive: true,
      inputSchema: obj({ id: str("Task ID") }, ["id"]),
      async run({ id }) {
        const rows = await q(supabase.from("items").delete().eq("id", id).select());
        if (rows.length === 0) throw new Error(`No task with id ${id}`);
        return { deleted: rows[0].title };
      },
    },

    // ── Grinds (habits) ──────────────────────────────────
    // Habits live in habit_templates; each completion also writes a
    // 'habit_entry' item, which is what the garden counts.

    {
      name: "list_grinds",
      description:
        "List habits/grinds. Shows title, streak, schedule, and whether each is done today.",
      inputSchema: obj({
        include_retired: bool("Include retired habits (default false)"),
      }),
      async run({ include_retired }) {
        let query = supabase
          .from("habit_templates")
          .select("*")
          .order("created_at", { ascending: true });
        if (!include_retired) query = query.eq("retired", false);

        const day = today();
        const dow = new Date().getDay();

        return (await q(query)).map((g) => ({
          ...g,
          completed_today: g.last_completed_date === day,
          enabled_today: !g.disabled_days.includes(dow),
        }));
      },
    },

    {
      name: "create_grind",
      description: "Create a new daily habit/grind.",
      inputSchema: obj(
        {
          title: str("Habit title"),
          description: str("Habit description"),
          disabled_days: {
            type: "array",
            items: { type: "number" },
            description: "Days of week to skip, 0=Sunday through 6=Saturday",
          },
        },
        ["title"]
      ),
      async run({ title, description, disabled_days }) {
        return q(
          supabase
            .from("habit_templates")
            .insert({
              title,
              description: description ?? "",
              disabled_days: disabled_days ?? [],
              last_checked_date: today(),
              color_variant: Math.floor(Math.random() * 5),
            })
            .select()
            .single()
        );
      },
    },

    {
      name: "complete_grind",
      description:
        "Mark a grind as completed for today. Extends the streak and plants its garden entry.",
      inputSchema: obj({ id: str("Grind ID") }, ["id"]),
      async run({ id }) {
        const day = today();
        const grind = await q(
          supabase.from("habit_templates").select("*").eq("id", id).maybeSingle()
        );
        if (!grind) throw new Error(`No grind with id ${id}`);

        // Completing twice in a day would inflate the streak.
        if (grind.last_completed_date === day) {
          return {
            already_completed_today: true,
            title: grind.title,
            current_streak: grind.current_streak,
          };
        }

        const current_streak = grind.current_streak + 1;
        const updated = await q(
          supabase
            .from("habit_templates")
            .update({
              last_completed_date: day,
              current_streak,
              best_streak: Math.max(grind.best_streak, current_streak),
              updated_at: nowIso(),
            })
            .eq("id", id)
            .select()
            .single()
        );

        await q(
          supabase
            .from("items")
            .insert({
              title: grind.title,
              item_type: "habit_entry",
              completed: true,
              completed_at: nowIso(),
              source_id: id,
              description: "",
            })
            .select()
        );

        return updated;
      },
    },

    // ── Pomodoros ────────────────────────────────────────

    {
      name: "list_pomodoros",
      description: "List completed pomodoro sessions. Shows task, duration, and when.",
      inputSchema: obj({ limit: num("Max results (default 20)") }),
      async run({ limit }) {
        return q(
          supabase
            .from("pomodoros_v2")
            .select("*")
            .order("completed_at", { ascending: false })
            .limit(limit ?? 20)
        );
      },
    },

    {
      name: "create_pomodoro",
      description: "Record a completed pomodoro focus session.",
      inputSchema: obj(
        {
          task_title: str("What was worked on"),
          duration_minutes: num("Minutes focused (default 25)"),
          item_id: str("Task ID this session was spent on"),
        },
        ["task_title"]
      ),
      async run({ task_title, duration_minutes, item_id }) {
        return q(
          supabase
            .from("pomodoros_v2")
            .insert({
              task_title,
              duration_minutes: duration_minutes ?? 25,
              item_id: item_id ?? null,
              completed_at: nowIso(),
            })
            .select()
            .single()
        );
      },
    },

    // ── Dashboard ────────────────────────────────────────

    {
      name: "get_dashboard",
      description:
        "Get a summary of today's focus: habits due, the current focus batch, overdue and due-today tasks, and recent pomodoros.",
      inputSchema: obj({}),
      async run() {
        const day = today();
        const dow = new Date().getDay();

        const [grinds, openTasks, batchRows, pomodoros] = await Promise.all([
          q(supabase.from("habit_templates").select("*").eq("retired", false)),
          q(
            supabase
              .from("items")
              .select("*")
              .eq("item_type", "task")
              .is("parent_id", null)
              .eq("completed", false)
              .eq("waiting", false)
          ),
          q(
            supabase
              .from("focus_batch")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(1)
          ),
          q(
            supabase
              .from("pomodoros_v2")
              .select("*")
              .order("completed_at", { ascending: false })
              .limit(5)
          ),
        ]);

        const enabledToday = grinds.filter((g) => !g.disabled_days.includes(dow));
        const summarise = (g) => ({ id: g.id, title: g.title, streak: g.current_streak });

        const byId = new Map(openTasks.map((t) => [t.id, t]));
        const focusBatch = (batchRows[0]?.item_ids ?? [])
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((t) => ({ id: t.id, title: t.title, due_date: t.due_date, priority: t.priority }));

        const startOfToday = new Date(day + "T00:00:00");

        return {
          date: day,
          habits: {
            done: enabledToday.filter((g) => g.last_completed_date === day).map(summarise),
            pending: enabledToday.filter((g) => g.last_completed_date !== day).map(summarise),
            skipped_today: grinds.filter((g) => g.disabled_days.includes(dow)).map((g) => g.title),
          },
          focus_batch: focusBatch,
          overdue: openTasks
            .filter((t) => t.due_date && new Date(t.due_date + "T00:00:00") < startOfToday)
            .map((t) => ({ id: t.id, title: t.title, due_date: t.due_date }))
            .sort((a, b) => a.due_date.localeCompare(b.due_date)),
          due_today: openTasks
            .filter((t) => t.due_date === day)
            .map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
          open_task_count: openTasks.length,
          pomodoros: {
            today: pomodoros.filter((p) => p.completed_at.slice(0, 10) === day).length,
            recent: pomodoros.map((p) => ({
              task: p.task_title,
              minutes: p.duration_minutes,
              at: p.completed_at,
            })),
          },
        };
      },
    },
  ];
}
