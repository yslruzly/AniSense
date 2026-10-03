// AniSense web pages: project settings.
//
// Fill these in once the Supabase project exists (the same two values as the
// app's .env). The publishable key is safe to publish: Row Level Security
// protects the data. NEVER put the secret / service_role key here.
//
// Until they are filled in, the delete-account page shows only the in-app
// steps and the support address, and hides its sign-in form.
window.ANISENSE = {
  supabaseUrl: "",       // https://xxxxxxxx.supabase.co
  supabaseKey: "",       // sb_publishable_...
  supportEmail: "AniSense2026@gmail.com",   // where a deletion or privacy request can be sent
};
