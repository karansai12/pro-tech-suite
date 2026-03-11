import { createProject, deleteProject, getAllProjects, getProjectById, getProjectByUserId, updateProjectById } from "../controllers/porposal"
import { verifyToken } from "../midleware/auth"
import router from "./user"

router.post("/createProject",verifyToken,createProject)
router.get("/getAllProjects",verifyToken,getAllProjects)
router.get("/getProjectById/:projectId",verifyToken,getProjectById)
router.put("/updateProject/:projectId",verifyToken,updateProjectById)
router.delete("/deleteProject/:projectId",verifyToken,deleteProject)
router.get("/getProjectByUserId/:id",verifyToken,getProjectByUserId)