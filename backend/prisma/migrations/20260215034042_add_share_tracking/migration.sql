-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "sharedToBluesky" TIMESTAMP(3),
ADD COLUMN     "sharedToInstagram" TIMESTAMP(3),
ADD COLUMN     "sharedToX" TIMESTAMP(3);
