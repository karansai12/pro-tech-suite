import { readFile } from 'fs/promises';
import { join } from 'path';

import express from "express"
import userRoutes from "./routes/user"
import projectRoutes from "./routes/project"
import proposalRoutes from "./routes/proposal"
import taskRoutes from "./routes/task"
import cors from "cors"
import cookieParser from "cookie-parser"

export const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/ping', async (req, res) => {
    try {
        const commitInfoPath = join(process.cwd(), 'commit-info.json');
        let commitInfo = null;
        try {
            const data = await readFile(commitInfoPath, 'utf-8');
            commitInfo = JSON.parse(data);

            // Convert timestamps to human-readable IST format
            if (commitInfo.commitDate && commitInfo.commitDate !== 'unknown') {
                commitInfo.commitDate = new Date(commitInfo.commitDate).toLocaleString(
                    'en-IN',
                    {
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }
                );
            } else {
                commitInfo.commitDate = 'unknown';
            }

            if (commitInfo.buildTime && commitInfo.buildTime !== 'unknown') {
                commitInfo.buildTime = new Date(commitInfo.buildTime).toLocaleString(
                    'en-IN',
                    {
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }
                );
            } else {
                commitInfo.buildTime = 'unknown';
            }
        } catch {
            // commit-info.json not found or unreadable
            commitInfo = {
                commitHash: 'unknown',
                commitDate: 'unknown',
                buildTime: 'unknown',
            };
        }

        res.json({
            message: 'server is running',
            deployment: commitInfo,
        });
    } catch (error) {
        console.error('Error reading commit info:', error);
        res.json({
            message: 'server is running',
            deployment: {
                commitHash: 'unknown',
                commitDate: 'unknown',
                buildTime: 'unknown',
            },
        });
    }
});

app.use("/api/user", userRoutes)
app.use("/api/project", projectRoutes)
app.use("/api/proposal", proposalRoutes)
app.use("/api/task", taskRoutes)