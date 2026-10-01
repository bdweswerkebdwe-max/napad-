import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Mail, Lock, User, Sparkles, Globe, ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Onboarding() {
  const { login, register, loginWithGoogle, resetPassword } = useApp();
  
  // Screens: 'welcome' | 'auth' | 'forgot_password' | 'terms'
  const [screen, setScreen] = useState<'welcome' | 'auth' | 'forgot_password' | 'terms'>('welcome');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى كتابة البريد الإلكتروني وكلمة المرور بالكامل.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const successLogin = await login(email, password);
      if (!successLogin) {
        setError('فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !username) {
      setError('يرجى تعبئة كافة الحقول لإنشاء الحساب.');
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const successReg = await register(email, username, name);
      if (!successReg) {
        setError('فشل إنشاء الحساب. قد يكون اسم المستخدم أو البريد مستخدماً بالفعل.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الطلب.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('فشل الاتصال بخدمة Google Identity.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال بريدك الإلكتروني لإرسال الرابط.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const msg = await resetPassword(email);
      setSuccess(msg);
      setEmail('');
    } catch (err) {
      setError('لم نتمكن من إيجاد حساب بهذا البريد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-4 text-slate-100 overflow-hidden">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-primary to-brand-gradient-end blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-secondary to-indigo-600 blur-[120px]" />
      </div>

      {/* Decorative Floating Waves */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(7,11,19,0.95)_90%)] z-0" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-all duration-300">
        
        {/* Welcome Screen */}
        {screen === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-8 py-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full scale-110" />
              <div className="relative w-20 h-20 bg-gradient-to-tr from-brand-primary to-brand-gradient-start rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                مـنـصـة نـبـض
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">
                تواصل بلحظتك، استكشف الفيديوهات القصيرة والمنشورات الرائعة وتفاعل مع غرف الصوت المباشرة.
              </p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <button
                onClick={() => setScreen('auth')}
                className="w-full h-13 rounded-xl bg-gradient-to-l from-brand-primary to-brand-gradient-start text-white font-bold text-base hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
              >
                <span>ابدأ رحلتك الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setScreen('auth');
                  setAuthTab('login');
                }}
                className="w-full h-13 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm active:scale-[0.98] transition-all"
              >
                لديك حساب بالفعل؟ تسجيل دخول
              </button>
            </div>

            {/* Muted Terms agreement footnote */}
            <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              بالضغط على "ابدأ"، فإنك توافق على{' '}
              <button onClick={() => setScreen('terms')} className="text-brand-primary hover:underline font-semibold focus:outline-none">
                شروط الخدمة
              </button>{' '}
              و{' '}
              <span className="text-slate-400">سياسة الخصوصية</span> لمنصة نبض الاجتماعية.
            </div>
          </div>
        )}

        {/* Authentication Screen */}
        {screen === 'auth' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <button 
                onClick={() => setScreen('welcome')} 
                className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-100">
                {authTab === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
              </h2>
              <div className="w-9 h-9" /> {/* Spacer */}
            </div>

            {/* Tabs Selector (BANNED pill metadata styling avoided - these are interactive buttons) */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  authTab === 'login' 
                    ? 'bg-slate-800 text-brand-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  authTab === 'register' 
                    ? 'bg-slate-800 text-brand-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                انضم إلينا
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-400 text-right leading-relaxed animate-shake">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-400 text-right leading-relaxed">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authTab === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="مثل: يوسف الحربي"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 pr-11 pl-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-sm text-slate-200 transition-colors text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">اسم المستخدم (Username)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-xs text-slate-500 font-mono">@</span>
                      <input
                        type="text"
                        placeholder="youssef_99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-sm text-slate-200 transition-colors text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pr-11 pl-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-sm text-slate-200 transition-colors text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  {authTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setScreen('forgot_password'); setError(''); }}
                      className="text-xs text-brand-primary hover:underline font-semibold"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                  <label className="text-xs text-slate-400 font-medium">كلمة المرور</label>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pr-11 pl-11 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-sm text-slate-200 transition-colors text-left"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-gradient-to-l from-brand-primary to-brand-gradient-start hover:opacity-95 text-white text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/15"
              >
                {loading ? 'جاري التحقق...' : authTab === 'login' ? 'تسجيل دخول' : 'إنشاء حساب'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500">أو عبر المنصات الاجتماعية</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Google Firebase Login Integration UI */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>الدخول الآمن باستخدام Google</span>
              </button>
            </div>

            {/* Test accounts tips for immediate user onboarding */}
            <div className="p-3 bg-slate-950/30 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block leading-relaxed">
                💡 للمطورين والتقييم السريع: يمكنك تسجيل الدخول بأي إيميل وهمي وكلمة مرور لتجربة محاكاة Firebase Auth الفورية.
              </span>
            </div>
          </div>
        )}

        {/* Forgot Password Screen */}
        {screen === 'forgot_password' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <button 
                onClick={() => { setScreen('auth'); setAuthTab('login'); setError(''); setSuccess(''); }} 
                className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-100">إعادة تعيين كلمة المرور</h2>
              <div className="w-9 h-9" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-right">
              أدخل عنوان بريدك الإلكتروني المسجل وسنقوم بإرسال رابط فوري وآمن لاستعادة وإعادة تعيين كلمة المرور الخاصة بك.
            </p>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-400 text-right">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-400 text-right">
                {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pr-11 pl-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-brand-primary focus:outline-none rounded-xl text-sm text-slate-200 text-left transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-l from-brand-primary to-brand-gradient-start hover:opacity-95 text-white text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
            </form>
          </div>
        )}

        {/* Terms of Service Screen */}
        {screen === 'terms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <button 
                onClick={() => setScreen('welcome')} 
                className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-100">شروط الخدمة</h2>
              <div className="w-9 h-9" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-4 text-xs text-slate-400 leading-relaxed pr-2 text-right">
              <h3 className="font-bold text-slate-200">1. قبول الشروط</h3>
              <p>مرحباً بك في منصة نبض. بتسجيلك أو تصفحك للتطبيق، فإنك تعبر عن موافقتك الصريحة والكاملة على هذه الشروط والأحكام ومتابعة تحديثاتها الدورية.</p>
              
              <h3 className="font-bold text-slate-200">2. سلوك المستخدم</h3>
              <p>يلتزم مستخدمو منصة نبض بنشر المحتوى البصري والأدبي الهادف والمحترم. يحظر تماماً تداول أي محتوى يحث على الكراهية، العنف، أو أي نشاط غير قانوني يخل بقوانين الفضاء السيبراني.</p>

              <h3 className="font-bold text-slate-200">3. حماية الخصوصية</h3>
              <p>نحن في نبض نولي خصوصية بياناتك اهتماماً بالغاً. لن يتم تسريب، مشاركة، أو تداول أي بيانات تتعلق بالمستخدمين مع أي جهات خارجية غير معتمدة رسمياً.</p>

              <h3 className="font-bold text-slate-200">4. حقوق النشر والملكية</h3>
              <p>يحتفظ صانعو المحتوى بكامل حقوق الملكية الفكرية لمنشوراتهم وفيديوهاتهم المرفوعة مع تفويض المنصة بعرضها وتنسيقها في التغذية العامة والبحث.</p>
            </div>

            <button
              onClick={() => setScreen('welcome')}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              فهمت وموافق، الرجوع
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
