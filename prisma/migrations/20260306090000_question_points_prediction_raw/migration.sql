-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "pointsCorrect" INTEGER;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "pointsWrong" INTEGER;

-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "rawOutput" TEXT;

