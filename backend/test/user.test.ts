import request from "supertest";
import { expect, jest, describe, test, beforeEach } from "@jest/globals";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
import jwt from "jsonwebtoken";
import { prisma } from "../src/prisma";
import { Role} from "@prisma/client";
import {PrismaClient} from "@prisma/client"
import bcrypt from 'bcrypt';
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

const validateCookie = (
  cookie: string,
  cookieName: string,
  mockCookieValue: string,
) => {
  expect(cookie).toBeDefined();
  const parts = cookie.split("; ").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      acc[key as string] = value ?? true;
      return acc;
    },
    {} as Record<string, string | boolean>,
  );
  expect(parts[cookieName]).toBe(mockCookieValue);
  expect(parts["Max-Age"]).toBe("86400");
  expect(parts.HttpOnly).toBe(true);
  expect(parts.Secure).toBe(true);
  expect(parts.SameSite).toBe("Lax");
  expect(parts.Path).toBe("/");
};

describe("Register Endpoint test", () => {
  const mockValidRegisterPayload = {
    username: "user",
    mobileNumber: "12364567890",
    email: "test@example.com",
    password: "password123",
    profileImage: "mock-profile-image-data",
    role: "employee" as Role,
  };

  test("should register user with valid data", async () => {
    const mockPrismaCreateResponse = {
      id: "mock-userid",
      username: mockValidRegisterPayload.username,
      email: mockValidRegisterPayload.email,
      role: mockValidRegisterPayload.role,
      profileImage: mockValidRegisterPayload.profileImage,
      mobileNumber: "",
      createdAt: new Date(),
      password: "",
      updatedAt: new Date(),
    };
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockPrismaCreateResponse);
    mockJwt.sign.mockReturnValue("fake-token" as never);
    const response = await request(app)
      .post("/api/user/register")
      .send(mockValidRegisterPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Registration success");
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(mockPrismaCreateResponse.id);
    expect(response.body.user.email).toBe(mockValidRegisterPayload.email);
    const cookie = response.headers["set-cookie"]?.[0] ?? "";
    validateCookie(cookie, "token", "fake-token");
  });
  test("should return error when prisma throws error", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(new Error("Prisma error"));
    mockJwt.sign.mockReturnValue("fake-token" as never);

    const response = await request(app)
      .post("/api/user/register")
      .send(mockValidRegisterPayload);

    expect(response.status).toBe(500);

    expect(response.body.message).toBe("Registration failed");
    expect(response.body.success).toBe(false);
    expect(response.body.user).not.toBeDefined();
    const cookies = response.headers["set-cookie"];
    expect(cookies).not.toBeDefined();
  });

  test("should return error when already exist", async () => {
    const mockPrismaResponse = {
      id: "mock-userid",
      username: mockValidRegisterPayload.username,
      email: mockValidRegisterPayload.email,
      mobileNumber: mockValidRegisterPayload.mobileNumber,
      profileImage: mockValidRegisterPayload.profileImage,
      password: "",
      role: Role.employee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.user.findUnique.mockResolvedValue(mockPrismaResponse);

    const response = await request(app)
      .post("/api/user/register")
      .send(mockValidRegisterPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Email already exist");
    expect(response.body.user).not.toBeDefined();
    const cookies = response.headers["set-cookie"];
    expect(cookies).not.toBeDefined();
  });

  test("should return validation error when payload is missing", async () => {
    const response = await request(app).post("/api/user/register").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation Error");
    expect(response.body.errors).toEqual([
      {
        field: "username",
        message: "Username is required",
      },
      {
        field: "mobileNumber",
        message: "Mobile number is required",
      },
      { field: "profileImage", message: "Profile image URL is required" },
      {
        field: "email",
        message: "Invalid email address",
      },
      {
        field: "password",
        message: "Password is required",
      },
      { field: "role", message: "Role must be 'manager' or 'employee'" },
    ]);


  });

  test("should return validation error for invalid email", async () => {
    const response = await request(app)
      .post("/api/user/register")
      .send({ ...mockValidRegisterPayload, email: "invalid-email" });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation Error");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual({
      field: "email",
      message: "Invalid email address",
    });
  });

  test("shppuld return validation error for short password", async () => {
    const response = await request(app)
      .post("/api/user/register")
      .send({ ...mockValidRegisterPayload, password: "123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation Error");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  });

  test('should return validation error for long password', async ()=>{
    const response = await request(app).post("/api/user/register").send({
      ...mockValidRegisterPayload,
      password:"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation Error')
    expect(response.body.errors).toContainEqual({
      field: 'password',
      message: "Password must be at most 30 character"
    })
  })
});

describe('Login Endpoint Tests', () => {
  const mockValidLoginPayload = {
    username: 'user',
    password: 'Password123',
  };
  test('Should login user with valid data', async () => {
    const mockPrismaLoginResponse = {
      id: 'mock-userid',
      username: mockValidLoginPayload.username,
      email: 'test@example.com',
      role: 'employee' as Role,
      mobileNumber: '1234567890',
      profileImage: 'mock-profile-image-data',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: bcrypt.hashSync(mockValidLoginPayload.password, 12),
    };
    prismaMock.user.findUnique.mockResolvedValue(mockPrismaLoginResponse);
    mockJwt.sign.mockReturnValue('fake-token' as never);

    const response = await request(app)
      .post('/api/user/login')
      .send(mockValidLoginPayload);

    expect(response.status).toBe(200);        
    expect(response.body.success).toBe(true)  
    expect(response.body.message).toBe("Login successful")  
    expect(response.body.user).toEqual({
      id: mockPrismaLoginResponse.id,
    email: mockPrismaLoginResponse.email,
    username: mockPrismaLoginResponse.username,
    role: mockPrismaLoginResponse.role,
    profileImage: mockPrismaLoginResponse.profileImage
    });
    const cookie = response.headers['set-cookie']?.[0] || '';
    validateCookie(cookie, 'token', 'fake-token');
  });

  test('should return error when prisma throws error', async () => {
    prismaMock.user.findUnique.mockRejectedValue('Prisma Error');
    mockJwt.sign.mockReturnValue('fake-token' as never);

    const response = await request(app)
      .post('/api/user/login')
      .send(mockValidLoginPayload);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Login failed");
    expect(response.body.user).not.toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies).not.toBeDefined();
  });

    test('should return validation error when payload is missing', async () => {
    const response = await request(app).post('/api/user/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation Error');
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toEqual([
      {
        field: 'username',
        message: 'Username is required',
      },
      {
        field: 'password',
        message: 'Password is required',
      },
    ]);
  });
   test('should return error when user does not exists', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send(mockValidLoginPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("No user exist");
    expect(response.body.user).not.toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies).not.toBeDefined();
  });

   test('Should throw error when password mismatch', async () => {
    const mockPrismaLoginResponse = {
      id: 'mock-userid',
      username: mockValidLoginPayload.username,
      email: 'test@example.com',
      role: 'employee' as Role,
      mobileNumber: '1234567890',
      profileImage: 'mock-profile-image-data',
      createdAt: new Date(),
     updatedAt: new Date(),    
      password: 'mock-password', 
    };
    prismaMock.user.findUnique.mockResolvedValue(mockPrismaLoginResponse);
    const response = await request(app)
      .post('/api/user/login')
      .send(mockValidLoginPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe( "Invalid username or password" );
    expect(response.body.user).not.toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies).not.toBeDefined();
  });
})

