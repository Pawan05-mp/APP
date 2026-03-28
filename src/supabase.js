import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypicbilajipxjgkqxuht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaWNiaWxhamlweGpna3F4dWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDgwMDMsImV4cCI6MjA5MDI4NDAwM30.ltRXNrPq4T0sknopDiyUXkcP9BxTsnXuLk7H3xdPAOk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
