alter table public.calendar_events
  add column end_time time,
  add constraint calendar_events_end_after_start check (end_time is null or end_time > event_time);
