export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
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
  likes: string[]; // array of user IDs
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
  spotId?: string;
  spotName?: string;
  title: string;
  description: string;
  fishType: string;
  weight?: string;
  length?: string;
  images: string[];
  likes: string[]; // array of user IDs
  comments: Comment[];
  isHidden: boolean;
  isFlagged: boolean;
  flagCount: number;
  reportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: Date;
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

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
