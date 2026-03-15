import request from "supertest";
import { expect, jest, describe, test, beforeEach } from "@jest/globals";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
import jwt from "jsonwebtoken";
import { prisma } from "../src/prisma";
import { Role } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { app } from "../src/app";

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
    sign: jest.fn(),
  },
}));

jest.mock("../src/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

const mockJwt = jest.mocked(jwt);
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

describe("Create Task Endpoint Tests", () => {
  const mockValidTaskPayload = {
    projectId: "project-123",
    taskTitle: "Implement login feature",
    taskDescription: "Create user authentication system",
    priority: "high",
    assignedTo: "user-123",
    status: "in-progress",
    dueDate: "2026-03-20T00:00:00.000Z",
    startDate: "2026-03-15T00:00:00.000Z",
  };

  test("should create task with valid data", async () => {
    const mockPrismaCreateResponse = {
      taskId: "task-123",
      projectId: mockValidTaskPayload.projectId,
      taskTitle: mockValidTaskPayload.taskTitle,
      taskDescription: mockValidTaskPayload.taskDescription,
      assignedTo: mockValidTaskPayload.assignedTo,
      status: mockValidTaskPayload.status,
      priority: mockValidTaskPayload.priority,
      dueDate: new Date(mockValidTaskPayload.dueDate),
      startDate: new Date(mockValidTaskPayload.startDate),
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.create.mockResolvedValue(mockPrismaCreateResponse);

    const response = await request(app)
      .post("/api/task/createTask")
      .send(mockValidTaskPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task created successfully.");
    expect(response.body.task).toEqual({
      ...mockPrismaCreateResponse,
      dueDate: mockPrismaCreateResponse.dueDate.toISOString(),
      startDate: mockPrismaCreateResponse.startDate.toISOString(),
      completedDate: null,
      createdAt: mockPrismaCreateResponse.createdAt.toISOString(),
      updatedAt: mockPrismaCreateResponse.updatedAt.toISOString(),
    });
  });

  test("should create task with minimal required fields", async () => {
    const minimalPayload = {
      projectId: "project-123",
      taskTitle: "Simple task",
      taskDescription: "Basic description",
      priority: "medium",
    };

    const mockPrismaCreateResponse = {
      taskId: "task-123",
      projectId: minimalPayload.projectId,
      taskTitle: minimalPayload.taskTitle,
      taskDescription: minimalPayload.taskDescription,
      assignedTo: null,
      status: "open",
      priority: minimalPayload.priority,
      dueDate: null,
      startDate: null,
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.create.mockResolvedValue(mockPrismaCreateResponse);

    const response = await request(app)
      .post("/api/task/createTask")
      .send(minimalPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.task.assignedTo).toBeNull();
    expect(response.body.task.status).toBe("open");
  });

  test("should return validation error when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/task/createTask")
      .send({})
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation Error");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual({
      field: "projectId",
      message: "projectId is required",
    });
    expect(response.body.errors).toContainEqual({
      field: "taskTitle",
      message: "taskTitle is required",
    });
    expect(response.body.errors).toContainEqual({
      field: "taskDescription",
      message: "taskDescription is required",
    });
    expect(response.body.errors).toContainEqual({
      field: "priority",
      message: "priority is required",
    });
  });

  test("should return error when prisma throws error", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.create.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/task/createTask")
      .send(mockValidTaskPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to create task.");
    expect(response.body.error).toBeDefined();
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .post("/api/task/createTask")
      .send(mockValidTaskPayload);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Get All Tasks Endpoint Tests", () => {
  test("should fetch all tasks", async () => {
    const mockTasks = [
      {
        taskId: "task-1",
        projectId: "project-1",
        taskTitle: "Task 1",
        taskDescription: "Description 1",
        assignedTo: "user-1",
        status: "open",
        priority: "high",
        dueDate: new Date("2026-03-20"),
        startDate: new Date("2026-03-15"),
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { projectTitle: "Project 1" },
      },
      {
        taskId: "task-2",
        projectId: "project-2",
        taskTitle: "Task 2",
        taskDescription: "Description 2",
        assignedTo: null,
        status: "in-progress",
        priority: "medium",
        dueDate: null,
        startDate: null,
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { projectTitle: "Project 2" },
      },
    ];

    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findMany.mockResolvedValue(mockTasks);

    const response = await request(app)
      .get("/api/task/getAllTask")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.tasks).toEqual(
      mockTasks.map((task) => ({
        ...task,
        dueDate: task.dueDate?.toISOString() || null,
        startDate: task.startDate?.toISOString() || null,
        completedDate: null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    );
  });

  test("should return 404 when no tasks found", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/task/getAllTask")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No tasks found.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app).get("/api/task/getAllTask");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Get Task By ID Endpoint Tests", () => {
  const mockTaskWithDetails = {
    taskId: "task-123",
    projectId: "project-123",
    taskTitle: "Test Task",
    taskDescription: "Test description",
    assignedTo: "user-123",
    status: "open",
    priority: "high",
    dueDate: new Date("2026-03-20"),
    startDate: new Date("2026-03-15"),
    completedDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: { projectTitle: "Test Project" },
    assignedUser: { username: "testuser", email: "test@example.com" },
  };

  test("should fetch task by ID with details", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(mockTaskWithDetails);

    const response = await request(app)
      .get("/api/task/getTaskById/task-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...mockTaskWithDetails,
      dueDate: mockTaskWithDetails.dueDate.toISOString(),
      startDate: mockTaskWithDetails.startDate.toISOString(),
      completedDate: null,
      createdAt: mockTaskWithDetails.createdAt.toISOString(),
      updatedAt: mockTaskWithDetails.updatedAt.toISOString(),
    });
  });

  test("should return 404 when task not found", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/task/getTaskById/nonexistent-task")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
  });
});

describe("Delete Task Endpoint Tests", () => {
  test("should delete task successfully", async () => {
    const existingTask = {
      taskId: "task-123",
      projectId: "project-123",
      taskTitle: "Test Task",
      taskDescription: "Test description",
      assignedTo: null,
      status: "open",
      priority: "high",
      dueDate: null,
      startDate: null,
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(existingTask);
    prismaMock.task.delete.mockResolvedValue(existingTask);

    const response = await request(app)
      .delete("/api/task/deleteTask/task-123")
      .set("Cookie", "token=fake-token");

    // expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task deleted successfully.");
  });

  test("should return 404 when task to delete does not exist", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/task/deleteTask/task-777")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
  });
});

describe("Update Task Endpoint Tests", () => {
  const mockExistingTask = {
    taskId: "task-123",
    projectId: "project-123",
    taskTitle: "Original Title",
    taskDescription: "Original description",
    assignedTo: null,
    status: "open",
    priority: "high",
    dueDate: null,
    startDate: null,
    completedDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test("should update task with all fields as manager", async () => {
    const updatePayload = {
      taskTitle: "Updated Title",
      taskDescription: "Updated description",
      assignedTo: "user-123",
      status: "completed",
      dueDate: "2026-03-25T00:00:00.000Z",
      startDate: "2026-03-16T00:00:00.000Z",
      priority: "low",
    };

    const mockUpdatedTask = {
      ...mockExistingTask,
      taskTitle: updatePayload.taskTitle,
      taskDescription: updatePayload.taskDescription,
      assignedTo: updatePayload.assignedTo,
      status: updatePayload.status,
      priority: updatePayload.priority,
      dueDate: new Date(updatePayload.dueDate),
      startDate: new Date(updatePayload.startDate),
      updatedAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(mockExistingTask);
    prismaMock.task.update.mockResolvedValue(mockUpdatedTask);

    const response = await request(app)
      .put("/api/task/updateTask/task-123")
      .send(updatePayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task updated successfully.");
    expect(response.body.task).toEqual({
      ...mockUpdatedTask,
      dueDate: mockUpdatedTask.dueDate.toISOString(),
      startDate: mockUpdatedTask.startDate.toISOString(),
      completedDate: null,
      createdAt: mockUpdatedTask.createdAt.toISOString(),
      updatedAt: mockUpdatedTask.updatedAt.toISOString(),
    });
  });

  test("should update only allowed fields as employee", async () => {
    const updatePayload = {
      status: "in-progress",
      startDate: "2026-03-16T00:00:00.000Z",
      taskTitle: "Should not be updated",
      priority: "low",
    };

    const mockUpdatedTask = {
      ...mockExistingTask,
      status: updatePayload.status,
      startDate: new Date(updatePayload.startDate),
      taskTitle: mockExistingTask.taskTitle,
      priority: mockExistingTask.priority,
      updatedAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      userId: "employee-123",
      role: Role.employee,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(mockExistingTask);
    prismaMock.task.update.mockResolvedValue(mockUpdatedTask);

    const response = await request(app)
      .put("/api/task/updateTask/task-123")
      .send(updatePayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.task.taskTitle).toBe(mockExistingTask.taskTitle);
    expect(response.body.task.status).toBe(updatePayload.status);
    expect(response.body.task.priority).toBe(mockExistingTask.priority);
  });

  test("should return 404 when task to update does not exist", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.task.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/task/updateTask/nonexistent-task")
      .send({ status: "completed" })
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .put("/api/task/updateTask/task-123")
      .send({ status: "completed" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Get Task By User ID Endpoint Tests", () => {
  test("should fetch tasks assigned to specific user", async () => {
    const mockTasks = [
      {
        taskId: "task-1",
        projectId: "project-1",
        taskTitle: "Task 1",
        taskDescription: "Description 1",
        assignedTo: "user-123",
        status: "open",
        priority: "high",
        dueDate: new Date("2026-03-20"),
        startDate: new Date("2026-03-15"),
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { projectTitle: "Project 1" },
      },
    ];

    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.employee,
    } as never);

    prismaMock.task.findMany.mockResolvedValue(mockTasks);

    const response = await request(app)
      .get("/api/task/getTaskByUserId/user-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.tasks).toEqual(
      mockTasks.map((task) => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
        startDate: task.startDate.toISOString(),
        completedDate: null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    );
  });

  test("should return 404 when no tasks found for user", async () => {
    mockJwt.verify.mockReturnValue({
      userId: "user-123",
      role: Role.employee,
    } as never);

    prismaMock.task.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/task/getTaskByUserId/user-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No tasks found for this user.");
  });
});