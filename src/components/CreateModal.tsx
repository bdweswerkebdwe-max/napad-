import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, Radio, Mic, BookOpen, FileText, Image as ImageIcon, 
  X, Lock, Globe, Users, Plus, Sparkles, CheckCircle, UploadCloud, AlertCircle, ArrowRight
} from 'lucide-react';

interface CreateModalProps {
  onClose: () => void;
}

type CreateTab = 'video' | 'live' | 'audio_room' | 'story' | 'post';

export default function CreateModal({ onClose }: CreateModalProps) {
  const { createNewPost, createStory, currentUser, uploadFileToStorage } = useApp();
  
  // High-fidelity flow: First select the isolated type, then open its custom form!
  const [selectedMode, setSelectedMode] = useState<CreateTab | null>(null);
  
  // Real File Upload handler
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, selectedMode === 'video' ? 'videos' : 'images');
      setMediaUrl(url);
      alert('تم رفع الملف بنجاح وتوليد الرابط وحفظه في Firebase Storage! 🟢');
    } catch (err) {
      console.error(err);
      alert('فشل رفع الملف إلى المستودع السحابي. يرجى مراجعة إعدادات الأمان في Firebase.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Form State
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState(['نبض', 'جديد']);
  
  // Live Stream State
  const [liveTitle, setLiveTitle] = useState('بث مباشر تفاعلي لمشاركة اللحظة ⚡️');
  const [liveCategory, setLiveCategory] = useState('ألعاب ومناقشات');
  
  // Live Simulator state for dynamic hearts and scrolling comments
  const [showLiveSimulator, setShowLiveSimulator] = useState(false);
  const [showAudioRoomSimulator, setShowAudioRoomSimulator] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveHearts, setLiveHearts] = useState<{ id: number; left: number; emoji: string }[]>([]);
  const [liveComments, setLiveComments] = useState<string[]>([
    'خالد الحربي: السلام عليكم يا مبدع، منور البث! 👋',
    'أمل الشمري: موضوع رائع جداً ومفيد للجميع ✨',
  ]);

  const handleAddLiveHeart = () => {
    const emojis = ['❤️', '💖', '🔥', '✨', '😍', '👏', '💥', '💯'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 80 + 10, // random percent left
      emoji: randomEmoji,
    };
    setLiveHearts(prev => [...prev, newHeart]);
    
    // Automatically prune old hearts after animation ends
    setTimeout(() => {
      setLiveHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2500);
  };

  React.useEffect(() => {
    if (!showLiveSimulator) return;

    const mockComments = [
      'فيصل الرحال: تصوير ممتاز وبث مشوق جداً ☕️',
      'سارة المهندس: منور يا بطل، بالتوفيق في مشاريعك القادمة 💻🚀',
      'يوسف العتيبي: ما شاء الله، ربي يسعدك ويوفقك 🌟',
      'عبدالله المطيري: هل هذا البث برعاية منصة نبض؟ 🤔',
      'ريم عبدالله: الإضاءة مذهلة جداً والفكرة جميلة جداً ✨',
      'محمد عسيري: تحية لك من جنوب المملكة يا غالي 🤍',
      'منار العتيبي: مبدع دائماً، استمر بمشاركة الأفكار 👍',
      'خالد الحربي: كيف يمكنني الانضمام للتحدث معك؟ 🎙️',
      'نورة السديري: رائع جداً! استمع بتركيز وشغف.'
    ];

    const interval = setInterval(() => {
      const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
      setLiveComments(prev => [...prev, randomComment].slice(-5)); // keep last 5
    }, 3000);

    return () => clearInterval(interval);
  }, [showLiveSimulator]);

  // Audio Room State
  const [audioRoomName, setAudioRoomName] = useState('مجلس نبض الثقافي والتقني 🎤');
  const [audioSpeakersCount, setAudioSpeakersCount] = useState('5');
  
  // Simulated uploading
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Gemini AI Caption generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAiCaption = async () => {
    if (!aiPrompt.trim()) {
      alert('الرجاء إدخال فكرة موجزة أولاً لتوليد النص الذكي.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (data.text) {
        setContent(data.text);
        const foundHashtags = data.text.match(/#[\w\u0600-\u06FF]+/g);
        if (foundHashtags) {
          const cleaned = foundHashtags.map((h: string) => h.replace('#', ''));
          setHashtags(cleaned);
        }
      } else {
        alert(data.error || 'فشل توليد الوصف الذكي.');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بخادم جيميناي الذكي.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddHashtag = () => {
    const trimmed = hashtagInput.trim().replace('#', '');
    if (trimmed && !hashtags.includes(trimmed)) {
      setHashtags([...hashtags, trimmed]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const handleMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (selectedMode === 'video') {
        setMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-from-above-42636-large.mp4');
      } else {
        setMediaUrl('/src/assets/images/post_scenic_1790855694074.jpg');
      }
      alert('تم تحميل وسائط التجربة وتوليد الرابط بنجاح! 🟢');
    }, 1200);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMode) return;

    if (selectedMode === 'post') {
      if (!content.trim()) return alert('الرجاء كتابة محتوى المنشور أولاً.');
      createNewPost('text-image', content, mediaUrl, privacy, hashtags);
    } else if (selectedMode === 'video') {
      if (!content.trim()) return alert('الرجاء كتابة وصف الفيديو القصير.');
      createNewPost('video', content, mediaUrl, privacy, hashtags);
    } else if (selectedMode === 'story') {
      createStory(mediaUrl);
    } else if (selectedMode === 'live') {
      setShowLiveSimulator(true);
      return; // Do not close, show the interactive live stream simulator overlay!
    } else if (selectedMode === 'audio_room') {
      setShowAudioRoomSimulator(true);
      return; // Do not close, show the interactive Twitter Space style Audio Room overlay!
    }

    setSuccessMsg('تم النشر وتحديث التغذية بنجاح! 🎉');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Main Container Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden animate-slideUp">
        
        {/* Header Contract */}
        <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-sm font-extrabold text-white">
            {selectedMode === null ? 'بوابة الإبداع والنشر' : 'تعبئة التفاصيل والمشاركة'}
          </h2>
          
          {selectedMode !== null ? (
            <button 
              onClick={() => { setSelectedMode(null); setSuccessMsg(''); }}
              className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>تغيير الوضع</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* 1. SELECTION DASHBOARD (Shown when selectedMode is null) */}
        {selectedMode === null && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            <div className="text-center space-y-1.5 pb-2">
              <span className="text-xs bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full font-bold">💡 انقر على أحد الخيارات المنفصلة للبدء</span>
              <h3 className="text-base font-extrabold text-slate-200 pt-1">ما هو المحتوى الذي تريد مشاركته اليوم؟</h3>
            </div>

            {/* Grid of highly isolated, premium options */}
            <div className="grid grid-cols-1 gap-3.5">
              
              {/* Option 1: Post */}
              <button
                onClick={() => setSelectedMode('post')}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-violet-500 rounded-2xl flex items-center justify-between text-right transition-all transform active:scale-[0.99] group shadow-sm hover:shadow-violet-500/15"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-violet-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>

                <div className="flex-1 ml-4 mr-4">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-violet-400 transition-colors">إنشاء منشور نصي وصوري 📝</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">شارك أفكارك وتأملاتك مع صورة دافئة في الجدول الزمني العام للمنصة.</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              </button>

              {/* Option 2: Short Video */}
              <button
                onClick={() => setSelectedMode('video')}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-brand-primary rounded-2xl flex items-center justify-between text-right transition-all transform active:scale-[0.99] group shadow-sm hover:shadow-brand-primary/15"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>

                <div className="flex-1 ml-4 mr-4">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-brand-primary transition-colors">تسجيل أو رفع فيديو قصير 🎥</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">ارفع مقاطع الفيديوهات القصيرة (Reels/Shorts) التفاعلية لتصل لترند المشاهدات.</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-inner shrink-0">
                  <Video className="w-6 h-6" />
                </div>
              </button>

              {/* Option 3: Story */}
              <button
                onClick={() => setSelectedMode('story')}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-amber-500 rounded-2xl flex items-center justify-between text-right transition-all transform active:scale-[0.99] group shadow-sm hover:shadow-amber-500/15"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>

                <div className="flex-1 ml-4 mr-4">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-amber-400 transition-colors">أضف لقصتك اليومية 💫</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">شارك يومياتك السريعة التي تختفي تلقائياً وبشكل آمن بعد مرور 24 ساعة.</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
              </button>

              {/* Option 4: Live Stream */}
              <button
                onClick={() => setSelectedMode('live')}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-red-500 rounded-2xl flex items-center justify-between text-right transition-all transform active:scale-[0.99] group shadow-sm hover:shadow-red-500/15"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>

                <div className="flex-1 ml-4 mr-4">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-red-400 transition-colors">إطلاق بث مباشر تفاعلي 🔴</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">افتح بث الفيديو الحي المباشر للتفاعل والتواصل اللحظي مع جميع المشاهدين.</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner shrink-0 animate-pulse">
                  <Radio className="w-6 h-6 fill-current" />
                </div>
              </button>

              {/* Option 5: Audio Room */}
              <button
                onClick={() => setSelectedMode('audio_room')}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500 rounded-2xl flex items-center justify-between text-right transition-all transform active:scale-[0.99] group shadow-sm hover:shadow-emerald-500/15"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>

                <div className="flex-1 ml-4 mr-4">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">فتح مجلس وغرفة صوتية 🎤</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">أنشئ صالون صوتي تفاعلي وادعُ أصدقائك للحوار والمناقشات الممتعة.</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
              </button>

            </div>
          </div>
        )}

        {/* 2. SPECIFIC FORMS (Shown when an isolated mode is selected) */}
        {selectedMode !== null && (
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {successMsg && (
              <div className="mb-4 p-4 bg-emerald-950/40 border border-emerald-850 rounded-xl text-xs text-emerald-400 text-center font-bold">
                🎉 {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-5 text-right">
              
              {/* Form A: Posts / Videos / Story Forms */}
              {(selectedMode === 'post' || selectedMode === 'video' || selectedMode === 'story') && (
                <>
                  {/* Gemini Assistant Panel (Only for feed items) */}
                  {selectedMode !== 'story' && (
                    <div className="p-4 bg-slate-950 border border-brand-primary/20 rounded-2xl space-y-3 mb-1">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs font-bold text-white">مساعد الكتابة الذكي بـ Gemini 🔮</span>
                        <Sparkles className="w-4 h-4 text-brand-primary fill-current animate-pulse" />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">أدخل فكرة مبسطة وسيقوم الذكاء الاصطناعي بصياغة أفضل وصف متكامل مع الهاشتاغات الرائجة لك تلقائياً.</p>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={handleGenerateAiCaption}
                          className="h-9 px-3.5 bg-brand-primary text-white hover:opacity-95 text-xs font-bold rounded-xl shrink-0 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isGenerating ? 'جاري الصياغة...' : 'صياغة ✨'}
                        </button>
                        <input
                          type="text"
                          placeholder="مثال: ليلة ممطرة هادئة مع فنجان قهوة دافئ..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="flex-1 h-9 px-3 bg-slate-900 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Caption input */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">اكتب وصفاً أو تعليقاً جذاباً</label>
                    <textarea
                      placeholder={selectedMode === 'story' ? 'أضف نصاً لقصتك الحالية... (اختياري)' : 'ماذا يدور في ذهنك اليوم؟ أضف الهاشتاغات لتصل لمنشورات الترند...'}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      maxLength={280}
                      className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-2xl text-xs text-slate-200 text-right leading-relaxed resize-none"
                    />
                    <div className="text-[10px] text-slate-500 font-mono">
                      {content.length}/280 حرف
                    </div>
                  </div>

                  {/* Upload media */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">ملفات الوسائط والصور</label>
                    <div className="p-6 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                      {mediaUrl ? (
                        <div className="w-full space-y-2">
                          {selectedMode === 'video' ? (
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex items-center justify-between text-left">
                              <span className="text-[10px] text-emerald-400 font-bold">تم الإعداد</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">waves_loop_42636.mp4</span>
                            </div>
                          ) : (
                            <img 
                              src={mediaUrl} 
                              alt="Uploaded asset" 
                              className="max-h-32 object-cover rounded-xl mx-auto border border-slate-800"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => setMediaUrl('')}
                            className="text-[11px] text-red-400 hover:underline font-bold"
                          >
                            إزالة الملف الحالي
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-slate-500 animate-pulse" />
                          <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-semibold">اسحب وأفلت الملفات هنا</p>
                            <p className="text-[10px] text-slate-500">يدعم صيغ MP4 للفيديو وصيغ PNG, JPG للصور</p>
                          </div>
                          <div className="flex gap-2.5">
                            <label
                              htmlFor="real-file-picker"
                              className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-primary/10"
                            >
                              {isUploading ? 'جاري رفع الملف...' : 'اختر ملفاً حقيقياً سحابياً 📁'}
                            </label>
                            <input
                              type="file"
                              id="real-file-picker"
                              onChange={handleRealFileUpload}
                              disabled={isUploading}
                              accept={selectedMode === 'video' ? 'video/*' : 'image/*'}
                              className="hidden"
                            />
                            
                            <button
                              type="button"
                              onClick={handleMockUpload}
                              disabled={isUploading}
                              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 border border-slate-800"
                            >
                              استخدم ملفاً تجريبياً سريعاً ⚡️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Hashtags (Only for post / video) */}
                  {selectedMode !== 'story' && (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium">وسوم الهاشتاغ المرفقة</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddHashtag}
                          className="h-9 px-4 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-brand-secondary border border-slate-800"
                        >
                          إضافة +
                        </button>
                        <input
                          type="text"
                          placeholder="طبيعة، تكنولوجيا..."
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddHashtag(); } }}
                          className="flex-1 h-9 px-3 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right"
                        />
                      </div>
                      
                      <div className="flex flex-wrap flex-row-reverse gap-1.5 pt-1">
                        {hashtags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-medium"
                          >
                            <button type="button" onClick={() => handleRemoveHashtag(tag)} className="text-red-400 hover:text-white font-bold font-mono">×</button>
                            <span>#{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Privacy settings */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">خصوصية ومستوى رؤية المنشور</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPrivacy('private')}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                          privacy === 'private' ? 'bg-slate-850 border-brand-primary text-brand-primary' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>خاص بي</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivacy('followers')}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                          privacy === 'followers' ? 'bg-slate-850 border-brand-primary text-brand-primary' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>للمتابعين فقط</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivacy('public')}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                          privacy === 'public' ? 'bg-slate-850 border-brand-primary text-brand-primary' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>عام للكل</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Form B: Live stream specifics */}
              {selectedMode === 'live' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-2xl flex items-center justify-between gap-3 text-right">
                    <div className="text-xs text-red-400 leading-relaxed">
                      ستبدأ بثاً مباشراً فورياً. سيتم إخطار كافة متابعيك المسجلين والنشطين الآن فور بدئك البث المباشر.
                    </div>
                    <Radio className="w-8 h-8 text-red-500 fill-current shrink-0 animate-ping" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">عنوان البث المباشر</label>
                    <input
                      type="text"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">فئة ومجال البث</label>
                    <select
                      value={liveCategory}
                      onChange={(e) => setLiveCategory(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right font-medium"
                    >
                      <option value="ألعاب ومناقشات">ألعاب ومناقشات تقنية</option>
                      <option value="ثقافة وفن">ثقافة وفنون تصويرية</option>
                      <option value="تعليم ودردشة">سفر ودردشة مفتوحة مع المتابعين</option>
                    </select>
                  </div>

                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img 
                      src="/src/assets/images/welcome_abstract_1790855671657.jpg" 
                      alt="Camera feed" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm"
                    />
                    <div className="relative z-10 flex flex-col items-center space-y-2 text-slate-300">
                      <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">محاكاة البث المباشر المسبق</span>
                      <p className="text-[10px] text-slate-400">سيتم تفعيل كاميرا الهاتف الأمامية فور الضغط على الزر أدناه</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form C: Audio Room specifics */}
              {selectedMode === 'audio_room' && (
                <div className="space-y-4">
                  <div className="p-4 bg-brand-primary/10 border border-brand-primary/40 rounded-2xl flex items-center justify-between gap-3 text-right">
                    <div className="text-xs text-brand-primary leading-relaxed">
                      غرف الصوت التفاعلية تتيح لك جمع ما يصل إلى 100 مستمع وإتاحة ميكروفونات متعددة للنقاش البناء.
                    </div>
                    <Mic className="w-8 h-8 text-brand-primary shrink-0 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">اسم الغرفة الصوتية</label>
                    <input
                      type="text"
                      value={audioRoomName}
                      onChange={(e) => setAudioRoomName(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">الحد الأقصى للمتحدثين على المنصة</label>
                    <input
                      type="number"
                      value={audioSpeakersCount}
                      onChange={(e) => setAudioSpeakersCount(e.target.value)}
                      min={2}
                      max={12}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right font-medium"
                    />
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center gap-1.5 h-16">
                    <div className="w-1.5 h-8 bg-brand-secondary rounded-full animate-pulse" />
                    <div className="w-1.5 h-12 bg-brand-primary rounded-full animate-pulse delay-75" />
                    <div className="w-1.5 h-6 bg-brand-secondary rounded-full animate-pulse delay-150" />
                    <div className="w-1.5 h-10 bg-brand-primary rounded-full animate-pulse delay-100" />
                    <div className="w-1.5 h-4 bg-brand-secondary rounded-full animate-pulse" />
                  </div>
                </div>
              )}

              {/* Action Publish button */}
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-l from-brand-primary to-brand-gradient-start hover:opacity-95 text-white text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
              >
                <span>
                  {selectedMode === 'post' && 'انشر الآن على التغذية العام'}
                  {selectedMode === 'video' && 'شارك الفيديو القصير'}
                  {selectedMode === 'story' && 'أضف للقصص اليومية'}
                  {selectedMode === 'live' && 'ابدأ البث المباشر فوراً'}
                  {selectedMode === 'audio_room' && 'افتح المجلس الصوتي'}
                </span>
                <Plus className="w-4 h-4" />
              </button>

            </form>
          </div>
        )}

      </div>

      {/* 4. FULLSCREEN INTERACTIVE LIVE STREAM SIMULATOR */}
      {showLiveSimulator && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950 text-white p-4">
          
          {/* Simulated Video Feed background (abstract mesh) */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/src/assets/images/welcome_abstract_1790855671657.jpg" 
              alt="Live feed simulation" 
              className="w-full h-full object-cover filter brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          </div>

          {/* Simulated Floating Hearts rising */}
          {liveHearts.map(heart => (
            <div
              key={heart.id}
              className="floating-heart text-2xl"
              style={{ left: `${heart.left}%` }}
            >
              {heart.emoji}
            </div>
          ))}

          {/* Top Bar info */}
          <div className="relative z-10 flex items-center justify-between mt-2 px-2">
            <button
              onClick={() => {
                setShowLiveSimulator(false);
                setSelectedMode(null);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              إنهاء البث 🔴
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-600 text-white font-bold px-2.5 py-1.5 rounded-lg animate-pulse">مباشر LIVE</span>
              <span className="text-[10px] bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg font-mono">👁️ 1,240</span>
            </div>
          </div>

          {/* Title description in top-right */}
          <div className="relative z-10 text-right mt-6 px-2 space-y-1">
            <h3 className="text-sm font-extrabold text-white">{liveTitle}</h3>
            <span className="text-[10px] text-brand-secondary font-bold bg-brand-secondary/15 px-2.5 py-0.5 rounded-md inline-block">#{liveCategory}</span>
          </div>

          {/* Interactive Comments & Actions block (TikTok Style) */}
          <div className="relative z-10 mt-auto flex flex-col space-y-4">
            
            {/* Active Comments timeline */}
            <div className="max-h-48 overflow-y-auto space-y-2 px-2 text-right flex flex-col items-end">
              {liveComments.map((comment, index) => (
                <div key={index} className="text-xs bg-black/45 backdrop-blur-md p-2 px-3 rounded-2xl inline-block max-w-[85%] text-right font-medium text-slate-100">
                  <p>{comment}</p>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-3 w-full px-2 pb-safe mb-2">
              {/* Hearts button */}
              <button
                type="button"
                onClick={handleAddLiveHeart}
                className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl shadow-lg shadow-brand-primary/10 hover:opacity-90 active:scale-75 transition-all shrink-0"
                title="أرسل تفاعلاً"
              >
                ❤️
              </button>

              <input
                type="text"
                placeholder="أرسل رسالة تفاعلية للبث المباشر..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const text = e.currentTarget.value.trim();
                    setLiveComments(prev => [...prev, `أنت: ${text}`].slice(-5));
                    e.currentTarget.value = '';
                  }
                }}
                className="flex-1 h-12 px-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-white text-right focus:outline-none placeholder-slate-400"
              />
            </div>

          </div>

        </div>
      )}

      {/* 5. TWITTER SPACE / CLUBHOUSE INTERACTIVE AUDIO SPACE SIMULATOR */}
      {showAudioRoomSimulator && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950 text-slate-100 p-6 overflow-hidden">
          {/* Animated colorful backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-slate-950 to-brand-secondary/10 opacity-60 z-0" />

          {/* Top Bar Navigation */}
          <div className="relative z-10 flex items-center justify-between mt-2">
            <button
              onClick={() => {
                setShowAudioRoomSimulator(false);
                setSelectedMode(null);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 text-slate-300"
            >
              مغادرة المجلس الصوتي 🚪
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[11px] font-bold text-slate-300">مجلس صوتي مباشر</span>
            </div>
          </div>

          {/* Room Title */}
          <div className="relative z-10 text-right mt-8 space-y-2">
            <h2 className="text-base font-extrabold text-white">{audioRoomName}</h2>
            <div className="flex gap-2 justify-end text-[10px] text-slate-400">
              <span>🎤 {audioSpeakersCount} متحدثين</span>
              <span>•</span>
              <span>👥 48 مستمعاً نشطاً</span>
            </div>
          </div>

          {/* Speakers grid (High-Fidelity Circular Layout) */}
          <div className="relative z-10 mt-10 grid grid-cols-3 gap-6 justify-center">
            
            {/* Host - The logged-in user */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="relative">
                {/* Pulsating Concentric Sound Wave Animation */}
                {!isMicMuted && (
                  <div className="absolute -inset-1 rounded-full bg-brand-primary/40 animate-ping" />
                )}
                <img
                  src={currentUser?.avatar || "/src/assets/images/avatar_premium_1790855716859.jpg"}
                  alt="Host avatar"
                  className="relative z-10 w-16 h-16 rounded-full object-cover border-2 border-brand-primary shadow-lg"
                />
                <span className="absolute bottom-0 right-0 z-20 text-[10px] bg-brand-primary text-white font-bold px-1.5 py-0.5 rounded-md">مضيف</span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[80px]">أنت</span>
              <span className="text-[9px] text-slate-400">
                {isMicMuted ? '🎙️ مكتوم' : '🎤 يتحدث...'}
              </span>
            </div>

            {/* Speaker 2 - Sarah */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-brand-secondary/40 animate-pulse" />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                  alt="Sarah avatar"
                  className="relative z-10 w-16 h-16 rounded-full object-cover border-2 border-slate-800 shadow-lg"
                />
              </div>
              <span className="text-xs font-bold text-slate-200">سارة المهندس</span>
              <span className="text-[9px] text-slate-400">🎤 يتحدث...</span>
            </div>

            {/* Speaker 3 - Youssef */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="relative">
                <img
                  src="/src/assets/images/avatar_premium_1790855716859.jpg"
                  alt="Youssef avatar"
                  className="relative z-10 w-16 h-16 rounded-full object-cover border-2 border-slate-800 shadow-lg"
                />
              </div>
              <span className="text-xs font-bold text-slate-200">يوسف العتيبي</span>
              <span className="text-[9px] text-slate-400">🎙️ مكتوم</span>
            </div>

          </div>

          {/* Listening Audience partition */}
          <div className="relative z-10 mt-12 flex-1 text-right">
            <h3 className="text-xs font-bold text-slate-400 mb-4">المستمعون (48)</h3>
            
            <div className="grid grid-cols-4 gap-4 max-h-48 overflow-y-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-1">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                    alt="Listener avatar"
                    className="w-10 h-10 rounded-full object-cover opacity-60 border border-slate-900"
                    onError={(e) => {
                      e.currentTarget.src = "/src/assets/images/avatar_premium_1790855716859.jpg";
                    }}
                  />
                  <span className="text-[10px] text-slate-400 truncate max-w-[60px]">مستمع_{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Audio controls */}
          <div className="relative z-10 mt-auto bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-850 flex items-center justify-between">
            <button
              onClick={() => {
                setShowAudioRoomSimulator(false);
                setSelectedMode(null);
              }}
              className="px-5 py-2.5 bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl hover:bg-red-600/25 transition-all"
            >
              مغادرة هادئة
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg transition-all active:scale-90 ${
                  isMicMuted 
                    ? 'bg-red-600 text-white' 
                    : 'bg-brand-primary text-white'
                }`}
              >
                {isMicMuted ? '🔇' : '🎤'}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
