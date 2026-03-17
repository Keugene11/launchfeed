"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createPost } from "@/lib/actions";

export function PostComposer({ userName }: { userName?: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!content.trim() || content.length > 500) return;
    startTransition(async () => {
      await createPost(content);
      setContent("");
    });
  };

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-semibold text-[14px] shrink-0">
          {userName?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in startup land?"
            maxLength={500}
            rows={3}
            className="w-full bg-transparent text-[14px] text-[#1a1a1a] placeholder:text-[#999]/50 outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-[12px] ${content.length > 450 ? "text-red-500" : "text-[#999]"}`}>
              {content.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="bg-[#1a1a1a] text-white px-5 py-2 rounded-full text-[13px] font-semibold press disabled:opacity-40 flex items-center gap-2"
            >
              <Send size={14} strokeWidth={1.5} />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
