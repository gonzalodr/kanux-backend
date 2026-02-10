export interface FeedPostResponse {
  id: string;
  content: string;
  created_at: Date | null;
  author: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    title?: string | null;
    name?: string | null;
    image_url?: string | null;
  } | null;
  commentsCount: number;
  reactionsCount: number;
  isOwner: boolean;
  isLikedByMe: boolean;
}
