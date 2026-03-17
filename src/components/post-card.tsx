"use client";

import { Heart, Trash2 } from "lucide-react";
import { toggleLike, deletePost } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";
import { useState, useTransition } from "react";
import type { Post } from "@/types";

export function PostCard({
  post,
  currentUserId,
  isLiked: initialIsLiked,
}: {
  post: Post;
  currentUserId?: string;
  isLiked?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const handleLike = () => {
    if (!currentUserId) return;
    setIsLiked(!isLiked);
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));
    startTransition(() => toggleLike(post.id));
  };

  const handleDelete = () => {
    setDeleted(true);
    startTransition(() => deletePost(post.id));
  };

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl px-5 py-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-semibold text-[14px] shrink-0">
          {post.author?.image ? (
            <img src={post.author.image} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            post.author?.name?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] text-[#1a1a1a] truncate">
              {post.author?.name || "Anonymous"}
            </span>
            <span className="text-[12px] text-[#999] shrink-0">
              {timeAgo(new Date(post.createdAt))}
            </span>
          </div>
          <p className="text-[14px] text-[#1a1a1a] mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              disabled={!currentUserId || isPending}
              className="flex items-center gap-1.5 text-[13px] press transition-colors"
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={isLiked ? "fill-red-500 text-red-500" : "text-[#999]"}
              />
              <span className={isLiked ? "text-red-500 font-medium" : "text-[#999]"}>
                {likesCount > 0 ? likesCount : ""}
              </span>
            </button>
            {currentUserId === post.authorId && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 text-[13px] text-[#999] hover:text-red-500 press transition-colors"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
