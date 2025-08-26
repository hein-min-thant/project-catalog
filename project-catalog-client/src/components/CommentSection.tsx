// CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import api from "@/config/api";

interface Comment {
  id: number;
  userId: number;
  comment: string;
  createdAt: string;
}
interface UserProfile {
  id: number;
  name: string;
  avatarUrl?: string;
}
interface CommentSectionProps {
  projectId: number;
  currentUserId: number;
}

export const CommentSection = ({
  projectId,
  currentUserId,
}: CommentSectionProps) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [users, setUsers] = useState<Map<number, UserProfile>>(new Map());

  /* ---------- Queries ---------- */
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["projectComments", projectId],
    queryFn: async () => (await api.get(`/comments/project/${projectId}`)).data,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (comments) {
      const ids = Array.from(new Set(comments.map((c) => c.userId))).filter(
        (id) => !users.has(id)
      );

      ids.forEach(async (id) => {
        try {
          const { data } = await api.get(`/users/${id}`);

          setUsers((prev) => new Map(prev).set(id, data));
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, [comments, users]);

  const addCommentMutation = useMutation({
    mutationFn: (text: string) =>
      api.post("/comments", {
        projectId,
        userId: currentUserId,
        comment: text,
      }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      });
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      api.delete(`/comments/${commentId}`, {
        params: { userId: currentUserId },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      }),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) addCommentMutation.mutate(newComment);
  };
  const handleDelete = (id: number) => deleteCommentMutation.mutate(id);

  /* ---------- Render ---------- */
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-5">
        Comments ({comments?.length || 0})
      </h2>

      {/* Add comment */}
      <form
        className="bg-glass rounded-2xl p-4 flex items-start gap-3 shadow-md"
        onSubmit={handleAdd}
      >
        <img
          alt="You"
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          src={users.get(currentUserId)?.avatarUrl || "/default-avatar.png"}
        />
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-cyan-500 focus:outline-none"
            disabled={addCommentMutation.isPending}
            placeholder="Write a comment…"
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-60"
              disabled={addCommentMutation.isPending}
              type="submit"
            >
              Post
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="mt-6 space-y-6">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            Loading comments…
          </p>
        )}
        {comments?.map((c) => {
          const user = users.get(c.userId);

          return (
            <div
              key={c.id}
              className="bg-glass rounded-2xl p-4 flex items-start gap-3 shadow-md"
            >
              <img
                alt={user?.name || "?"}
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                src={
                  user?.avatarUrl ||
                  "https://static.vecteezy.com/system/resources/thumbnails/021/548/095/small/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
                }
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">
                    {user?.name || "Unknown"}
                  </span>
                  {c.userId === currentUserId && (
                    <button
                      className="rounded-full p-1 text-muted-foreground transition hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/40"
                      disabled={deleteCommentMutation.isPending}
                      type="button"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Icon className="h-4 w-4" icon="mdi:delete-outline" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {c.comment}
                </p>
                <time className="mt-1 block text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
