-- CreateTable
CREATE TABLE "LeaderboardScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "correctAnswersCount" INTEGER NOT NULL DEFAULT 0,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardScore_userId_key" ON "LeaderboardScore"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardScore_score_idx" ON "LeaderboardScore"("score");

-- CreateIndex
CREATE INDEX "LeaderboardScore_snapshotAt_idx" ON "LeaderboardScore"("snapshotAt");

-- AddForeignKey
ALTER TABLE "LeaderboardScore" ADD CONSTRAINT "LeaderboardScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
