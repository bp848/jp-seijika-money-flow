import { supabase } from "./supabase-client"

/**
 * This is a workaround to satisfy imports expecting a 'prisma' default export.
 * Be aware that this exports a Supabase client instance, not a Prisma client.
 *
 * If your code relies on Prisma-specific methods, you will encounter runtime errors.
 * You should refactor the code that imports 'prisma' to use Supabase client syntax
 * or implement a proper Prisma setup if Prisma is indeed required.
 */
const prisma = supabase

export default prisma
