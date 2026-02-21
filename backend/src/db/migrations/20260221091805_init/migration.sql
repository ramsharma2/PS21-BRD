-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "rawContent" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Source_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "isRelevant" BOOLEAN NOT NULL DEFAULT false,
    "relevanceScore" REAL,
    "chunkIndex" INTEGER NOT NULL,
    CONSTRAINT "Chunk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Extraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT,
    "citations" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Extraction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BRD" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "executiveSummary" TEXT NOT NULL,
    "businessObjectives" TEXT NOT NULL,
    "stakeholderAnalysis" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "functionalRequirements" TEXT NOT NULL,
    "nonFunctionalRequirements" TEXT NOT NULL,
    "assumptions" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "successMetrics" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "glossary" TEXT NOT NULL,
    "rtm" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BRD_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BRDVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brdId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "editNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BRDVersion_brdId_fkey" FOREIGN KEY ("brdId") REFERENCES "BRD" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conflict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "itemA" TEXT NOT NULL,
    "itemB" TEXT NOT NULL,
    "sourceA" TEXT NOT NULL,
    "sourceB" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "Conflict_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Source_projectId_idx" ON "Source"("projectId");

-- CreateIndex
CREATE INDEX "Source_sourceType_idx" ON "Source"("sourceType");

-- CreateIndex
CREATE INDEX "Chunk_projectId_idx" ON "Chunk"("projectId");

-- CreateIndex
CREATE INDEX "Chunk_sourceId_idx" ON "Chunk"("sourceId");

-- CreateIndex
CREATE INDEX "Chunk_isRelevant_idx" ON "Chunk"("isRelevant");

-- CreateIndex
CREATE INDEX "Extraction_projectId_idx" ON "Extraction"("projectId");

-- CreateIndex
CREATE INDEX "Extraction_category_idx" ON "Extraction"("category");

-- CreateIndex
CREATE UNIQUE INDEX "BRD_projectId_key" ON "BRD"("projectId");

-- CreateIndex
CREATE INDEX "BRD_projectId_idx" ON "BRD"("projectId");

-- CreateIndex
CREATE INDEX "BRDVersion_brdId_idx" ON "BRDVersion"("brdId");

-- CreateIndex
CREATE INDEX "BRDVersion_version_idx" ON "BRDVersion"("version");

-- CreateIndex
CREATE INDEX "Conflict_projectId_idx" ON "Conflict"("projectId");

-- CreateIndex
CREATE INDEX "Conflict_status_idx" ON "Conflict"("status");
