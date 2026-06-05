/*
  Warnings:

  - You are about to drop the column `teamA` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `teamB` on the `Match` table. All the data in the column will be lost.
  - Added the required column `teamAId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamBId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "teamA",
DROP COLUMN "teamB",
ADD COLUMN     "teamAId" TEXT NOT NULL,
ADD COLUMN     "teamBId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
