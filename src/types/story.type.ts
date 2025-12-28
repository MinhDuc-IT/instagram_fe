import { User } from "./user.type"

export interface StoryItem {
  id: string
  mediaUrl: string
  type: "image" | "video"
  createdAt: string
  expiresAt: string
  isViewed: boolean
  isLiked: boolean
}

export interface UserStoryGroup {
  user: User
  stories: StoryItem[]
  hasUnseen: boolean
  latestStoryAt: number
}

export interface StoryPagingResponse {
  stories: UserStoryGroup[]
  pagination: {
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
}
