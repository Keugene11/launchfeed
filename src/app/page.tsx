import { auth } from "@/lib/auth";
import { getPosts, getLikedPostIds } from "@/lib/actions";
import { Header } from "@/components/header";
import { PostComposer } from "@/components/post-composer";
import { FeedList } from "@/components/feed-list";
import type { Post } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const { posts } = await getPosts();
  const currentUserId = session?.user?.id;

  const likedPostIds = currentUserId
    ? await getLikedPostIds(currentUserId, posts.map((p) => p.id))
    : [];

  return (
    <>
      <Header userName={session?.user?.name || undefined} isLoggedIn={!!session} />
      <main className="max-w-lg mx-auto px-5 pt-6 pb-10">
        {session && (
          <div className="mb-4 animate-slide-up">
            <PostComposer userName={session.user?.name || undefined} />
          </div>
        )}
        <FeedList
          posts={posts as Post[]}
          currentUserId={currentUserId}
          likedPostIds={likedPostIds}
        />
      </main>
    </>
  );
}
