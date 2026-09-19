import { UserProfile, UserRole, ROLE_CONFIGS, PasswordStrength } from '../types/auth';

const STORAGE_KEY_USER = 'navadapt_auth_user';
const STORAGE_KEY_TOKEN = 'navadapt_auth_token';
const STORAGE_KEY_USERS_DB = 'navadapt_users_db';
const AUTH_EVENT_NAME = 'navadapt-auth-updated';

interface StoredUserRecord {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

// Native Web Crypto SHA-256 helper
async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getRandomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return atob(b64);
}

// Generate client JWT
async function generateClientJWT(user: UserProfile): Promise<{ token: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 86400; // 24 hours
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: expiresAt,
    iss: 'navadapt-av-client'
  };

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signatureRaw = await sha256Hex(`${headerB64}.${payloadB64}.navadapt-secure-salt`);
  const signatureB64 = toBase64Url(signatureRaw);

  return {
    token: `${headerB64}.${payloadB64}.${signatureB64}`,
    expiresAt: expiresAt * 1000
  };
}

class AuthService {
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  // Pre-seed default examiner accounts if DB is empty
  public async initDatabase(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const existing = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (!existing) {
        const seedUsers: StoredUserRecord[] = [
          {
            id: 'usr-eng-01',
            name: 'Eng. Aarav Sharma',
            email: 'engineer@navadapt.ai',
            salt: 'e9a184c1f9d2',
            passwordHash: await sha256Hex('e9a184c1f9d2' + 'navadapt2026'),
            role: 'Autonomous Systems Engineer',
            createdAt: new Date().toISOString()
          },
          {
            id: 'usr-safe-02',
            name: 'Priya Patel',
            email: 'safety@navadapt.ai',
            salt: '7b8f3e2a10c9',
            passwordHash: await sha256Hex('7b8f3e2a10c9' + 'safety2026'),
            role: 'Fleet Safety Officer',
            createdAt: new Date().toISOString()
          },
          {
            id: 'usr-res-03',
            name: 'Dr. Vikram Rao',
            email: 'research@navadapt.ai',
            salt: '4d1c9f8a3b2e',
            passwordHash: await sha256Hex('4d1c9f8a3b2e' + 'research2026'),
            role: 'AI Perception Researcher',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(seedUsers));
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('AuthService localStorage init error:', e);
    }
  }

  private getStoredUsers(): StoredUserRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public checkPasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const hasMinLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasMinLength) score++;
    if (password.length >= 10) score++;
    if (hasNumber && hasUpper) score++;
    if (hasSpecial) score++;

    let label: PasswordStrength['label'] = 'Too Weak';
    let color = 'bg-red-500';

    if (score === 1) {
      label = 'Weak';
      color = 'bg-orange-500';
    } else if (score === 2) {
      label = 'Medium';
      color = 'bg-amber-400';
    } else if (score === 3) {
      label = 'Strong';
      color = 'bg-emerald-400';
    } else if (score >= 4) {
      label = 'Very Strong';
      color = 'bg-cyan-400';
    }

