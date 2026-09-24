# Task Tracker

A Task Tracker built with React, Node.js/Express, and PostgreSQL.

The backend and database are implemented. The React frontend is pending.

## Prerequisites

- Node.js LTS with npm
- PostgreSQL
- pgAdmin or another PostgreSQL client

Commands below use Windows PowerShell and assume the project is at `C:\task-tracker`.

Use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Database Setup

For a new environment:

1. Create a PostgreSQL login role named `task_tracker_app` with a password.
2. Create a database named `task_tracker`, owned by that role.
3. Connect to `task_tracker` as `task_tracker_app`.
4. Execute `database/schema.sql` once to create the `tasks` table.

Verify:

```sql
SELECT current_database(), current_user;

SELECT id, title, category, completed, created_at
FROM tasks;
```

Do not rerun the table-creation script on every application startup.

## Backend Configuration

Install the locked dependencies:

```powershell
Set-Location C:\task-tracker\backend
npm.cmd ci
```

If `.env` does not already exist:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your local settings:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker
PGUSER=task_tracker_app
PGPASSWORD="replace_with_your_actual_app_password"
```

Do not commit `.env`. Keep placeholder values in `.env.example`.

## Run the Backend

Check the database connection:

```powershell
node --env-file=.env src/check-db.js
```

Start with automatic source-code restarts:

```powershell
npm.cmd run dev
```

Or start without watch mode:

```powershell
npm.cmd start
```

Default API address: `http://localhost:3000`

Use Ctrl+C to stop the backend.

## API

POST and PATCH requests use `Content-Type: application/json`.

| Method | Endpoint | Input | Success response |
|---|---|---|---|
| GET | `/health` | None | 200, `{"status":"ok"}` |
| GET | `/tasks` | Optional `category=Work` or `category=Personal` query parameter | 200, task array |
| POST | `/tasks` | `title` and `category` | 201, created task |
| PATCH | `/tasks/:id` | Boolean `completed` | 200, updated task |
| DELETE | `/tasks/:id` | Task ID in the path | 204, no body |

Task records contain `id`, `title`, `category`, `completed`, and `created_at`.

Example POST body:

```json
{
  "title": "Build the frontend",
  "category": "Work"
}
```

Example PATCH body:

```json
{
  "completed": true
}
```

PATCH also accepts `false` to mark a task incomplete.

Titles are trimmed and must contain between 1 and 200 characters. Categories must be exactly Work or Personal.

For all tasks, omit the category parameter. Empty lists return `[]`.

Errors use this format:

```json
{
  "error": "Task not found."
}
```

| Status | Meaning |
|---|---|
| 400 | Invalid input or malformed JSON |
| 404 | Task or endpoint not found |
| 413 | Request body exceeds the 10 KB limit |
| 500 | Unexpected server error |

## Verification and Remaining Work

Manual checks completed:

- Task creation, retrieval, filtering, completion updates, and deletion.
- Invalid titles, categories, completion values, IDs, and JSON.
- Missing tasks and unknown endpoints.
- Invalid creation requests do not add records.
- API results match PostgreSQL records in pgAdmin.

The persistence check retrieves fresh data after restarting the backend and checks that saved values remain and deleted tasks stay absent.

Remaining work:

- Build and connect the React frontend.
- Check the complete application through the browser.