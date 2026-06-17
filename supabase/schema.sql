-- ============================================================
-- 營養深潛 — Supabase Database Schema
-- ============================================================

-- 1. Posts 文章資料表
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,                     -- 文章標題
  slug text unique not null,               -- 網址路徑 (例如: vitamin-d-guide)
  youtube_video_id text not null,          -- YouTube 影片 ID (例如: dQw4w9WgXcQ)
  content text,                            -- 主要內文 (支援 Markdown 格式)
  nutrients jsonb default '[]'::jsonb,     -- 標籤或核心營養素 (例如: ["維生素D", "鈣"])
  "references" jsonb default '[]'::jsonb,    -- 文獻來源清單 (儲存標題與連結的陣列)
  download_url text,                       -- 每日營養卡等檔案的下載路徑
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles 使用者資料表 (與 auth.users 關聯)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 3. 自動建立 profile 的觸發器（新用戶註冊時自動觸發）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 安全建立觸發器
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Comments 留言資料表
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security (RLS) 政策
-- ============================================================

-- Posts: 所有人可讀
alter table posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on posts;
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

-- Profiles: 所有人可讀, 使用者可更新自己的 profile
alter table profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Comments: 所有人可讀, 登入使用者可新增, 使用者可刪除自己的留言
alter table comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on comments;
create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

drop policy if exists "Authenticated users can insert comments" on comments;
create policy "Authenticated users can insert comments"
  on comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on comments;
create policy "Users can delete their own comments"
  on comments for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 索引 (提升查詢效能)
-- ============================================================

create index if not exists idx_posts_slug on posts(slug);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_comments_created_at on comments(created_at desc);

-- ============================================================
-- 5. Nutrition Resources 營養小工具與檔案資料表
-- ============================================================

create table if not exists public.nutrition_resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,                     -- 資源/工具名稱 (例如: 每日建議營養卡 (DRIs))
  description text,                        -- 資源詳細描述
  category text not null,                  -- 分類 (calculator, pdf, chart)
  file_path text,                          -- 儲存在 Supabase Storage 中的路徑 (例如: tw_dris_handbook.pdf)
  file_size text,                          -- 檔案大小 (例如: 4.8 MB)
  download_count integer default 0 not null, -- 下載/使用次數
  is_interactive boolean default false not null, -- 是否為互動工具
  interactive_id text,                     -- 互動工具 ID (例如: daily-nutrition-card)
  requires_auth boolean default false not null, -- 是否需要登入才能下載/使用
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_nutrition_resources_category on public.nutrition_resources(category);

-- 啟用 RLS
alter table public.nutrition_resources enable row level security;

-- 任何人都可以查詢資源清單
drop policy if exists "Nutrition resources are viewable by everyone" on public.nutrition_resources;
create policy "Nutrition resources are viewable by everyone"
  on public.nutrition_resources for select
  using (true);

-- 僅限管理員/已登入帳戶可以編輯
drop policy if exists "Only authenticated users can modify nutrition resources" on public.nutrition_resources;
create policy "Only authenticated users can modify nutrition resources"
  on public.nutrition_resources for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 6. Supabase Storage 儲存槽初始化與權限設定
-- ============================================================

-- 自動註冊儲存槽 (如果尚未建立的話)
insert into storage.buckets (id, name, public)
values ('nutrition-files', 'nutrition-files', true)
on conflict (id) do nothing;

-- 儲存槽的 RLS 政策 (防止報錯先刪除舊政策)
drop policy if exists "Public Access to Read Files" on storage.objects;
create policy "Public Access to Read Files"
  on storage.objects for select
  using ( bucket_id = 'nutrition-files' );

drop policy if exists "Authenticated Users Can Upload Files" on storage.objects;
create policy "Authenticated Users Can Upload Files"
  on storage.objects for insert
  with check ( bucket_id = 'nutrition-files' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated Users Can Update Files" on storage.objects;
create policy "Authenticated Users Can Update Files"
  on storage.objects for update
  using ( bucket_id = 'nutrition-files' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated Users Can Delete Files" on storage.objects;
create policy "Authenticated Users Can Delete Files"
  on storage.objects for delete
  using ( bucket_id = 'nutrition-files' and auth.role() = 'authenticated' );

-- ============================================================
-- 7. 輔助函數 (RPC Functions)
-- ============================================================

-- 下載次數自動加 1 函數
create or replace function public.increment_download_count(resource_id uuid)
returns void as $$
begin
  update public.nutrition_resources
  set download_count = download_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 8. 預設種子資料 (Seed Data)
-- ============================================================

insert into public.nutrition_resources (id, title, description, category, file_path, file_size, is_interactive, interactive_id, requires_auth, download_count)
values
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '每日建議營養卡 (DRIs)', '依據你的年齡、性別與參考標準，精準計算每日建議營養素攝取量，並生成專屬的個人營養卡片。', 'calculator', null, null, true, 'daily-nutrition-card', false, 128),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '台灣膳食營養素參考攝取量 (DRIs) 手冊', '衛生福利部國民健康署官方最新版成人與兒童 DRIs 參考手冊，包含各營養素之建議與上限攝取標準。', 'pdf', 'tw_dris_handbook.pdf', '4.8 MB', false, null, false, 85),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '臨床實證維生素 D3/K2 協同補給指引', '深入探討維生素 D3 與 K2 的協同吸收效應，以及對於人體骨骼與免疫系統健康之實證影響。', 'pdf', 'vitamin_d_k2_guide.pdf', '1.5 MB', false, null, true, 42),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', '高蛋白減脂飲食分配與換算圖表', '幫助你在熱量赤字期間，依據體重與每日活動量精準分配與換算碳水、脂肪與蛋白質攝取比例之圖表。', 'chart', 'protein_fat_ratio_chart.pdf', '850 KB', false, null, false, 156),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', '常見微量元素缺乏自我評估清單', '整理缺鐵、缺鈣、缺鎂、缺鋅等常見微量營養素缺乏時，身體發出的早期警訊與飲食盲點自我檢視表。', 'pdf', 'micronutrient_checklist.pdf', '1.1 MB', false, null, true, 61)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  file_path = excluded.file_path,
  file_size = excluded.file_size,
  is_interactive = excluded.is_interactive,
  interactive_id = excluded.interactive_id,
  requires_auth = excluded.requires_auth;