    return { score, label, color, hasMinLength, hasNumber, hasSpecial, hasUpper };
  }

  // Attempt login via Backend API first, fallback to secure client DB
  public async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    await this.initDatabase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.access_token) {
          this.setSession(data.user, data.access_token, Date.now() + 86400 * 1000);
          return { success: true, user: data.user };
        }
      } else if (res.status === 401) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.detail || 'Invalid email or password.' };
      }
    } catch {
      // Backend not running / static deployment fallback
    }

    // 2. Client-side Hashed Auth Verification
    const users = this.getStoredUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, message: 'Operator account not found. Please register or use Demo accounts.' };
    }

    const testHash = await sha256Hex(matched.salt + password);
    if (testHash !== matched.passwordHash) {
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    const roleMeta = ROLE_CONFIGS[matched.role] || ROLE_CONFIGS['Autonomous Systems Engineer'];
    const userProfile: UserProfile = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      avatarIcon: roleMeta.avatarIcon,
      clearanceLevel: roleMeta.clearanceLevel,
      canControlCAN: roleMeta.canControlCAN,
      canEmergencyBrake: roleMeta.canEmergencyBrake,
      canModifyParameters: roleMeta.canModifyParameters,
      joinedAt: matched.createdAt
    };

    const jwt = await generateClientJWT(userProfile);
    this.setSession(userProfile, jwt.token, jwt.expiresAt);
    return { success: true, user: userProfile };
  }

  // Register new operator account
  public async register(
    name: string,
    email: string,
    role: UserRole,
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    await this.initDatabase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, message: 'All fields are mandatory.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // 1. Try Backend API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, role, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.access_token) {
          this.setSession(data.user, data.access_token, Date.now() + 86400 * 1000);
          return { success: true, user: data.user };
        }
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.detail) return { success: false, message: err.detail };
      }
    } catch {
      // Backend not running / static deployment fallback
    }

    // 2. Client-side Registry
    const users = this.getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An operator account with this email already exists.' };
    }

    const salt = getRandomSalt();
    const passwordHash = await sha256Hex(salt + password);
    const userId = 'usr-' + Date.now().toString(36);
    const roleMeta = ROLE_CONFIGS[role] || ROLE_CONFIGS['Autonomous Systems Engineer'];

    const newRecord: StoredUserRecord = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      salt,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newRecord);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));

    const userProfile: UserProfile = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role,
      avatarIcon: roleMeta.avatarIcon,
      clearanceLevel: roleMeta.clearanceLevel,
      canControlCAN: roleMeta.canControlCAN,
      canEmergencyBrake: roleMeta.canEmergencyBrake,
      canModifyParameters: roleMeta.canModifyParameters,
      joinedAt: newRecord.createdAt
    };

    const jwt = await generateClientJWT(userProfile);
    this.setSession(userProfile, jwt.token, jwt.expiresAt);
    return { success: true, user: userProfile };
  }

  // Instant 1-Click Examiner Demo Sign In
  public async quickLogin(demoKey: 'eng' | 'safety' | 'research'): Promise<UserProfile> {
    await this.initDatabase();
    const demoCatalog: Record<string, { email: string; name: string; role: UserRole }> = {
      eng: {
        email: 'engineer@navadapt.ai',
        name: 'Eng. Aarav Sharma',
        role: 'Autonomous Systems Engineer'
      },
      safety: {
        email: 'safety@navadapt.ai',
        name: 'Priya Patel',
        role: 'Fleet Safety Officer'
      },
      research: {
        email: 'research@navadapt.ai',
        name: 'Dr. Vikram Rao',
        role: 'AI Perception Researcher'
      }
    };

    const target = demoCatalog[demoKey] || demoCatalog.eng;
    const roleMeta = ROLE_CONFIGS[target.role];
    const userProfile: UserProfile = {
      id: `usr-demo-${demoKey}`,
      name: target.name,
      email: target.email,
      role: target.role,
      avatarIcon: roleMeta.avatarIcon,
      clearanceLevel: roleMeta.clearanceLevel,
      canControlCAN: roleMeta.canControlCAN,
      canEmergencyBrake: roleMeta.canEmergencyBrake,
      canModifyParameters: roleMeta.canModifyParameters,
      joinedAt: new Date().toISOString()
    };

    const jwt = await generateClientJWT(userProfile);
    this.setSession(userProfile, jwt.token, jwt.expiresAt);
    return userProfile;
  }

  private setSession(user: UserProfile, token: string, expiresAt: number): void {
    user.accessToken = token;
    user.tokenExpiresAt = expiresAt;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    } catch (e) {
      console.warn('Storage error setting session', e);
    }
  }

  public getCurrentUser(): UserProfile | null {
    try {
      const userRaw = localStorage.getItem(STORAGE_KEY_USER);
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!userRaw || !token) return null;

      const user: UserProfile = JSON.parse(userRaw);
      // Check token expiration
      if (user.tokenExpiresAt && Date.now() > user.tokenExpiresAt) {
        this.logout();
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  public logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.warn('Error during logout', e);
    }
  }
}

export const authService = new AuthService();
