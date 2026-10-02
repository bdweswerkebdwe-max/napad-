import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, Radio, Mic, BookOpen, FileText, Image as ImageIcon, 
  X, Lock, Globe, Users, Plus, Sparkles, CheckCircle, UploadCloud, 
  AlertCircle, ArrowRight, RotateCw, Sparkle, Smile, Sliders, Volume2, 
  Tv, Compass, HelpCircle, Send, Music, HelpCircle as HelpIcon, Play, Pause, Flame
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface CreateModalProps {
  onClose: () => void;
}

type ModeType = 'text' | 'image' | '15s' | '60s' | '10m' | 'live' | 'audio_room';

const TIKTOK_SOUNDS = [
  { id: 's1', name: 'نبض الترند - موسيقى حماسية 🔥', artist: 'برعاية نبض', duration: '0:15' },
  { id: 's2', name: 'هدوء الطبيعة والبر 🌌', artist: 'سفر واسترخاء', duration: '0:30' },
  { id: 's3', name: 'ذكاء اصطناعي لو-فاي 💻', artist: 'سارة المهندس', duration: '0:45' },
  { id: 's4', name: 'صوت صب القهوة المختصة ☕️', artist: 'فيصل الرحال', duration: '0:10' }
];

const CAMERA_EFFECTS = [
  { id: 'none', name: 'طبيعي ✨', filter: '' },
  { id: 'vintage', name: 'عتيق كلاسيك 📼', filter: 'sepia(0.5) contrast(1.1)' },
  { id: 'noir', name: 'أبيض وأسود 🎬', filter: 'grayscale(1) contrast(1.2)' },
  { id: 'cyberpunk', name: 'سايبر بانك 🌌', filter: 'hue-rotate(140deg) saturate(1.6)' },
  { id: 'vibrant', name: 'ألوان مشبعة 🎨', filter: 'saturate(1.5) contrast(1.05)' }
];

