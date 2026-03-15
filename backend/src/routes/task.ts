import { verifyToken } from "../midleware/auth"
import router from "./user"
import { createTask, deleteTask, getAllTasks, getTaskById, getTaskByUserId, updateTask } from "../controllers/task"

router.post("/createTask",verifyToken,createTask)
router.get("/getAllTask",verifyToken,getAllTasks)
router.delete("/deleteTask/:taskId",verifyToken,deleteTask)
router.get("/getTaskByUserId/:id",verifyToken,getTaskByUserId)
router.put("/updateTask/:taskId",verifyToken,updateTask)
router.get("/getTaskById/:taskId",verifyToken,getTaskById)

export default router