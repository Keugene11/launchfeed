"use client";

import { PostCard } from "./post-card";
import type { Post } from "@/types";

export function FeedList({
  posts,
  currentUserId,
  likedPostIds,
}: {
  posts: Post[];
  currentUserId?: string;
  likedPostIds: string[];
}) {
  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-[#999] text-[14px]">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 stagger">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isLiked={likedPostIds.includes(post.id)}
        />
      ))}
    </div>
  );
}
