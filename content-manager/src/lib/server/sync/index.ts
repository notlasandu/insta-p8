import { createClient } from '@supabase/supabase-js';
import { resolveAccessToken, fetchInstagramData, fetchFacebookData } from './meta-client';
import { persistSyncData } from './supabase-writer';
import type { SyncResult } from './types';

const inFlightSyncs = new Map<string, Promise<SyncResult>>();

export function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || 'https://exkefrxudvgxymaulopu.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2Vmcnh1ZHZneHltYXVsb3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM4MzIsImV4cCI6MjEwMjk3OTgzMn0.YIgapOjJ59LTZ8bJjp4hDTPph5yOas3jtRzLgGUKbGQ';

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function syncAccount(accountId = 'copiumbuilder', force = false): Promise<SyncResult> {
  const existingSync = inFlightSyncs.get(accountId);
  if (existingSync) return existingSync;

  const syncPromise = executeAccountSync(accountId, force);
  inFlightSyncs.set(accountId, syncPromise);

  try {
    return await syncPromise;
  } finally {
    inFlightSyncs.delete(accountId);
  }
}

async function executeAccountSync(accountId: string, force: boolean): Promise<SyncResult> {
  const supabase = getServerSupabase();

  if (!force) {
    const { data: snapshot } = await supabase
      .from('account_latest_snapshots')
      .select('updated_at')
      .eq('account_id', accountId)
      .maybeSingle();

    if (snapshot?.updated_at) {
      const lastSyncTime = new Date(snapshot.updated_at).getTime();
      const oneHourMs = 60 * 60 * 1000;
      if (Date.now() - lastSyncTime < oneHourMs) {
        return {
          success: true,
          updated: false,
          reason: 'Data was fetched less than 1 hour ago',
          last_updated: snapshot.updated_at
        };
      }
    }
  }

  try {
    const token = await resolveAccessToken(supabase);
    const igAccountId = process.env.IG_ACCOUNT_ID || '17841423877461958';
    const fbPageId = process.env.FB_PAGE_ID || '1353894244476166';

    const [igData, fbData] = await Promise.all([
      fetchInstagramData(token, igAccountId),
      fetchFacebookData(token, fbPageId)
    ]);

    await persistSyncData(supabase, accountId, {
      igProfile: igData.profile,
      fbProfile: fbData.profile,
      igInsights: igData.insights,
      fbInsights: fbData.insights,
      igMedia: igData.media,
      fbPosts: fbData.posts,
      mediaInsights: igData.mediaInsights
    });

    const nowIso = new Date().toISOString();
    return {
      success: true,
      updated: true,
      last_updated: nowIso
    };
  } catch (err: any) {
    return {
      success: false,
      updated: false,
      error: err?.message || 'Unknown sync error'
    };
  }
}
