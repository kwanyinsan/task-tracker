# Task Tracker

A full-stack training project built with React, Vite, Express, and PostgreSQL. It demonstrates how a browser interface communicates with an API and stores persistent data in a database.

## Features

- View tasks and their categories and completion status.
- Add tasks with a title and a Work or Personal category.
- Mark tasks as completed and delete tasks.
- Filter by All, Work, or Personal.
- Display loading, saving, error, and empty states.
- Reload tasks from the database through the API.

## Technology and Structure

| Part | Technology | Folder |
|---|---|---|
| Frontend | React, Vite, JavaScript, JSX, CSS, fetch | `frontend/` |
| Backend | Node.js, Express 5, pg, CommonJS | `backend/` |
| Database | PostgreSQL and SQL schema | `database/` |

React sends HTTP requests to Express using `fetch()`. Express queries PostgreSQL and returns JSON. React uses the responses to update the interface.

## Local Setup

These instructions use Windows PowerShell and assume the project is at `C:\task-tracker`. Install Node.js with npm and PostgreSQL first. Use pgAdmin or another PostgreSQL client for database setup.

### 1. Create the database

For a new environment:

1. Create a PostgreSQL login role named `task_tracker_app` with a password.
2. Create a database named `task_tracker`, owned by that role.
3. Connect to that database as `task_tracker_app`.
4. Run `database/schema.sql` once to create the `tasks` table.

Skip this section if the database is already configured. Do not rerun the table-creation script on every startup.

### 2. Install dependencies

For a fresh checkout, install the locked dependencies for both packages:

```powershell
Set-Location C:\task-tracker\backend
npm.cmd ci

Set-Location C:\task-tracker\frontend
npm.cmd ci
```

### 3. Configure the backend

Create the local environment file if it does not already exist:

```powershell
Set-Location C:\task-tracker\backend
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Edit `backend/.env` with your database settings:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker
PGUSER=task_tracker_app
PGPASSWORD="replace_with_your_actual_app_password"
```

Keep `.env` local and excluded from Git. Keep placeholder values in `.env.example`.

## Run the Application

Make sure PostgreSQL is running.

Start the backend in one terminal:

```powershell
Set-Location C:\task-tracker\backend
npm.cmd run dev
```

The backend checks its database connection before starting. Its default address is `http://localhost:3000`.

Start the frontend in another terminal:

```powershell
Set-Location C:\task-tracker\frontend
npm.cmd run dev
```

Open [Task Tracker](http://localhost:5173). Keep both terminals running. Use `Ctrl+C` in a terminal to stop its server.

The Vite development proxy forwards `/api` requests to `http://localhost:3000` and removes the `/api` prefix. For example, `/api/tasks` reaches the Express endpoint `/tasks`. If the backend port changes, update `frontend/vite.config.js` and restart Vite.

## API

The paths below are Express endpoints. The frontend adds `/api` when using the development proxy. `:id` represents a task ID.

| Method | Endpoint | Input | Success response |
|---|---|---|---|
| GET | `/health` | None | 200: `{ "status": "ok" }` |
| GET | `/tasks` | Optional `?category=Work` or `?category=Personal` | 200: task array |
| POST | `/tasks` | `{ "title": "Build frontend", "category": "Work" }` | 201: created task |
| PATCH | `/tasks/:id` | `{ "completed": true }` | 200: updated task |
| DELETE | `/tasks/:id` | Task ID in the path | 204: no response body |

POST and PATCH use `Content-Type: application/json`.

Task records contain `id`, `title`, `category`, `completed`, and `created_at`. Titles are trimmed and must contain 1–200 characters. Categories must be exactly `Work` or `Personal`. Omit the category parameter to retrieve all tasks; an empty result is `[]`.

The API accepts either boolean value for `completed`. The current UI only provides marking a task completed.

Errors return an `error` message, for example `{ "error": "Task not found." }`. Status codes include 400 for invalid input, 404 for missing tasks or endpoints, 413 for oversized request bodies, and 500 for unexpected server errors.

## Checks and Build

Run the frontend checks:

```powershell
Set-Location C:\task-tracker\frontend
npm.cmd run lint
npm.cmd run build
```

Lint checks the source against the configured rules. Build generates frontend assets in `frontend/dist`. Edit source files and rebuild instead of editing generated files.

Manual testing has covered task creation, listing, completion, deletion, filtering, validation, error handling, and persistence after browser refresh and backend restart. API results were checked against PostgreSQL records.

PostgreSQL stores persistent data; React state holds the current interface data. Use **Reload tasks** to retrieve changes made outside the current interface.

Production hosting and production API routing are not configured. The build output does not include a running backend or database.

