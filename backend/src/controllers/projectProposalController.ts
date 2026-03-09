import { Request, Response } from "express"
import { prisma } from "../prisma"
import { Role } from "../generated/prismag/enums";

interface CustomeRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: Role

    }
}


export const getAllProposals = async (req: CustomeRequest, res: Response) => {

    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" })
        }
        if (req.user.role !== Role.manager) {
            return res.status(401).json({ message: "Not authorized" })
        }
        const proposals = await prisma.projectProposal.findMany()
        return res.status(200).json({ success: true, proposals })
    } catch (error) {
        return res.status(400).json({ message: "Failed to fetch proposals.", error })
    }
}

export const getProposalById = async (req: CustomeRequest, res: Response) => {

    try {
        const { proposalId } = req.params as { proposalId: string }
        const proposal = await prisma.projectProposal.findUnique({
            where: { proposalId },
            include: { user: { select: { username: true, email: true } } },
        });

        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found." });
        }

        return res.status(200).json(proposal);
    } catch (error) {
        return res.status(400).json({ message: "Failed to fetch proposal.", error });
    }
}

export const createProposal = async (req: CustomeRequest, res: Response) => {
    const { proposalTitle, proposalDescription } = req.body
    try {

        if (!proposalTitle || !proposalDescription) {
            return res.status(400).json({ message: "Title and Description missing" })
        }
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" })
        }

        const proposal = await prisma.projectProposal.create({
            data: {
                userId: req.user.id,
                proposalTitle,
                proposalDescription,
                status: "pending",
            }
        })
        return res.status(200).json({ message: "Proposal created successfully.", proposal })
    } catch (error) {
        console.error({ error })
        return res.status(400).json({ message: "Failed to create proposal.", error })
    }
}

export const updateProposal = async (req: CustomeRequest, res: Response) => {
    try {
        const { proposalId } = req.params as { proposalId: string }
        const { proposalTitle, proposalDescription, status } = req.body;
        const existing = await prisma.projectProposal.findUnique({ where: { proposalId } });
        if (!existing) {
            return res.status(404).json({ message: "Proposal not found." });
        }
        if (req.user?.role === Role.employee && existing.userId !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own proposals." });
        }
        const updated = await prisma.projectProposal.update({
            where: { proposalId },
            data: {
                ...(proposalTitle && { proposalTitle }),
                ...(proposalDescription && { proposalDescription }),
                // Only managers can change status
                ...(req.user?.role === Role.manager && status && { status }),
            },
        });

        return res.status(200).json({ message: "Proposal updated successfully.", updated })
    } catch (error) {
        return res.status(400).json({ message: "Failed to update proposal.", error })
    }
}

export const deleteProposal = async (req: CustomeRequest, res: Response) => {
    try {
        const { proposalId } = req.params as { proposalId: string }
        const existingProposal = await prisma.projectProposal.findUnique({ where: { proposalId } });
        if (!existingProposal) {
            return res.status(404).json({ message: "Proposal not found." });
        }
        if (req.user?.role === Role.employee && existingProposal?.userId !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own proposals." });
        }
        await prisma.projectProposal.delete({ where: { proposalId } });
        return res.status(200).json({ message: "Proposal deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: "Failed to delete proposal.", error })
    }
}