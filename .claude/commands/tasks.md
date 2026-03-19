Help me manage my tasks. Call `mcp__blessedmind__list_tasks` with `completed: false` to get my open tasks.

Present them organized by:
1. Overdue (past due_date)
2. Due today
3. Starred/priority 1
4. Everything else by priority

Then ask what I'd like to do:
- Add a new task
- Complete a task
- Reprioritize
- Break a task into steps
- Move something to waiting

When I ask to complete a task, use `mcp__blessedmind__complete_task` with the task's ID.
When I ask to create a task, use `mcp__blessedmind__create_task`.
When I ask to update a task, use `mcp__blessedmind__update_task`.

$ARGUMENTS
