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

describe("Create Project Endpoint Tests", () => {
  const mockValidProjectPayload = {
    proposalId: "proposal-123",
    projectTitle: "New E-commerce Platform",
    projectDescription: "Build a full-stack e-commerce solution",
    startDate: "2026-03-15T09:00:00.000Z",
    endDate: "2026-06-15T17:00:00.000Z",
    frontEndTechStack: "React, TypeScript, Tailwind CSS",
    backendEndTechStack: "Node.js, Express, PostgreSQL",
    database: "PostgreSQL",
  };

  const mockProposal = {
    proposalId: "proposal-123",
    userId: "user-123",
    proposalTitle: "New E-commerce Platform",
    proposalDescription: "Build a full-stack e-commerce solution",
    status: "pending",
    createdAt: new Date(),
    user: {
      username: "john doe",
      email: "john@example.com",
    },
  };

  test("should create project when proposal is pending and valid data", async () => {
    const mockProject = {
      projectId: "project-123",
      proposalId: mockValidProjectPayload.proposalId,
      projectTitle: mockValidProjectPayload.projectTitle,
      projectDescription: mockValidProjectPayload.projectDescription,
      startDate: new Date(mockValidProjectPayload.startDate),
      endDate: new Date(mockValidProjectPayload.endDate),
      frontEndTechStack: mockValidProjectPayload.frontEndTechStack,
      backendEndTechStack: mockValidProjectPayload.backendEndTechStack,
      database: mockValidProjectPayload.database,
      status: "active",
      createdAt: new Date(),
    };

    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.projectProposal.findUnique.mockResolvedValue(mockProposal as never);
    prismaMock.projectProposal.update.mockResolvedValue({
      ...mockProposal,
      status: "approved",
    } as never);
    prismaMock.project.create.mockResolvedValue(mockProject as never);

    const response = await request(app)
      .post("/api/project/createProject")
      .send(mockValidProjectPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Project created successfully.");
    expect(response.body.project).toEqual({
      ...mockProject,
      startDate: mockProject.startDate.toISOString(),
      endDate: mockProject.endDate.toISOString(),
      createdAt: mockProject.createdAt.toISOString(),
    });
  });

  test("should return 400 when proposal is not in pending state", async () => {
    const approvedProposal = {
      ...mockProposal,
      status: "approved",
    };

    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.projectProposal.findUnique.mockResolvedValue(approvedProposal as never);

    const response = await request(app)
      .post("/api/project/createProject")
      .send(mockValidProjectPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("proposal not in pending state");
  });

  test("should return 404 when proposal does not exist", async () => {
    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.projectProposal.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/project/createProject")
      .send(mockValidProjectPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Proposal not found.");
  });

  test("should return 400 when required fields are missing", async () => {
    const incompletePayload = {
      proposalId: "proposal-123",
      projectTitle: "Test Project",
      // Missing other required fields
    };

    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    const response = await request(app)
      .post("/api/project/createProject")
      .send(incompletePayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("All required fields must be provided.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .post("/api/project/createProject")
      .send(mockValidProjectPayload);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  test("should return 400 when database error occurs", async () => {
    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.projectProposal.findUnique.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/project/createProject")
      .send(mockValidProjectPayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Failed to create project.");
    expect(response.body.error).toBeDefined();
  });
});

describe("Get All Projects Endpoint Tests", () => {
  const mockProjects = [
    {
      projectId: "project-1",
      proposalId: "proposal-1",
      projectTitle: "Project 1",
      projectDescription: "Description 1",
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-06-15"),
      frontEndTechStack: "React",
      backendEndTechStack: "Node.js",
      database: "PostgreSQL",
      status: "active",
      createdAt: new Date(),
      tasks: [],
      proposal: {
        proposalTitle: "Proposal 1",
        user: { username: "user1" },
      },
    },
    {
      projectId: "project-2",
      proposalId: "proposal-2",
      projectTitle: "Project 2",
      projectDescription: "Description 2",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-07-01"),
      frontEndTechStack: "Vue.js",
      backendEndTechStack: "Python",
      database: "MongoDB",
      status: "active",
      createdAt: new Date(),
      tasks: [],
      proposal: {
        proposalTitle: "Proposal 2",
        user: { username: "user2" },
      },
    },
  ];

  test("should fetch all projects with related data", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findMany.mockResolvedValue(mockProjects as never);

    const response = await request(app)
      .get("/api/project/getAllProjects")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual(
      mockProjects.map((project) => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        createdAt: project.createdAt.toISOString(),
      })),
    );
  });

  test("should return empty array when no projects exist", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/project/getAllProjects")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual([]);
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app).get("/api/project/getAllProjects");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Get Project By ID Endpoint Tests", () => {
  const mockProjectWithDetails = {
    projectId: "project-123",
    proposalId: "proposal-123",
    projectTitle: "Test Project",
    projectDescription: "Test description",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-06-15"),
    frontEndTechStack: "React",
    backendEndTechStack: "Node.js",
    database: "PostgreSQL",
    status: "active",
    createdAt: new Date(),
    proposal: {
      proposalTitle: "Test Proposal",
      user: {
        username: "testuser",
        email: "test@example.com",
      },
    },
    tasks: [
      {
        taskId: "task-1",
        taskTitle: "Task 1",
        assignedUser: { username: "employee1" },
      },
    ],
  };

  test("should fetch project by ID with full details", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(mockProjectWithDetails as never);

    const response = await request(app)
      .get("/api/project/getProjectById/project-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("project fetched");
    expect(response.body.project).toEqual({
      ...mockProjectWithDetails,
      startDate: mockProjectWithDetails.startDate.toISOString(),
      endDate: mockProjectWithDetails.endDate.toISOString(),
      createdAt: mockProjectWithDetails.createdAt.toISOString(),
    });
  });

  test("should return 400 when project not found", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/project/getProjectById/nonexistent-project")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("project id not found");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .get("/api/project/getProjectById/project-123");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Update Project Endpoint Tests", () => {
  const mockExistingProject = {
    projectId: "project-123",
    proposalId: "proposal-123",
    projectTitle: "Original Title",
    projectDescription: "Original description",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-06-15"),
    frontEndTechStack: "React",
    backendEndTechStack: "Node.js",
    database: "PostgreSQL",
    status: "active",
    createdAt: new Date(),
  };

  test("should update project with all fields as manager", async () => {
    const updatePayload = {
      projectTitle: "Updated Title",
      projectDescription: "Updated description",
      startDate: "2026-03-16T09:00:00.000Z",
      endDate: "2026-06-20T17:00:00.000Z",
      status: "completed",
      frontEndTechStack: "React, Next.js",
      backendEndTechStack: "Node.js, Express",
      database: "MongoDB",
    };

    const mockUpdatedProject = {
      ...mockExistingProject,
      projectTitle: updatePayload.projectTitle,
      projectDescription: updatePayload.projectDescription,
      startDate: new Date(updatePayload.startDate),
      endDate: new Date(updatePayload.endDate),
      status: updatePayload.status,
      frontEndTechStack: updatePayload.frontEndTechStack,
      backendEndTechStack: updatePayload.backendEndTechStack,
      database: updatePayload.database,
    };

    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(mockExistingProject as never);
    prismaMock.project.update.mockResolvedValue(mockUpdatedProject as never);

    const response = await request(app)
      .put("/api/project/updateProject/project-123")
      .send(updatePayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Project updated successfully.");
    expect(response.body.project).toEqual({
      ...mockUpdatedProject,
      startDate: mockUpdatedProject.startDate.toISOString(),
      endDate: mockUpdatedProject.endDate.toISOString(),
      createdAt: mockUpdatedProject.createdAt.toISOString(),
    });
  });

  test("should update only provided fields", async () => {
    const partialUpdatePayload = {
      projectTitle: "Updated Title Only",
    };

    const mockUpdatedProject = {
      ...mockExistingProject,
      projectTitle: partialUpdatePayload.projectTitle,
    };

    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(mockExistingProject as never);
    prismaMock.project.update.mockResolvedValue(mockUpdatedProject as never);

    const response = await request(app)
      .put("/api/project/updateProject/project-123")
      .send(partialUpdatePayload)
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.project.projectTitle).toBe(partialUpdatePayload.projectTitle);
    expect(response.body.project.projectDescription).toBe(mockExistingProject.projectDescription);
  });

  test("should return 404 when project to update does not exist", async () => {
    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/project/updateProject/nonexistent-project")
      .send({ projectTitle: "Updated" })
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .put("/api/project/updateProject/project-123")
      .send({ projectTitle: "Updated" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Delete Project Endpoint Tests", () => {
  const mockExistingProject = {
    projectId: "project-123",
    proposalId: "proposal-123",
    projectTitle: "Test Project",
    projectDescription: "Test description",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-06-15"),
    frontEndTechStack: "React",
    backendEndTechStack: "Node.js",
    database: "PostgreSQL",
    status: "active",
    createdAt: new Date(),
  };

  test("should delete project and its tasks successfully", async () => {
    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(mockExistingProject as never);
    prismaMock.task.deleteMany.mockResolvedValue({} as never);
    prismaMock.project.delete.mockResolvedValue(mockExistingProject as never);

    const response = await request(app)
      .delete("/api/project/deleteProject/project-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Project deleted successfully.");
    expect(response.body.projectId).toBe("project-123");
  });

  test("should return 404 when project to delete does not exist", async () => {
    mockJwt.verify.mockReturnValue({
      id: "manager-123",
      role: Role.manager,
    } as never);

    prismaMock.project.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/project/deleteProject/nonexistent-project")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .delete("/api/project/deleteProject/project-123");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Get Project By User ID Endpoint Tests", () => {
  const mockUserProjects = [
    {
      projectId: "project-1",
      proposalId: "proposal-1",
      projectTitle: "User's Project 1",
      projectDescription: "Description 1",
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-06-15"),
      frontEndTechStack: "React",
      backendEndTechStack: "Node.js",
      database: "PostgreSQL",
      status: "active",
      createdAt: new Date(),
      tasks: [
        {
          taskId: "task-1",
          taskTitle: "Task 1",
          assignedUser: { username: "employee1" },
        },
      ],
    },
  ];

  test("should fetch projects for specific user", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.employee,
    } as never);

    prismaMock.project.findMany.mockResolvedValue(mockUserProjects as never);

    const response = await request(app)
      .get("/api/project/getProjectByUserId/user-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual(
      mockUserProjects.map((project) => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        createdAt: project.createdAt.toISOString(),
      })),
    );
  });

  test("should return 404 when no projects found for user", async () => {
    mockJwt.verify.mockReturnValue({
      id: "user-123",
      role: Role.employee,
    } as never);

    prismaMock.project.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/project/getProjectByUserId/user-123")
      .set("Cookie", "token=fake-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No projects found for this user.");
  });

  test("should return 401 when no token provided", async () => {
    const response = await request(app)
      .get("/api/project/getProjectByUserId/user-123");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});

describe("Proposal Endpoints Integration", () => {
  describe("Get All Proposals Endpoint Tests", () => {
    const mockProposals = [
      {
        proposalId: "proposal-1",
        userId: "user-1",
        proposalTitle: "Proposal 1",
        proposalDescription: "Description 1",
        status: "pending",
        createdAt: new Date(),
        user: {
          username: "user1",
          email: "user1@example.com",
        },
      },
      {
        proposalId: "proposal-2",
        userId: "user-2",
        proposalTitle: "Proposal 2",
        proposalDescription: "Description 2",
        status: "approved",
        createdAt: new Date(),
        user: {
          username: "user2",
          email: "user2@example.com",
        },
      },
    ];

    test("should fetch all proposals as manager", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "manager-123",
        role: Role.manager,
      } as never);

      prismaMock.projectProposal.findMany.mockResolvedValue(mockProposals as never);

      const response = await request(app)
        .get("/api/project/getAllProposals")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.proposals).toEqual(
        mockProposals.map((proposal) => ({
          ...proposal,
          createdAt: proposal.createdAt.toISOString(),
        })),
      );
    });

    test("should return 401 when employee tries to access proposals", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "employee-123",
        role: Role.employee,
      } as never);

      const response = await request(app)
        .get("/api/project/getAllProposals")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized");
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app).get("/api/project/getAllProposals");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("Get Proposal By ID Endpoint Tests", () => {
    const mockProposalWithUser = {
      proposalId: "proposal-123",
      userId: "user-123",
      proposalTitle: "Test Proposal",
      proposalDescription: "Test description",
      status: "pending",
      createdAt: new Date(),
      user: {
        username: "testuser",
        email: "test@example.com",
      },
    };

    test("should fetch proposal by ID with user details", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.manager,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(mockProposalWithUser as never);

      const response = await request(app)
        .get("/api/project/getProposalById/proposal-123")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProposalWithUser,
        createdAt: mockProposalWithUser.createdAt.toISOString(),
      });
    });

    test("should return 404 when proposal not found", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "manager-123",
        role: Role.manager,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/project/getProposalById/nonexistent-proposal")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Proposal not found.");
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app)
        .get("/api/project/getProposalById/proposal-123");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("Create Proposal Endpoint Tests", () => {
    const mockValidProposalPayload = {
      proposalTitle: "New Proposal",
      proposalDescription: "Proposal description",
    };

    const mockCreatedProposal = {
      proposalId: "proposal-123",
      userId: "user-123",
      proposalTitle: mockValidProposalPayload.proposalTitle,
      proposalDescription: mockValidProposalPayload.proposalDescription,
      status: "pending",
      createdAt: new Date(),
    };

    test("should create proposal successfully", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.create.mockResolvedValue(mockCreatedProposal as never);

      const response = await request(app)
        .post("/api/proposal/createProposal")
        .send(mockValidProposalPayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Proposal created successfully.");
      expect(response.body.proposal).toEqual({
        ...mockCreatedProposal,
        createdAt: mockCreatedProposal.createdAt.toISOString(),
      });
    });

    test("should return 400 when title or description missing", async () => {
      const incompletePayload = {
        proposalTitle: "Only Title",
      };

      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.employee,
      } as never);

      const response = await request(app)
        .post("/api/proposal/createProposal")
        .send(incompletePayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and Description missing");
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app)
        .post("/api/proposal/createProposal")
        .send(mockValidProposalPayload);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });

    test("should return 400 when database error occurs", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/proposal/createProposal")
        .send(mockValidProposalPayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Failed to create proposal.");
      expect(response.body.error).toBeDefined();
    });
  });

  describe("Update Proposal Endpoint Tests", () => {
    const mockExistingProposal = {
      proposalId: "proposal-123",
      userId: "user-123",
      proposalTitle: "Original Title",
      proposalDescription: "Original description",
      status: "pending",
      createdAt: new Date(),
    };

    test("should update proposal as manager with all fields", async () => {
      const updatePayload = {
        proposalTitle: "Updated Title",
        proposalDescription: "Updated description",
        status: "approved",
      };

      const mockUpdatedProposal = {
        ...mockExistingProposal,
        proposalTitle: updatePayload.proposalTitle,
        proposalDescription: updatePayload.proposalDescription,
        status: updatePayload.status,
      };

      mockJwt.verify.mockReturnValue({
        userId: "manager-123",
        role: Role.manager,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(mockExistingProposal as never);
      prismaMock.projectProposal.update.mockResolvedValue(mockUpdatedProposal as never);

      const response = await request(app)
        .put("/api/proposal/updateProposal/proposal-123")
        .send(updatePayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Proposal updated successfully.");
      expect(response.body.updated).toEqual({
        ...mockUpdatedProposal,
        createdAt: mockUpdatedProposal.createdAt.toISOString(),
      });
    });

    test("should update proposal as employee only for own proposals", async () => {
      const updatePayload = {
        proposalTitle: "Updated Title",
        proposalDescription: "Updated description",
        status: "approved", // Employee trying to change status
      };

      const mockUpdatedProposal = {
        ...mockExistingProposal,
        proposalTitle: updatePayload.proposalTitle,
        proposalDescription: updatePayload.proposalDescription,
        status: mockExistingProposal.status, // Status should not change
      };

      mockJwt.verify.mockReturnValue({
        id: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(mockExistingProposal as never);
      prismaMock.projectProposal.update.mockResolvedValue(mockUpdatedProposal as never);

      const response = await request(app)
        .put("/api/proposal/updateProposal/proposal-123")
        .send(updatePayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body.updated.status).toBe(mockExistingProposal.status);
    });

    test("should return 403 when employee tries to edit others proposal", async () => {
      const updatePayload = {
        proposalTitle: "Updated Title",
      };

      const differentUserProposal = {
        ...mockExistingProposal,
        userId: "different-user",
      };

      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(differentUserProposal as never);

      const response = await request(app)
        .put("/api/proposal/updateProposal/proposal-123")
        .send(updatePayload)
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You can only edit your own proposals.");
    });

    test("should return 404 when proposal not found", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "manager-123",
        role: Role.manager,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/proposal/updateProposal/nonexistent-proposal")
        .send({ proposalTitle: "Updated" })
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Proposal not found.");
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app)
        .put("/api/proposal/updateProposal/proposal-123")
        .send({ proposalTitle: "Updated" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("Delete Proposal Endpoint Tests", () => {
    const mockExistingProposal = {
      proposalId: "proposal-123",
      userId: "user-123",
      proposalTitle: "Test Proposal",
      proposalDescription: "Test description",
      status: "pending",
      createdAt: new Date(),
    };

    test("should delete proposal as owner (employee)", async () => {
      mockJwt.verify.mockReturnValue({
        id: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(mockExistingProposal as never);
      prismaMock.projectProposal.delete.mockResolvedValue(mockExistingProposal as never);

      const response = await request(app)
        .delete("/api/proposal/deleteProposal/proposal-123")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Proposal deleted successfully.");
    });

    test("should return 403 when employee tries to delete others proposal", async () => {
      const differentUserProposal = {
        ...mockExistingProposal,
        userId: "different-user",
      };

      mockJwt.verify.mockReturnValue({
        userId: "user-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(differentUserProposal as never);

      const response = await request(app)
        .delete("/api/proposal/deleteProposal/proposal-123")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You can only delete your own proposals.");
    });

    test("should return 404 when proposal not found", async () => {
      mockJwt.verify.mockReturnValue({
        userId: "employee-123",
        role: Role.employee,
      } as never);

      prismaMock.projectProposal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/proposal/deleteProposal/nonexistent-proposal")
        .set("Cookie", "token=fake-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Proposal not found.");
    });

    test("should return 401 when no token provided", async () => {
      const response = await request(app)
        .delete("/api/proposal/deleteProposal/proposal-123");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});