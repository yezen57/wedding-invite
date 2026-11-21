-- ========================================================
-- Zaid & Arwa Wedding Invitation Database Schema
-- Paste directly into the Supabase SQL Editor
-- ========================================================

-- Enable pgcrypto for UUID generation if not already active
create extension if not exists "pgcrypto";

-- 1. Invitations Table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  guest_name text,
  party_size int not null default 1 check (party_size between 1 and 20),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for instant lookup and scanning
create index if not exists idx_invitations_token on public.invitations (token);
create index if not exists idx_invitations_used_at on public.invitations (used_at);

-- 2. RSVPs Table (Phase 2)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete set null,
  name text not null,
  attending boolean not null,
  message text,
  created_at timestamptz not null default now()
);

-- Index for rsvps
create index if not exists idx_rsvps_created_at on public.rsvps (created_at desc);

-- 3. Atomic Scan & Burn RPC Function
-- Guarantees atomic burning: single round-trip, race-condition free.
-- Can be called via supabase.rpc('scan_invitation', { token_input: '...' })
create or replace function public.scan_invitation(token_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_invite record;
begin
  -- Step 1: Atomic burn - update only if token exists and used_at is null
  update public.invitations
  set used_at = now()
  where token = token_input and used_at is null
  returning * into v_invite;

  if found then
    return jsonb_build_object(
      'status', 'allowed',
      'guest_name', v_invite.guest_name,
      'party_size', v_invite.party_size,
      'used_at', v_invite.used_at,
      'token', v_invite.token
    );
  end if;

  -- Step 2: If no row was updated, inspect why (already used vs invalid)
  select * into v_invite from public.invitations where token = token_input limit 1;

  if found then
    return jsonb_build_object(
      'status', 'already_used',
      'guest_name', v_invite.guest_name,
      'party_size', v_invite.party_size,
      'used_at', v_invite.used_at,
      'token', v_invite.token
    );
  else
    return jsonb_build_object(
      'status', 'invalid',
      'token', token_input
    );
  end if;
end;
$$;

-- Revoke public access to raw tables, server uses service_role key
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

