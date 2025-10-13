export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  preferences?: UserPreferences;
  verification?: UserVerification;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: {
    bidUpdates: boolean;
    auctionReminders: boolean;
    newAuctions: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  push: {
    bidUpdates: boolean;
    auctionReminders: boolean;
    newAuctions: boolean;
  };
  sms: {
    bidUpdates: boolean;
    auctionReminders: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showBiddingHistory: boolean;
  showWatchlist: boolean;
  allowMessages: boolean;
}

export interface UserVerification {
  email: boolean;
  phone: boolean;
  identity: boolean;
  address: boolean;
  paymentMethod: boolean;
}

export interface UserStats {
  totalBids: number;
  wonAuctions: number;
  lostAuctions: number;
  totalSpent: number;
  averageBid: number;
  successRate: number;
  memberSince: string;
  lastActive: string;
}

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  badges?: UserBadge[];
  rating?: UserRating;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface UserRating {
  average: number;
  total: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  dateOfBirth?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  website?: string;
  address?: Partial<Address>;
  preferences?: Partial<UserPreferences>;
  socialLinks?: Partial<UserProfile['socialLinks']>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';

export interface UserPermissions {
  canBid: boolean;
  canCreateAuctions: boolean;
  canMessage: boolean;
  canReport: boolean;
  canModerate: boolean;
  canAdmin: boolean;
}