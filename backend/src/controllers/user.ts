import { Request, Response, CookieOptions } from "express"
import { prisma } from "../prisma"
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import { Role } from "@prisma/client";
import { RegisterSchema, LoginSchema } from "../validation/schemas";

dotenv.config()

const jwt_secret = process.env.JWT_SECRET!
const saltRounds = 12
const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  maxAge: 24 * 60 * 60 * 1000
}

// Helper function to serialize dates in response
const serializeDates = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serializeDates);
    if (typeof obj === 'object') {
        const serialized: Record<string, unknown> = {};
        for (const key in obj) {
            serialized[key] = serializeDates((obj as Record<string, unknown>)[key]);
        }
        return serialized;
    }
    return obj;
};

export interface User {
    id: string  
    email: string
    role: Role
    username: string
    profileImage?: string
    mobileNumber?: string
}
interface CustomRequest extends Request {
  user?: User
}

const generateToken = (payload: string | object | Buffer<ArrayBufferLike>) => {
  return jwt.sign(payload, jwt_secret, { expiresIn: "1d" })
}

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input using zod
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path[0] as string,
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors
      });
    }

    const { email, password, role, username, profileImage, mobileNumber } = parseResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exist" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        role: role as Role,
        username,
        profileImage,
        mobileNumber,
      },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        createdAt: true, 
        username: true, 
        profileImage: true,
        mobileNumber: true
      }
    });

    const payload = { id: user.id, email: user.email, role: user.role, username: user.username, profileImage: user.profileImage };
    const token = generateToken(payload);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ success: true, message: "Registration success", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Registration failed", error });
  }
  finally {
    await prisma.$disconnect();
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path[0] as string,
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors
      });
    }

    const { username, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "No user exist" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    }

    const token = generateToken(payload);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed", error });
  } finally {
    await prisma.$disconnect();
  }
}

export const getAllEmployees = async (req: CustomRequest, res: Response) => {
  const isManager = req.user?.role === Role.manager;
  if (!isManager) {
    return res.status(401).json({ message: "not authorized" });
  }
  const { sortBy, order, page, limit } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: Role.employee,
      },
      ...(sortBy ? { orderBy: { [sortBy as string]: order } } : {}),
      take: limitNum,
      skip: skip
    });

    // Serialize dates
    const serializedEmployees = serializeDates(employees);

    return res.status(200).json({ success: true, message: "Emloyees fetched successfuly", employees: serializedEmployees });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch employees", error });
  }
}