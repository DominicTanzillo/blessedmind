Start a focus session. First call `mcp__blessedmind__get_dashboard` to see my current focus batch.

If I specified a task: help me work on that specific task. Look at its steps, think about how to approach it, and help me execute. If the task relates to code in this repo, find the relevant files and help implement.

If no task specified: suggest which task from my focus batch to tackle based on priority and due dates.

Once we pick a task:
1. Show the task details and any steps
2. Help me think through the approach
3. If it's a coding task, find relevant files and help implement
4. When done, ask if I want to mark it complete with `mcp__blessedmind__complete_task`
5. Ask if I want to log a pomodoro with `mcp__blessedmind__create_pomodoro`

$ARGUMENTS
