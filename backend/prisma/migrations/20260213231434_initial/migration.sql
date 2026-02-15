-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "photoIpfsUrl" TEXT NOT NULL,
    "photoGatewayUrl" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "xHandle" TEXT,
    "instagramHandle" TEXT,
    "blueskyHandle" TEXT,
    "email" TEXT,
    "walletAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "mintTxHash" TEXT,
    "mintedToCollection" TEXT,
    "tokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 137,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NftCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_walletAddress_idx" ON "Submission"("walletAddress");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NftCollection_contractAddress_chainId_key" ON "NftCollection"("contractAddress", "chainId");
