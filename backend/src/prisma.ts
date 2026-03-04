import dotenv from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prismag/client"

dotenv.config()

const connectionString = process.env.CONNECTION

const adapter = new PrismaPg({connectionString})
export const prisma = new PrismaClient({adapter})