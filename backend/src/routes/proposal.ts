import { createProposal, deleteProposal, getAllProposals, getProposalById, updateProposal } from "../controllers/proposal"
import { verifyToken } from "../midleware/auth"
import router from "./user"

router.get("/getAllProposals",verifyToken, getAllProposals)
router.post("/createProposal", verifyToken, createProposal)
router.get("/getProposalById/:proposalId", verifyToken, getProposalById)
router.put("/updateProposal/:proposalId",verifyToken,updateProposal)
router.delete("/deleteProposal/:proposalId",verifyToken,deleteProposal)

export default router