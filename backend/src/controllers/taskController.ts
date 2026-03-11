import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Role } from "../generated/prismag/enums";

interface CustomeRequest extends Request {
    user?: {
        id: string
        username: string
        role: Role
    }
}

export const createTask = async (req:Request, res:Response) => {
  try {
    const {
      projectId,
      taskTitle,
      taskDescription,
      assignedTo,
      status,
      dueDate,
      startDate,
      priority,
    } = req.body;

    if (!projectId || !taskTitle || !taskDescription || !priority) {
      return res.status(400).json({ message: "projectId, taskTitle, taskDescription, and priority are required." });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        taskTitle,
        taskDescription,
        assignedTo: assignedTo || null,
        status: status || "open",
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        priority,
      },
    });

    return res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    return res.status(400).json({ message: "Failed to create task.", error });
  }
};

export const getAllTasks = async (req:Request, res:Response) => {
  try {
  
 const tasks = await prisma.task.findMany({
      include: {
        project: { select: { projectTitle: true } },
      },
    })

    if (!tasks) {
      return res.status(404).json({ message: "No tasks found." })
    }
    return res.status(200).json({sucess:true,tasks  });
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch tasks.", error });
  }
};

export const getTaskById = async (req:Request, res:Response) => {
  try {
    const { taskId } = req.params as {taskId : string}

    const task = await prisma.task.findUnique({
      where: { taskId },
      include: {
        project: { select: { projectTitle: true } },
        assignedUser: { select: { username: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch task.", error });
  }
};

export const deleteTask = async (req:Request, res:Response) => {
  try {
    const { taskId } = req.params as {taskId : string}

    const existing = await prisma.task.findUnique({ where: { taskId } });
    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }

    await prisma.task.delete({ where: { taskId } });

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    return res.status(400).json({ message: "Failed to delete task.", error });
  }
};

export const updateTask = async (req:CustomeRequest, res:Response) => {
  try {
    const { taskId } = req.params as {taskId : string}
    const {
      taskTitle,
      taskDescription,
      assignedTo,
      status,
      dueDate,
      startDate,
      completedDate,
      priority,
    } = req.body;
     
    const existing = await prisma.task.findUnique({ where: { taskId } });
    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }
   
   
    const isEmployee = req.user?.role === Role.employee;

    const updated = await prisma.task.update({
      where: { taskId },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(completedDate && { completedDate: new Date(completedDate) }),
        ...(status && { status }),
        
        ...(!isEmployee && taskTitle && { taskTitle }),
        ...(!isEmployee && taskDescription && { taskDescription }),
        ...(!isEmployee && assignedTo !== undefined && { assignedTo }),
        ...(!isEmployee && dueDate && { dueDate: new Date(dueDate) }),
        ...(!isEmployee && priority && { priority }),
      },
    });

    return res.status(200).json({ message: "Task updated successfully.", task: updated });
  } catch (error) {
    return res.status(400).json({ message: "Failed to update task.", error});
  }
};

export const getTaskByUserId = async (req:CustomeRequest, res:Response) => {
  try {
    const { userId } = req.params  as {userId : string}

    const tasks = await prisma.task.findMany({
      where: { assignedTo: userId },
      include: {
        project: { select: { projectTitle: true } },
      }
    });

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found for this user." });
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(400).json({ message: "Failed to fetch tasks.", error });
  }
};