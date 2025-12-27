import { User } from "./user.type"

export interface Story {
  id: string
  user: User
  isViewed?: boolean
  createdAt: string
}

export interface StoryPagingResponse {
  stories: Story[]
  pagination: {
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
}