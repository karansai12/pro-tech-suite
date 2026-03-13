import express from "express"
import userRoutes from "./routes/user"
import projectRoutes from "./routes/project"
import proposalRoutes from "./routes/proposal"
import taskRoutes from "./routes/task"
import cors from "cors"
import cookieParser from "cookie-parser"

export const app = express()

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