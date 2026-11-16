-- Migration Phase I: Database Persistence for Commercial, Cost Sheets, Weld Book and GED
-- Generated on 2026-11-16 for SARL SILEX SERVICES ERP

-- 1. Create Enums
CREATE TYPE "OpportunityStatus" AS ENUM ('NOUVELLE', 'QUALIFIEE', 'VISITE_TECHNIQUE', 'CHIFFRAGE', 'VALIDATION_INTERNE', 'OFFRE_SOUMISE', 'NEGOCIATION', 'GAGNEE', 'PERDUE', 'ANNULEE');
CREATE TYPE "CostSheetStatus" AS ENUM ('BROUILLON', 'PRETE_POUR_VALIDATION', 'EN_ATTENTE_DG', 'VALIDEE', 'REFUSEE', 'GAGNEE');
CREATE TYPE "CostSheetContributionDept" AS ENUM ('PROJET', 'ACHATS', 'RH', 'FINANCE');
CREATE TYPE "WeldJointStatus" AS ENUM ('EN_ATTENTE_CND', 'LIBERE_EPREUVE', 'REJETE', 'A_REPARER', 'REPARE_CONFORME');

-- 2. Create Opportunity Table
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "sector" "IndustrialSector" NOT NULL DEFAULT 'OIL_AND_GAS',
    "location" TEXT,
    "wilaya" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "estimatedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "winProbability" INTEGER NOT NULL DEFAULT 50,
    "weightedValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "assignedCommercialId" TEXT,
    "assignedCommercialName" TEXT,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'NOUVELLE',
    "priority" TEXT NOT NULL DEFAULT 'NORMALE',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionDeadline" TIMESTAMP(3),
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "sourceOrigin" TEXT DEFAULT 'DIRECT',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- 3. Create CostSheet Table
CREATE TABLE "CostSheet" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "sector" TEXT NOT NULL DEFAULT 'OIL_AND_GAS',
    "siteLocation" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "status" "CostSheetStatus" NOT NULL DEFAULT 'BROUILLON',
    "version" INTEGER NOT NULL DEFAULT 1,
    "totalDirectCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalIndirectCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalEstimatedCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "targetMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "proposedSellingPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "estimatedMarginValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "marginRateOnCost" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "markupRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "dgDecision" TEXT,
    "dgDecisionNotes" TEXT,
    "dgDecisionDate" TIMESTAMP(3),
    "dgDecisionBy" TEXT,
    "isImmutable" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostSheet_pkey" PRIMARY KEY ("id")
);

-- 4. Create CostSheetContribution Table
CREATE TABLE "CostSheetContribution" (
    "id" TEXT NOT NULL,
    "costSheetId" TEXT NOT NULL,
    "department" "CostSheetContributionDept" NOT NULL,
    "responsibleId" TEXT,
    "responsibleName" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "summaryNotes" TEXT,
    "dataPayload" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostSheetContribution_pkey" PRIMARY KEY ("id")
);

-- 5. Create CostSheetLine Table
CREATE TABLE "CostSheetLine" (
    "id" TEXT NOT NULL,
    "costSheetId" TEXT NOT NULL,
    "department" "CostSheetContributionDept" NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CostSheetLine_pkey" PRIMARY KEY ("id")
);

-- 6. Create CostSheetRevision Table
CREATE TABLE "CostSheetRevision" (
    "id" TEXT NOT NULL,
    "costSheetId" TEXT NOT NULL,
    "revisionNumber" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "reason" TEXT NOT NULL,
    "totalDirectCost" DECIMAL(15,2) NOT NULL,
    "totalEstimatedCost" DECIMAL(15,2) NOT NULL,
    "proposedSellingPrice" DECIMAL(15,2) NOT NULL,
    "marginValue" DECIMAL(15,2) NOT NULL,
    "deltaMarginDA" DECIMAL(15,2),
    "snapshotData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostSheetRevision_pkey" PRIMARY KEY ("id")
);

-- 7. Create WeldJoint Table
CREATE TABLE "WeldJoint" (
    "id" TEXT NOT NULL,
    "jointNumber" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "lineIso" TEXT NOT NULL,
    "spoolId" TEXT,
    "diameterNominal" TEXT NOT NULL,
    "thicknessMm" DECIMAL(6,2),
    "material" TEXT NOT NULL,
    "heatNumberPipe" TEXT,
    "heatNumberFitting" TEXT,
    "welderId" TEXT,
    "welderName" TEXT NOT NULL,
    "welderStamp" TEXT NOT NULL,
    "welderCqsRef" TEXT,
    "weldingProcess" TEXT NOT NULL,
    "dmosRef" TEXT NOT NULL,
    "weldDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visualInspection" TEXT NOT NULL DEFAULT 'CONFORME',
    "visualDate" TIMESTAMP(3),
    "visualInspector" TEXT,
    "cndType" TEXT,
    "cndRatePercent" INTEGER NOT NULL DEFAULT 100,
    "cndStatus" TEXT NOT NULL DEFAULT 'EN_ATTENTE_CND',
    "cndReportRef" TEXT,
    "cndFilmRef" TEXT,
    "cndControlDate" TIMESTAMP(3),
    "cndControllingBody" TEXT,
    "status" "WeldJointStatus" NOT NULL DEFAULT 'EN_ATTENTE_CND',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeldJoint_pkey" PRIMARY KEY ("id")
);

