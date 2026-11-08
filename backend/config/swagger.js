
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "TaskMatrix API",
      version: "1.0.0",
      description:
        "API documentation for the TaskMatrix Project and Team Management System",
    },

    servers: [
      {
        url: "http://localhost:5001",
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [{ BearerAuth: [] }],

    paths: {
      // HEALTH
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Check API health",
          security: [],
          responses: {
            200: { description: "API is healthy" },
          },
        },
      },

      // AUTHENTICATION
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered" },
            400: { description: "Invalid input" },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get logged-in user",
          responses: {
            200: { description: "Current user" },
          },
        },
      },

      // USERS
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "Get users",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "sortBy", schema: { type: "string" } },
            {
              in: "query",
              name: "order",
              schema: { type: "string", enum: ["asc", "desc"] },
            },
          ],
          responses: {
            200: { description: "Users retrieved" },
          },
        },
      },

      // PROJECTS
      "/api/projects": {
        get: {
          tags: ["Projects"],
          summary: "Get projects",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "sortBy", schema: { type: "string" } },
            {
              in: "query",
              name: "order",
              schema: { type: "string", enum: ["asc", "desc"] },
            },
          ],
          responses: {
            200: { description: "Projects retrieved" },
          },
        },

        post: {
          tags: ["Projects"],
          summary: "Create project",
          responses: {
            201: { description: "Project created" },
          },
        },
      },

      "/api/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Get project details",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Project details" },
            404: { description: "Not found" },
          },
        },

        put: {
          tags: ["Projects"],
          summary: "Update project",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Project updated" },
          },
        },

        delete: {
          tags: ["Projects"],
          summary: "Delete project",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Project deleted" },
          },
        },
      },

      // TASKS
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get tasks",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "sortBy", schema: { type: "string" } },
            {
              in: "query",
              name: "order",
              schema: { type: "string", enum: ["asc", "desc"] },
            },
          ],
          responses: {
            200: { description: "Tasks retrieved" },
          },
        },

        post: {
          tags: ["Tasks"],
          summary: "Create task",
          responses: {
            201: { description: "Task created" },
          },
        },
      },

      "/api/tasks/my-tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get tasks assigned to current user",
          responses: {
            200: { description: "Assigned tasks" },
          },
        },
      },

      "/api/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task details",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Task details" },
          },
        },

        put: {
          tags: ["Tasks"],
          summary: "Update task",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Task updated" },
          },
        },

        delete: {
          tags: ["Tasks"],
          summary: "Delete task",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Task deleted" },
          },
        },
      },

      // DASHBOARD
      "/api/dashboard": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard statistics",
          responses: {
            200: { description: "Dashboard data" },
          },
        },
      },

      // REPORTS AND ANALYTICS
      "/api/dashboard/reports": {
        get: {
          tags: ["Reports"],
          summary: "Get reports and analytics",
          description:
            "Returns task status, priority, monthly task trends, project status and summary statistics for the authenticated user's access scope.",
          responses: {
            200: {
              description: "Reports generated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          summary: { type: "object" },
                          statusBreakdown: {
                            type: "array",
                            items: { type: "object" },
                          },
                          priorityBreakdown: {
                            type: "array",
                            items: { type: "object" },
                          },
                          monthlyTaskTrend: {
                            type: "array",
                            items: { type: "object" },
                          },
                          projectStatus: {
                            type: "array",
                            items: { type: "object" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            500: { description: "Failed to generate reports" },
          },
        },
      },

      // COMMENTS
      "/api/tasks/{taskId}/comments": {
        get: {
          tags: ["Comments"],
          summary: "Get task comments",
          parameters: [
            {
              in: "path",
              name: "taskId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Comments retrieved" },
          },
        },

        post: {
          tags: ["Comments"],
          summary: "Add task comment",
          parameters: [
            {
              in: "path",
              name: "taskId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            201: { description: "Comment added" },
          },
        },
      },

      // NOTIFICATIONS
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "Get notifications",
          description:
            "Get notifications for the authenticated user with pagination and unread count.",
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10 },
            },
            {
              in: "query",
              name: "unread",
              schema: { type: "boolean" },
            },
          ],
          responses: {
            200: { description: "Notifications retrieved successfully" },
            401: { description: "Unauthorized" },
          },
        },

        post: {
          tags: ["Notifications"],
          summary: "Create notification",
          description:
            "Create a notification for a recipient. Admin and Project Manager roles only.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipient", "title", "message"],
                  properties: {
                    recipient: { type: "string" },
                    title: { type: "string" },
                    message: { type: "string" },
                    type: {
                      type: "string",
                      enum: [
                        "task-assigned",
                        "task-updated",
                        "comment",
                        "project",
                        "general",
                      ],
                    },
                    relatedTask: { type: "string" },
                    relatedProject: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Notification created successfully" },
            400: { description: "Invalid notification data" },
            401: { description: "Unauthorized" },
            403: { description: "Insufficient permissions" },
          },
        },
      },

      "/api/notifications/read-all": {
        patch: {
          tags: ["Notifications"],
          summary: "Mark all notifications as read",
          responses: {
            200: { description: "All notifications marked as read" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/notifications/{id}/read": {
        patch: {
          tags: ["Notifications"],
          summary: "Mark one notification as read",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Notification marked as read" },
            404: { description: "Notification not found" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/notifications/{id}": {
        delete: {
          tags: ["Notifications"],
          summary: "Delete notification",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Notification deleted successfully" },
            404: { description: "Notification not found" },
            401: { description: "Unauthorized" },
          },
        },
      },

      // PROJECT ACTIVITIES
      "/api/projects/{projectId}/activities": {
        get: {
          tags: ["Activities"],
          summary: "Get project activity history",
          parameters: [
            {
              in: "path",
              name: "projectId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Activities retrieved" },
          },
        },
      },
    },
  },

  apis: [],
};

module.exports = swaggerJsdoc(options);
