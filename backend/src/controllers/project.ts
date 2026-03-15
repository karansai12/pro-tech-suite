import { Request, Response } from "express"
import { prisma } from "../prisma";

export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      proposalId,
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      frontEndTechStack,
      backendEndTechStack,
      database,
    
    } = req.body;

    if (!proposalId || !projectTitle || !startDate || !endDate || !frontEndTechStack || !backendEndTechStack || !database) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }
    const existingProposal = await prisma.projectProposal.findUnique({
      where: { proposalId }
    })
    if (!existingProposal) {
      return res.status(404).json({ message: "Proposal not found." })
    }
    if (existingProposal.status === "pending") {
      await prisma.projectProposal.update({
        where: { proposalId },
        data: { status: "approved" },
      });
      const project = await prisma.project.create({
      data: {
        proposalId,
        projectTitle,
        projectDescription,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frontEndTechStack,
        backendEndTechStack,
        database,
      },
    });
     return res.status(201).json({ success: true, message: "Project created successfully.", project });
    }else{
      return res.status(400).json({message:"proposal not in pending state"})
    }   
  } catch (error) {
    return res.status(400).json({ message: "Failed to create project.", error });
  }
}

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        proposal: { select: { proposalTitle: true, user: { select: { username: true } } } },
        tasks: true,
      },
    });
    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch projects.", error });
  }
};

export const getProjectById = async(req: Request, res: Response)=>{
  const {projectId} = req.params as {projectId :string}
  try {
      const project = await prisma.project.findUnique({
      where: { projectId },
      include: {
        proposal: { include: { user: { select: { username: true, email: true } } } },
        tasks: { include: { assignedUser: { select: { username: true } } } },
      
      },
    });
    if(!project){
      return res.status(400).json({message:"project id not found"})
    }
    return res.status(200).json({success:true,message:"project fetched",project})
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch project.", error})
  }
   
}

export const updateProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as {projectId :string}
    const {
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      status,
      frontEndTechStack,
      backendEndTechStack,
      database,
    } = req.body;

    const existing = await prisma.project.findUnique({ where: { projectId } });
    if (!existing) {
      return res.status(404).json({ message: "Project not found." });
    }

    const updated = await prisma.project.update({
      where: { projectId },
      data: {
        ...(projectTitle && { projectTitle }),
        ...(projectDescription && { projectDescription }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(frontEndTechStack && { frontEndTechStack }),
        ...(backendEndTechStack && { backendEndTechStack }),
        ...(database && { database }),
      },
    });

    return res.status(200).json({ message: "Project updated successfully.", project: updated });
  } catch (error) {
    return res.status(400).json({ message: "Failed to update project.", error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as {projectId :string}

    const existing = await prisma.project.findUnique({ where: { projectId } });
    if (!existing) {
      return res.status(404).json({ message: "Project not found." });
    }

    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { projectId } });

    return res.status(200).json({ message: "Project deleted successfully." ,projectId});
  } catch (error) {
    return res.status(400).json({ message: "Failed to delete project.", error });
  }
};

export const getProjectByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params  as {id :string}

    const projects = await prisma.project.findMany({
      where: {
        proposal: { userId: id },
      },
      include: {
        tasks: { include: { assignedUser: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found for this user." });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch projects.", error});
  }
};