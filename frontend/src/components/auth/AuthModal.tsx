import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Lock, Eye, EyeOff, Shield, Zap, CheckCircle2, 
  AlertCircle, Sparkles, ChevronRight, Activity, Cpu 
} from 'lucide-react';
import { UserProfile, UserRole, ROLE_CONFIGS } from '../../types/auth';
import { authService } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Autonomous Systems Engineer');

  useEffect(() => {
    setTab(initialTab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  }, [initialTab, isOpen]);

  // Compute password strength
  const pwdStrength = authService.checkPasswordStrength(password);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both Operator Email and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        setSuccessMsg(`Access Granted. Welcome back, ${res.user.name}.`);
        setTimeout(() => {
          onSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('All fields are mandatory.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.register(name, email, role, password);
      if (res.success && res.user) {
        setSuccessMsg(`Operator account created for ${res.user.name}.`);
        setTimeout(() => {
          onSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch {
      setErrorMsg('An error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoKey: 'eng' | 'safety' | 'research') => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const user = await authService.quickLogin(demoKey);
      setSuccessMsg(`Logged in as ${user.name} (${user.role}).`);
      setTimeout(() => {
        onSuccess(user);
      }, 400);
    } catch {
      setErrorMsg('Demo sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-cyan-500/30">
              NA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">NavAdapt</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">PORTAL</span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous Vehicle Operator Authentication</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex rounded-xl bg-slate-950/90 p-1 mx-4 sm:mx-5 mt-4 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition text-center ${
              tab === 'signin' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition text-center ${
              tab === 'signup' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mx-4 sm:mx-5 mt-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 sm:mx-5 mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="flex-1 font-medium">{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Operator Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@navadapt.ai"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                  Access Password
                </label>
                <span className="text-[10px] text-cyan-400/80 hover:text-cyan-300 cursor-pointer">
                  Demo Pass: navadapt2026
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>AUTHORIZE OPERATOR ACCESS</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* CREATE ACCOUNT / REGISTER FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="p-4 sm:p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Operator Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  required
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@organization.com"
                  required
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Vehicle Clearance Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="Autonomous Systems Engineer">Autonomous Systems Engineer (Level 4 AV Pilot)</option>
                <option value="Fleet Safety Officer">Fleet Safety Officer (Fleet Audit Lead)</option>
                <option value="AI Perception Researcher">AI Perception Researcher (Perception Scientist)</option>
                <option value="Test Vehicle Pilot">Test Vehicle Pilot (Certified Test Pilot)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator Bar */}
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                    <span>STRENGTH: <span className="font-bold text-white">{pwdStrength.label}</span></span>
                    <span>{password.length}/6+ chars</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-transparent'}`}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Confirm Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-9 pr-10 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <span className="animate-pulse">ENROLLING OPERATOR...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>REGISTER OPERATOR CERTIFICATION</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-CLICK EXAMINER DEMO PROFILES */}
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 mt-1 bg-slate-950/40">
          <div className="flex items-center justify-between my-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>1-Click Examiner Demo Profiles</span>
            </span>
            <span className="text-[9px] text-cyan-400/70 font-mono">NO TYPING REQUIRED</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo('eng')}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-left transition group active:scale-95"
            >
              <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-xs">⚡</span>
                <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate">Aarav</span>
              </div>
              <div className="text-[9px] text-cyan-400/90 truncate font-mono">Lead Eng</div>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo('safety')}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 text-left transition group active:scale-95"
            >
              <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-xs">🛡️</span>
                <span className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">Priya</span>
              </div>
              <div className="text-[9px] text-amber-400/90 truncate font-mono">Safety Lead</div>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo('research')}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-400 text-left transition group active:scale-95"
            >
              <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-xs">🔬</span>
                <span className="text-[11px] font-bold text-white group-hover:text-indigo-300 truncate">Vikram</span>
              </div>
              <div className="text-[9px] text-indigo-400/90 truncate font-mono">AI R&D</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
