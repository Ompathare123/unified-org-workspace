-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM';
