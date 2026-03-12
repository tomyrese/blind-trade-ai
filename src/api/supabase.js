import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project values
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const isConfigured = 
  SUPABASE_URL && 
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
  SUPABASE_URL.startsWith('http');

/**
 * Supabase Client Instance
 * Uses polyfills to ensure compatibility with React Native CLI environment.
 */
export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : {
      auth: {
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase is not configured' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase is not configured' } }),
        verifyOtp: async () => ({ data: null, error: { message: 'Supabase is not configured' } }),
        updateUser: async () => ({ data: null, error: { message: 'Supabase is not configured' } }),
      },
    };
