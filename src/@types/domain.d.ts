interface ShortUrl {
  // Partition Key  userId: string
  code: string
  userId: string
  originalUrl: string
  createdAt: number
  expireAt: number
  deletedAt: number | null
}
