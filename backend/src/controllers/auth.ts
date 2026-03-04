import { Request, Response } from "express"
import { prisma } from "../prisma"
import bcrypt from 'bcrypt';

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
        const hashPasword = await bcrypt.hash(password, 12)
        // Create user
        const user = prisma.user.create({
            data: {
                email,
                password: hashPasword,
                role: role as "manager" | "employee"
            },
            select: { id: true, email: true, role: true, createdAt: true }
        })
        res.status(201).json({ success: true, message: "Registration success", data: {} })
    } catch (error) {
 console.error(error);
    res.status(500).json({ message: 'Registration failed' });
    }
    finally{
        await prisma.$disconnect()
    }
}