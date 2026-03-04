import { Request, Response, CookieOptions } from "express"
import { prisma } from "../prisma"
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from "jsonwebtoken"

dotenv.config()

const jwt_secret = process.env.JWT_SCRET!
const saltRounds = 12
const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
}

const genrateToken = (payload: string | object | Buffer<ArrayBufferLike>) => {
    return jwt.sign(payload, jwt_secret, { expiresIn: "1h" })
}

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and Password required" })
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
                role: role as "manager" | "employee"
            },
            select: { id: true, email: true, role: true, createdAt: true }
        })

        const payload = { email: user.email, role: user.role }
        const token = genrateToken(payload)
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