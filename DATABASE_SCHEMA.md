# TaskMatrix – Database Schema Documentation

## 1. Database Overview

TaskMatrix uses MongoDB as its database and Mongoose as its Object Data Modeling (ODM) library.

The database contains five main collections:

- Users
- Projects
- Tasks
- TaskComments
- ActivityLogs

## 2. Collection Relationships

### Users
Stores registered user information.

| Field | Description |
|---|---|
| _id | Unique user ID |
| name | User's name |
| email | Unique email address |
| password | Hashed password |
| role | admin, project-manager, team-member |
| isActive | Account status |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### Projects
Stores project information.

| Field | Description |
|---|---|
| _id | Unique project ID |
| name | Project name |
| description | Project description |
| startDate | Project start date |
| endDate | Project end date |
| status | planned, active, on-hold, completed |
| manager | Reference to Users |
| members | Array of User references |
| createdBy | Reference to Users |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### Tasks
Stores tasks associated with projects.

| Field | Description |
|---|---|
| _id | Unique task ID |
| title | Task title |
| description | Task description |
| project | Reference to Projects |
| assignedTo | Reference to Users |
| assignedBy | Reference to Users |
| createdBy | Reference to Users |
| priority | low, medium, high, critical |
| status | todo, in-progress, review, completed |
| dueDate | Task deadline |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### TaskComments
Stores comments associated with tasks.

| Field | Description |
|---|---|
| _id | Unique comment ID |
| task | Reference to Tasks |
| user | Reference to Users |
| message | Comment content |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### ActivityLogs
Stores activities performed within projects.

| Field | Description |
|---|---|
| _id | Unique activity ID |
| project | Reference to Projects |
| task | Optional reference to Tasks |
| user | Reference to Users |
| action | Activity action |
| details | Activity description |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

## 3. Entity Relationships

- One User can manage multiple Projects.
- One Project can contain multiple Users as members.
- One Project can contain multiple Tasks.
- One User can be assigned multiple Tasks.
- One Task can contain multiple Comments.
- One User can write multiple Comments.
- One Project can have multiple Activity Logs.
- One Task can be associated with multiple Activity Logs.

## 4. Relationship Summary

| Collection | Relationship | Collection |
|---|---|---|
| Users | One-to-Many | Projects (manager) |
| Users | Many-to-Many | Projects (members) |
| Projects | One-to-Many | Tasks |
| Users | One-to-Many | Tasks (assignedTo) |
| Tasks | One-to-Many | TaskComments |
| Users | One-to-Many | TaskComments |
| Projects | One-to-Many | ActivityLogs |
| Tasks | One-to-Many | ActivityLogs |

## 5. Database Technology

- Database: MongoDB
- ODM: Mongoose
- Hosting: MongoDB Atlas
- Relationships: MongoDB ObjectId references
- Timestamps: Automatic createdAt and updatedAt fields

## 6. Conclusion

The TaskMatrix database structure supports project management, task assignment, team collaboration, comments, activity tracking and dashboard reporting through related MongoDB collections.
