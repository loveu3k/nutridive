import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your-supabase-url-here' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here';

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase 環境變數未設定。請在 .env 檔案中填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
  );
}

// 使用合法的 URL 格式避免 SDK 初始化錯誤
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://xyzplaceholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk5NjI4MDAsImV4cCI6MTk2NTUzODgwMH0.placeholder-key'
);

export { isConfigured };

