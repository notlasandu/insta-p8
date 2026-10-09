import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://exkefrxudvgxymaulopu.supabase.co';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2Vmcnh1ZHZneHltYXVsb3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM4MzIsImV4cCI6MjEwMjk3OTgzMn0.YIgapOjJ59LTZ8bJjp4hDTPph5yOas3jtRzLgGUKbGQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});
