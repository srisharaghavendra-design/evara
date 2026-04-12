import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://sqddpjsgtwblmkgxqyxe.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY || SUPABASE_ANON_KEY
);
export const getSender = (profile) => ({
  fromName: profile?.companies?.from_name || profile?.companies?.name || "evara",
  fromEmail: "hello@evarahq.com",
});
// Alias for legacy ANON_KEY usage across views
export const ANON_KEY = SUPABASE_ANON_KEY;
