-- AlterTable
ALTER TABLE "respondents" ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "paymentTypeOther" TEXT,
ADD COLUMN     "unitOther" TEXT;

-- CreateTable
CREATE TABLE "payment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_types_code_key" ON "payment_types"("code");

-- CreateIndex
CREATE INDEX "respondents_serviceType_idx" ON "respondents"("serviceType");
