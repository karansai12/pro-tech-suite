import { Router } from "express"
import { getAllEmployees, login, register } from "../controllers/userController"
import { verifyToken } from "../midleware/auth"
import { createProposal, getAllProposals, getProposalById } from "../controllers/projectProposalController"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/getAllEmployees", verifyToken, getAllEmployees)

router.get("/getAllProposals",verifyToken, getAllProposals)
router.post("/createProposal", verifyToken, createProposal)
router.get("/getProposalById/:proposalId", verifyToken, getProposalById)

export default router