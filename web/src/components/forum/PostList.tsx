"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PostForm } from "./PostForm";

interface Post {
  id: string;
  title: string;
  content: string;
  autoTags: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  _count: { replies: number };
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

export function PostList({ animeId }: { animeId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`/api/posts?animeId=${animeId}&sort=${sort}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [sort]);

  return (
    <div>
      <PostForm animeId={animeId} onPosted={fetchPosts} />

      <div className="flex gap-2 mb-4 mt-6">
        <button
          onClick={() => setSort("latest")}
          className={`px-3 py-1 text-sm rounded ${sort === "latest" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          最新回复
        </button>
        <button
          onClick={() => setSort("hot")}
          className={`px-3 py-1 text-sm rounded ${sort === "hot" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          热门帖子
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400 text-center py-8">加载中...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">还没有帖子，来发第一个吧</p>
      )}

      <div className="space-y-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/forum/${animeId}?post=${post.id}`} className="block border rounded-lg p-3 hover:border-indigo-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
              </div>
              <span className="text-xs text-gray-400 ml-2">{post._count.replies}回复</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {parseTags(post.autoTags).map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{tag}</span>
              ))}
              <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