export default function CreateModal({ onClose }: CreateModalProps) {
  const { createNewPost, createStory, currentUser, uploadFileToStorage } = useApp();

  // Mode Selection State
  const [activeMode, setActiveMode] = useState<ModeType>('15s');

  // Hardware permission & media stream state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);

  // TikTok Tool States
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [showSoundLibrary, setShowSoundLibrary] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [showFiltersTray, setShowFiltersTray] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [isBeautyEnabled, setIsBeautyEnabled] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Timer States
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountdown] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<3 | 10>(3);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // File picker / Content post states
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [textContent, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [hashtags, setHashtags] = useState<string[]>(['نبض', 'ترند']);
  const [hashtagInput, setHashtagInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // LIVE simulator states
  const [showLiveSimulator, setShowLiveSimulator] = useState(false);
  const [liveTitle, setLiveTitle] = useState('بث مباشر تفاعلي لمشاركة اللحظة ⚡️');
  const [liveCategory, setLiveCategory] = useState('ألعاب ومناقشات');
  const [liveHearts, setLiveHearts] = useState<{ id: number; left: number; emoji: string }[]>([]);
  const [liveComments, setLiveComments] = useState<string[]>([
    'خالد الحربي: السلام عليكم يا مبدع، منور البث! 👋',
    'أمل الشمري: موضوع رائع جداً ومفيد للجميع ✨',
  ]);

  // Audio room states
  const [showAudioRoomSimulator, setShowAudioRoomSimulator] = useState(false);
  const [audioRoomName, setAudioRoomName] = useState('مجلس نبض الثقافي والتقني 🎤');
  const [audioSpeakersCount, setAudioSpeakersCount] = useState('5');
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Gemini AI Prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Trigger media stream on entry or mode change
  useEffect(() => {
    // If text mode or audio room, we don't need video camera stream, but audio room needs mic
    const needsVideo = activeMode !== 'text' && activeMode !== 'audio_room' && !showAudioRoomSimulator;
    const needsAudio = activeMode !== 'text';

    if (needsVideo || needsAudio) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      navigator.mediaDevices.getUserMedia({ 
        video: needsVideo ? { facingMode } : false, 
        audio: needsAudio 
      })
      .then(stream => {
        setCameraStream(stream);
        setPermissionError(false);
      })
      .catch(err => {
        console.warn("Camera/Microphone access was denied or unavailable:", err);
        setPermissionError(true);
      });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeMode, facingMode, showLiveSimulator, showAudioRoomSimulator]);

  // Bind video element to media stream
  useEffect(() => {
    if (cameraStream && cameraPreviewRef.current) {
      cameraPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeMode, showLiveSimulator]);

  // Real-time live comments generation
  useEffect(() => {
    if (!showLiveSimulator) return;

    const mockComments = [
      'فيصل الرحال: تصوير ممتاز وبث مشوق جداً ☕️',
      'سارة المهندس: منور يا بطل، بالتوفيق في مشاريعك القادمة 💻🚀',
      'يوسف العتيبي: ما شاء الله، ربي يسعدك ويوفقك 🌟',
      'عبدالله المطيري: هل هذا البث برعاية منصة نبض؟ 🤔',
      'ريم عبدالله: الإضاءة مذهلة جداً والفكرة جميلة جداً ✨',
      'منار العتيبي: مبدع دائماً، استمر بمشاركة الأفكار 👍',
      'خالد الحربي: كيف يمكنني الانضمام للتحدث معك؟ 🎙️',
      'نورة السديري: رائع جداً! استمع بتركيز وشغف.'
    ];

    const interval = setInterval(() => {
      const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
      setLiveComments(prev => [...prev, randomComment].slice(-5));
    }, 2800);

    return () => clearInterval(interval);
  }, [showLiveSimulator]);

  // Gemini AI text description generation
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
      alert('حدث خطأ في الاتصال بخدمة جيميناي الذكية.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Flip Camera Logic
  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Rotate viewfinder animation
    const preview = cameraPreviewRef.current;
    if (preview) {
      preview.classList.add('animate-spin');
      setTimeout(() => preview.classList.remove('animate-spin'), 600);
    }
  };

  // Sound selection
  const handleSelectSound = (soundName: string) => {
    setSelectedSound(soundName);
    setShowSoundLibrary(false);
  };

  // Dynamic Record Hold / Click Action
  const startRecording = () => {
    if (isCountingDown) return;

    // Check if countdown timer is set
    if (selectedTimer && !isRecording) {
      setIsCountdown(true);
      setCountdown(selectedTimer);
      let count = selectedTimer;
      const timer = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
          setIsCountdown(false);
          actuallyStartRecording();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      actuallyStartRecording();
    }
  };

  const actuallyStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    const limitSec = activeMode === '15s' ? 15 : activeMode === '60s' ? 60 : 600;

    const interval = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= limitSec) {
          clearInterval(interval);
          stopRecording();
          return limitSec;
        }
        return prev + 0.1;
      });
    }, 100);
    recordingTimerRef.current = interval;
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // Post creation handler
  const handlePublishRecordedVideo = async () => {
    if (!currentUser) return;
    setIsUploading(true);

    try {
      // Create short video post in Firestore
      const finalMedia = mediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-wooden-cabin-42861-large.mp4';
      await createNewPost('video', textContent || 'مقطع فيديو قصير ورائع من كاميرا نبض الترند المباشرة 🎥✨', finalMedia, privacy, hashtags);
      
      setSuccessMsg('🎉 تم نشر مقطع الفيديو القصير بنجاح ومزامنته سحابياً!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      alert("حدث خطأ أثناء الاتصال بقاعدة البيانات.");
    } finally {
      setIsUploading(false);
    }
  };

  // Direct Gallery Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const isVideo = activeMode === '15s' || activeMode === '60s' || activeMode === '10m';
      const url = await uploadFileToStorage(file, isVideo ? 'videos' : 'images');
      setMediaUrl(url);
      alert('تم رفع ملف الاستوديو بنجاح وحفظه في Firebase Storage! 🟢');
    } catch (err) {
      console.error(err);
      alert('فشل الرفع السحابي. يرجى مراجعة إعدادات الخصوصية.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Publish Text/Image Story or Post
  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUploading(true);

    try {
      if (activeMode === 'text') {
        if (!textContent.trim()) return alert('الرجاء كتابة النص أولاً.');
        await createNewPost('text-image', textContent, mediaUrl, privacy, hashtags);
      } else if (activeMode === 'image') {
        await createStory(mediaUrl || '/src/assets/images/post_scenic_1790855694074.jpg');
      }
      setSuccessMsg('🎉 تم النشر والمزامنة بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      alert('حدث خطأ في المزامنة السحابية.');
    } finally {
      setIsUploading(false);
    }
  };

  // Initiate LIVE Stream in Database
  const handleStartLiveStream = async () => {
    if (!currentUser) return;
    const sessionId = `live_${Date.now()}`;
    try {
      await setDoc(doc(db, 'live_sessions', sessionId), {
        id: sessionId,
        type: 'video',
        title: liveTitle,
        category: liveCategory,
        hostUid: currentUser.uid,
        hostName: currentUser.displayName,
        hostAvatar: currentUser.avatar,
        timestamp: new Date().toISOString(),
        streamKey: `stream_${Math.random().toString(36).substring(7)}`,
        listeners: []
      });
      setShowLiveSimulator(true);
    } catch (err) {
      console.error("Error creating LIVE:", err);
    }
  };

  // Initiate Audio Lounge Space in Database
  const handleStartAudioRoom = async () => {
    if (!currentUser) return;
    const sessionId = `audio_${Date.now()}`;
    try {
      await setDoc(doc(db, 'live_sessions', sessionId), {
        id: sessionId,
        type: 'audio',
        title: audioRoomName,
        speakersCount: audioSpeakersCount,
        hostUid: currentUser.uid,
        hostName: currentUser.displayName,
        hostAvatar: currentUser.avatar,
        timestamp: new Date().toISOString(),
        streamKey: `audio_${Math.random().toString(36).substring(7)}`,
        listeners: []
      });
      setShowAudioRoomSimulator(true);
    } catch (err) {
      console.error("Error creating Audio Space:", err);
    }
  };

  const handleAddLiveHeart = () => {
    const emojis = ['❤️', '🔥', '✨', '😍', '👏', '💥', '💯'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 80 + 10,
      emoji: randomEmoji,
    };
    setLiveHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setLiveHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
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

  // Get active CSS filter
  const getCameraFilterStyle = () => {
    const filterObj = CAMERA_EFFECTS.find(f => f.id === activeFilter);
    let styleStr = filterObj ? filterObj.filter : '';
    if (isBeautyEnabled) {
      styleStr += ' brightness(1.05) contrast(0.95) saturate(1.03)';
    }
    return styleStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black md:max-w-lg md:mx-auto md:rounded-3xl overflow-hidden shadow-2xl font-cairo">
      
      {/* ===================== VIEW A: TEXT MODE EDITOR ===================== */}
      {activeMode === 'text' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#120c1f] via-[#0b0f19] to-brand-primary/20 flex flex-col justify-between p-6 z-10 text-right">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-2.5 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 rounded-full text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-white">منشور نصي سحابي</span>
            <div className="w-10 h-10" />
          </div>

          {/* Text Form */}
          <form onSubmit={handlePublishContent} className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
            
            {successMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl text-center font-bold">
                {successMsg}
              </div>
            )}

            {/* AI Writing Assistant */}
            <div className="p-4 bg-slate-950/50 border border-brand-primary/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-white">مساعد الكتابة الذكي بـ Gemini 🔮</span>
                <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiCaption}
                  disabled={isGenerating}
                  className="px-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'جاري صياغته...' : 'توليد ✨'}
                </button>
                <input
                  type="text"
                  placeholder="مثال: وصف فنجان قهوة الصباح والهدوء..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 h-9 px-3 bg-slate-900 border border-slate-800 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right"
                />
              </div>
            </div>

            <textarea
              placeholder="اكتب منشورك الإبداعي للجميع هنا..."
              value={textContent}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={280}
              className="w-full p-4 bg-transparent border-none focus:outline-none text-base text-slate-100 text-center leading-relaxed font-bold placeholder-slate-500 resize-none"
            />

            <div className="flex flex-col space-y-4">
              {/* Hashtags adding */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddHashtag} className="h-9 px-3 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-brand-secondary">أضف +</button>
                  <input
                    type="text"
                    placeholder="طبيعة، برمجة..."
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHashtag(); } }}
                    className="flex-1 h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 text-right"
                  />
                </div>
                <div className="flex flex-wrap flex-row-reverse gap-1.5 pt-1">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300">
                      <button type="button" onClick={() => handleRemoveHashtag(tag)} className="text-red-400 font-bold">×</button>
                      <span>#{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Toggle */}
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                <select
                  value={privacy}
                  onChange={(e: any) => setPrivacy(e.target.value)}
                  className="bg-transparent text-xs text-brand-secondary font-bold focus:outline-none"
                >
                  <option value="public" className="bg-slate-900 text-slate-200">الجميع (عام) 🌎</option>
                  <option value="followers" className="bg-slate-900 text-slate-200">المتابعين فقط 👥</option>
                  <option value="private" className="bg-slate-900 text-slate-200">خاص بي 🔒</option>
                </select>
                <span className="text-xs text-slate-400 font-semibold">مستوى الرؤية</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full h-12 rounded-xl bg-gradient-to-l from-brand-primary to-brand-gradient-start hover:opacity-95 text-white text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-brand-primary/20"
            >
              {isUploading ? 'جاري نشر المنشور...' : 'انشر الآن على التغذية 🚀'}
            </button>
          </form>

          {/* Mode Switcher */}
          <ModeSelector activeMode={activeMode} onChange={setActiveMode} />

        </div>
      )}

      {/* ===================== VIEW B: EXACT TIKTOK CAMERA VIEWFINDER ===================== */}
      {activeMode !== 'text' && (
        <div className="absolute inset-0 bg-black flex flex-col justify-between z-0">
          
          {/* Real Live HTML5 Camera Video Element */}
          <div className="absolute inset-0 z-0">
            {permissionError ? (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                <h3 className="text-base font-extrabold text-white">أذونات الكاميرا والمايكروفون مطلوبة 🚫</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  لم تتمكن منصة نبض من الوصول لعدسة كاميرا جوالك أو المايكروفون. يرجى تفعيل الأذونات من إعدادات المتصفح للتمتع بالتجربة الحية.
                </p>
                <label
                  htmlFor="camera-picker-file"
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  تصفح ورفع ملف مباشرة بدلاً من ذلك 📁
                </label>
              </div>
            ) : (
              <video
                ref={cameraPreviewRef}
                autoPlay
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{ 
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
                  filter: getCameraFilterStyle()
                }}
              />
            )}
            
            {/* Viewfinder Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            
            {/* Countdown Big Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                <span className="text-7xl font-extrabold text-brand-primary animate-ping">{countdown}</span>
              </div>
            )}
          </div>

          {/* ======================= TOP ROW OVERLAYS ======================= */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <button 
              onClick={onClose} 
              className="p-2.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sound Selector library button (TikTok precise styling) */}
            <button
              onClick={() => setShowSoundLibrary(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 text-white text-xs font-bold transition-all"
            >
              <Music className="w-3.5 h-3.5 text-brand-secondary fill-current animate-pulse" />
              <span className="truncate max-w-[120px]">{selectedSound || 'إضافة صوت 🎵'}</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-white ${isMuted ? 'text-red-400' : 'text-emerald-400'}`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* ======================= FLOATING SIDEBAR (RIGHT COLUMN) ======================= */}
          <div className="absolute top-20 right-4 z-20 flex flex-col gap-4">
            
            {/* Flip Camera */}
            <button 
              onClick={handleFlipCamera}
              className="flex flex-col items-center gap-1 text-white text-[10px] font-bold text-center focus:outline-none"
            >
              <div className="p-3 bg-black/35 backdrop-blur-md rounded-full hover:bg-black/50 border border-white/5 active:scale-95 transition-all">
                <RotateCw className="w-5 h-5" />
              </div>
              <span>قلب</span>
            </button>

            {/* Speed selection */}
            <button 
              onClick={() => setSpeedMultiplier(prev => prev === '1x' ? '2x' : prev === '2x' ? '0.5x' : '1x')}
              className="flex flex-col items-center gap-1 text-white text-[10px] font-bold text-center focus:outline-none"
            >
              <div className="p-3 bg-black/35 backdrop-blur-md rounded-full hover:bg-black/50 border border-white/5 active:scale-95 transition-all">
                <span className="text-[11px] font-mono font-extrabold text-brand-secondary">{speedMultiplier}</span>
              </div>
              <span>السرعة</span>
            </button>

            {/* Filters Tray toggle */}
            <button 
              onClick={() => setShowFiltersTray(!showFiltersTray)}
              className="flex flex-col items-center gap-1 text-white text-[10px] font-bold text-center focus:outline-none"
            >
              <div className={`p-3 rounded-full backdrop-blur-md border border-white/5 active:scale-95 transition-all ${
                activeFilter !== 'none' ? 'bg-brand-primary text-white' : 'bg-black/35 text-white hover:bg-black/50'
              }`}>
                <Sliders className="w-5 h-5" />
              </div>
              <span>الفلاتر</span>
            </button>

            {/* Face Enhancement Beauty Mode Toggle */}
            <button 
              onClick={() => setIsBeautyEnabled(!isBeautyEnabled)}
              className="flex flex-col items-center gap-1 text-white text-[10px] font-bold text-center focus:outline-none"
            >
              <div className={`p-3 rounded-full backdrop-blur-md border border-white/5 active:scale-95 transition-all ${
                isBeautyEnabled ? 'bg-emerald-500 text-white' : 'bg-black/35 text-white hover:bg-black/50'
              }`}>
                <Sparkle className="w-5 h-5" />
              </div>
              <span>تحسين</span>
            </button>

            {/* Countdown timer toggle */}
            <button 
              onClick={() => setSelectedTimer(prev => prev === 3 ? 10 : 3)}
              className="flex flex-col items-center gap-1 text-white text-[10px] font-bold text-center focus:outline-none"
            >
              <div className="p-3 bg-black/35 backdrop-blur-md rounded-full hover:bg-black/50 border border-white/5 active:scale-95 transition-all text-brand-primary font-mono text-[11px] font-extrabold">
                {selectedTimer}s
              </div>
              <span>المؤقت</span>
            </button>

          </div>

          {/* ======================= BOTTOM PANEL & CAPTURE CONTROLS ======================= */}
          <div className="relative z-10 flex flex-col space-y-4 pb-6">
            
            {/* If we have captured media or files - show a publish card overlay inside viewfinder */}
            {mediaUrl && (
              <div className="mx-4 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl space-y-3 shadow-2xl text-right animate-slideUp">
                <div className="flex justify-between items-center">
                  <button onClick={() => setMediaUrl('')} className="text-[10px] text-red-400 font-bold hover:underline">إلغاء وإعادة المحاولة 🗑️</button>
                  <span className="text-xs font-extrabold text-white">جاهز للنشر والمزامنة السحابية</span>
                </div>
                <textarea
                  placeholder="أدخل عنواناً جذاباً ووصفاً مميزاً للمقطع..."
                  value={textContent}
                  onChange={(e) => setContent(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-950 border border-slate-800 focus:outline-none rounded-xl text-xs text-slate-200 text-right leading-relaxed"
                />
                <button
                  onClick={handlePublishRecordedVideo}
                  disabled={isUploading}
                  className="w-full h-11 bg-brand-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  {isUploading ? 'جاري رفع ونشر الفيديو...' : 'انشر الآن على التغذية 🚀'}
                </button>
              </div>
            )}

            {/* LIVE setup form overlay */}
            {activeMode === 'live' && !showLiveSimulator && (
              <div className="mx-4 p-5 bg-slate-950/90 border border-slate-850 rounded-3xl space-y-4 text-right shadow-xl">
                <h3 className="text-xs font-extrabold text-white">إطلاق البث المباشر التفاعلي</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-semibold">عنوان البث المباشر</label>
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right"
                  />
                </div>
                <button
                  onClick={handleStartLiveStream}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/10"
                >
                  ابدأ البث المباشر والربط السحابي 🔴
                </button>
              </div>
            )}

            {/* Audio room setup form overlay */}
            {activeMode === 'audio_room' && !showAudioRoomSimulator && (
              <div className="mx-4 p-5 bg-slate-950/90 border border-slate-850 rounded-3xl space-y-4 text-right shadow-xl">
                <h3 className="text-xs font-extrabold text-white">إطلاق مجلس حواري صوتي</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">اسم الغرفة والمجلس</label>
                    <input
                      type="text"
                      value={audioRoomName}
                      onChange={(e) => setAudioRoomName(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">الحد الأقصى للمتحدثين</label>
                    <input
                      type="number"
                      value={audioSpeakersCount}
                      onChange={(e) => setAudioSpeakersCount(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right"
                    />
                  </div>
                </div>
                <button
                  onClick={handleStartAudioRoom}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  افتح المجلس الصوتي السحابي 🎤
                </button>
              </div>
            )}

            {/* If we are actively holding/recording - show live progress slider bar */}
            {isRecording && (
              <div className="px-6">
                <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-brand-primary h-full rounded-full transition-all duration-100" 
                    style={{ width: `${(recordingDuration / (activeMode === '15s' ? 15 : activeMode === '60s' ? 60 : 600)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                  <span>{activeMode === '15s' ? '15.0s' : activeMode === '60s' ? '60.0s' : '10m'}</span>
                  <span className="text-white font-bold">{recordingDuration.toFixed(1)}s</span>
                </div>
              </div>
            )}

            {/* ======================= CAPTURE ACTIONS ROW ======================= */}
            {!mediaUrl && activeMode !== 'live' && activeMode !== 'audio_room' && (
              <div className="flex items-center justify-around px-8">
                
                {/* Effects Menu trigger */}
                <button 
                  onClick={() => setShowFiltersTray(true)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <div className="w-12 h-12 bg-white/15 hover:bg-white/25 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all shadow-lg">
                    <Smile className="w-6 h-6 text-yellow-300" />
                  </div>
                  <span className="text-[10px] text-white font-bold">المؤثرات</span>
                </button>

                {/* Big TikTok Central Capture Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-600 scale-90' : 'bg-transparent hover:bg-white/10 scale-100'
                    }`}
                  >
                    <div className={`rounded-full transition-all ${
                      isRecording ? 'w-6 h-6 bg-white rounded-md' : 'w-13 h-13 bg-brand-primary'
                    }`} />
                  </button>
                </div>

                {/* Gallery Upload (natively triggers mobile input file picker) */}
                <div className="flex flex-col items-center gap-1.5">
                  <label 
                    htmlFor="camera-picker-file"
                    className="w-12 h-12 bg-white/15 hover:bg-white/25 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <UploadCloud className="w-6 h-6 text-brand-secondary" />
                  </label>
                  <input
                    type="file"
                    id="camera-picker-file"
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <span className="text-[10px] text-white font-bold">تحميل</span>
                </div>

              </div>
            )}

            {/* Mode Selector horizontal line */}
            {!mediaUrl && !showLiveSimulator && !showAudioRoomSimulator && (
              <ModeSelector activeMode={activeMode} onChange={setActiveMode} />
            )}

          </div>
        </div>
      )}

      {/* ===================== VIEW C: SOUND LIBRARY TIKTOK SHEET ===================== */}
      {showSoundLibrary && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button onClick={() => setShowSoundLibrary(false)} className="text-slate-400 hover:text-white">إغلاق ×</button>
            <h3 className="text-sm font-extrabold text-white">مكتبة الأصوات والترندات</h3>
            <div className="w-9 h-9" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-right">
            {TIKTOK_SOUNDS.map(sound => (
              <div 
                key={sound.id}
                onClick={() => handleSelectSound(sound.name)}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-brand-primary flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-xs text-slate-500 font-mono">{sound.duration}</span>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white">{sound.name}</h4>
                  <p className="text-[10px] text-slate-400">@{sound.artist}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => handleSelectSound('')}
            className="w-full h-11 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs text-slate-300 font-semibold"
          >
            إزالة الصوت المختار
          </button>
        </div>
      )}

      {/* ===================== VIEW D: FILTERS SELECTION PANEL ===================== */}
      {showFiltersTray && (
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md rounded-t-3xl border-t border-slate-850 p-6 space-y-4 animate-slideUp">
          <div className="flex justify-between items-center">
            <button onClick={() => setShowFiltersTray(false)} className="text-[11px] text-slate-400 hover:text-white">إخفاء</button>
            <span className="text-xs font-extrabold text-white">فلاتر الكاميرا والمؤثرات</span>
          </div>
          <div className="flex flex-row-reverse gap-3 overflow-x-auto pb-2 no-scrollbar">
            {CAMERA_EFFECTS.map(effect => (
              <button
                key={effect.id}
                onClick={() => { setActiveFilter(effect.id); setShowFiltersTray(false); }}
                className={`flex-col items-center justify-center px-4 py-3 rounded-2xl shrink-0 border text-center transition-all ${
                  activeFilter === effect.id 
                    ? 'bg-brand-primary border-brand-primary text-white' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full mx-auto bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-80 mb-1.5" />
                <span className="text-[10px] font-bold block">{effect.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== VIEW E: FULLSCREEN LIVE BROADCAST STUDIO ===================== */}
      {showLiveSimulator && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950 text-white p-4">
          
          {/* Real Live Video Feed background */}
          <div className="absolute inset-0 z-0 bg-black">
            <video
              ref={cameraPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          </div>

          {/* Floating Hearts rising animation placeholder */}
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
                setActiveMode('15s');
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

          {/* Comments list panel */}
          <div className="mt-auto relative z-10 p-3 space-y-2.5">
            <div className="max-h-48 overflow-y-auto space-y-2 flex flex-col justify-end">
              {liveComments.map((comment, i) => (
                <div key={i} className="p-2 bg-black/40 backdrop-blur-sm rounded-xl text-right text-xs max-w-xs ml-auto border border-white/5 animate-slideUp">
                  <p className="text-slate-100 font-semibold">{comment}</p>
                </div>
              ))}
            </div>

            {/* Bottom Row action interactions */}
            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleAddLiveHeart}
                className="w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xl rounded-xl flex items-center justify-center active:scale-75 transition-transform"
              >
                ❤️
              </button>
              <input
                type="text"
                placeholder="أرسل رداً فورياً للبث المباشر..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLiveComments(prev => [...prev, `أنت: ${(e.target as HTMLInputElement).value}`].slice(-5));
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1 h-11 px-4 bg-black/50 backdrop-blur-md border border-white/10 focus:outline-none rounded-xl text-xs text-white text-right"
              />
            </div>
          </div>

        </div>
      )}

      {/* ===================== VIEW F: AUDIO SPACE STUDIO ===================== */}
      {showAudioRoomSimulator && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-[#0b0c16] text-white p-6 justify-between">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <button 
              onClick={() => { setShowAudioRoomSimulator(false); setActiveMode('15s'); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl"
            >
              غادر بهدوء 👋
            </button>
            <div className="text-right">
              <h3 className="text-xs font-bold text-slate-400">مجلس حواري صوتي مباشر</h3>
              <p className="text-[10px] text-emerald-400 font-bold">بإدارة منصة نبض السحابية</p>
            </div>
          </div>

          {/* Speakers Grid representation */}
          <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
            <div className="grid grid-cols-3 gap-6 max-w-sm w-full">
              
              {/* Host Speaker */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="relative p-1 rounded-full border-2 border-brand-primary animate-pulse">
                  <img src={currentUser?.avatar || '/src/assets/images/avatar_premium_1790855716859.jpg'} className="w-14 h-14 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-brand-primary p-1 rounded-full text-[8px] font-extrabold text-white">مضيف</span>
                </div>
                <span className="text-[10px] font-bold text-white truncate max-w-[64px]">{currentUser?.displayName || 'أنت'}</span>
              </div>

              {/* Guest 1 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="relative p-1 rounded-full border border-brand-secondary">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="w-14 h-14 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-brand-secondary p-1 rounded-full text-[8px] font-extrabold text-slate-950">متحدث</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300">سارة المهندس</span>
              </div>

              {/* Guest 2 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="relative p-1 rounded-full border border-slate-700">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" className="w-14 h-14 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-slate-800 p-1 rounded-full text-[8px] font-extrabold text-slate-400">متحدث</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300">فيصل الرحال</span>
              </div>

            </div>

            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-slate-200">{audioRoomName}</h2>
              <span className="text-[9px] text-slate-500 block font-mono">الحد الأقصى للمستمعين: {audioSpeakersCount} / 25 مستمع</span>
            </div>

            {/* Waveform graphic */}
            <div className="flex items-center gap-1 h-12">
              <span className="w-1 h-8 bg-brand-primary rounded-full animate-pulse" />
              <span className="w-1 h-12 bg-brand-secondary rounded-full animate-pulse delay-75" />
              <span className="w-1 h-6 bg-brand-primary rounded-full animate-pulse delay-150" />
              <span className="w-1 h-10 bg-brand-secondary rounded-full animate-pulse delay-100" />
              <span className="w-1 h-4 bg-brand-primary rounded-full animate-pulse" />
            </div>
          </div>

          {/* Space Controls (Mute / mic options) */}
          <div className="flex items-center justify-around bg-slate-950/40 p-4 rounded-3xl border border-slate-900">
            <button 
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`p-3.5 rounded-full transition-all ${
                isMicMuted ? 'bg-red-600 text-white' : 'bg-slate-850 hover:bg-slate-800 text-emerald-400'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 font-semibold">{isMicMuted ? 'المايكروفون مكتوم 🎙️' : 'المايكروفون نشط ويبث 🟢'}</span>
          </div>

        </div>
      )}

    </div>
  );
}

// Sub Component: Horizontal Scrolling Mode Selector
interface ModeSelectorProps {
  activeMode: ModeType;
  onChange: (mode: ModeType) => void;
}

function ModeSelector({ activeMode, onChange }: ModeSelectorProps) {
  const modesList: { id: ModeType; name: string }[] = [
    { id: 'text', name: 'نص ✍️' },
    { id: 'image', name: 'صورة 💫' },
    { id: '15s', name: '15 ثانية ⏱️' },
    { id: '60s', name: '60 ثانية ⏱️' },
    { id: '10m', name: '10 دقائق ⏱️' },
    { id: 'live', name: 'LIVE 🔴' },
    { id: 'audio_room', name: 'المجلس 🎤' }
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 text-center select-none">
      <div className="flex flex-row-reverse items-center justify-center gap-5 px-6 whitespace-nowrap">
        {modesList.map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`text-xs font-extrabold pb-1 transition-all ${
              activeMode === mode.id 
                ? 'text-brand-primary border-b-2 border-brand-primary scale-105' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode.name}
          </button>
        ))}
      </div>
    </div>
  );
}
