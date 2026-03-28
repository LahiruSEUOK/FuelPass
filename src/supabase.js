import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqmwtlzvizwpsutklpsp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXd0bHp2aXp3cHN1dGtscHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NjA5MTQsImV4cCI6MjA5MDIzNjkxNH0.kHZKxr4ubGK5Hz6pN81D_Wgxc4tTFRKMwhnr1LHbe - g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);






