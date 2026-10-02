import React, { useState, useRef, useEffect } from 'react';
import { useApp, Post, User } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Bookmark, Send, Volume2, VolumeX, CheckCircle, Plus, Sparkles, Smile, MessageSquare, Play, Pause } from 'lucide-react';

export default function HomeFeed() {
  const { currentUser, posts, likePost, savePost, addComment, followUser, stories } = useApp();
  
  // Top Tabs: 'videos' | 'posts' | 'following'
  const [activeTab, setActiveTab] = useState<'videos' | 'posts' | 'following'>('videos');
  
  // Following Sub-Tabs: 'posts' | 'videos'
  const [followingSubTab, setFollowingSubTab] = useState<'posts' | 'videos'>('posts');

  // Comment Sheet state
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');

  // Audio mute/unmute state for feeds
  const [isMuted, setIsMuted] = useState(true);

  const handleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    likePost(postId);
  };

  const handleSave = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    savePost(postId);
  };

  const handleShare = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Simulate share native API or copy to clipboard
    const shareText = `شاهد هذا المحتوى المميز من ${post.author.displayName} على منصة نبض!`;
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`).then(() => {
      alert('تم نسخ رابط المنشور بنجاح! شاركه مع أصدقائك 🔗.');
    }).catch(() => {
      alert(shareText);
    });
  };

  const handleAddCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    
    // Refresh the local reference in the open comments modal
    const updatedPost = posts.find(p => p.id === postId);
    if (updatedPost) {
      // Simulate adding to current UI without lag
      setSelectedPostForComments({
        ...updatedPost,
        comments: [
          ...updatedPost.comments,
          {
            id: `temp_${Date.now()}`,
            author: {
              uid: currentUser?.uid || 'user',
              displayName: currentUser?.displayName || 'أنت',
              username: currentUser?.username || 'me',
              avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
            },
            text: commentText.trim(),
            timestamp: 'الآن'
          }
        ]
      });
    }
    setCommentText('');
  };

  // Filter lists based on tab selection
  const videosFeed = posts.filter(p => p.type === 'video');
  const textImageFeed = posts.filter(p => p.type === 'text-image');
  
  // Following filter (only showing posts of followed accounts)
  const followedUserIds = currentUser?.following || [];
  const followingVideos = posts.filter(p => p.type === 'video' && followedUserIds.includes(p.author.uid));
  const followingPosts = posts.filter(p => p.type === 'text-image' && followedUserIds.includes(p.author.uid));

  // Suggest popular creators to follow if they have an empty followers feed
  const suggestedCreators = [
    {
      uid: 'creator_1',
      displayName: 'يوسف العتيبي',
      username: 'youssef_creations',
      avatar: '/src/assets/images/avatar_premium_1790855716859.jpg',
      bio: 'مصور فوتوغرافي وصانع محتوى بصري 🌌',
    },
    {
      uid: 'creator_2',
      displayName: 'سارة المهندس',
      username: 'sarah_tech',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      bio: 'مهندسة برمجيات أشارككم رحلتي في عالم الذكاء الاصطناعي 💻✨',
    },
    {
      uid: 'creator_3',
      displayName: 'فيصل الرحال',
      username: 'faisal_travels',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      bio: 'أجوب العالم بحثاً عن القهوة المختصة والقصص المنسية 🗺️☕️',
    }
  ];

  return (
    <div className="relative h-full flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden">
      
      {/* 1. Header with 3 Top Tabs */}
      <div className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-lg mb-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping" />
            <h1 className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              نبض Feed
            </h1>
          </div>
          
          {/* Audio toggle global control */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? "كتم الصوت" : "تشغيل الصوت"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Top segmented controller tabs */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-1 px-2 border-b-2 transition-all ${
              activeTab === 'videos' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            فيديوهات
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-1 px-2 border-b-2 transition-all ${
              activeTab === 'posts' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            منشورات
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`pb-1 px-2 border-b-2 transition-all ${
              activeTab === 'following' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المتابعين
          </button>
        </div>
      </div>

      {/* 2. Main Content Feed Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        
        {/* TAB 1: VIDEOS FEED (TikTok vertical reels layout) */}
        {activeTab === 'videos' && (
          <div className="vertical-snap-container h-[calc(100vh-140px)] w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden relative border border-slate-900/60">
            {videosFeed.map((post) => (
              <VideoReelItem 
                key={post.id} 
                post={post} 
                isMuted={isMuted} 
                currentUser={currentUser}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onCommentOpen={setSelectedPostForComments}
                onFollow={followUser}
              />
            ))}
          </div>
        )}

        {/* TAB 2: POSTS FEED (Instagram-like posts timeline) */}
        {activeTab === 'posts' && (
          <div className="w-full max-w-lg mx-auto px-4 py-4 space-y-6">
            {textImageFeed.map((post) => (
              <PostCardItem 
                key={post.id} 
                post={post} 
                currentUser={currentUser}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onCommentOpen={setSelectedPostForComments}
                onFollow={followUser}
              />
            ))}
          </div>
        )}

        {/* TAB 3: FOLLOWING ONLY FEED */}
        {activeTab === 'following' && (
          <div className="w-full max-w-lg mx-auto px-4 py-4 space-y-6">
            
            {/* Following Sub Tabs */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-950/60 border border-slate-900 rounded-xl mb-4">
              <button
                onClick={() => setFollowingSubTab('posts')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  followingSubTab === 'posts' ? 'bg-slate-850 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                منشورات المتابَعين
              </button>
              <button
                onClick={() => setFollowingSubTab('videos')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  followingSubTab === 'videos' ? 'bg-slate-850 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                فيديوهات المتابَعين
              </button>
            </div>

            {/* Display list based on sub-tab */}
            {followingSubTab === 'posts' && (
              <>
                {followingPosts.length > 0 ? (
                  followingPosts.map(post => (
                    <PostCardItem 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      onCommentOpen={setSelectedPostForComments}
                      onFollow={followUser}
                    />
                  ))
                ) : (
                  <EmptyFollowingPlaceholder suggestedCreators={suggestedCreators} followUser={followUser} currentUser={currentUser} />
                )}
              </>
            )}

            {followingSubTab === 'videos' && (
              <>
                {followingVideos.length > 0 ? (
                  <div className="vertical-snap-container h-[600px] w-full bg-black rounded-2xl overflow-hidden relative">
                    {followingVideos.map(post => (
                      <VideoReelItem 
                        key={post.id} 
                        post={post} 
                        isMuted={isMuted} 
                        currentUser={currentUser}
                        onLike={handleLike}
                        onSave={handleSave}
                        onShare={handleShare}
                        onCommentOpen={setSelectedPostForComments}
                        onFollow={followUser}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyFollowingPlaceholder suggestedCreators={suggestedCreators} followUser={followUser} currentUser={currentUser} />
                )}
              </>
            )}

          </div>
        )}

      </div>

      {/* 3. Bottom Slide-up Sheet for Comments */}
      {selectedPostForComments && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedPostForComments(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-t-3xl border-t border-slate-800 shadow-2xl z-10 flex flex-col max-h-[85vh] animate-slideUp">
            
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setSelectedPostForComments(null)} />
            
            {/* Header */}
            <div className="px-6 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedPostForComments.comments.length} تعليق
              </span>
              <h3 className="text-sm font-bold text-slate-200">التعليقات والمناقشات</h3>
              <button onClick={() => setSelectedPostForComments(null)} className="text-xs text-slate-400 hover:text-white font-medium">إغلاق</button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedPostForComments.comments.length > 0 ? (
                selectedPostForComments.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-right">
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.displayName} 
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-300">{comment.author.displayName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">@{comment.author.username}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 stroke-1" />
                  <p className="text-xs">كن أول من يعلق على هذا المنشور الرائع!</p>
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form 
              onSubmit={(e) => handleAddCommentSubmit(e, selectedPostForComments.id)}
              className="p-4 bg-slate-950 border-t border-slate-850 flex items-center gap-2"
            >
              <button 
                type="submit"
                className="w-10 h-10 bg-brand-primary hover:opacity-95 text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
              <input
                type="text"
                placeholder="اكتب تعليقك هنا بكل احترام..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 h-10 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-brand-primary focus:outline-none text-right"
              />
              {currentUser && (
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// === Sub-Component 1: Video Reel Item ===
interface VideoReelItemProps {
  post: Post;
  isMuted: boolean;
  currentUser: User | null;
  onLike: (id: string, e: React.MouseEvent) => void;
  onSave: (id: string, e: React.MouseEvent) => void;
  onShare: (post: Post, e: React.MouseEvent) => void;
  onCommentOpen: (post: Post) => void;
  onFollow: (id: string) => void;
}

function VideoReelItem({ post, isMuted, currentUser, onLike, onSave, onShare, onCommentOpen, onFollow }: VideoReelItemProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsPlaying(true);
            video.play().catch(() => {});
          } else {
            setIsPlaying(false);
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
  const isSaved = currentUser ? post.saves.includes(currentUser.uid) : false;
  const isFollowing = currentUser ? currentUser.following.includes(post.author.uid) : false;

  return (
    <div ref={containerRef} className="vertical-snap-item relative h-full w-full flex items-center justify-center bg-black">
      
      {/* HTML5 Native Video Tag */}
      <video
        ref={videoRef}
        src={post.mediaUrl}
        className="h-full w-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        autoPlay
      />

      {/* Play/Pause Overlay indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white">
            <Play className="w-8 h-8 fill-current" />
          </div>
        </div>
      )}

      {/* Floating Left/Right action buttons (TikTok style) */}
      <div className="absolute bottom-16 right-4 flex flex-col items-center gap-5 z-10">
        
        {/* Creator Avatar with follow overlay button */}
        <div className="relative mb-2">
          <img 
            src={post.author.avatar} 
            alt={post.author.displayName} 
            className="w-12 h-12 rounded-full border-2 border-brand-primary object-cover shadow-lg"
          />
          {currentUser && post.author.uid !== currentUser.uid && !isFollowing && (
            <button 
              onClick={() => onFollow(post.author.uid)}
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-brand-primary hover:opacity-95 text-white rounded-full flex items-center justify-center shadow focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Heart / Like button */}
        <button 
          onClick={(e) => onLike(post.id, e)}
          className="flex flex-col items-center focus:outline-none group"
        >
          <div className={`p-3 rounded-full ${isLiked ? 'bg-brand-primary/25 text-brand-primary' : 'bg-black/40 text-white hover:bg-black/60'} backdrop-blur-md transition-all active:scale-75`}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-brand-primary' : ''}`} />
          </div>
          <span className="text-[10px] text-slate-300 font-mono mt-1">{post.likes.length}</span>
        </button>

        {/* Comment button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onCommentOpen(post); }}
          className="flex flex-col items-center focus:outline-none"
        >
          <div className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all active:scale-75">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-mono mt-1">{post.comments.length}</span>
        </button>

        {/* Bookmark / Save button */}
        <button 
          onClick={(e) => onSave(post.id, e)}
          className="flex flex-col items-center focus:outline-none"
        >
          <div className={`p-3 rounded-full ${isSaved ? 'bg-amber-500/25 text-amber-500' : 'bg-black/40 text-white hover:bg-black/60'} backdrop-blur-md transition-all active:scale-75`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] text-slate-300 font-mono mt-1">{post.saves.length}</span>
        </button>

        {/* Share button */}
        <button 
          onClick={(e) => onShare(post, e)}
          className="flex flex-col items-center focus:outline-none"
        >
          <div className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all active:scale-75">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-mono mt-1">{post.shares}</span>
        </button>

      </div>

      {/* Creator Info & Caption Overlays (TikTok bottom overlay) */}
      <div className="absolute bottom-4 left-4 right-16 text-right z-10 flex flex-col items-end text-white px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none">
        
        {/* Creator Name */}
        <div className="flex items-center gap-1.5 mb-1.5 pointer-events-auto">
          {post.author.isVerified && <CheckCircle className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
          <span className="text-xs text-slate-300 font-mono font-medium">@{post.author.username}</span>
          <span className="text-sm font-bold">{post.author.displayName}</span>
        </div>

        {/* Text Description */}
        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed mb-2 text-right">
          {post.content}
        </p>

        {/* Hashtags (BANNED pill metadata avoided - static quiet inline text with spaces) */}
        <div className="flex flex-row-reverse flex-wrap gap-1.5 text-[11px] text-brand-secondary font-semibold">
          {post.hashtags.map((tag, idx) => (
            <span key={idx}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* Screen gradient scrim to ensure text readable */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

    </div>
  );
}

// === Sub-Component 2: Post Card Item (Instagram style) ===
interface PostCardItemProps {
  post: Post;
  currentUser: User | null;
  onLike: (id: string, e: React.MouseEvent) => void;
  onSave: (id: string, e: React.MouseEvent) => void;
  onShare: (post: Post, e: React.MouseEvent) => void;
  onCommentOpen: (post: Post) => void;
  onFollow: (id: string) => void;
}

function PostCardItem({ post, currentUser, onLike, onSave, onShare, onCommentOpen, onFollow }: PostCardItemProps) {
  const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
  const isSaved = currentUser ? post.saves.includes(currentUser.uid) : false;
  const isFollowing = currentUser ? currentUser.following.includes(post.author.uid) : false;

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-slate-950/25">
      
      {/* 1. Facebook Style Header */}
      <div className="p-4 flex items-center justify-between">
        
        {/* Left Side: Follow button / Actions */}
        {currentUser && post.author.uid !== currentUser.uid && (
          <button
            onClick={() => onFollow(post.author.uid)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isFollowing 
                ? 'bg-slate-850 text-slate-400 hover:bg-slate-800' 
                : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white'
            }`}
          >
            {isFollowing ? 'متابع ✓' : '+ متابعة'}
          </button>
        )}

        {/* Right Side: Creator info with privacy icon (Globe representing Facebook-like public feed) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {post.author.isVerified && <CheckCircle className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
              <span className="text-sm font-extrabold text-white">{post.author.displayName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-end mt-0.5">
              <span className="font-mono">@{post.author.username}</span>
              <span aria-hidden="true">·</span>
              <span>{post.timestamp}</span>
              <span aria-hidden="true">·</span>
              <span title="عام للجميع" className="text-xs">🌎</span>
            </div>
          </div>
          <img 
            src={post.author.avatar} 
            alt={post.author.displayName} 
            className="w-10 h-10 rounded-full object-cover border border-slate-800"
          />
        </div>

      </div>

      {/* 2. Text Caption Content */}
      <div className="px-4 pb-3.5 text-right">
        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* 3. Edge-to-Edge Image Content */}
      {post.mediaUrl && (
        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden border-y border-slate-950">
          <img 
            src={post.mediaUrl} 
            alt="Post Content" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
          />
        </div>
      )}

      {/* 4. Facebook Reaction Counters Bar */}
      <div className="px-4 py-3 flex justify-between items-center text-xs text-slate-400 border-b border-slate-850/60 bg-slate-950/10">
        {/* Left Side: Comments & Shares count */}
        <div className="flex gap-2 font-mono text-[11px]">
          <span>{post.comments.length} تعليق</span>
          <span>•</span>
          <span>{post.shares || Math.floor(post.likes.length * 0.4)} مشاركة</span>
        </div>

        {/* Right Side: Facebook Reactions Icons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-slate-300">{post.likes.length}</span>
          <div className="flex -space-x-1 space-x-reverse items-center">
            <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] shadow border border-slate-900">👍</span>
            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] shadow border border-slate-900">❤️</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] shadow border border-slate-900">😮</span>
          </div>
        </div>
      </div>

      {/* 5. Facebook Interactive Action Buttons */}
      <div className="p-2.5 flex items-center justify-around text-slate-300">
        
        {/* Share Button */}
        <button 
          onClick={(e) => onShare(post, e)}
          className="flex-1 py-1.5 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>مشاركة</span>
        </button>

        {/* Comment Button */}
        <button 
          onClick={() => onCommentOpen(post)}
          className="flex-1 py-1.5 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>تعليق</span>
        </button>

        {/* Like Button */}
        <button 
          onClick={(e) => onLike(post.id, e)}
          className={`flex-1 py-1.5 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 ${
            isLiked ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>أعجبني</span>
        </button>

      </div>

      {/* 5. Micro Comments Preview */}
      {post.comments.length > 0 && (
        <div className="px-4 pb-4 border-t border-slate-850/60 pt-3 bg-slate-950/20 text-right space-y-2">
          {post.comments.slice(-2).map(c => (
            <div key={c.id} className="text-xs">
              <span className="font-semibold text-slate-300 ml-1.5">{c.author.displayName}:</span>
              <span className="text-slate-400">{c.text}</span>
            </div>
          ))}
          {post.comments.length > 2 && (
            <button 
              onClick={() => onCommentOpen(post)}
              className="text-[11px] text-brand-secondary font-bold hover:underline"
            >
              عرض كافة الـ {post.comments.length} تعليقات
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// === Sub-Component 3: Empty Followers Feed Placeholder ===
interface EmptyFollowingPlaceholderProps {
  suggestedCreators: Array<{ uid: string, displayName: string, username: string, avatar: string, bio: string }>;
  followUser: (id: string) => void;
  currentUser: User | null;
}

function EmptyFollowingPlaceholder({ suggestedCreators, followUser, currentUser }: EmptyFollowingPlaceholderProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl">
      <Sparkles className="w-12 h-12 text-brand-secondary animate-bounce mb-3" />
      <h3 className="text-base font-bold text-white mb-1">أنت لا تتابع أحداً بعد!</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6">
        تابع أفضل المبدعين وصناع المحتوى على نبض لتشاهد منشوراتهم وفيديوهاتهم الحصرية في هذه الصفحة فورا!
      </p>

      {/* Suggested Creators list */}
      <div className="w-full space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 text-right mb-2">صنّاع محتوى مقترحون:</h4>
        {suggestedCreators.map(creator => {
          const isFollowing = currentUser ? currentUser.following.includes(creator.uid) : false;
          return (
            <div key={creator.uid} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-850">
              <button
                onClick={() => followUser(creator.uid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isFollowing 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-brand-primary text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? 'متابع' : 'متابعة'}
              </button>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h5 className="text-xs font-bold text-white">{creator.displayName}</h5>
                  <p className="text-[10px] text-slate-400">@{creator.username}</p>
                </div>
                <img 
                  src={creator.avatar} 
                  alt={creator.displayName} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-850"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
