import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

// 示範資料（Supabase 未連線時使用）
const DEMO_POSTS = [
  {
    id: '1',
    title: '維生素 D 完全指南：為什麼你可能正在缺乏？',
    slug: 'vitamin-d-guide',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['維生素D', '鈣', '免疫力'],
    created_at: '2026-06-10T00:00:00Z',
  },
  {
    id: '2',
    title: 'Omega-3 脂肪酸：魚油真的有效嗎？最新研究解析',
    slug: 'omega-3-fish-oil',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['Omega-3', 'DHA', 'EPA'],
    created_at: '2026-06-08T00:00:00Z',
  },
  {
    id: '3',
    title: '腸道菌群與健康：益生菌的科學真相',
    slug: 'gut-microbiome',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['益生菌', '腸道健康', '免疫力'],
    created_at: '2026-06-06T00:00:00Z',
  },
  {
    id: '4',
    title: '間歇性斷食：科學支持的減重方法還是流行迷思？',
    slug: 'intermittent-fasting',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['代謝', '體重管理', '胰島素'],
    created_at: '2026-06-04T00:00:00Z',
  },
  {
    id: '5',
    title: '蛋白質攝取全攻略：你每天需要多少蛋白質？',
    slug: 'protein-intake-guide',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['蛋白質', '肌肉', '運動營養'],
    created_at: '2026-06-02T00:00:00Z',
  },
  {
    id: '6',
    title: '鎂元素：被忽略的重要礦物質',
    slug: 'magnesium-guide',
    youtube_video_id: 'dQw4w9WgXcQ',
    nutrients: ['鎂', '睡眠', '神經系統'],
    created_at: '2026-05-31T00:00:00Z',
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, youtube_video_id, nutrients, created_at')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setPosts(DEMO_POSTS);
        } else {
          setPosts(data);
        }
      } catch {
        // Supabase 未連線，使用示範資料
        setPosts(DEMO_POSTS);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          每 2 天更新
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-surface-900 mb-4">
          用
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            科學
          </span>
          探索營養的深度
        </h1>
        <p className="text-lg text-surface-500 max-w-2xl mx-auto leading-relaxed">
          每一期影片都以最新的科學文獻為基礎，帶你深入了解營養學的關鍵知識，
          讓健康決策不再靠感覺。
        </p>
      </section>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-video bg-surface-200" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-surface-200" />
                  <div className="h-5 w-12 rounded-full bg-surface-200" />
                </div>
                <div className="h-6 w-full rounded bg-surface-200" />
                <div className="h-4 w-32 rounded bg-surface-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
              <PostCard post={post} index={index} />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-surface-400 text-lg">目前還沒有文章，敬請期待！</p>
        </div>
      )}
    </div>
  );
}
