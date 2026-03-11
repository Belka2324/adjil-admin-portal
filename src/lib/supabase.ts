import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey);
};

// Create a dummy client for when Supabase is not configured
const createDummyClient = (): any => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
      admin: {
        createUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
        deleteUser: async () => ({ error: null }),
      },
    },
    from: () => ({
      select: async () => ({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      eq: function() { return this; },
      single: async function() { return { data: null, error: null }; },
    }),
    rpc: async () => ({ data: null, error: null }),
  };
};

// Create Supabase client only if configured
let supabase: SupabaseClient | any;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = createDummyClient();
  }
} else {
  supabase = createDummyClient();
  
  if (typeof window !== 'undefined') {
    console.info(
      'Supabase is not configured. Using localStorage fallback.\n' +
      'To enable Supabase, update your .env.local file with:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here\n' +
      'Then restart the development server.'
    );
  }
}

// Create Supabase admin client for server-side operations
let supabaseAdmin: SupabaseClient | any;

if (isSupabaseConfigured() && serviceRoleKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error);
    supabaseAdmin = createDummyClient();
  }
} else {
  supabaseAdmin = createDummyClient();
}

export { supabase, supabaseAdmin };
