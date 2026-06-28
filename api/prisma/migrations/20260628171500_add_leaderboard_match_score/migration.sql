-- CreateTable
CREATE TABLE "LeaderboardMatchScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "matchName" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardMatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardMatchScore_userId_matchId_key" ON "LeaderboardMatchScore"("userId", "matchId");

-- CreateIndex
CREATE INDEX "LeaderboardMatchScore_matchId_idx" ON "LeaderboardMatchScore"("matchId");

-- CreateIndex
CREATE INDEX "LeaderboardMatchScore_userId_idx" ON "LeaderboardMatchScore"("userId");

-- AddForeignKey
ALTER TABLE "LeaderboardMatchScore" ADD CONSTRAINT "LeaderboardMatchScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
