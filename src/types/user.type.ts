export interface User {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    followers?: number;
    isFollowing?: boolean;
    [key: string]: any;
}