// AniSense web pages: project settings.
//
// Fill these in once the Supabase project exists (the same two values as the
// app's .env). The publishable key is safe to publish: Row Level Security
// protects the data. NEVER put the secret / service_role key here.
//
// Until they are filled in, the delete-account page shows only the in-app
// steps and the support address, and hides its sign-in form, and the admin
// website (admin.html) says it isn't connected yet.
window.ANISENSE = {
  supabaseUrl: "https://lrlpkhbvqmajdrlzntev.supabase.co",       // https://xxxxxxxx.supabase.co
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybHBraGJ2cW1hamRybHpudGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMDgwOTQsImV4cCI6MjEwNjY4NDA5NH0.4EQkkDoa6OAiuwxeldKSy4eR7ehl2rwWZZkR3xw55ZQ",       // sb_publishable_...
  supportEmail: "AniSense2026@gmail.com",   // where a deletion or privacy request can be sent
  // The app's Google Play address, once it is published, e.g.
  // "https://play.google.com/store/apps/details?id=com.nuevaecija.anisense".
  // Empty: the website's badge says "Coming soon" and is not a link.
  playStoreUrl: "",
};
