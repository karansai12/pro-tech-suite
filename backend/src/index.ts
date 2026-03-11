import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/user"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)

const port = process.env.PORT!
app.listen(Number(port) , "0.0.0.0", () => console.info(`server started at http://localhost:${process.env.PORT}`))