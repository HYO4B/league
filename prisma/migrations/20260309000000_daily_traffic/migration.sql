-- CreateTable
CREATE TABLE "DailyTraffic" (
    "dayKst" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTraffic_pkey" PRIMARY KEY ("dayKst")
);

-- CreateTable
CREATE TABLE "DailyVisitor" (
    "id" TEXT NOT NULL,
    "dayKst" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyVisitor_dayKst_idx" ON "DailyVisitor"("dayKst");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVisitor_dayKst_visitorHash_key" ON "DailyVisitor"("dayKst", "visitorHash");

