-- CreateTable
CREATE TABLE "Project" (
    "projectId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectDescription" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "frontEndTechStack" TEXT NOT NULL,
    "backendEndTechStack" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "Task" (
    "taskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("taskId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_proposalId_key" ON "Project"("proposalId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProjectProposal"("proposalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
