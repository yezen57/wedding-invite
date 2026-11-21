import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseServiceKey.includes("your-supabase")
);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// ============================================================================
// Local Fallback Store: Enables immediate testing of /host, /i/[token], /gate
// if Supabase credentials have not yet been added to .env.local
// ============================================================================
export type InvitationRecord = {
  id: string;
  token: string;
  guest_name: string | null;
  party_size: number;
  used_at: string | null;
  created_at: string;
};

const storeFile = path.resolve(process.cwd(), ".local-store.json");

function readLocalStore(): InvitationRecord[] {
  try {
    if (fs.existsSync(storeFile)) {
      return JSON.parse(fs.readFileSync(storeFile, "utf-8"));
    }
  } catch (e) {}
  return [];
}

function writeLocalStore(data: InvitationRecord[]) {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
}

export const db = {
  async getInvitations(): Promise<InvitationRecord[]> {
    if (supabaseServer) {
      const { data, error } = await supabaseServer
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return readLocalStore();
  },

  async getInvitationByToken(token: string): Promise<InvitationRecord | null> {
    if (supabaseServer) {
      const { data, error } = await supabaseServer
        .from("invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const list = readLocalStore();
    return list.find((it) => it.token === token) || null;
  },

  async createInvitation(record: Omit<InvitationRecord, "id" | "created_at" | "used_at">): Promise<InvitationRecord> {
    if (supabaseServer) {
      const { data, error } = await supabaseServer
        .from("invitations")
        .insert([{
          token: record.token,
          guest_name: record.guest_name,
          party_size: record.party_size,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const list = readLocalStore();
    const created: InvitationRecord = {
      id: "loc_" + Math.random().toString(36).substring(2, 9),
      token: record.token,
      guest_name: record.guest_name,
      party_size: record.party_size,
      used_at: null,
      created_at: new Date().toISOString(),
    };
    list.unshift(created);
    writeLocalStore(list);
    return created;
  },

  async deleteInvitation(id: string): Promise<boolean> {
    if (supabaseServer) {
      const { error } = await supabaseServer.from("invitations").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    const list = readLocalStore().filter((it) => it.id !== id);
    writeLocalStore(list);
    return true;
  },

  async reactivateInvitation(id: string): Promise<boolean> {
    if (supabaseServer) {
      const { error } = await supabaseServer.from("invitations").update({ used_at: null }).eq("id", id);
      if (error) throw error;
      return true;
    }
    const list = readLocalStore().map((it) => (it.id === id ? { ...it, used_at: null } : it));
    writeLocalStore(list);
    return true;
  },

  async scanAndBurn(token: string): Promise<{
    status: "allowed" | "already_used" | "invalid";
    guest_name?: string | null;
    party_size?: number;
    used_at?: string | null;
    token?: string;
  }> {
    if (supabaseServer) {
      // 1. Try RPC scan_invitation
      const { data, error } = await supabaseServer.rpc("scan_invitation", { token_input: token });
      if (!error && data) return data;

      // 2. Direct atomic SQL fallback if RPC not yet created
      const { data: updated, error: updateErr } = await supabaseServer
        .from("invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token)
        .is("used_at", null)
        .select()
        .maybeSingle();

      if (!updateErr && updated) {
        return {
          status: "allowed",
          guest_name: updated.guest_name,
          party_size: updated.party_size,
          used_at: updated.used_at,
          token: updated.token,
        };
      }

      // If not updated, check if it exists
      const { data: existing } = await supabaseServer
        .from("invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (existing) {
        return {
          status: "already_used",
          guest_name: existing.guest_name,
          party_size: existing.party_size,
          used_at: existing.used_at,
          token: existing.token,
        };
      }

      return { status: "invalid", token };
    }

    // Local Store atomic scan
    const list = readLocalStore();
    const item = list.find((it) => it.token === token);
    if (!item) {
      return { status: "invalid", token };
    }
    if (item.used_at) {
      return {
        status: "already_used",
        guest_name: item.guest_name,
        party_size: item.party_size,
        used_at: item.used_at,
        token: item.token,
      };
    }
    item.used_at = new Date().toISOString();
    writeLocalStore(list);
    return {
      status: "allowed",
      guest_name: item.guest_name,
      party_size: item.party_size,
      used_at: item.used_at,
      token: item.token,
    };
  },
};

