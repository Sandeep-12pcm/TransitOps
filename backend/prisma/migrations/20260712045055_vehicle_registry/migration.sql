-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('Available', 'On Trip', 'In Shop', 'Retired');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "maximumLoadCapacity" DOUBLE PRECISION NOT NULL,
    "odometer" DOUBLE PRECISION NOT NULL,
    "acquisitionCost" DOUBLE PRECISION NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");
