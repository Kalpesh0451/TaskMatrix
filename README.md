# TaskMatrix – Advanced Project & Team Management System

## 1. Project Overview

TaskMatrix is a MERN stack-based Project and Team Management System designed to help organizations manage projects, assign tasks, track progress, collaborate with team members, and monitor project activities through a centralized dashboard.

## 2. Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs

### Database
- MongoDB
- Mongoose

### Development Tools
- Visual Studio Code
- Postman
- Git and GitHub
- MongoDB Atlas

## 3. Main Features

### Authentication
- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected API routes.
- Role-based authorization.

### User Management
- View registered users.
- Search users.
- Filter users by role and status.
- Update user information through authorized backend APIs.

### Project Management
- Create, view, update, and delete projects.
- Assign and remove project members.
- Manage project descriptions and dates.
- Track project status.
- Search and filter projects.

### Task Management
- Create, view, update, and delete tasks.
- Assign tasks to team members.
- Set task priorities.
- Manage task deadlines.
- Update task status.
- Search and filter tasks.

### Collaboration
- Add comments to tasks.
- View project activity logs.

### Dashboard
- Total projects and tasks.
- Completed, pending, and in-progress tasks.
- Task completion percentage.
- Overdue tasks.
- Assigned tasks.
- Project-wise progress.
- Recent activities.

## 4. Project Structure

```text
TaskMatrix/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   └── package.json
│
└── README.md
```

## 5. Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or local MongoDB
- Git

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TaskMatrix
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure the following environment variables:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
ADMIN_NAME=Administrator
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5001
```

### Step 3: Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 6. API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |
| PATCH | /api/users/profile | Update own profile |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project details |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| PUT | /api/projects/:id/members | Assign members |
| DELETE | /api/projects/:id/members/:userId | Remove member |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tasks | Get tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/my-tasks | Get assigned tasks |
| GET | /api/tasks/:id | Get task details |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

### Comments and Activities

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/tasks/:taskId/comments | Add comment |
| GET | /api/tasks/:taskId/comments | Get task comments |
| GET | /api/projects/:projectId/activities | Get project activities |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard | Get dashboard statistics |

**Note:** Protected endpoints require a valid JWT Bearer Token.

## 7. Database Collections

- Users
- Projects
- Tasks
- TaskComments
- ActivityLogs

## 8. Testing

API endpoints were organized and tested using Postman.

The final API testing collection includes:
- Project retrieval
- Task retrieval
- Dashboard statistics
- User retrieval
- Invalid project ID handling
- Invalid task ID handling
- Unauthorized request handling
- Invalid route handling

## 9. Security

- Password hashing using bcrypt.
- JWT-based authentication.
- Protected routes.
- Role-based authorization.
- Environment variables for sensitive configuration.
- Centralized error handling.

## 10. Future Enhancements

- Real-time collaboration using Socket.IO.
- Email notifications.
- Kanban board.
- File attachments.
- Swagger API documentation.
- Automated testing.
- Cloud deployment.

## 11. Author

Developed as a MERN Stack training project at GetSphere Technologies.

**Project Name:** TaskMatrix  
**Technology:** MERN Stack  
**Category:** Project and Team Management System
