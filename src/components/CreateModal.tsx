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

type MainTabType = 'video' | 'post' | 'story' | 'live' | 'audio_room';
type VideoDurationType = '15s' | '60s' | '10m';

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

  // 1. Core 5 Tabs Navigation States (Horizontal Mode Switcher)
  const [mainTab, setMainTab] = useState<MainTabType>('video');
  const [videoDuration, setVideoDuration] = useState<VideoDurationType>('15s');

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

  // Post / Story fields
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

  const requestCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      setPermissionError(false);
      alert("✅ تم منح أذونات الوصول للكاميرا والمايكروفون بنجاح!");
    } catch (err) {
      console.warn("User denied or browser blocked camera permissions:", err);
      setPermissionError(true);
      alert("⚠️ تعذر تفعيل الكاميرا تلقائياً. يرجى تفعيل أذونات الكاميرا والمايكروفون من إعدادات الموقع بالمتصفح.");
    }
  };

  // Trigger media stream on mainTab change or setup changes
  useEffect(() => {
    // If post or audio room (before simulation), we do not need live video camera preview, but audio room needs mic
    const needsVideo = mainTab !== 'post' && mainTab !== 'audio_room' && !showAudioRoomSimulator;
    const needsAudio = mainTab !== 'post';

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
  }, [mainTab, facingMode, showLiveSimulator, showAudioRoomSimulator]);

  // Bind video element
  useEffect(() => {
    if (cameraStream && cameraPreviewRef.current) {
      cameraPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, mainTab, showLiveSimulator]);

  // Live Comments simulator
  useEffect(() => {
    if (!showLiveSimulator) return;

    const mockComments = [
      'فيصل الرحال: تصوير ممتاز وبث مشوق جداً ☕️',
      'سارة المهندس: منور يا بطل، بالتوفيق في مشاريعك القادمة 💻🚀',
      'يوسف العتيبي: ما شاء الله، ربي يسعدك ويوفقك 🌟',
      'ريم عبدالله: الإضاءة مذهلة جداً والفكرة جميلة جداً ✨',
      'منار العتيبي: مبدع دائماً، استمر بمشاركة الأفكار 👍'
    ];

    const interval = setInterval(() => {
      const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
      setLiveComments(prev => [...prev, randomComment].slice(-5));
    }, 3000);

    return () => clearInterval(interval);
  }, [showLiveSimulator]);

  // Gemini generator
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

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    const preview = cameraPreviewRef.current;
    if (preview) {
      preview.classList.add('animate-spin');
      setTimeout(() => preview.classList.remove('animate-spin'), 600);
    }
  };

  // Record Trigger
  const startRecording = () => {
    if (isCountingDown) return;

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
    const limitSec = videoDuration === '15s' ? 15 : videoDuration === '60s' ? 60 : 600;

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

  // Publish video post
  const handlePublishRecordedVideo = async () => {
    if (!currentUser) return;
    setIsUploading(true);

    try {
      const finalMedia = mediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-wooden-cabin-42861-large.mp4';
      await createNewPost('video', textContent || 'مقطع فيديو قصير من منصة نبض الرقمية 🎥💫', finalMedia, privacy, hashtags);
      
      setSuccessMsg('🎉 تم النشر والمزامنة سحابياً بنجاح!');
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      alert("حدث خطأ في المزامنة.");
    } finally {
      setIsUploading(false);
    }
  };

  // Publish Story
  const handlePublishStory = async () => {
    if (!currentUser) return;
    setIsUploading(true);
    try {
      const finalMedia = mediaUrl || '/src/assets/images/post_scenic_1790855694074.jpg';
      await createStory(finalMedia);
      setSuccessMsg('🎉 تم إضافة القصة اليومية بنجاح لمتابعيك!');
      setTimeout(() => onClose(), 1000);
    } catch (e) {
      alert("حدث خطأ.");
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
      const isVideo = mainTab === 'video';
      const url = await uploadFileToStorage(file, isVideo ? 'videos' : 'images');
      setMediaUrl(url);
      alert('تم رفع ملفك بنجاح للرفع السحابي! 🟢');
    } catch (err) {
      alert('فشل الرفع السحابي.');
    } finally {
      setIsUploading(false);
    }
  };

  // Publish standard text post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUploading(true);

    try {
      if (!textContent.trim()) return alert('الرجاء كتابة المحتوى أولاً.');
      await createNewPost('text-image', textContent, mediaUrl, privacy, hashtags);
      setSuccessMsg('🎉 تم النشر والتحديث بنجاح!');
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      alert('حدث خطأ.');
    } finally {
      setIsUploading(false);
    }
  };

  // Create LIVE session in Database
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
        streamKey: `stream_${Math.random().toString(36).substring(7)}`
      });
      setShowLiveSimulator(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Audio Space session in Database
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
        timestamp: new Date().toISOString()
      });
      setShowAudioRoomSimulator(true);
    } catch (err) {
      console.error(err);
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
      
      {/* ===================== VIEW 1: POST MODE (منشور) ===================== */}
      {mainTab === 'post' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#120c1f] via-[#0b0f19] to-brand-primary/20 flex flex-col justify-between p-6 z-10 text-right">
          
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-2.5 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 rounded-full text-white">
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-white">منشور نصي وصور</span>
            <div className="w-10 h-10" />
          </div>

          <form onSubmit={handlePublishPost} className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
            
            {successMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl text-center font-bold">
                {successMsg}
              </div>
            )}

            {/* AI Caption generator */}
            <div className="p-4 bg-slate-950/50 border border-brand-primary/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-white">توليد الوصف بالذكاء الاصطناعي 🔮</span>
                <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiCaption}
                  disabled={isGenerating}
                  className="px-3 bg-brand-primary text-white text-xs font-bold rounded-xl"
                >
                  {isGenerating ? 'صياغة...' : 'ولد ✨'}
                </button>
                <input
                  type="text"
                  placeholder="مثال: وصف فنجان قهوة الصباح والهدوء..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 h-9 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white text-right focus:outline-none"
                />
              </div>
            </div>

            <textarea
              placeholder="اكتب منشورك الإبداعي للجميع هنا..."
              value={textContent}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-4 bg-transparent border-none focus:outline-none text-base text-slate-100 text-center leading-relaxed font-bold placeholder-slate-500 resize-none"
            />

            <div className="space-y-4">
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
                <span className="text-xs text-slate-400 font-semibold">الرؤية والخصوصية</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full h-12 rounded-xl bg-gradient-to-l from-brand-primary to-brand-gradient-start hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg"
            >
              {isUploading ? 'جاري النشر...' : 'انشر الآن على التغذية 🚀'}
            </button>
          </form>

          {/* Bottom Tabs Switcher */}
          <TabsSwitcher activeTab={mainTab} onChange={setMainTab} />

        </div>
      )}

      {/* ===================== VIEW 2: FULL CAMERA VIEWFINDER (فيديو, قصة, بث) ===================== */}
      {mainTab !== 'post' && (
        <div className="absolute inset-0 bg-black flex flex-col justify-between z-0">
          
          {/* Camera Viewfinder */}
          <div className="absolute inset-0 z-0">
            {permissionError && mainTab !== 'audio_room' ? (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                <h3 className="text-base font-extrabold text-white">تفعيل الوصول للكاميرا مطلوب 🚫</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  الرجاء تفعيل إذن الوصول للكاميرا والمايكروفون من إعدادات المتصفح للتمكن من التقاط ومشاركة فيديوهاتك المباشرة وسرد قصصك.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={requestCameraPermissions}
                    className="w-full py-2.5 bg-gradient-to-l from-brand-primary to-brand-gradient-start text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md active:scale-95 transition-all"
                  >
                    طلب إذن الوصول للكاميرا والمايكروفون الآن 🎙️📷
                  </button>
                  <label
                    htmlFor="camera-upload-btn"
                    className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-850 block text-center"
                  >
                    رفع ملف من الاستوديو كبديل 📁
                  </label>
                </div>
              </div>
            ) : (
              mainTab !== 'audio_room' && (
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
              )
            )}
            
            {isFlashEnabled && (
              <div className="absolute inset-0 bg-white/20 pointer-events-none mix-blend-screen z-10" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            
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

            {mainTab === 'video' && (
              <button
                onClick={() => setShowSoundLibrary(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-bold"
              >
                <Music className="w-3.5 h-3.5 text-brand-secondary fill-current animate-pulse" />
                <span className="truncate max-w-[120px]">{selectedSound || 'إضافة صوت 🎵'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFlashEnabled(!isFlashEnabled)}
                className={`p-2.5 bg-black/40 backdrop-blur-md rounded-full border transition-colors ${isFlashEnabled ? 'text-yellow-400 border-yellow-500/50' : 'text-slate-400 border-white/5'}`}
                title="فلاش الكاميرا"
              >
                <Flame className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-white ${isMuted ? 'text-red-400' : 'text-emerald-400'}`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ======================= FLOATING SIDEBAR (RIGHT COLUMN) ======================= */}
          {mainTab !== 'audio_room' && (
            <div className="absolute top-20 right-4 z-20 flex flex-col gap-4">
              <button onClick={handleFlipCamera} className="flex flex-col items-center gap-1 text-white text-[10px] font-bold">
                <div className="p-3 bg-black/35 backdrop-blur-md rounded-full border border-white/5 active:scale-95 transition-all">
                  <RotateCw className="w-5 h-5" />
                </div>
                <span>قلب</span>
              </button>

              <button onClick={() => setSpeedMultiplier(prev => prev === '1x' ? '2x' : prev === '2x' ? '0.5x' : '1x')} className="flex flex-col items-center gap-1 text-white text-[10px] font-bold">
                <div className="p-3 bg-black/35 backdrop-blur-md rounded-full border border-white/5 active:scale-95 transition-all">
                  <span className="text-[11px] font-mono font-extrabold text-brand-secondary">{speedMultiplier}</span>
                </div>
                <span>السرعة</span>
              </button>

              <button onClick={() => setShowFiltersTray(!showFiltersTray)} className="flex flex-col items-center gap-1 text-white text-[10px] font-bold">
                <div className={`p-3 rounded-full backdrop-blur-md border border-white/5 active:scale-95 transition-all ${activeFilter !== 'none' ? 'bg-brand-primary' : 'bg-black/35'}`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <span>الفلاتر</span>
              </button>

              <button onClick={() => setIsBeautyEnabled(!isBeautyEnabled)} className="flex flex-col items-center gap-1 text-white text-[10px] font-bold">
                <div className={`p-3 rounded-full backdrop-blur-md border border-white/5 active:scale-95 transition-all ${isBeautyEnabled ? 'bg-emerald-500' : 'bg-black/35'}`}>
                  <Sparkle className="w-5 h-5" />
                </div>
                <span>تحسين</span>
              </button>
            </div>
          )}

          {/* ======================= BOTTOM PANEL CONTROLS ======================= */}
          <div className="relative z-10 flex flex-col space-y-4 pb-6">
            
            {/* 1. Captured File preview publish form */}
            {mediaUrl && (
              <div className="mx-4 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl space-y-3 shadow-2xl text-right animate-slideUp">
                <div className="flex justify-between items-center">
                  <button onClick={() => setMediaUrl('')} className="text-[10px] text-red-400 font-bold">إلغاء المقطع الحالي 🗑️</button>
                  <span className="text-xs font-extrabold text-white">مقطعك جاهز للنشر السحابي</span>
                </div>
                <textarea
                  placeholder="أدخل عنواناً جذاباً ووصفاً مميزاً للمقطع..."
                  value={textContent}
                  onChange={(e) => setContent(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:outline-none rounded-xl text-xs text-white text-right"
                />
                <button
                  onClick={mainTab === 'story' ? handlePublishStory : handlePublishRecordedVideo}
                  disabled={isUploading}
                  className="w-full h-11 bg-brand-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  {isUploading ? 'جاري الحفظ والمزامنة السحابية...' : 'انشر الآن للجميع 🚀'}
                </button>
              </div>
            )}

            {/* 2. VIDEO mode setup: Secondary duration selector directly above record button */}
            {mainTab === 'video' && !mediaUrl && (
              <div className="flex justify-center gap-4 text-center select-none pb-2">
                {(['15s', '60s', '10m'] as VideoDurationType[]).map(dur => (
                  <button
                    key={dur}
                    onClick={() => setVideoDuration(dur)}
                    className={`px-3 py-1 text-[11px] font-extrabold rounded-full transition-all ${
                      videoDuration === dur ? 'bg-brand-primary text-white scale-105' : 'bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dur === '15s' && '15 ثانية'}
                    {dur === '60s' && '60 ثانية'}
                    {dur === '10m' && '10 دقائق'}
                  </button>
                ))}
              </div>
            )}

            {/* 3. LIVE setup form overlay */}
            {mainTab === 'live' && !showLiveSimulator && (
              <div className="mx-4 p-5 bg-slate-950/90 border border-slate-850 rounded-3xl space-y-4 text-right shadow-xl">
                <h3 className="text-xs font-extrabold text-white">إطلاق البث المباشر التفاعلي</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-semibold">عنوان البث المباشر</label>
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleStartLiveStream}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  ابدأ البث المباشر والربط السحابي 🔴
                </button>
              </div>
            )}

            {/* 4. AUDIO ROOM setup form overlay */}
            {mainTab === 'audio_room' && !showAudioRoomSimulator && (
              <div className="mx-4 p-5 bg-slate-950/90 border border-slate-850 rounded-3xl space-y-4 text-right shadow-xl">
                <h3 className="text-xs font-extrabold text-white">إطلاق مجلس حواري صوتي</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">اسم الغرفة والمجلس</label>
                    <input
                      type="text"
                      value={audioRoomName}
                      onChange={(e) => setAudioRoomName(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">الحد الأقصى للمتحدثين</label>
                    <input
                      type="number"
                      value={audioSpeakersCount}
                      onChange={(e) => setAudioSpeakersCount(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-right focus:outline-none"
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
                    style={{ width: `${(recordingDuration / (videoDuration === '15s' ? 15 : videoDuration === '60s' ? 60 : 600)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                  <span>{videoDuration === '15s' ? '15.0s' : videoDuration === '60s' ? '60.0s' : '10m'}</span>
                  <span className="text-white font-bold">{recordingDuration.toFixed(1)}s</span>
                </div>
              </div>
            )}

            {/* ======================= CAPTURE ACTIONS ROW ======================= */}
            {!mediaUrl && mainTab !== 'live' && mainTab !== 'audio_room' && (
              <div className="flex items-center justify-around px-8">
                
                {/* Instant Demo Publish Button */}
                <button 
                  type="button"
                  onClick={async () => {
                    if (!currentUser) return;
                    setIsUploading(true);
                    try {
                      if (mainTab === 'video') {
                        await createNewPost('video', textContent || 'مقطع إبداعي هادف ومميز من نبض ⚡️🎥', 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-wooden-cabin-42861-large.mp4', privacy, hashtags);
                        alert("🎉 تم نشر مقطع الفيديو التجريبي بنجاح بالتغذية العامة!");
                      } else {
                        await createStory('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600');
                        alert("🎉 تم نشر قصة سريعة بنجاح لمتابعيك!");
                      }
                      onClose();
                    } catch (e) {
                      alert("فشل النشر السريع.");
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  disabled={isUploading}
                  className="flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <div className="w-12 h-12 bg-brand-primary/20 hover:bg-brand-primary/45 rounded-xl border border-brand-primary/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all">
                    <Send className="w-5 h-5 text-brand-secondary transform rotate-180 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-white font-bold">نشر فوري 🚀</span>
                </button>

                {/* Big Shutter Record Button */}
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

                {/* Upload Gallery files */}
                <div className="flex flex-col items-center gap-1.5">
                  <label 
                    htmlFor="camera-upload-btn"
                    className="w-12 h-12 bg-white/15 hover:bg-white/25 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-6 h-6 text-brand-secondary" />
                  </label>
                  <input
                    type="file"
                    id="camera-upload-btn"
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <span className="text-[10px] text-white font-bold">تحميل</span>
                </div>

              </div>
            )}

            {/* Core 5 Horizontal Selector tabs */}
            {!mediaUrl && !showLiveSimulator && !showAudioRoomSimulator && (
              <TabsSwitcher activeTab={mainTab} onChange={setMainTab} />
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
                onClick={() => { setSelectedSound(sound.name); setShowSoundLibrary(false); }}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-brand-primary flex items-center justify-between cursor-pointer transition-colors animate-slideUp"
              >
                <span className="text-xs text-slate-500 font-mono">{sound.duration}</span>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white">{sound.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">@{sound.artist}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => { setSelectedSound(null); setShowSoundLibrary(false); }}
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
          
          <div className="absolute inset-0 z-0 bg-black">
            <video
              ref={cameraPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover opacity-75 animate-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          </div>

          {liveHearts.map(heart => (
            <div
              key={heart.id}
              className="floating-heart text-2xl"
              style={{ left: `${heart.left}%` }}
            >
              {heart.emoji}
            </div>
          ))}

          <div className="relative z-10 flex items-center justify-between mt-2 px-2">
            <button
              onClick={() => {
                setShowLiveSimulator(false);
                setMainTab('video');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              إنهاء البث 🔴
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!currentUser) return;
                try {
                  await createNewPost('text-image', `أنا الآن في بث مباشر تفاعلي! تفضلوا بالانضمام والمشاركة لمناقشة: "${liveTitle}" 🔴👇`, 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=600', 'public', ['بث_مباشر', 'لايف_نبض']);
                  alert("📣 تم نشر رابط بثك المباشر في التغذية العامة بنجاح!");
                } catch (e) {
                  alert("فشل نشر الرابط.");
                }
              }}
              className="px-3 py-2 bg-brand-primary text-white text-[11px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-brand-secondary transform rotate-180" />
              <span>انشر البث 📣</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-600 text-white font-bold px-2.5 py-1.5 rounded-lg animate-pulse">مباشر LIVE</span>
              <span className="text-[10px] bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg font-mono">👁️ 1,240</span>
            </div>
          </div>

          <div className="relative z-10 text-right mt-6 px-2 space-y-1">
            <h3 className="text-sm font-extrabold text-white">{liveTitle}</h3>
            <span className="text-[10px] text-brand-secondary font-bold bg-brand-secondary/15 px-2.5 py-0.5 rounded-md inline-block">#{liveCategory}</span>
          </div>

          <div className="mt-auto relative z-10 p-3 space-y-2.5">
            <div className="max-h-48 overflow-y-auto space-y-2 flex flex-col justify-end">
              {liveComments.map((comment, i) => (
                <div key={i} className="p-2 bg-black/40 backdrop-blur-sm rounded-xl text-right text-xs max-w-xs ml-auto border border-white/5 animate-slideUp">
                  <p className="text-slate-100 font-semibold">{comment}</p>
                </div>
              ))}
            </div>

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
        <div className="fixed inset-0 z-[150] flex flex-col bg-[#0b0c16] text-white p-6 justify-between animate-slideUp">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <button 
              onClick={() => { setShowAudioRoomSimulator(false); setMainTab('video'); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl"
            >
              غادر بهدوء 👋
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!currentUser) return;
                try {
                  await createNewPost('text-image', `مجلسنا الصوتي الحواري نشط الآن ويبث حياً ومباشرة! انضموا إلينا للمناقشة والمشاركة حول: "${audioRoomName}" 🎤📻`, 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600', 'public', ['مجلس_صوتي', 'صالون_نبض']);
                  alert("🔗 تم نشر رابط مجلسك الصوتي في التغذية العامة بنجاح!");
                } catch (e) {
                  alert("فشل نشر الرابط.");
                }
              }}
              className="px-3 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-brand-secondary transform rotate-180" />
              <span>انشر المجلس 🔗</span>
            </button>
            <div className="text-right">
              <h3 className="text-xs font-bold text-slate-400">مجلس حواري صوتي مباشر</h3>
              <p className="text-[10px] text-emerald-400 font-bold">بإدارة منصة نبض السحابية</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
            <div className="grid grid-cols-3 gap-6 max-w-sm w-full">
              
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="relative p-1 rounded-full border-2 border-brand-primary animate-pulse">
                  <img src={currentUser?.avatar || '/src/assets/images/avatar_premium_1790855716859.jpg'} className="w-14 h-14 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-brand-primary p-1 rounded-full text-[8px] font-extrabold text-white">مضيف</span>
                </div>
                <span className="text-[10px] font-bold text-white truncate max-w-[64px]">{currentUser?.displayName || 'أنت'}</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-1">
                <div className="relative p-1 rounded-full border border-brand-secondary">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="w-14 h-14 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-brand-secondary p-1 rounded-full text-[8px] font-extrabold text-slate-950">متحدث</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300">سارة المهندس</span>
              </div>

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

            <div className="flex items-center gap-1 h-12">
              <span className="w-1 h-8 bg-brand-primary rounded-full animate-pulse" />
              <span className="w-1 h-12 bg-brand-secondary rounded-full animate-pulse delay-75" />
              <span className="w-1 h-6 bg-brand-primary rounded-full animate-pulse delay-150" />
              <span className="w-1 h-10 bg-brand-secondary rounded-full animate-pulse delay-100" />
              <span className="w-1 h-4 bg-brand-primary rounded-full animate-pulse" />
            </div>
          </div>

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

// Sub Component: Bottom core 5 tabs Switcher
interface TabsSwitcherProps {
  activeTab: MainTabType;
  onChange: (tab: MainTabType) => void;
}

function TabsSwitcher({ activeTab, onChange }: TabsSwitcherProps) {
  const tabsList: { id: MainTabType; name: string; icon: React.ReactNode }[] = [
    { id: 'video', name: 'فيديو 🎥', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'post', name: 'منشور ✍️', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'story', name: 'قصة 💫', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'live', name: 'بث مباشر 🔴', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'audio_room', name: 'غرفة صوتية 🎤', icon: <Mic className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 text-center select-none bg-black/60 border-t border-white/5">
      <div className="flex flex-row-reverse items-center justify-center gap-5 px-6 whitespace-nowrap">
        {tabsList.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 text-xs font-extrabold pb-1.5 px-2.5 transition-all rounded-full ${
              activeTab === tab.id 
                ? 'text-brand-primary border-b-2 border-brand-primary scale-105 font-bold bg-white/5 py-1' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Direct Publishing Icon next to each mode icon */}
            <Send className={`w-3 h-3 text-brand-secondary transform rotate-180 ${activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-40'}`} />
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
