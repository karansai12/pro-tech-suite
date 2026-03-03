import { Router } from "express"
import { register } from "../controllers/auth"
import { verifyToken } from "../midleware/auth"

const router = Router()

router.post("/register", verifyToken, register)


export default router