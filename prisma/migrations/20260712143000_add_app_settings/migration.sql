-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KILOMETERS', 'MILES');

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "depotName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "distanceUnit" "DistanceUnit" NOT NULL DEFAULT 'KILOMETERS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
