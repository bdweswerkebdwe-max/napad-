import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Onboarding from './components/Onboarding';
import HomeFeed from './components/HomeFeed';
import Explore from './components/Explore';
import CreateModal from './components/CreateModal';
import Inbox from './components/Inbox';
import Profile from './components/Profile';
import CallOverlay from './components/CallOverlay';
import { Home, Compass, Plus, Inbox as InboxIcon, User, Sparkles } from 'lucide-react';

function AppContent() {
  const { currentUser } = useApp();
  
  // Navigation Tabs: 'home' | 'explore' | 'inbox' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'inbox' | 'profile'>('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // If user is not authenticated, show onboarding flow (includes google/firebase authentication simulation)
  if (!currentUser) {
    return <Onboarding />;
  }

  return (
    <div className="relative min-h-screen bg-[#070b13] flex flex-col max-w-md mx-auto border-x border-slate-900 shadow-2xl overflow-hidden text-slate-100 pb-safe">
      
      {/* 1. Main scrollable screen views based on active navigation tab */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && <HomeFeed />}
        {activeTab === 'explore' && <Explore />}
        {activeTab === 'inbox' && <Inbox />}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* 2. Fixed Bottom Touch Navigation Bar (Pattern 1 from touch applications reference) */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md h-16 bg-[#0b0f19]/90 backdrop-blur-md border-t border-slate-900 z-40 px-4 flex items-center justify-between shadow-2xl">
        <div className="grid grid-cols-5 w-full items-center justify-items-center">
          
          {/* Profile Tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-2 px-3 w-full h-full focus:outline-none transition-colors ${
              activeTab === 'profile' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className={`w-5.5 h-5.5 ${activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1">الملف الشخصي</span>
          </button>

          {/* Inbox Tab */}
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex flex-col items-center justify-center py-2 px-3 w-full h-full focus:outline-none transition-colors ${
              activeTab === 'inbox' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <InboxIcon className={`w-5.5 h-5.5 ${activeTab === 'inbox' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-primary rounded-full animate-ping" />
            </div>
            <span className="text-[9px] font-bold tracking-tight mt-1">صندوق الوارد</span>
          </button>

          {/* Create (+) Tab - triggers overlay sheet without switching main scroll index */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="relative flex items-center justify-center -top-3 focus:outline-none group"
            aria-label="Create content"
          >
            <div className="absolute inset-0 bg-brand-primary/30 blur-md rounded-full group-hover:scale-110 transition-transform" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-brand-gradient-start flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 transform group-active:scale-90 transition-all">
              <Plus className="w-6.5 h-6.5 stroke-[3px]" />
            </div>
          </button>

          {/* Explore Tab */}
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center py-2 px-3 w-full h-full focus:outline-none transition-colors ${
              activeTab === 'explore' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className={`w-5.5 h-5.5 ${activeTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1">استكشاف</span>
          </button>

          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-2 px-3 w-full h-full focus:outline-none transition-colors ${
              activeTab === 'home' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className={`w-5.5 h-5.5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1">الرئيسية</span>
          </button>

        </div>
      </nav>

      {/* 3. Global Create Sheet Overlay */}
      {isCreateOpen && (
        <CreateModal onClose={() => setIsCreateOpen(false)} />
      )}

      {/* 4. Global Interactive Audio/Video Calls overlay */}
      <CallOverlay />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
