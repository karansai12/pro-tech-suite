import { Request, Response, CookieOptions } from "express"
import { prisma } from "../prisma"
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import { Role } from "../generated/prismag/enums";

dotenv.config()

const jwt_secret = process.env.JWT_SECRET!
const saltRounds = 12
const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
}

const generateToken = (payload: string | object | Buffer<ArrayBufferLike>) => {
    return jwt.sign(payload, jwt_secret, { expiresIn: "1d" })
}

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role,username,profileImage } = req.body
        if (!email || !password || !role || !username || !profileImage) {
          return  res.status(400).json({ success: false, message: "All fields are required" })
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "Email already exist" })
        }
        // Hash password
        const hashPasword = await bcrypt.hash(password, saltRounds)
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashPasword,
                role: role as Role,
                username,
                profileImage
            },
            select: { id: true, email: true, role: true, createdAt: true,username:true,profileImage:true }
        })

        const payload = { email: user.email, role: user.role,username: user.username,profileImage:user.profileImage }
        const token = generateToken(payload)
        res.cookie("token", token, cookieOptions)
        return res.status(201).json({ success: true, message: "Registration success", user  })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Registration failed' });
    }
    finally {
        await prisma.$disconnect()
    }
}
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No user exist" })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid username or password" })
    }

    const payload = {
      email: user.email,
      role: user.role,
      username: user.username,
    }

    const token = generateToken(payload)

    res.cookie("token", token, cookieOptions)

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
    })

  } catch (error) {
    return res.status(500).json({ message: "Login failed",error })
  } finally {
    await prisma.$disconnect()
  }
}