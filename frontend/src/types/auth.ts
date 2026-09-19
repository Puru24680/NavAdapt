export type UserRole = 
  | 'Autonomous Systems Engineer'
  | 'Fleet Safety Officer'
  | 'AI Perception Researcher'
  | 'Test Vehicle Pilot';

export interface RolePermissions {
  clearanceLevel: string;
  canControlCAN: boolean;
  canEmergencyBrake: boolean;
  canModifyParameters: boolean;
  avatarIcon: string;
  badgeColor: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarIcon: string;
  clearanceLevel: string;
  canControlCAN: boolean;
  canEmergencyBrake: boolean;
  canModifyParameters: boolean;
  joinedAt?: string;
  accessToken?: string;
  tokenExpiresAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasUpper: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RolePermissions> = {
  'Autonomous Systems Engineer': {
    clearanceLevel: 'LEVEL 4 AV PILOT',
    canControlCAN: true,
    canEmergencyBrake: true,
    canModifyParameters: true,
    avatarIcon: '⚡',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/70 text-cyan-300'
  },
  'Fleet Safety Officer': {
    clearanceLevel: 'FLEET AUDIT LEAD',
    canControlCAN: false,
    canEmergencyBrake: true,
    canModifyParameters: false,
    avatarIcon: '🛡️',
    badgeColor: 'border-amber-500/50 bg-amber-950/70 text-amber-300'
  },
  'AI Perception Researcher': {
    clearanceLevel: 'PERCEPTION SCIENTIST',
    canControlCAN: false,
    canEmergencyBrake: false,
    canModifyParameters: true,
    avatarIcon: '🔬',
    badgeColor: 'border-indigo-500/50 bg-indigo-950/70 text-indigo-300'
  },
  'Test Vehicle Pilot': {
    clearanceLevel: 'CERTIFIED TEST PILOT',
    canControlCAN: true,
    canEmergencyBrake: true,
    canModifyParameters: false,
    avatarIcon: '🚗',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/70 text-emerald-300'
  }
};
