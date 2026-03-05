import { Router } from "express"
import { login, register } from "../controllers/auth"
import { verifyToken } from "../midleware/auth"

const router = Router()

router.post("/register", verifyToken, register)
router.post("/login",verifyToken,login)

export default router