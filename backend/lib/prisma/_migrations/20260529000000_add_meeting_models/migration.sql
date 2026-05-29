-- Add missing Role values (safe - ADD VALUE is idempotent in Postgres 12+)
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'INSTRUCTOR';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STUDENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add otpExpire column to User if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='User' AND column_name='otpExpire'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "otpExpire" TIMESTAMP(3);
  END IF;
END $$;

-- Create new ENUMs (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MeetingPlatform" AS ENUM ('NEUROMEET', 'ZOOM', 'GOOGLE_MEET');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'CO_HOST', 'PARTICIPANT', 'OBSERVER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create Meeting table
CREATE TABLE IF NOT EXISTS "Meeting" (
    "id"              TEXT NOT NULL,
    "hostId"          TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "livekitRoomName" TEXT,
    "livekitRoomSid"  TEXT,
    "joinToken"       TEXT,
    "status"          "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "platform"        "MeetingPlatform" NOT NULL DEFAULT 'NEUROMEET',
    "scheduledAt"     TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "startedAt"       TIMESTAMP(3),
    "endedAt"         TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Meeting_hostId_idx" ON "Meeting"("hostId");
CREATE INDEX IF NOT EXISTS "Meeting_status_idx" ON "Meeting"("status");

-- Create MeetingParticipant table
CREATE TABLE IF NOT EXISTS "MeetingParticipant" (
    "id"                 TEXT NOT NULL,
    "meetingId"          TEXT NOT NULL,
    "userId"             TEXT NOT NULL,
    "role"               "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "consentGiven"       BOOLEAN NOT NULL DEFAULT false,
    "joinedAt"           TIMESTAMP(3),
    "leftAt"             TIMESTAMP(3),
    "secondsPresent"     INTEGER NOT NULL DEFAULT 0,
    "avgEngagementScore" DOUBLE PRECISION,
    "adhdFlagged"        BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MeetingParticipant_meetingId_userId_key"
  ON "MeetingParticipant"("meetingId", "userId");
CREATE INDEX IF NOT EXISTS "MeetingParticipant_meetingId_idx" ON "MeetingParticipant"("meetingId");
CREATE INDEX IF NOT EXISTS "MeetingParticipant_userId_idx" ON "MeetingParticipant"("userId");

-- Create MeetingMaterial table
CREATE TABLE IF NOT EXISTS "MeetingMaterial" (
    "id"           TEXT NOT NULL,
    "meetingId"    TEXT NOT NULL,
    "uploadedBy"   TEXT NOT NULL,
    "driveFileId"  TEXT,
    "driveViewUrl" TEXT,
    "fileName"     TEXT NOT NULL,
    "mimeType"     TEXT,
    "sizeBytes"    INTEGER,
    "uploadedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingMaterial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MeetingMaterial_meetingId_idx" ON "MeetingMaterial"("meetingId");

-- Foreign Keys (safe: skip if already exists)
DO $$ BEGIN
  ALTER TABLE "Meeting"
    ADD CONSTRAINT "Meeting_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MeetingParticipant"
    ADD CONSTRAINT "MeetingParticipant_meetingId_fkey"
    FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MeetingParticipant"
    ADD CONSTRAINT "MeetingParticipant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MeetingMaterial"
    ADD CONSTRAINT "MeetingMaterial_meetingId_fkey"
    FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MeetingMaterial"
    ADD CONSTRAINT "MeetingMaterial_uploadedBy_fkey"
    FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
