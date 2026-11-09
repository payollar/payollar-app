-- Add chat card kinds for client briefs and delivery reports.
ALTER TYPE "BookingMessageKind" ADD VALUE IF NOT EXISTS 'BRIEF';
ALTER TYPE "BookingMessageKind" ADD VALUE IF NOT EXISTS 'REPORT';
