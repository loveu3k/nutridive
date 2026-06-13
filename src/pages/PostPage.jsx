import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import YouTubeEmbed from '../components/YouTubeEmbed';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ReferenceList from '../components/ReferenceList';
import CommentSection from '../components/CommentSection';

// 示範文章（Supabase 未連線時使用）
const DEMO_POST = {
  id: '1',
  title: '維生素 D 完全指南：為什麼你可能正在缺乏？',
  slug: 'vitamin-d-guide',
  youtube_video_id: 'dQw4w9WgXcQ',
  nutrients: ['維生素D', '鈣', '免疫力'],
  content: `## 什麼是維生素 D？

維生素 D 是一種脂溶性維生素，也被稱為「陽光維生素」，因為我們的身體可以在皮膚暴露於陽光（特別是 UVB 輻射）時自行合成。

### 維生素 D 的主要功能

- **骨骼健康**：幫助鈣和磷的吸收，維持骨骼密度
- **免疫調節**：調節先天性和適應性免疫反應
- **肌肉功能**：維持肌肉力量和協調性
- **情緒調節**：與血清素的產生有關

### 誰容易缺乏？

1. 長時間待在室內的人
2. 居住在高緯度地區的人
3. 深膚色族群
4. 老年人
5. 肥胖者（BMI > 30）

> **重要提醒**：補充維生素 D 前，建議先做血液檢測，了解自己的 25(OH)D 水平。

### 建議攝取量

| 年齡 | 每日建議量 (IU) |
|------|----------------|
| 0-12 個月 | 400 |
| 1-70 歲 | 600 |
| 70 歲以上 | 800 |

*部分專家建議成人每日攝取 1000-2000 IU，特別是在冬季或日照不足的情況下。*
`,
  references: [
    { title: 'Holick, M. F. (2007). Vitamin D deficiency. New England Journal of Medicine, 357(3), 266-281.', url: 'https://doi.org/10.1056/NEJMra070553' },
    { title: 'Aranow, C. (2011). Vitamin D and the immune system. Journal of Investigative Medicine, 59(6), 881-886.', url: 'https://doi.org/10.2310/JIM.0b013e31821b8755' },
    { title: 'Lips, P. (2006). Vitamin D physiology. Progress in Biophysics and Molecular Biology, 92(1), 4-8.', url: 'https://doi.org/10.1016/j.pbiomolbio.2006.02.016' },
  ],
  created_at: '2026-06-10T00:00:00Z',
};

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          setPost(DEMO_POST);
        } else {
          setPost(data);
        }
      } catch {
        // Supabase 未連線，使用示範資料
        setPost(DEMO_POST);
      }
      setLoading(false);
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="aspect-video rounded-2xl bg-surface-200 mb-8" />
        <div className="h-10 w-3/4 bg-surface-200 rounded mb-4" />
        <div className="flex gap-2 mb-6">
          <div className="h-6 w-20 bg-surface-200 rounded-full" />
          <div className="h-6 w-16 bg-surface-200 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-200 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-4">找不到這篇文章</h2>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
          ← 返回首頁
        </Link>
      </div>
    );
  }

  const date = new Date(post.created_at).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回文章列表
      </Link>

      {/* YouTube Embed */}
      <div className="mb-8 animate-fade-in">
        <YouTubeEmbed videoId={post.youtube_video_id} />
      </div>

      {/* Title & Meta */}
      <header className="mb-8 animate-slide-up">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 leading-tight mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <time className="text-sm text-surface-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {date}
          </time>
          {post.nutrients?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.nutrients.map((nutrient, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                >
                  {nutrient}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <MarkdownRenderer content={post.content} />
      </div>

      {/* References */}
      <div className="mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ReferenceList references={post.references} />
      </div>

      {/* Comments */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
