# TaskMatrix – Project & Team Management System

A full-stack MERN application designed to simplify project management, task tracking, team collaboration, and real-time notifications.

## Project Overview

TaskMatrix is a web-based project and team management platform that enables administrators, project managers, and team members to manage projects, assign tasks, monitor progress, and collaborate through a centralized workspace.

## Features

### 1. Authentication and Authorization
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Admin, Project Manager, and Team Member roles

### 2. Dashboard
- Project statistics
- Task overview
- Progress monitoring
- Centralized workspace

### 3. Project Management
- Create and manage projects
- View project details
- Search and filter projects
- Track project progress

### 4. Task Management
- Create and assign tasks
- Update task details and status
- Search and filter tasks
- Track task progress and deadlines

### 5. Kanban Board
- Visual task management
- Organize tasks by status
- Track workflow progress

### 6. Team Management
- View team members
- Display member information and roles
- Manage team collaboration

### 7. Notifications
- Notification center
- Read and unread notifications
- Mark all notifications as read
- Delete notifications
- Real-time notifications using Socket.IO

### 8. Additional Features
- Search, filtering, sorting, and pagination
- Task comments
- Activity logs
- REST API documentation using Swagger UI

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Real-time Communication | Socket.IO |
| API Documentation | Swagger UI |
| Development Tools | VS Code, Git, GitHub, Postman |

## Project Structure

```text
TaskMatrix/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── Screenshots/
│   ├── dashboard.png
│   ├── notifications.png
│   ├── projects.png
│   ├── tasks.png
│   └── team members.png
│
├── DATABASE_SCHEMA.md
├── README.md
└── .gitignore
```

*Note: The folder structure above is an overview. Refer to the repository for the complete source structure.*

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB or MongoDB Atlas
- Git
- VS Code (recommended)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Kalpesh0451/TaskMatrix.git
cd TaskMatrix
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

Configure your MongoDB connection string, JWT secret, server port, and frontend URL.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser. The default Vite development URL is usually:

```text
http://localhost:5173
```

## Environment Variables

The backend requires environment variables for its configuration.

Refer to `backend/.env.example` for the exact variable names and descriptions.

Never commit your actual `.env` file, database credentials, or JWT secrets to GitHub.

## API Documentation

TaskMatrix provides Swagger UI for exploring and testing backend REST API endpoints.

Once the backend is running, open:

```text
http://localhost:5001/api-docs
```

The documented API sections include:

- Health
- Authentication
- Users
- Projects
- Tasks
- Dashboard
- Notifications

## Database Documentation

Database schema documentation is available in:

```text
DATABASE_SCHEMA.md
```

It describes the application's database structure and relationships.

## Screenshots

Application screenshots are available in the `Screenshots/` directory of this repository.

The screenshots cover the Dashboard, Projects, Tasks, Team Members, and Notifications modules.

## Security

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Role-based authorization
- Environment variables for sensitive configuration

## Future Enhancements

- Cloud deployment
- Automated testing
- Additional reporting and analytics
- Further collaboration features

## Author

**Kalpesh Dipak Patil**

Software Engineer

## GitHub Repository

https://github.com/Kalpesh0451/TaskMatrix


## Project Demo Video

Watch the complete demonstration of TaskMatrix, including authentication, dashboard, project management, task management, Kanban board, team management, notifications, and API documentation.

[Watch TaskMatrix Project Demo](https://drive.google.com/file/d/1oH9SqVNLGNAPTRBkQWEvOMIbr2is25w8/view?usp=sharing)