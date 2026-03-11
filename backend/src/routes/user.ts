import { Router } from "express"
import { getAllEmployees, login, register } from "../controllers/user"
import { verifyToken } from "../midleware/auth"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/getAllEmployees", verifyToken, getAllEmployees)

export default router