-- CreateEnum
CREATE TYPE "LoginAction" AS ENUM ('LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'TOKEN_REFRESH');

-- AlterTable
ALTER TABLE "login_history" ADD COLUMN     "action" "LoginAction" NOT NULL DEFAULT 'LOGIN';
