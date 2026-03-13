import { Router } from "express"
import { getAllEmployees, login, register } from "../controllers/user"
import { verifyToken } from "../midleware/auth"
import { validateBody } from "../validation/validation"
import { RegisterSchema } from "../validation/schemas"

const router = Router()

router.post("/register", validateBody(RegisterSchema), register)
router.post("/login", validateBody(RegisterSchema), login)
router.get("/getAllEmployees", verifyToken, getAllEmployees)

export default router