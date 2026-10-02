import React, { useState, useEffect } from 'react';
import { useApp, Chat, Story, Notification, User, Message } from '../context/AppContext';
import { 
  MessageSquare, Bell, Phone, Video as VideoIcon, Send, BookOpen, 
  ChevronLeft, ArrowRight, Eye, Sparkles, Volume2, Smile, Mic, Radio, ShieldAlert, CheckCircle2, Plus
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Inbox() {
  const { 
    chats, stories, notifications, sendDirectMessage, 
    markNotificationsAsRead, viewStory, initiateCall, currentUser 
  } = useApp();

  // Active view: 'list' | 'chat' | 'notifs'
  const [inboxView, setInboxView] = useState<'list' | 'notifs'>('list');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Active Story Viewer State
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  // Real-time Firestore DM sync subscription
  useEffect(() => {
    if (!activeChat) return;

    const messagesQuery = query(
      collection(db, `chats/${activeChat.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach(doc => {
        messagesList.push({ ...(doc.data() as Message), id: doc.id });
      });
      if (messagesList.length > 0) {
        setActiveChat(prev => prev ? { ...prev, messages: messagesList } : null);
      }
    }, (error) => {
      console.error("Error subscribing to live DMs:", error);
    });

    return () => unsubscribe();
  }, [activeChat?.id]);

  const handleSendMsgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !chatInput.trim()) return;
    
    sendDirectMessage(activeChat.id, chatInput);
    
    // Simulate updating active chat state messages in the UI without waiting for sync
    const updatedMessages = [
      ...activeChat.messages,
      {
        id: `temp_${Date.now()}`,
        senderId: 'user',
        text: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        mediaType: 'text' as const
      }
    ];

    setActiveChat({
      ...activeChat,
      messages: updatedMessages
    });

    setChatInput('');
  };

  const handleViewStory = (story: Story) => {
    viewStory(story.id);
    setViewingStory(story);
  };

  // Quick initiate call triggers
  const handleStartCall = (user: User, type: 'audio' | 'video') => {
    initiateCall(user, type);
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative h-full flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden">
      
      {/* 1. Header Navigation Tabs for Inbox vs Notifications */}
      {inboxView !== 'list' || !activeChat ? (
        <div className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-900 p-4 flex items-center justify-between">
          
          {/* Unread indicators & Mark read action button */}
          {inboxView === 'notifs' ? (
            <button 
              onClick={() => { markNotificationsAsRead(); alert('تم تحديد كافة الإشعارات كمقروءة 🟢.'); }}
              className="text-xs text-brand-secondary font-bold hover:underline"
            >
              تحديد الكل كمقروء
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {/* Dual sub-navigation tabs (Interactive buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-850 rounded-xl">
            <button
              onClick={() => setInboxView('notifs')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                inboxView === 'notifs' ? 'bg-slate-850 text-brand-primary' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {unreadNotifsCount > 0 && (
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                )}
                <span>الإشعارات</span>
                <Bell className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => setInboxView('list')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                inboxView === 'list' ? 'bg-slate-850 text-brand-primary' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>الرسائل</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          <h2 className="text-sm font-extrabold text-white">صندوق الوارد</h2>
        </div>
      ) : null}

      {/* 2. Inbox Views */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* VIEW A: MESSAGES LIST */}
        {inboxView === 'list' && !activeChat && (
          <div className="max-w-lg mx-auto py-4 space-y-6">
            
            {/* 2A-1. Horizontal Stories Bar */}
            <div className="px-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 text-right">القصص اليومية النشطة</h3>
              <div className="flex flex-row-reverse gap-4 overflow-x-auto pb-2 no-scrollbar">
                
                {/* My Story simulation button */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border border-dashed border-slate-700 hover:border-brand-primary cursor-pointer transition-colors mb-1">
                    <Plus className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">قصتك</span>
                </div>

                {/* Creators' active stories with gradients */}
                {stories.map(story => (
                  <button
                    key={story.id}
                    onClick={() => handleViewStory(story)}
                    className="flex flex-col items-center shrink-0 focus:outline-none"
                  >
                    <div className={`p-0.5 rounded-full ${
                      story.isViewed 
                        ? 'border-2 border-slate-800' 
                        : 'bg-gradient-to-tr from-brand-primary via-brand-gradient-start to-brand-secondary p-[2.5px]'
                    } mb-1 shadow-md`}>
                      <img 
                        src={story.avatar} 
                        alt={story.username} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-900"
                      />
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono truncate max-w-[64px]">@{story.username}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2A-2. Direct Messages Chat List */}
            <div className="px-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 text-right">المراسلات المباشرة ({chats.length})</h3>
              
              <div className="divide-y divide-slate-900 border border-slate-850 bg-slate-900/50 rounded-2xl overflow-hidden">
                {chats.map(chat => {
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleOpenChat(chat)}
                      className="p-4 flex items-center justify-between hover:bg-slate-850/60 cursor-pointer transition-colors text-right"
                    >
                      {/* Left: Unread message badge & time */}
                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-slate-500 block font-mono">{lastMessage?.timestamp || 'الآن'}</span>
                        {chat.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center bg-brand-primary text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full mt-1.5 animate-bounce">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Right: Participant Avatar and stacked text */}
                      <div className="flex items-center gap-3.5 text-right flex-1 justify-end ml-4">
                        <div className="text-right">
                          <h4 className="text-xs font-bold text-white flex items-center justify-end gap-1">
                            {chat.participant.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-secondary fill-current shrink-0" />}
                            <span>{chat.participant.displayName}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                            {lastMessage?.text || 'لا توجد رسائل بعد'}
                          </p>
                        </div>

                        <div className="relative">
                          <img 
                            src={chat.participant.avatar} 
                            alt={chat.participant.displayName} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-800"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW B: FULLSCREEN ACTIVE CHAT BOX */}
        {activeChat && (
          <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col">
            
            {/* Chatbox Header with Call actions */}
            <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
              
              {/* Call Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStartCall(activeChat.participant, 'audio')}
                  className="p-2.5 bg-slate-850 hover:bg-slate-800 text-emerald-400 rounded-xl transition-all active:scale-95 border border-slate-800"
                  title="مكالمة صوتية"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStartCall(activeChat.participant, 'video')}
                  className="p-2.5 bg-slate-850 hover:bg-slate-800 text-brand-primary rounded-xl transition-all active:scale-95 border border-slate-800"
                  title="مكالمة فيديو"
                >
                  <VideoIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Stacked participant names */}
              <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white">{activeChat.participant.displayName}</h4>
                  <p className="text-[9px] text-emerald-400 font-semibold">نشط الآن على نبض</p>
                </div>
                <img 
                  src={activeChat.participant.avatar} 
                  alt="Participant" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-800"
                />
              </div>

              {/* Back Button */}
              <button 
                onClick={() => setActiveChat(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 flex items-center gap-1 text-xs font-bold"
              >
                <span>رجوع</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Chatbox Messages list container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#070a12]">
              <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl max-w-xs mx-auto text-center space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">🔐 اتصال مشفر عبر خوادم نبض</span>
                <p className="text-[9px] text-slate-500 leading-relaxed">رسائلك ومكالماتك مشفرة تماماً ومحفوظة بموثوقية Firebase Realtime.</p>
              </div>

              {activeChat.messages.map((msg, index) => {
                const isMe = msg.senderId === 'user';
                return (
                  <div 
                    key={msg.id || index} 
                    className={`flex gap-3 text-right ${isMe ? 'justify-start' : 'justify-end'}`}
                  >
                    {/* Bubble */}
                    <div className="space-y-1 max-w-[75%]">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-l from-brand-primary to-brand-gradient-start text-white rounded-tr-none' 
                          : 'bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none'
                      }`}>
                        
                        {/* If call log */}
                        {msg.mediaType === 'call_log' ? (
                          <div className="flex items-center gap-2 font-semibold">
                            <span>{msg.text}</span>
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}

                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block text-left px-1">{msg.timestamp}</span>
                    </div>

                    {/* Participant Avatar */}
                    {!isMe && (
                      <img 
                        src={activeChat.participant.avatar} 
                        alt="User" 
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-850"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chatbox Send Form */}
            <form 
              onSubmit={handleSendMsgSubmit}
              className="p-4 bg-slate-900 border-t border-slate-850 flex items-center gap-2 pb-safe"
            >
              <button 
                type="submit"
                className="w-11 h-11 bg-brand-primary hover:opacity-95 text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-md shadow-brand-primary/10"
              >
                <Send className="w-4.5 h-4.5 transform rotate-180" />
              </button>
              <input
                type="text"
                placeholder="اكتب رسالتك الآمنة هنا..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 h-11 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-xs text-slate-200 text-right"
              />
            </form>

          </div>
        )}

        {/* VIEW C: NOTIFICATIONS LIST */}
        {inboxView === 'notifs' && (
          <div className="max-w-lg mx-auto py-4 px-4 space-y-3.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-right justify-end ${
                    notif.isRead 
                      ? 'bg-slate-900/40 border-slate-850/60 text-slate-300' 
                      : 'bg-slate-900 border-brand-primary/20 text-white shadow-sm'
                  }`}
                >
                  {/* Text Details */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between gap-1.5 mb-1 flex-row-reverse">
                      <div className="flex items-center gap-1.5">
                        {notif.username ? (
                          <span className="text-xs font-bold text-white">@{notif.username}</span>
                        ) : (
                          <span className="text-xs font-bold text-brand-primary">تنبيه النظام</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.text}</p>
                  </div>

                  {/* Icon Avatar or Logo */}
                  <div className="shrink-0">
                    {notif.avatar ? (
                      <img 
                        src={notif.avatar} 
                        alt="User" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-850"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <Bell className="w-12 h-12 text-slate-700 mx-auto stroke-1" />
                <p className="text-xs">لا توجد أي تنبيهات أو إشعارات نشطة لديك حالياً.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. CINEMATIC STORY VIEWER OVERLAY */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black justify-between p-4">
          
          {/* Progress bar simulation indicator */}
          <div className="w-full flex gap-1.5 px-2 pt-2">
            <div className="h-1 bg-brand-primary rounded-full flex-1 animate-storyProgress" />
            <div className="h-1 bg-slate-800 rounded-full flex-1" />
          </div>

          {/* Story Creator header */}
          <div className="flex items-center justify-between w-full px-2 mt-4 z-10 text-white">
            <button 
              onClick={() => setViewingStory(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
            >
              إغلاق ×
            </button>
            
            <div className="flex items-center gap-2 text-right">
              <div>
                <h4 className="text-xs font-bold">{viewingStory.displayName}</h4>
                <span className="text-[9px] text-slate-300 font-mono">@{viewingStory.username} · {viewingStory.timestamp}</span>
              </div>
              <img 
                src={viewingStory.avatar} 
                alt="Story creator" 
                className="w-9 h-9 rounded-full object-cover border border-brand-primary"
              />
            </div>
          </div>

          {/* Main Story Image */}
          <div className="flex-1 my-4 relative flex items-center justify-center overflow-hidden rounded-2xl border border-slate-900 bg-[#080b12]">
            <img 
              src={viewingStory.mediaUrl} 
              alt="Story main" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bottom Interactive comment mockup for stories */}
          <div className="w-full max-w-lg mx-auto flex items-center gap-2 pb-safe px-2 z-10">
            <button
              onClick={() => { alert('تم إرسال تفاعل سريع للقصة! ❤️'); setViewingStory(null); }}
              className="w-11 h-11 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20"
            >
              ❤️
            </button>
            <input
              type="text"
              placeholder="أرسل رداً خاصاً وسريعاً للقصة..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  alert('تم إرسال ردك بنجاح! 📨');
                  setViewingStory(null);
                }
              }}
              className="flex-1 h-11 px-4 bg-white/10 backdrop-blur-md border border-white/10 focus:outline-none rounded-xl text-xs text-white text-right"
            />
          </div>

        </div>
      )}

    </div>
  );
}
