# Task Tracker

A simple React project I built to study React, Node.js, and PostgreSQL. It is a full-stack task tracker where I practised building a frontend, creating an Express API, storing data in a database, and deploying the application to a Linux server.

## Features

- Add tasks with a title and a Work or Personal category.
- View and filter tasks by category.
- Mark tasks as completed and delete tasks.
- Save tasks in PostgreSQL so they remain after refreshing the page.
- Show loading, empty, saving, and error states.

## Tech stack

| Layer | Technology | Location |
| --- | --- | --- |
| Frontend | React and Vite | `frontend/` |
| Backend | Node.js, Express, and node-postgres (`pg`) | `backend/` |
| Database | PostgreSQL | Schema in `database/schema.sql` |
| Linux hosting | PM2 and Nginx | PM2 runs the backend; Nginx serves the frontend and proxies API requests |

The browser sends `/api/...` requests to the backend through a proxy. Express validates requests, queries PostgreSQL, and returns JSON. Database credentials stay in the backend environment file.

- **Local development:** Vite serves React and forwards `/api/...` to Express.
- **Linux deployment:** Nginx serves the built React files and forwards `/api/...` to Express. PM2 keeps Express running in the background.

## Run locally on Windows

These commands use PowerShell. Install [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/en/download) with npm, and [PostgreSQL](https://www.postgresql.org/download/windows/) first. Use Node.js 22.12 or newer on a supported LTS release. PostgreSQL 18 was used for this project.

### 1. Clone the project

Run this in the folder where you want to keep the project:

```powershell
git clone https://github.com/kwanyinsan/task-tracker.git
cd task-tracker
```

The following setup commands start from the repository root.

If PostgreSQL commands are not on your PATH, add its `bin` folder for this PowerShell session. Adjust `18` if your installed version differs:

```powershell
$env:Path = "C:\Program Files\PostgreSQL\18\bin;$env:Path"
```

### 2. Create the database

Make sure the PostgreSQL service is running. Connect using the administrator password chosen during installation:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

At the `psql` prompt, run:

```sql
CREATE ROLE task_tracker_app WITH LOGIN;
\password task_tracker_app
CREATE DATABASE task_tracker OWNER task_tracker_app;
\q
```

`\password` prompts for a password for the application role. Keep it for the backend `.env` file.

Back in PowerShell, create the table as the application role:

```powershell
psql -h localhost -p 5432 -U task_tracker_app -d task_tracker -W -v ON_ERROR_STOP=1 -f database/schema.sql
```

This creates an empty `tasks` table. Run database creation and schema setup once for a new environment, not every time you start the app. Skip them if your database already exists.

### 3. Install dependencies and configure the backend

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
notepad .env
```

If `.env` already exists, edit it instead of copying over it. Set these values and replace the password placeholder with the application role's password:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker
PGUSER=task_tracker_app
PGPASSWORD="replace_with_your_app_password"
```

Save the file as `backend/.env`. The backend scripts load it using Node's `--env-file=.env` option. `.env` is ignored by Git; `.env.example` contains placeholders and should stay in the repository. Do not put database passwords in frontend code or `VITE_` variables.

Install the frontend dependencies:

```powershell
cd ../frontend
npm.cmd ci
```

`npm ci` installs the versions recorded in each package's lockfile. `npm.cmd` invokes npm directly on Windows, avoiding PowerShell script execution-policy issues.

### 4. Start both servers

In one terminal, from `task-tracker/backend`:

```powershell
npm.cmd run dev
```

The backend checks the database connection and starts at `http://localhost:3000`. Its development script uses Node's `--watch` option to restart when backend files change.

In another terminal, from `task-tracker/frontend`:

```powershell
npm.cmd run dev
```

Open **http://localhost:5173**. Keep both terminals open; use `Ctrl+C` to stop each server.

Vite removes the `/api` prefix when forwarding requests: `/api/tasks` becomes `http://localhost:3000/tasks`. The proxy is configured in `frontend/vite.config.js`.

### 5. Verify the local app

In another PowerShell terminal:

```powershell
curl.exe -i http://localhost:3000/health
curl.exe -i http://localhost:3000/tasks
```

Expect HTTP `200`, `{"status":"ok"}` for health, and a JSON array for tasks (`[]` for an empty database). In the browser, add a task, filter it, mark it completed, refresh, and delete it.

## Deploy to a Linux server with PM2 and Nginx

This is a minimal, single-server deployment using Ubuntu's APT packages. The original deployment used Ubuntu 26.04. The server needs SSH access and a user with `sudo` privileges. The examples also work when logged in as root.

Assume the provider exposes these inbound ports:

| Port | Purpose |
| --- | --- |
| 22 | SSH and SCP |
| 80 | HTTP website and API through Nginx |
| 443 | Available for HTTPS; this minimal guide does not configure TLS |

Ports `3000`, `5173`, and `5432` do not need public access. This guide ends with an **HTTP** website. Opening port 443 alone does not enable HTTPS. The app has no user authentication, so anyone who can reach it can change its tasks; use it as a learning/demo application.

Replace `YOUR_SERVER_IP` and `YOUR_SSH_USER` below with your server details.

### 1. Connect and install the required tools

From your local terminal:

```powershell
ssh YOUR_SSH_USER@YOUR_SERVER_IP
```

Run the following commands on the Linux server:

```bash
sudo apt update
sudo apt install git nodejs npm postgresql nginx
node --version
npm --version
psql --version
```

`apt update` refreshes the package index; `apt install` installs the packages and their dependencies. Check that Node meets the requirement above before continuing. Older Ubuntu repositories may need a newer Node installation; see the [Node.js installation options](https://nodejs.org/en/download).

Ubuntu packages normally start PostgreSQL and Nginx during installation. Check their status:

```bash
sudo systemctl status postgresql nginx --no-pager
```

On Ubuntu, `postgresql.service` can show `active (exited)` because it manages database clusters. If database connections fail, use `pg_lsclusters` to check the actual cluster status.

If UFW is already active, allow SSH and HTTP before continuing, preserving SSH access:

```bash
sudo ufw status
# Only if UFW is active and these ports are not already allowed:
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
```

### 2. Clone the project and install dependencies

```bash
cd /opt
sudo git clone https://github.com/kwanyinsan/task-tracker.git
sudo chown -R "$(id -un):$(id -gn)" /opt/task-tracker
cd /opt/task-tracker/backend
npm ci
cd ../frontend
npm ci
```

The repository is now at `/opt/task-tracker`. The ownership command allows your SSH user to install dependencies, edit `.env`, and build the frontend. Run the application and PM2 consistently as this same user.

### 3. Create the database and load the schema or existing data

```bash
sudo -u postgres psql
```

At the `psql` prompt:

```sql
CREATE ROLE task_tracker_app WITH LOGIN;
\password task_tracker_app
CREATE DATABASE task_tracker OWNER task_tracker_app;
\q
```

Choose **one** of the following options for the new, empty database. Do not run both.

#### Option A: Start with an empty task list

```bash
psql -h localhost -U task_tracker_app -d task_tracker -W -v ON_ERROR_STOP=1 -f /opt/task-tracker/database/schema.sql
```

#### Option B: Migrate your existing local tasks

On **Windows PowerShell**, export your local database and transfer the file. Adjust the PostgreSQL version in the path if needed:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h localhost -U postgres -d task_tracker --no-owner --no-acl -f "$HOME\Downloads\task_tracker.sql"
scp "$HOME\Downloads\task_tracker.sql" YOUR_SSH_USER@YOUR_SERVER_IP:task_tracker.sql
```

The dump contains schema, data, and identity sequence values. `--no-owner --no-acl` omits the old ownership and permission settings so the application role can own the restored objects. Roles and their passwords are created separately. Use a `pg_dump` version matching the local PostgreSQL major version and preferably the same PostgreSQL major version on the server; restoring into an older major version is not guaranteed to work.

On **Linux**, restore the file from your SSH user's home directory:

```bash
psql -h localhost -U task_tracker_app -d task_tracker -W -v ON_ERROR_STOP=1 -f "$HOME/task_tracker.sql"
```

This is a plain SQL dump, so restore it with `psql`, not `pg_restore`. `ON_ERROR_STOP=1` stops processing if an SQL command fails. Do not rerun this over an already populated database.

For either option, verify the table using the application account:

```bash
psql -h localhost -U task_tracker_app -d task_tracker -W -c 'SELECT COUNT(*) FROM tasks;'
```

### 4. Configure and verify the backend

```bash
cd /opt/task-tracker/backend
cp .env.example .env
chmod 600 .env
nano .env
```

If `.env` already exists, edit it instead of overwriting it. Use the same environment-variable values shown in the local setup, with the **Linux database role's password**. Keep `PORT=3000` to match the Nginx configuration below.

`chmod 600` allows only the file owner to read and write `.env`. The file stays at `/opt/task-tracker/backend/.env`, outside Nginx's public frontend directory.

Start the backend manually:

```bash
npm start
```

In a second SSH terminal, verify it:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/tasks
```

Both should return HTTP `200`. `/tasks` checks the API's database query; `/health` returns a basic status response. Return to the first terminal and press `Ctrl+C` before starting the same app with PM2.

### 5. Keep the backend running with PM2

```bash
sudo npm install -g pm2
cd /opt/task-tracker/backend
pm2 start "npm start" --name task-tracker-backend
pm2 status
pm2 logs task-tracker-backend
```

`npm start` runs `node --env-file=.env src/server.js`. PM2 manages that process in the background and restarts it after a crash. The development script is unnecessary here because it adds file watching.

Press `Ctrl+C` to leave the log viewer; this does not stop the PM2-managed backend.

Configure startup after a server reboot:

```bash
pm2 startup
```

If PM2 prints an additional `sudo ...` command, copy and run that exact command. Then save the process list:

```bash
pm2 save
```

`pm2 startup` configures the boot service; `pm2 save` records which processes to restore. PM2 stores its files under the running user's `~/.pm2/`. Do not switch between `pm2` and `sudo pm2`, which manage different users' process lists.

Useful management commands, when needed:

```bash
pm2 status
pm2 logs task-tracker-backend
pm2 restart task-tracker-backend
```

To deliberately stop the app, use `pm2 stop task-tracker-backend`; `pm2 restart task-tracker-backend` starts it again. `pm2 delete task-tracker-backend` stops it and removes its PM2 entry. After deleting it, run the original `pm2 start` command again to recreate it. Run `pm2 save` after changing the process list you want restored at boot.

### 6. Build the frontend

```bash
cd /opt/task-tracker/frontend
npm run build
```

Vite creates `frontend/dist/index.html` and JavaScript/CSS assets under `frontend/dist/assets/`. Nginx will serve these files. You do not need to keep a Vite development server running on the VM.

### 7. Configure Nginx

Back up the default site configuration before editing it:

```bash
sudo cp /etc/nginx/sites-available/default /opt/nginx-default.backup
sudo nano /etc/nginx/sites-available/default
```

Replace the site's contents with the following, substituting your actual server IP:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /opt/task-tracker/frontend/dist;
    index index.html;

    server_name YOUR_SERVER_IP;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
    }
}
```

- `listen 80`: accepts HTTP requests.
- `root` and `index`: serve the built frontend and its entry page.
- `try_files`: serves an existing file/directory or falls back to React's `index.html`.
- `location /api/`: sends API requests to Express on the same machine.
- The trailing `/` in `proxy_pass` replaces the matching `/api/` prefix. `/api/tasks?category=Work` reaches Express as `/tasks?category=Work`.

Ubuntu's default site is normally already linked from `/etc/nginx/sites-enabled/default`. Test and apply the configuration:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Only reload after the configuration test succeeds. Nginx's Ubuntu package normally enables startup at boot during installation.

### 8. Verify the deployed website

On the Linux server:

```bash
curl -i http://localhost/
curl -i http://localhost/api/health
curl -i 'http://localhost/api/tasks?category=Work'
```

Expect HTTP `200`: HTML for `/`, a status object for `/api/health`, and task JSON for `/api/tasks`.

From your own computer, open **http://YOUR_SERVER_IP** and check:

1. Existing tasks load.
2. You can create, filter, complete, and delete a task.
3. Refreshing the page keeps saved changes.
4. The website still works after closing the SSH session.

To verify startup persistence too, reboot the VM at a suitable time with `sudo reboot`, reconnect, check `pm2 status`, and test the public website again.

## File locations on the server

| Location | Contents |
| --- | --- |
| `/opt/task-tracker` | Cloned project |
| `/opt/task-tracker/backend/.env` | Backend configuration and database credentials |
| `/opt/task-tracker/frontend/dist` | Generated frontend files served publicly |
| `/etc/nginx/sites-available/default` | Nginx site configuration |
| `/opt/nginx-default.backup` | Original Nginx configuration backup |
| `~/task_tracker.sql` | Transferred SQL dump, if using migration |
| `~/.pm2/` | PM2 logs, state, and saved process list |
| `/var/log/nginx/` | Nginx access and error logs |

PostgreSQL stores the live database separately from the repository and SQL dump. To see its actual data directory, run `sudo -u postgres psql -c 'SHOW data_directory;'`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `psql` not found on Windows | Use PostgreSQL's full executable path or the session PATH command above. |
| Backend fails to start | Check `backend/.env`, database service, role password, and `pm2 logs task-tracker-backend`. |
| `relation "tasks" does not exist` | Run the schema or restore into the database named in `.env`. |
| `EADDRINUSE` | Stop the manually started backend before starting PM2; avoid duplicate backend processes. |
| Nginx returns `502 Bad Gateway` | Check PM2 and `curl http://localhost:3000/health`; confirm backend port 3000. |
| Nginx returns `403` or cannot read files | Check that `dist/index.html` exists and Nginx can traverse `/opt/task-tracker/frontend/dist`; inspect `/var/log/nginx/error.log`. Do not make `.env` public. |
| Local server checks work but the public website fails | Check the server IP, provider port-80 rule, and active OS firewall rules. |
| Frontend changes are missing | Rebuild with `npm run build`; source changes do not automatically update `dist`. |

## API

These are the direct Express routes. Through Vite or Nginx, prepend `/api`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Basic backend status |
| GET | `/tasks` | List tasks |
| GET | `/tasks?category=Work` | Filter by `Work` or `Personal` |
| POST | `/tasks` | Create a task with `title` and `category` |
| PATCH | `/tasks/:id` | Update `completed` using a boolean |
| DELETE | `/tasks/:id` | Delete a task |

POST and PATCH accept JSON with `Content-Type: application/json`. Titles must contain 1–200 characters after trimming. The UI provides marking a task completed; the API accepts either boolean value.

## References

The commands above are adapted for this repository's folders, scripts, and API routes.

- [Ubuntu: Install and manage packages](https://documentation.ubuntu.com/server/how-to/software/package-management/)
- [PostgreSQL: Ubuntu installation](https://www.postgresql.org/download/linux/ubuntu/)
- [PostgreSQL: pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL: psql](https://www.postgresql.org/docs/current/app-psql.html)
- [npm: npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
- [PM2: Quick start](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2: Startup and saved processes](https://pm2.keymetrics.io/docs/usage/startup/)
- [Vite: Deploying a static site](https://vite.dev/guide/static-deploy.html)
- [Nginx: proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
