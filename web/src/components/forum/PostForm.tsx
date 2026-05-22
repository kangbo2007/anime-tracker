"use client";

import { useState } from "react";

export function PostForm({ animeId, onPosted }: { animeId: string; onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, title: title.trim(), content: content.trim() }),
    });
    setTitle("");
    setContent("");
    setLoading(false);
    onPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg">
      <input
        type="text"
        placeholder="帖子标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        maxLength={100}
        required
      />
      <textarea
        placeholder="帖子内容（纯文字）"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        maxLength={10000}
        required
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{content.length}/10000</span>
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "发布中..." : "发布帖子"}
        </button>
      </div>
    </form>
  );
}
