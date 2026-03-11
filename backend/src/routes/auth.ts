import { Router } from "express"
import { getAllEmployees, login, register } from "../controllers/user"
import { verifyToken } from "../midleware/auth"
import { createProposal, deleteProposal, getAllProposals, getProposalById, updateProposal } from "../controllers/projectProposalController"
import { createProject, deleteProject, getAllProjects, getProjectById, getProjectByUserId, updateProjectById } from "../controllers/projectController"
import { createTask, deleteTask, getAllTasks, getTaskById, getTaskByUserId, updateTask } from "../controllers/taskController"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/getAllEmployees", verifyToken, getAllEmployees)

router.get("/getAllProposals",verifyToken, getAllProposals)
router.post("/createProposal", verifyToken, createProposal)
router.get("/getProposalById/:proposalId", verifyToken, getProposalById)
router.put("/updateProposal/:proposalId",verifyToken,updateProposal)
router.delete("/deleteProposal/:proposalId",verifyToken,deleteProposal)

router.post("/createProject",verifyToken,createProject)
router.get("/getAllProjects",verifyToken,getAllProjects)
router.get("/getProjectById/:projectId",verifyToken,getProjectById)
router.put("/updateProject/:projectId",verifyToken,updateProjectById)
router.delete("/deleteProject/:projectId",verifyToken,deleteProject)
router.get("/getProjectByUserId/:id",verifyToken,getProjectByUserId)

router.post("/createTask",verifyToken,createTask)
router.get("/getAllTask",verifyToken,getAllTasks)
router.delete("/deleteTask",verifyToken,deleteTask)
router.get("/getTaskByUserId/:id",verifyToken,getTaskByUserId)
router.put("/updateTask",verifyToken,updateTask)
router.get("/getTaskById/:taskId",verifyToken,getTaskById)
export default router