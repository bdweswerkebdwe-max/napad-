import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, RefreshCw, Volume2 } from 'lucide-react';

export default function CallOverlay() {
  const { activeCall, answerCall, declineCall, endCall } = useApp();
  const [callStream, setCallStream] = React.useState<MediaStream | null>(null);
  const localVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (activeCall.isOpen && activeCall.status === 'connected') {
      if (activeCall.type === 'video') {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            setCallStream(stream);
          })
          .catch(err => {
            console.warn("Camera access denied during call:", err);
          });
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            setCallStream(stream);
          })
          .catch(err => {
            console.warn("Microphone access denied during call:", err);
          });
      }
    } else {
      if (callStream) {
        callStream.getTracks().forEach(track => track.stop());
        setCallStream(null);
      }
    }
    return () => {
      if (callStream) {
        callStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCall.isOpen, activeCall.status, activeCall.type]);

  React.useEffect(() => {
    if (callStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callStream;
    }
  }, [callStream, activeCall.status]);

  if (!activeCall.isOpen || !activeCall.user) return null;

  const { type, user, status, duration } = activeCall;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 bg-slate-950/95 backdrop-blur-xl text-white text-center">
      
      {/* 1. Header showing Encryption label */}
      <div className="pt-4 text-center">
        <span className="text-[10px] bg-white/10 px-3.5 py-1.5 rounded-full font-bold tracking-wider uppercase text-slate-300">
          🔐 اتصال صوتي مرئي مشفر - نبض Secure
        </span>
      </div>

      {/* 2. Main Call Body */}
      <div className="flex flex-col items-center space-y-6 flex-1 justify-center">
        
        {/* Animated Avatar Rings */}
        <div className="relative">
          {status === 'calling' && (
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full scale-150 animate-ping" />
          )}
          {status === 'connected' && (
            <div className="absolute inset-0 bg-brand-secondary/20 blur-xl rounded-full scale-150 animate-pulse" />
          )}
          
          <img 
            src={user.avatar} 
            alt={user.displayName} 
            className="relative w-28 h-28 rounded-full object-cover border-4 border-brand-primary shadow-2xl z-10"
          />
        </div>

        {/* User information details */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold">{user.displayName}</h2>
          <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
        </div>

        {/* Current status or call duration */}
        <div className="pt-2">
          {status === 'calling' && (
            <p className="text-xs text-brand-primary font-bold animate-pulse">جاري الرنين والاتصال...</p>
          )}
          {status === 'incoming' && (
            <p className="text-xs text-brand-secondary font-bold animate-bounce">مكالمة واردة إليك...</p>
          )}
          {status === 'connected' && (
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-emerald-400 font-bold">متصل الآن 🟢</span>
              <span className="text-lg font-mono tracking-widest bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-xl font-bold">{duration || '00:00'}</span>
            </div>
          )}
        </div>

        {/* If Video Call & Connected - show interactive mockup frame */}
        {type === 'video' && status === 'connected' && (
          <div className="relative w-72 aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl mt-4">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute bottom-2 right-2 p-1 bg-black/60 rounded-lg text-[9px] font-bold z-10">
              كاميرتك المباشرة (سيلفي) 📸
            </div>
            
            {/* Picture in Picture of participant */}
            <div className="absolute top-2 left-2 w-20 aspect-video rounded-lg border border-slate-700 overflow-hidden shadow bg-black z-10">
              <img 
                src={user.avatar} 
                alt="Participant feed" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

      </div>

      {/* 3. Action Buttons Section */}
      <div className="pb-8 flex flex-col items-center gap-6 w-full max-w-xs">
        
        {/* Toggle options bar (Mute mic, Speaker, Flip camera) */}
        {status === 'connected' && (
          <div className="flex items-center justify-center gap-6 bg-slate-900/50 border border-slate-850 p-3 rounded-2xl w-full">
            <button className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition-all">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition-all">
              <Volume2 className="w-5 h-5" />
            </button>
            {type === 'video' && (
              <button className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition-all">
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Primary Call control buttons */}
        <div className="flex items-center justify-center gap-6">
          
          {/* Answer Call buttons (Only for incoming calls) */}
          {status === 'incoming' ? (
            <>
              <button
                onClick={declineCall}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={answerCall}
                className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all animate-bounce"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : (
            /* Normal end call action button */
            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
