/**
 * User Profile Types
 * Types for user profile data from /me/profile API
 */

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  image: string;
  company: string;
  department: string;
  designation: string;
  specialization: string;
  experienceYears: number;
  emailVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  user: UserProfile;
}
