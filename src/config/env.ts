// Centralized environment variable configuration
// Use import.meta.env for Vite projects

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  APP_URL: import.meta.env.VITE_APP_URL || window.location.origin,
};

// Check for missing required variables
export const validateEnv = () => {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
  
  if (missing.length > 0 && import.meta.env.DEV) {
    console.warn(`Environment variables missing: ${missing.join(', ')}. Check .env.example`);
  }
  
  return missing.length === 0;
};
