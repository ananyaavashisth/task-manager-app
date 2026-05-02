# Team Task Manager

A robust, full-stack application built for team collaboration and task management.

## Live Demo
- **App URL**: https://exemplary-vision-production.up.railway.app
- **Test Credentials**: 
  - Admin: `admin@test.com` / `Admin@123`
  - Member: `member@test.com` / `Member@123`

## Tech Stack
**Frontend:**
- React (Vite)
- TailwindCSS
- React Router v6
- Axios

**Backend:**
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT & bcrypt

## Features
- **Authentication**: JWT-based login/signup system with password hashing.
- **Role-Based Access Control (RBAC)**: Two distinct roles (`ADMIN` and `MEMBER`) restricting access at both the global and project levels.
- **Projects**: Create, manage, and delete projects. Project admins can invite and remove team members.
- **Tasks**: Kanban-style project boards. Create tasks with descriptions, assignees, priorities, and due dates. Filter and update tasks.
- **Dashboard**: Real-time aggregation of task statistics, overdue tracking, and personal assignment tracking.

## Local Setup

### 1. Clone & Database
```bash
git clone https://github.com/ananyaavashisth/task-manager-app.git
cd task-manager-app
```
Ensure you have PostgreSQL running locally, or use a cloud database URL.

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on .env.example
cp .env.example .env
# Edit .env and insert your DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```
*Backend runs on http://localhost:8080 (or your configured PORT).*

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file and set VITE_API_URL=http://localhost:8080
echo "VITE_API_URL=http://localhost:8080" > .env
npm run dev
```
*Frontend runs on http://localhost:5173.*

## Environment Variables

### Backend `.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for signing JWTs | `super_secret_string` |
| `PORT` | Backend server port | `8080` |

### Frontend `.env`
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:8080` |

## API Overview

**Auth**
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user

**Projects**
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project (Admin)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (Project Admin)
- `DELETE /api/projects/:id` - Delete project (Project Admin)
- `POST /api/projects/:id/members` - Add member (Project Admin)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Project Admin)

**Tasks**
- `GET /api/projects/:id/tasks` - List project tasks
- `POST /api/projects/:id/tasks` - Create task
- `GET /api/tasks/:id` - Get task detail
- `PUT /api/tasks/:id` - Update task (Admin can update all, assignee can update status)
- `DELETE /api/tasks/:id` - Delete task (Admin)

**Dashboard**
- `GET /api/dashboard` - Get aggregated stats across projects

## Design Decisions
**Decoupled Architecture:** A decoupled REST architecture separates the frontend presentation layer from the backend business logic. This ensures scalability, allows either side to be deployed independently (e.g., static frontend CDN vs backend PaaS), and provides a clean contract via Axios.

**Granular RBAC:** Role-based access control was implemented at two levels. The global `User.role` dictates platform-wide permissions (like creating projects), while the `ProjectMember.role` restricts actions within specific projects. This matrix allows users to be an Admin in one project but a standard Member in another, closely mimicking real-world organizational structures.

**Prisma ORM & PostgreSQL:** Prisma was chosen for its type-safety and robust schema modeling. It cleanly handles cascading deletions (e.g., deleting a project wipes its tasks and memberships automatically) and handles complex aggregations required for the Dashboard endpoint with minimal boilerplate.
