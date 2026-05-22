"use client";

import { useState } from "react";

export function ReplyForm({ postId, onReplied }: { postId: string; onReplied: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch(`/api/posts/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    setContent("");
    setLoading(false);
    onReplied();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        placeholder="写回复..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        maxLength={5000}
        required
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "回复中..." : "回复"}
        </button>
      </div>
    </form>
  );
}