-- 8. Create WeldRepair Table
CREATE TABLE "WeldRepair" (
    "id" TEXT NOT NULL,
    "weldJointId" TEXT NOT NULL,
    "repairIndex" INTEGER NOT NULL DEFAULT 1,
    "repairDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repairWelderStamp" TEXT NOT NULL,
    "repairWelderName" TEXT,
    "repairDmosRef" TEXT NOT NULL DEFAULT 'DMOS-REP-01',
    "postRepairCndStatus" TEXT NOT NULL DEFAULT 'CONFORME',
    "postRepairCndReportRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeldRepair_pkey" PRIMARY KEY ("id")
);

-- 9. Create DocumentRevision Table
CREATE TABLE "DocumentRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "changeNotes" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRevision_pkey" PRIMARY KEY ("id")
);

-- 10. Alter Existing Tables (Additive Columns)
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "opportunityId" TEXT;
ALTER TABLE "NonConformity" ADD COLUMN IF NOT EXISTS "weldJointId" TEXT;
ALTER TABLE "NonConformity" ADD COLUMN IF NOT EXISTS "weldJointNumber" TEXT;

-- 11. Create Unique Constraints & Indexes
CREATE UNIQUE INDEX "Opportunity_code_key" ON "Opportunity"("code");
CREATE INDEX "Opportunity_code_idx" ON "Opportunity"("code");
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");
CREATE INDEX "Opportunity_clientName_idx" ON "Opportunity"("clientName");

CREATE UNIQUE INDEX "CostSheet_reference_key" ON "CostSheet"("reference");
CREATE INDEX "CostSheet_reference_idx" ON "CostSheet"("reference");
CREATE INDEX "CostSheet_opportunityId_idx" ON "CostSheet"("opportunityId");
CREATE INDEX "CostSheet_status_idx" ON "CostSheet"("status");

CREATE UNIQUE INDEX "CostSheetContribution_costSheetId_department_key" ON "CostSheetContribution"("costSheetId", "department");
CREATE INDEX "CostSheetContribution_costSheetId_idx" ON "CostSheetContribution"("costSheetId");

CREATE INDEX "CostSheetLine_costSheetId_idx" ON "CostSheetLine"("costSheetId");
CREATE INDEX "CostSheetLine_department_idx" ON "CostSheetLine"("department");

CREATE INDEX "CostSheetRevision_costSheetId_idx" ON "CostSheetRevision"("costSheetId");

CREATE UNIQUE INDEX "WeldJoint_jointNumber_key" ON "WeldJoint"("jointNumber");
CREATE INDEX "WeldJoint_jointNumber_idx" ON "WeldJoint"("jointNumber");
CREATE INDEX "WeldJoint_projectId_idx" ON "WeldJoint"("projectId");
CREATE INDEX "WeldJoint_welderStamp_idx" ON "WeldJoint"("welderStamp");
CREATE INDEX "WeldJoint_status_idx" ON "WeldJoint"("status");

CREATE INDEX "WeldRepair_weldJointId_idx" ON "WeldRepair"("weldJointId");
CREATE INDEX "DocumentRevision_documentId_idx" ON "DocumentRevision"("documentId");

CREATE UNIQUE INDEX IF NOT EXISTS "Project_opportunityId_key" ON "Project"("opportunityId");

-- 12. Add Foreign Keys
ALTER TABLE "Project" ADD CONSTRAINT "Project_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CostSheet" ADD CONSTRAINT "CostSheet_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CostSheetContribution" ADD CONSTRAINT "CostSheetContribution_costSheetId_fkey" FOREIGN KEY ("costSheetId") REFERENCES "CostSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CostSheetLine" ADD CONSTRAINT "CostSheetLine_costSheetId_fkey" FOREIGN KEY ("costSheetId") REFERENCES "CostSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CostSheetRevision" ADD CONSTRAINT "CostSheetRevision_costSheetId_fkey" FOREIGN KEY ("costSheetId") REFERENCES "CostSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeldJoint" ADD CONSTRAINT "WeldJoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeldJoint" ADD CONSTRAINT "WeldJoint_welderId_fkey" FOREIGN KEY ("welderId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WeldRepair" ADD CONSTRAINT "WeldRepair_weldJointId_fkey" FOREIGN KEY ("weldJointId") REFERENCES "WeldJoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NonConformity" ADD CONSTRAINT "NonConformity_weldJointId_fkey" FOREIGN KEY ("weldJointId") REFERENCES "WeldJoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentRevision" ADD CONSTRAINT "DocumentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
