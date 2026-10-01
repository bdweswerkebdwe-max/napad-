import React, { useState } from 'react';
import { useApp, Post, User } from '../context/AppContext';
import { Search, TrendingUp, Grid, Video, Hash, Sparkles, CheckCircle, ArrowLeft, Heart, MessageCircle } from 'lucide-react';

export default function Explore() {
  const { posts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nature' | 'tech' | 'travel'>('all');
  
  // Detail preview state
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  // Popular/Trending hashtags
  const popularHashtags = [
    { name: 'طبيعة', count: '124K' },
    { name: 'تكنولوجيا', count: '98K' },
    { name: 'سفر', count: '85K' },
    { name: 'قهوة', count: '64K' },
    { name: 'تأمل', count: '41K' },
  ];

  // Static mockup of popular creators for searching
  const creatorsDb: User[] = [
    {
      uid: 'creator_1',
      email: 'youssef@nabd.com',
      username: 'youssef_creations',
      displayName: 'يوسف العتيبي',
      bio: 'مصور فوتوغرافي وصانع محتوى بصري 🌌',
      avatar: '/src/assets/images/avatar_premium_1790855716859.jpg',
      coverPhoto: '',
      followersCount: 12800,
      followingCount: 340,
      likesCount: 95400,
      visitorsCount: 412,
      isVerified: true,
      followers: [],
      following: []
    },
    {
      uid: 'creator_2',
      email: 'sarah.tech@nabd.com',
      username: 'sarah_tech',
      displayName: 'سارة المهندس',
      bio: 'مهندسة برمجيات أشارككم رحلتي في عالم الذكاء الاصطناعي 💻✨.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      coverPhoto: '',
      followersCount: 45200,
      followingCount: 180,
      likesCount: 312000,
      visitorsCount: 1024,
      isVerified: true,
      followers: [],
      following: []
    },
    {
      uid: 'creator_3',
      email: 'faisal@nabd.com',
      username: 'faisal_travels',
      displayName: 'فيصل الرحال',
      bio: 'أجوب العالم بحثاً عن القهوة المختصة والقصص المنسية 🗺️☕️.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      coverPhoto: '',
      followersCount: 8900,
      followingCount: 450,
      likesCount: 42300,
      visitorsCount: 189,
      isVerified: false,
      followers: [],
      following: []
    }
  ];

  // Filters logic
  const filteredCreators = searchQuery.trim() 
    ? creatorsDb.filter(c => 
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPostsBySearch = searchQuery.trim()
    ? posts.filter(p => 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  // Additional category filtering for the trending Grid
  const finalPosts = filteredPostsBySearch.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'nature') return p.hashtags.includes('طبيعة') || p.hashtags.includes('بحر') || p.hashtags.includes('تأمل');
    if (selectedCategory === 'tech') return p.hashtags.includes('تكنولوجيا') || p.hashtags.includes('تطوير');
    if (selectedCategory === 'travel') return p.hashtags.includes('سفر') || p.hashtags.includes('مغامرة');
    return true;
  });

  return (
    <div className="relative h-full flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden">
      
      {/* 1. Sticky Top Bar Search Box */}
      <div className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-900 px-4 py-4 space-y-3">
        
        {/* Search Input */}
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="ابحث عن صناع محتوى، هاشتاغات أو مواضيع رائعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-11 pl-11 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 transition-all text-right"
          />
          <Search className="absolute right-4 top-3.5 w-4 h-4 text-slate-500" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-3 text-xs text-brand-primary hover:underline font-bold"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category horizontal scroll (BANNED pill metadata styling avoided - these are interactive buttons) */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-row-reverse max-w-lg mx-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all' ? 'bg-brand-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedCategory('nature')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'nature' ? 'bg-brand-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              الطبيعة والهدوء 🌌
            </button>
            <button
              onClick={() => setSelectedCategory('tech')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'tech' ? 'bg-brand-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              البرمجة والتقنية 💻
            </button>
            <button
              onClick={() => setSelectedCategory('travel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'travel' ? 'bg-brand-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              السياحة والسفر 🗺️
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Explore Panel Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        
        {/* Search Results Mode */}
        {searchQuery.trim() ? (
          <div className="max-w-lg mx-auto py-4 space-y-6">
            
            {/* 2A. Searched Users */}
            {filteredCreators.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 text-right">المستخدمون وصنّاع المحتوى</h3>
                <div className="space-y-2.5">
                  {filteredCreators.map(creator => (
                    <div key={creator.uid} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-xs text-brand-primary font-bold">ملف المبدع</div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="flex items-center gap-1 justify-end">
                            {creator.isVerified && <CheckCircle className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
                            <span className="text-xs font-bold text-white">{creator.displayName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">@{creator.username}</span>
                        </div>
                        <img 
                          src={creator.avatar} 
                          alt={creator.displayName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2B. Searched Posts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 text-right">المنشورات ومقاطع الفيديو المطابقة</h3>
              {finalPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {finalPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => setPreviewPost(post)}
                      className="group relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-850 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      {post.type === 'video' ? (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white z-10">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                      ) : null}
                      <img 
                        src={post.type === 'video' ? '/src/assets/images/post_neon_1790855705772.jpg' : post.mediaUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed mb-1">{post.content}</p>
                        <span className="text-[9px] text-brand-secondary">@{post.author.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  لم نجد أي نتائج لـ "{searchQuery}". جرب كلمات مفتاحية أخرى.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Normal Browse Mode (Default) */
          <div className="max-w-lg mx-auto py-4 space-y-6">
            
            {/* Popular/Trending Hashtags Carousels */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-white">الهاشتاغات المتداولة الآن</span>
                <TrendingUp className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="flex flex-row-reverse gap-3 overflow-x-auto pb-1 no-scrollbar">
                {popularHashtags.map((hashtag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(hashtag.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800/80 rounded-xl hover:border-brand-primary/40 text-right shrink-0"
                  >
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">#{hashtag.name}</span>
                      <span className="text-[9px] text-slate-500 block font-mono">{hashtag.count} منشور</span>
                    </div>
                    <div className="w-7 h-7 bg-slate-850 text-brand-secondary rounded-lg flex items-center justify-center font-bold">
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Pinterest / Explore Grid layout */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-white">المحتوى الشائع والترند</span>
                <Grid className="w-4 h-4 text-brand-secondary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {finalPosts.map((post, idx) => {
                  // Make some grid elements spans to look extremely elegant like Pinterest/Instagram Explore
                  const isLarge = idx % 3 === 0;
                  return (
                    <div
                      key={post.id}
                      onClick={() => setPreviewPost(post)}
                      className={`group relative ${
                        isLarge ? 'col-span-2 aspect-[4/3]' : 'aspect-[3/4]'
                      } bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 cursor-pointer shadow-sm`}
                    >
                      {/* Reels indicator */}
                      {post.type === 'video' && (
                        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md p-1.5 rounded-lg text-white z-10 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-brand-primary" />
                          <span className="text-[9px] font-bold">فيديو</span>
                        </div>
                      )}

                      <img 
                        src={post.type === 'video' ? '/src/assets/images/post_neon_1790855705772.jpg' : post.mediaUrl} 
                        alt="Trend asset" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Screen Overlay with stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          {post.author.isVerified && <CheckCircle className="w-3 h-3 text-brand-secondary fill-current" />}
                          <span className="text-[10px] text-white font-bold">{post.author.displayName}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 line-clamp-1 leading-relaxed mb-2">{post.content}</p>
                        
                        <div className="flex items-center gap-3 justify-end text-slate-300">
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <span>{post.comments.length}</span>
                            <MessageCircle className="w-3 h-3" />
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <span>{post.likes.length}</span>
                            <Heart className="w-3 h-3 text-brand-primary fill-current" />
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 3. Detail Popup/Modal Preview on Trend click */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setPreviewPost(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10">
            
            {/* Header */}
            <div className="p-4 bg-slate-950/80 flex items-center justify-between border-b border-slate-850">
              <button 
                onClick={() => setPreviewPost(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-bold"
              >
                رجوع
              </button>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{previewPost.author.displayName}</span>
                  <span className="text-[9px] text-slate-500 font-mono block">@{previewPost.author.username}</span>
                </div>
                <img 
                  src={previewPost.author.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-slate-800"
                />
              </div>
            </div>

            {/* Media Body */}
            <div className="relative aspect-[4/3] bg-black">
              <img 
                src={previewPost.type === 'video' ? '/src/assets/images/post_scenic_1790855694074.jpg' : previewPost.mediaUrl} 
                alt="Post Preview" 
                className="w-full h-full object-cover"
              />
              {previewPost.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="p-3 bg-brand-primary rounded-full text-white">
                    <Video className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Post details */}
            <div className="p-5 space-y-3 text-right bg-slate-900">
              <p className="text-xs text-slate-200 leading-relaxed">{previewPost.content}</p>
              
              <div className="flex flex-row-reverse flex-wrap gap-1.5 text-xs text-brand-secondary font-semibold">
                {previewPost.hashtags.map((tag, i) => (
                  <span key={i}>#{tag}</span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-850/60 flex justify-between items-center text-xs text-slate-400">
                <span className="font-mono">{previewPost.timestamp}</span>
                <div className="flex items-center gap-3">
                  <span>❤️ {previewPost.likes.length} إعجاب</span>
                  <span>💬 {previewPost.comments.length} تعليق</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
