const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase configuration check:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Set (length: ' + supabaseServiceRoleKey.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Default client — has no user session attached. Fine for auth.getUser(token)
// (which only verifies the token) but NOT for any query that relies on RLS
// policies checking auth.uid(), since this client's requests carry no JWT.
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Service role client — bypasses RLS policies entirely. Use this for admin operations
// or for queries that need to access data regardless of user permissions (e.g., public rooms).
const supabaseServiceRole = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Per-request client — attaches the user's own access token as the
// Authorization header, so Postgres RLS policies see the real auth.uid()
// instead of NULL. Use this for any .from(...) query that touches a table
// with RLS policies scoped to the current user (messages, user_profiles, etc).
function getAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

module.exports = supabase;
module.exports.getAuthenticatedClient = getAuthenticatedClient;
module.exports.supabaseServiceRole = supabaseServiceRole;