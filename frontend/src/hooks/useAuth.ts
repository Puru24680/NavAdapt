import { useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthState, UserRole } from '../types/auth';
import { authService } from '../services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const user = authService.getCurrentUser();
    const token = authService.getAuthToken();
    return {
      isAuthenticated: !!user,
      user,
      token,
      isLoading: false
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'signin' | 'signup'>('signin');

  const syncAuthState = useCallback(() => {
    const user = authService.getCurrentUser();
    const token = authService.getAuthToken();
    setAuthState({
      isAuthenticated: !!user,
      user,
      token,
      isLoading: false
    });
  }, []);

  // Synchronize across tabs, iframes, and local events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'navadapt_auth_user' || e.key === 'navadapt_auth_token') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('navadapt-auth-updated', syncAuthState);

    // Initial check
    syncAuthState();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('navadapt-auth-updated', syncAuthState);
    };
  }, [syncAuthState]);

  const openAuthModal = useCallback((initialTab: 'signin' | 'signup' = 'signin') => {
    setAuthModalInitialTab(initialTab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = useCallback((user: UserProfile) => {
    syncAuthState();
    closeAuthModal();
  }, [closeAuthModal, syncAuthState]);

  const signOut = useCallback(() => {
    authService.logout();
    syncAuthState();
  }, [syncAuthState]);

  const login = useCallback(async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const res = await authService.login(email, pass);
    syncAuthState();
    if (res.success) {
      closeAuthModal();
    }
    return res;
  }, [closeAuthModal, syncAuthState]);

  const register = useCallback(async (name: string, email: string, role: UserRole, pass: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const res = await authService.register(name, email, role, pass);
    syncAuthState();
    if (res.success) {
      closeAuthModal();
    }
    return res;
  }, [closeAuthModal, syncAuthState]);

  const quickLogin = useCallback(async (demoKey: 'eng' | 'safety' | 'research') => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const user = await authService.quickLogin(demoKey);
    syncAuthState();
    closeAuthModal();
    return user;
  }, [closeAuthModal, syncAuthState]);

  return {
    ...authState,
    isAuthModalOpen,
    authModalInitialTab,
    openAuthModal,
    closeAuthModal,
    signIn,
    signOut,
    login,
    register,
    quickLogin,
    logout: signOut
  };
}