describe('Get All Employees Endpoint Tests', ()=>{
  test('should fetch all student', async ()=>{
    const mockPrismaCreateResponse = [
      {
         id: 'mock-userid1',
        username: 'user1',
        email: 'test@example.com',
        role: "employee" as Role,
        mobileNumber: '1234567890',
        profileImage: 'mock-profile-image-data',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'mock-password',
      },
       {
        id: 'mock-userid2',
        username: 'user2',
        email: 'test2@example.com',
        role: "employee" as Role,
        mobileNumber: '1234567890',
        profileImage: 'mock-profile-image-data',
        createdAt: new Date(),
         updatedAt: new Date(),
        password: 'mock-password',
      },
    ]
    prismaMock.user.findMany.mockResolvedValue(mockPrismaCreateResponse);
    mockJwt.verify.mockReturnValue({
      id: 'mock-user',
 email: 'test@test.com',
      role: Role.manager,
    }as never)
     const response = await request(app)
      .get('/api/user/getAllEmployees')
      .set('Cookie', 'token=fake-token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Emloyees fetched successfuly",);
    expect(response.body.employees).toEqual(
      mockPrismaCreateResponse.map((object) => {
        return {
          ...object,
          createdAt: object.createdAt.toISOString(),
          updatedAt: object.updatedAt.toISOString(), 
        };
      })
    );
  })
})