"use server";

import { auth } from "./auth";
import { redis } from "./redis";
import { generateId } from "./utils";
import { revalidatePath } from "next/cache";
import type { Post } from "@/types";

export async function createPost(content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (!content.trim() || content.length > 500) throw new Error("Invalid content");

  const id = generateId();
  const post = {
    id,
    authorId: session.user.id,
    content: content.trim(),
    likesCount: 0,
    createdAt: Date.now(),
  };

  await redis.hset(`post:${id}`, post);
  await redis.zadd("feed:global", { score: post.createdAt, member: id });
  await redis.zadd(`feed:user:${session.user.id}`, { score: post.createdAt, member: id });

  revalidatePath("/");
  return post;
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const post = await redis.hgetall(`post:${postId}`) as Record<string, string> | null;
  if (!post || post.authorId !== session.user.id) throw new Error("Not authorized");

  await redis.del(`post:${postId}`);
  await redis.del(`post:${postId}:likes`);
  await redis.zrem("feed:global", postId);
  await redis.zrem(`feed:user:${session.user.id}`, postId);

  revalidatePath("/");
}

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const isLiked = await redis.sismember(`post:${postId}:likes`, session.user.id);

  if (isLiked) {
    await redis.srem(`post:${postId}:likes`, session.user.id);
    await redis.hincrby(`post:${postId}`, "likesCount", -1);
  } else {
    await redis.sadd(`post:${postId}:likes`, session.user.id);
    await redis.hincrby(`post:${postId}`, "likesCount", 1);
  }

  revalidatePath("/");
}

export async function getPosts(cursor?: number, limit: number = 20) {
  const max = cursor || "+inf";
  const min = "-inf";

  const postIds = await redis.zrange("feed:global", max, min, {
    byScore: true,
    rev: true,
    offset: cursor ? 1 : 0,
    count: limit,
  }) as string[];

  if (!postIds.length) return { posts: [], nextCursor: null };

  const posts: Post[] = [];
  for (const id of postIds) {
    const post = await redis.hgetall(`post:${id}`) as Record<string, string> | null;
    if (!post) continue;
    const author = await redis.hgetall(`user:${post.authorId}`) as Record<string, string> | null;
    posts.push({
      id: post.id || id,
      authorId: post.authorId,
      content: post.content,
      likesCount: parseInt(post.likesCount || "0"),
      createdAt: parseInt(post.createdAt),
      author: author ? { id: author.id, name: author.name, image: author.image, username: author.username } : null,
    });
  }

  const lastPost = posts[posts.length - 1];
  const nextCursor = posts.length === limit && lastPost ? lastPost.createdAt : null;

  return { posts, nextCursor };
}

export async function getUserPosts(userId: string) {
  const postIds = await redis.zrange(`feed:user:${userId}`, "+inf", "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: 50,
  }) as string[];

  const posts = await Promise.all(
    postIds.map(async (id) => {
      const post = await redis.hgetall(`post:${id}`) as Record<string, string> | null;
      if (!post) return null;
      const author = await redis.hgetall(`user:${post.authorId}`) as Record<string, string> | null;
      return {
        ...post,
        likesCount: parseInt(post.likesCount || "0"),
        createdAt: parseInt(post.createdAt),
        author: author ? { id: author.id, name: author.name, image: author.image, username: author.username } : null,
      };
    })
  );

  return posts.filter(Boolean);
}

export async function getLikedPostIds(userId: string, postIds: string[]) {
  const results = await Promise.all(
    postIds.map((id) => redis.sismember(`post:${id}:likes`, userId))
  );
  return postIds.filter((_, i) => results[i]);
}

export async function getUser(userId: string) {
  return await redis.hgetall(`user:${userId}`) as Record<string, string> | null;
}

export async function updateProfile(data: { name: string; bio: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await redis.hset(`user:${session.user.id}`, {
    name: data.name.trim(),
    bio: data.bio.trim(),
  });

  revalidatePath("/");
}
