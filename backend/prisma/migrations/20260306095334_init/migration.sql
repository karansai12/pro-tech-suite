-- CreateTable
CREATE TABLE "ProjectProposal" (
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalTitle" TEXT NOT NULL,
    "proposalDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectProposal_pkey" PRIMARY KEY ("proposalId")
);

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
