export interface Post {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  createdAt: number;
  author: UserProfile | null;
}

export interface UserProfile {
  id: string;
  name: string;
  image: string;
  username: string;
  bio?: string;
  email?: string;
  createdAt?: number;
}
