export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: number;
  avatar?: string;
  bio?: string;
  website?: string;
  followers?: number;
  isFollowing?: boolean;
  [key: string]: any;
}

export interface UserUpdateRequest {
  fullName?: string;
  avatar?: string;
  phone?: string;
  gender?: number;
  bio?: string;
  website?: string;
}
