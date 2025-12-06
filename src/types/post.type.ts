export interface Media {
  id: string;
  publicId: string;
  type: string;
  fileName: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  fileSize: number;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  userAvatar: string | null;
  content: string;
  replyTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: number;
  username: string;
  userAvatar?: string;
  caption?: string | null;
  location?: string | null;
  visibility?: string | null;
  media: Media[];
  timestamp?: string; // createdDate từ BE
  likes?: number;
  comments?: Comment[];
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}
