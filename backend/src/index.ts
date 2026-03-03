import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth"
import cors from "cors"

dotenv.config()
const app = express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))


app.use("/api/auth",authRoutes)
app.listen(process.env.PORT, () => console.log(`server started at http://localhost:${process.env.PORT}`))