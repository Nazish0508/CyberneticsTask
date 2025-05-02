import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const DATABASE_URL = process.env.SUPABASE_URL || '';  // Make sure to set this in your .env file
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''; // Set this in your .env file

// Initialize Supabase client
const supabase = createClient(DATABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
