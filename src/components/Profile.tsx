import React, { useState } from 'react';
import { useApp, Post } from '../context/AppContext';
import { 
  Settings, Users, Heart, BookOpen, Edit3, Grid, Video, 
  UserCheck, Shield, Key, Bell, Sun, Moon, LogOut, CheckCircle, 
  Sparkles, Camera, ArrowLeft, RefreshCw, Eye
} from 'lucide-react';

export default function Profile() {
  const { 
    currentUser, posts, logout, updateProfile, settings, updateSettings, visitors 
  } = useApp();

  // Drawers/Modals: 'none' | 'settings' | 'visitors' | 'edit_profile' | 'analytics'
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'settings' | 'visitors' | 'edit_profile' | 'analytics'>('none');
  
  // Profile Bottom Tabs: 'my_videos' | 'my_posts' | 'liked_posts'
  const [profileTab, setProfileTab] = useState<'my_videos' | 'my_posts' | 'liked_posts'>('my_posts');

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editCover, setEditCover] = useState(currentUser?.coverPhoto || '');

  if (!currentUser) return null;

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, editBio, editAvatar, editCover);
    setActiveDrawer('none');
  };

  // Filter posts created by current user
  const myPosts = posts.filter(p => p.author.uid === currentUser.uid && p.type === 'text-image');
  const myVideos = posts.filter(p => p.author.uid === currentUser.uid && p.type === 'video');
  const likedPosts = posts.filter(p => p.likes.includes(currentUser.uid));

  return (
    <div className="relative h-full flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden">
      
      {/* 1. Header with Settings and Page Visitors buttons */}
      <div className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-900 px-4 py-3.5 flex items-center justify-between">
        
        {/* Settings button */}
        <button 
          onClick={() => setActiveDrawer('settings')}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95"
          title="الإعدادات والخصوصية"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Page Visitors center pill link */}
        <button
          onClick={() => setActiveDrawer('visitors')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300"
        >
          <span className="font-mono text-brand-secondary text-[11px]">{currentUser.visitorsCount || 37}</span>
          <span className="text-[10px] text-slate-400">زوار الصفحة</span>
          <Eye className="w-3.5 h-3.5 text-brand-secondary" />
        </button>

        {/* Username */}
        <div className="flex items-center gap-1">
          {currentUser.isVerified && <CheckCircle className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
          <span className="text-sm font-extrabold text-white">@{currentUser.username}</span>
        </div>
      </div>

      {/* 2. Profile Details Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* 2A. Cover & Avatar lockup */}
        <div className="relative h-44 w-full bg-slate-950">
          <img 
            src={currentUser.coverPhoto || "/src/assets/images/social_cover_1790855683888.jpg"} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/30 to-transparent" />
          
          {/* Circular Avatar hanging off cover */}
          <div className="absolute -bottom-10 right-6 z-10 p-1 rounded-full bg-[#0b0f19]">
            <img 
              src={currentUser.avatar || "/src/assets/images/avatar_premium_1790855716859.jpg"} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-900 shadow-xl"
            />
          </div>
        </div>

        {/* 2B. Name, Edit button and stats */}
        <div className="px-6 pt-12 text-right space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveDrawer('edit_profile')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-850 active:scale-95 transition-all"
              >
                <span>تعديل الحساب</span>
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDrawer('analytics')}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-lg shadow-brand-primary/10 active:scale-95 transition-all"
              >
                <span>التحليلات 📊</span>
              </button>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-extrabold text-white">{currentUser.displayName}</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">@{currentUser.username}</p>
            </div>
          </div>

          {/* User Bio */}
          <p className="text-xs text-slate-300 leading-relaxed max-w-md text-right whitespace-pre-line">
            {currentUser.bio}
          </p>

          {/* Followers / Following Stats (BANNED pill metadata avoided - unboxed text with dots) */}
          <div className="flex items-center justify-end gap-5 text-right py-2.5 border-y border-slate-900">
            <div className="text-center">
              <span className="text-sm font-bold text-white block font-mono">{currentUser.likesCount || 980}</span>
              <span className="text-[10px] text-slate-500 block">إعجاب</span>
            </div>
            <span className="text-slate-700 font-mono">·</span>
            <div className="text-center">
              <span className="text-sm font-bold text-white block font-mono">{currentUser.followersCount || 158}</span>
              <span className="text-[10px] text-slate-500 block">المتابِعون</span>
            </div>
            <span className="text-slate-700 font-mono">·</span>
            <div className="text-center">
              <span className="text-sm font-bold text-white block font-mono">{currentUser.followingCount || 124}</span>
              <span className="text-[10px] text-slate-500 block">المتابَعون</span>
            </div>
          </div>
        </div>

        {/* 2C. My Content Tabs selector (BANNED pill metadata styling avoided) */}
        <div className="mt-6 border-b border-slate-900 px-4">
          <div className="flex items-center justify-center gap-6 text-xs font-bold pb-2">
            <button
              onClick={() => setProfileTab('liked_posts')}
              className={`pb-1 border-b-2 transition-all ${
                profileTab === 'liked_posts' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              أعجبتني ❤️
            </button>
            <button
              onClick={() => setProfileTab('my_posts')}
              className={`pb-1 border-b-2 transition-all ${
                profileTab === 'my_posts' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              منشوراتي 📝
            </button>
            <button
              onClick={() => setProfileTab('my_videos')}
              className={`pb-1 border-b-2 transition-all ${
                profileTab === 'my_videos' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              فيديوهاتي 🎥
            </button>
          </div>
        </div>

        {/* 2D. Grid rendering based on profile tab selection */}
        <div className="p-4">
          
          {profileTab === 'my_posts' && (
            myPosts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myPosts.map(post => (
                  <div key={post.id} className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-850 group">
                    <img src={post.mediaUrl} alt="my post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-xs text-white transition-opacity font-mono">
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.comments.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="لا توجد منشورات بعد" subtitle="لم تنشر أي صورة أو نص في الجدول الزمني حتى الآن." />
            )
          )}

          {profileTab === 'my_videos' && (
            myVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myVideos.map(post => (
                  <div key={post.id} className="relative aspect-[3/4] rounded-xl bg-slate-950 overflow-hidden border border-slate-850 group">
                    <img src="/src/assets/images/post_neon_1790855705772.jpg" alt="my video" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-brand-primary p-1 rounded text-white text-[9px] font-bold">فيديو</div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-xs text-white transition-opacity font-mono">
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.comments.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="لا توجد فيديوهات بعد" subtitle="لم تقم برفع أو تسجيل أي مقطع فيديو قصير بعد." />
            )
          )}

          {profileTab === 'liked_posts' && (
            likedPosts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {likedPosts.map(post => (
                  <div key={post.id} className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-850 group">
                    <img src={post.type === 'video' ? '/src/assets/images/post_scenic_1790855694074.jpg' : post.mediaUrl} alt="liked content" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-xs text-white transition-opacity font-mono">
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.comments.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="لا يوجد محتوى مفضل" subtitle="قم بالإعجاب ببعض المنشورات لتظهر لك هنا في أي وقت." />
            )
          )}

        </div>

      </div>

      {/* 3. DRAWERS / MODALS SYSTEM */}
      
      {/* 3A. Settings and Privacy Drawer */}
      {activeDrawer === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden animate-slideUp">
            
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white font-bold">إغلاق</button>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 justify-end">
                <span>الإعدادات والخصوصية</span>
                <Settings className="w-4 h-4 text-brand-primary" />
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-right">
              
              {/* Account details info */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID: {currentUser.uid}</span>
                <span className="text-xs text-slate-300 font-bold">{currentUser.email}</span>
              </div>

              {/* Theme Settings Toggle */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-bold block">مظهر التطبيق</span>
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                    className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-brand-primary"
                  >
                    {settings.darkMode ? <Moon className="w-4.5 h-4.5 text-amber-400 fill-current" /> : <Sun className="w-4.5 h-4.5 text-orange-400" />}
                  </button>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">الوضع الليلي (Dark Mode)</span>
                    <span className="text-[10px] text-slate-500 block">تفعيل المظهر الليلي المريح للعينين</span>
                  </div>
                </div>
              </div>

              {/* Privacy and Security settings */}
              <div className="space-y-2.5">
                <span className="text-[11px] text-slate-400 font-bold block">الخصوصية والأمان (Firebase Engine)</span>
                
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={settings.privateAccount}
                    onChange={(e) => updateSettings({ privateAccount: e.target.checked })}
                    className="w-4 h-4 accent-brand-primary rounded"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">حساب خاص (Private Account)</span>
                    <span className="text-[10px] text-slate-500 block">عرض محتواك للمتابعين الموافق عليهم فقط</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={settings.notificationsEnabled}
                    onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-brand-primary rounded"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">تفعيل التنبيهات الفورية</span>
                    <span className="text-[10px] text-slate-500 block">إشعارات تفاعل المتابعين والإعجابات</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => updateSettings({ twoFactorEnabled: e.target.checked })}
                    className="w-4 h-4 accent-brand-primary rounded"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">التحقق بخطوتين (2FA)</span>
                    <span className="text-[10px] text-slate-500 block">أقصى حماية لحسابك عبر رمز الهاتف</span>
                  </div>
                </div>
              </div>

              {/* Logout actions */}
              <div className="pt-4 border-t border-slate-850">
                <button
                  onClick={() => { logout(); alert('تم تسجيل خروجك بأمان. يمكنك الدخول في أي وقت 👋.'); }}
                  className="w-full py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل خروج من الحساب</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3B. Page Visitors List Modal */}
      {activeDrawer === 'visitors' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[80vh] overflow-hidden animate-slideUp">
            
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white font-bold">إغلاق</button>
              <h3 className="text-sm font-bold text-slate-200">زوار ملفك الشخصي</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-right">
              <span className="text-[10px] text-slate-500 block text-center mb-1 leading-relaxed">
                💡 تظهر لك هذه القائمة المستخدمين المتميزين الذين تصفحوا حسابك وتغذيتك الشخصية خلال الـ 24 ساعة الماضية.
              </span>

              <div className="space-y-3">
                {visitors.map((visitor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-mono">{visitor.timestamp}</span>
                    
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-1 justify-end">
                          {visitor.isVerified && <CheckCircle className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
                          <h4 className="text-xs font-bold text-white">{visitor.displayName}</h4>
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono">@{visitor.username}</span>
                      </div>
                      <img src={visitor.avatar} alt="visitor avatar" className="w-10 h-10 rounded-full object-cover border border-slate-850" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3C. Edit Profile Details Modal */}
      {activeDrawer === 'edit_profile' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-slideUp">
            
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white font-bold">إلغاء</button>
              <h3 className="text-sm font-bold text-slate-200">تعديل الملف الشخصي</h3>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">الاسم الكامل الظاهر</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">السيرة الذاتية (Bio)</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">رابط صورة الملف الشخصي (أفاتار)</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">رابط صورة الغلاف</label>
                <input 
                  type="text" 
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-left font-mono"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-brand-primary hover:opacity-95 text-white text-xs font-bold active:scale-95 transition-all mt-4 flex items-center justify-center"
              >
                حفظ وإجراء التحديثات
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 2F. CREATOR ANALYTICS DRAWER */}
      {activeDrawer === 'analytics' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />
          
          <div className="relative w-full max-w-md h-full bg-[#0b0f19] border-l border-slate-900 shadow-2xl flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-900 p-4 flex items-center justify-between">
              <button 
                onClick={() => setActiveDrawer('none')}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-slate-400"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-200">لوحة تحليلات منشئ المحتوى 📊</h3>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-right">
              
              {/* Stat Boxes Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">مجموع المشاهدات الأسبوعية</span>
                  <p className="text-xl font-extrabold text-white mt-1 font-mono">14,280</p>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">📈 +12.4% عن الأسبوع الماضي</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">تفاعل الجمهور</span>
                  <p className="text-xl font-extrabold text-white mt-1 font-mono">8.4%</p>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">📈 +2.1% تقدم إيجابي</span>
                </div>
              </div>

              {/* Views Performance Chart (Custom SVG Sparkline Chart) */}
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded">٧ أيام مضت</span>
                  <h4 className="text-xs font-bold text-slate-200">نمو مشاهدات المقاطع القصيرة</h4>
                </div>
                
                {/* Custom Sparkline Chart SVG */}
                <div className="h-28 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 30 L 0 20 Q 20 10 35 15 T 70 8 T 100 2 L 100 30 Z"
                      fill="url(#chart-grad)"
                    />
                    <path
                      d="M 0 20 Q 20 10 35 15 T 70 8 T 100 2"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="2" r="1.5" fill="#10b981" />
                  </svg>
                </div>
                
                {/* Chart Labels */}
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>الجمعة</span>
                  <span>الأربعاء</span>
                  <span>الاثنين</span>
                  <span>السبت</span>
                </div>
              </div>

              {/* Best Posting Hours */}
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-200">الساعات الذهبية لنشر المحتوى 🔥</h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">ممتاز جداً 🌟</span>
                    <span className="text-xs font-bold text-slate-300">08:00 مساءً - 10:00 مساءً</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full w-[95%] rounded-full" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">متفاعل ونشط 👍</span>
                    <span className="text-xs font-bold text-slate-300">04:00 مساءً - 06:00 مساءً</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-secondary h-full w-[70%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Top Audience locations */}
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">البلدان والمدن الأكثر تفاعلاً</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-mono text-slate-400">65%</span>
                    <span className="text-slate-200">الرياض، المملكة العربية السعودية 🇸🇦</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-mono text-slate-400">18%</span>
                    <span className="text-slate-200">جدة، المملكة العربية السعودية 🇸🇦</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-mono text-slate-400">12%</span>
                    <span className="text-slate-200">دبي، الإمارات العربية المتحدة 🇦🇪</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// === Sub-Component Helper: Empty State layout ===
function EmptyState({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center space-y-2.5">
      <div className="w-12 h-12 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-center">
        <Sparkles className="w-6 h-6 stroke-1 text-slate-500 animate-pulse" />
      </div>
      <h4 className="text-xs font-bold text-slate-400">{title}</h4>
      <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">{subtitle}</p>
    </div>
  );
}
