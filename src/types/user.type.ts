export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  gender?: number;
  avatar?: string;
  followers?: number;
  isFollowing?: boolean;
  [key: string]: any;
}

export interface UserUpdateRequest {
  fullName?: string;
  avatar?: string;
  phone?: string;
  gender?: number;
}
