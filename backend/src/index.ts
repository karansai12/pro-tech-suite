import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user"
import projectRoutes from "./routes/project"
import proposalRoutes from "./routes/proposal"
import taskRoutes from "./routes/task"
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
app.use("/api/user", userRoutes)
app.use("/api/project", projectRoutes)
app.use("/api/proposal", proposalRoutes)
app.use("/api/task", taskRoutes)

const port = process.env.PORT!
app.listen(Number(port) , "0.0.0.0", () => console.info(`server started at http://localhost:${process.env.PORT}`))