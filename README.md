# TaskMatrix – Project & Team Management System

A full-stack Project and Team Management System built using the MERN stack (MongoDB, Express.js, React.js and Node.js). TaskMatrix helps teams manage projects, assign tasks, monitor progress, collaborate through comments, and receive real-time notifications.

## Key Features

### Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control.
- Roles: Admin, Project Manager and Team Member.

### Dashboard
- Project statistics.
- Task statistics.
- Task status overview.
- Dashboard summary for users.

### Project Management
- Create, view, update and delete projects.
- Assign project managers.
- Add team members to projects.
- Track project status and dates.

### Task Management
- Create, view, update and delete tasks.
- Assign tasks to team members.
- Set task priorities and due dates.
- Track task statuses.
- Filter and search tasks.

### Team Management
- View team members.
- Manage user information and roles.
- Manage project team assignments.

### Kanban Board
- Visual task management.
- Organize tasks by status.
- Track task progress through workflow columns.

### Notifications
- Notification center.
- Mark individual notifications as read.
- Mark all notifications as read.
- Delete notifications.
- Real-time notifications using Socket.IO.

### Additional Features
- RESTful API architecture.
- Pagination and sorting.
- Search and filtering.
- API documentation using Swagger.
- Input validation and error handling.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS, Bootstrap (if used in the current frontend) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time Communication | Socket.IO |
| API Documentation | Swagger |
| API Testing | Swagger UI, Postman |
| Development Tools | VS Code, Git, GitHub |

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
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or local MongoDB
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/Kalpesh0451/TaskMatrix.git
cd TaskMatrix
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables.

Example:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Use the exact variable names expected by your backend configuration.

Start the backend:

```bash
npm run dev
```

Backend API:

```text
http://localhost:5001
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

## API Documentation

TaskMatrix provides API documentation through Swagger UI.

Once the backend is running, open:

http://localhost:5001/api-docs

The documentation includes API endpoints for:

- Health
- Authentication
- Users
- Projects
- Tasks
- Dashboard
- Notifications

For protected endpoints, authenticate using a valid JWT token through the Swagger Authorize option.

## API Architecture

The backend follows a structured MVC-style architecture:

- **Models:** MongoDB database schemas.
- **Controllers:** Application business logic.
- **Routes:** REST API endpoint definitions.
- **Middleware:** Authentication, authorization and request handling.
- **Services:** Reusable application services.
- **Utils:** Helper functions and utilities.

## Security

- JWT-based authentication.
- Password hashing.
- Role-based authorization.
- Environment variables for sensitive configuration.
- Request validation and centralized error handling.

## Future Enhancements

- Automated unit and integration testing.
- Email notifications.
- File attachments.
- Advanced analytics and reporting.
- Cloud deployment.
- Docker-based deployment.

## Author

**Kalpesh Dipak Patil**

GitHub: https://github.com/Kalpesh0451

## Repository

https://github.com/Kalpesh0451/TaskMatrix

---

*TaskMatrix – Simplifying Project and Team Management.*