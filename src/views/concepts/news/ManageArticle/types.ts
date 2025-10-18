// src/views/concepts/news/ManageArticle/types.ts
export type ArticleTag = {
  id: string | number
  label: string
}

export type ArticleAuthor = {
  id?: string | number
  name: string
  avatar?: string
  img?: string
}

export type Article = {
  id: string | number
  title: string
  content?: string
  category?: string
  author?: string
  authors?: ArticleAuthor[]
  tags?: ArticleTag[]
  created_by_user_id?: string | number | null
  starred?: boolean
  published?: boolean
  updateTime?: string | null
  updateTimeStamp?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  timeToRead?: number
  viewCount?: number
  commentCount?: number
}

export type Articles = Article[]

export type Filter = {
  category?: string[]
  query?: string
}

export type GetArticleListResponse = {
  list: Articles
  total: number
}
