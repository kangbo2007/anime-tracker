"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReplyForm } from "./ReplyForm";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface Post {
  id: string;
  title: string;
  content: string;
  autoTags: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  replies: Reply[];
}

export function PostDetail({ postId, animeId }: { postId: string; animeId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = () => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => setPost(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPost(); }, [postId]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">加载中...</p>;
  }

  if (!post) {
    return <p className="text-sm text-gray-400 py-8 text-center">帖子不存在</p>;
  }

  return (
    <div>
      <Link href={`/forum/${animeId}`} className="text-sm text-gray-500 hover:text-indigo-600 mb-4 inline-block">
        ← 返回帖子列表
      </Link>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>{post.user.name || "匿名"}</span>
          <span>{new Date(post.createdAt).toLocaleString("zh-CN")}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
        {(() => { try { const tags = JSON.parse(post.autoTags); if (Array.isArray(tags) && tags.length > 0) return (
          <div className="flex gap-1 mt-3">
            {tags.map((tag: string) => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{tag}</span>
            ))}
          </div>
        ); } catch { return null; } return null; })()}
      </div>

      <h3 className="text-md font-semibold mb-3">回复 ({post.replies.length})</h3>

      <div className="space-y-3 mb-6">
        {post.replies.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">暂无回复</p>
        )}
        {post.replies.map((reply) => (
          <div key={reply.id} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>{reply.user.name || "匿名"}</span>
              <span>{new Date(reply.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
          </div>
        ))}
      </div>

      <ReplyForm postId={postId} onReplied={fetchPost} />
    </div>
  );
}
