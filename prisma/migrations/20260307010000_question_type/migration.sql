-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionType" TEXT;

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");

