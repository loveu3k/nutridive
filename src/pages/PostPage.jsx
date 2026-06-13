import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import YouTubeEmbed from '../components/YouTubeEmbed';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ReferenceList from '../components/ReferenceList';
import CommentSection from '../components/CommentSection';

import { DEMO_POSTS } from '../data/posts';

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
          const fallback = DEMO_POSTS.find(p => p.slug === slug) || DEMO_POSTS[0];
          setPost(fallback);
        } else {
          setPost(data);
        }
      } catch {
        // Supabase 未連線，使用示範資料
        const fallback = DEMO_POSTS.find(p => p.slug === slug) || DEMO_POSTS[0];
        setPost(fallback);
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
