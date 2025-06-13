import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

export function createSupabaseBrowserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Server-side client for use in Server Actions and Route Handlers
// Note: Use createServerClient from @supabase/ssr for server components and pages if needed.
// For simple server actions, this direct client is often sufficient.
export function createSupabaseServerClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Fallback to anon key if service role key is not available, though service role is preferred for admin tasks
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not found, falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY for server client. This may have insufficient permissions.",
    )
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      // persistSession: false, // Typically false for service_role client
      // autoRefreshToken: false, // Typically false for service_role client
    },
  })
}
