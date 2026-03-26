-- Migration: add 'practice' to journal_entries type constraint
-- Run this in your Supabase SQL Editor if the table already exists

alter table journal_entries
  drop constraint if exists journal_entries_type_check;

alter table journal_entries
  add constraint journal_entries_type_check
  check (type in ('morning', 'evening', 'practice'));
