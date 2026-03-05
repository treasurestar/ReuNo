-- ============================================================
-- Remove integração Google Calendar
-- Execute no Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

DROP TABLE IF EXISTS public.google_calendar_tokens CASCADE;
ALTER TABLE public.meetings DROP COLUMN IF EXISTS sync_google;
ALTER TABLE public.meetings DROP COLUMN IF EXISTS google_event_id;
