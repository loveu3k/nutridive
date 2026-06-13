-- ============================================================
-- 營養深潛 — Supabase Database Schema
-- ============================================================

-- 1. Posts 文章資料表
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,                     -- 文章標題
  slug text unique not null,               -- 網址路徑 (例如: vitamin-d-guide)
  youtube_video_id text not null,          -- YouTube 影片 ID (例如: dQw4w9WgXcQ)
  content text,                            -- 主要內文 (支援 Markdown 格式)
  nutrients jsonb default '[]'::jsonb,     -- 標籤或核心營養素 (例如: ["維生素D", "鈣"])
  references jsonb default '[]'::jsonb,    -- 文獻來源清單 (儲存標題與連結的陣列)
  download_url text,                       -- 每日營養卡等檔案的下載路徑
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles 使用者資料表 (與 auth.users 關聯)
create table profiles (
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Comments 留言資料表
create table comments (
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

create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

-- Profiles: 所有人可讀, 使用者可更新自己的 profile
alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Comments: 所有人可讀, 登入使用者可新增, 使用者可刪除自己的留言
alter table comments enable row level security;

create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Authenticated users can insert comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 索引 (提升查詢效能)
-- ============================================================

create index idx_posts_slug on posts(slug);
create index idx_posts_created_at on posts(created_at desc);
create index idx_comments_post_id on comments(post_id);
create index idx_comments_created_at on comments(created_at desc);
