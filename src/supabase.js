import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqmwtlzvizwpsutklpsp.supabase.co';
const supabaseAnonKey = 'YOUR_REAL_KEY_HERE'; // remove "- g"

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase config");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);