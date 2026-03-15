import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Role } from "@prisma/client";

interface CustomeRequest extends Request {
    user?: {
        id: string
        username: string
        role: Role
    }
}

// Helper function to serialize dates in response
const serializeDates = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serializeDates);
    if (typeof obj === 'object') {
        const serialized: Record<string, unknown> = {};
        for (const key in obj) {
            serialized[key] = serializeDates((obj as Record<string, unknown>)[key]);
        }
        return serialized;
    }
    return obj;
};

interface ValidationError {
    field: string;
    message: string;
}

// Validation helper
const validateTaskCreation = (body: unknown): ValidationError[] => {
    const errors: ValidationError[] = [];
    const input = body as Record<string, unknown>;
    if (!input.projectId) errors.push({ field: "projectId", message: "projectId is required" });
    if (!input.taskTitle) errors.push({ field: "taskTitle", message: "taskTitle is required" });
    if (!input.taskDescription) errors.push({ field: "taskDescription", message: "taskDescription is required" });
    if (!input.priority) errors.push({ field: "priority", message: "priority is required" });
    return errors;
};

export const createTask = async (req: Request, res: Response) => {
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

        // Validate required fields
        const validationErrors = validateTaskCreation(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: validationErrors
            });
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

        return res.status(201).json({
            success: true,
            message: "Task created successfully.",
            task: serializeDates(task)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to create task.",
            error
        });
    }
};

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                project: { select: { projectTitle: true } },
            },
        });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found." });
        }
        return res.status(200).json({ success: true, tasks: serializeDates(tasks) });
    } catch (error) {
        return res.status(400).json({ message: "Failed to fetch tasks.", error });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params as { taskId: string };

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

        return res.status(200).json(serializeDates(task));
    } catch (error) {
        return res.status(400).json({ message: "Failed to fetch task.", error });
    }
};

export const deleteTask = async (req: CustomeRequest, res: Response) => {
    try {
        const { taskId } = req.params as { taskId: string };

        if (!taskId) {
            return res.status(400).json({ success: false, message: "Task ID is required" });
        }

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

export const updateTask = async (req: CustomeRequest, res: Response) => {
    try {
        const { taskId } = req.params as { taskId: string };
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

        return res.status(200).json({
            success: true,
            message: "Task updated successfully.",
            task: serializeDates(updated)
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Failed to update task.", error });
    }
};

export const getTaskByUserId = async (req: CustomeRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const tasks = await prisma.task.findMany({
            where: { assignedTo: id },
            include: {
                project: { select: { projectTitle: true } },
            }
        });

        if (!tasks.length) {
            return res.status(404).json({ message: "No tasks found for this user." });
        }

        return res.status(200).json({ tasks: serializeDates(tasks) });
    } catch (error) {
        return res.status(400).json({ message: "Failed to fetch tasks.", error });
    }
};