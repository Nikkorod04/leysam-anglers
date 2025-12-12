export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isVerified: boolean;
  createdAt: Date;
  role: 'user' | 'moderator' | 'admin';
}

export interface FishingSpot {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  fishTypes: string[];
  bestTime: string;
  images: string[];
  likes: string[];
  isHidden: boolean;
  isFlagged: boolean;
  flagCount: number;
  reportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CatchReport {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  description: string;
  fishType: string;
  weight?: number;
  length?: number;
  spotName?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  likes: string[];
  isFlagged: boolean;
  flagCount: number;
  reportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'spot' | 'report' | 'user';
  targetId: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface UserActivity {
  userId: string;
  lastSpotCreated?: Date;
  spotsCreatedToday: number;
  spotsCreatedThisWeek: number;
  totalReports: number;
}
