export interface Note {
  id: string
  userId: string
  title: string | null
  content: string | null
  categoryId: string | null
  tags?: string[]
  isFavorite: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  createdAt: string
}

export interface User {
  app_metadata: {}
  aud: string
  user_metadata: any
  id: string
  email: string
  created_at: string
}

export interface DragItem {
  id: string
  type: "note" | "category"
  data: Note | Category
}
