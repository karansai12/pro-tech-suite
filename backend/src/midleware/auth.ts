import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../controllers/userController";

dotenv.config();

const jwt_secret = process.env.JWT_SECRET!;
interface AuthPayload extends JwtPayload {
    user: User
}

interface CustomRequest extends Request {
    user?: AuthPayload;
}

// extend Request with user property via declaration merging in controllers where needed
export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || '';

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, jwt_secret)
        req.user = decoded as AuthPayload
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token", err });
    }
};
