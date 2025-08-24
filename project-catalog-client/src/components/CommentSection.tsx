// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/api";

interface Comment {
  id: number;
  userId: number; // Only userId is available from the API
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

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["projectComments", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/project/${projectId}`);

      return data;
    },
    enabled: !!projectId,
  });

  // Fetch user data for each comment
  useEffect(() => {
    if (comments) {
      const userIdsToFetch = Array.from(
        new Set(comments.map((c) => c.userId))
      ).filter((id) => !users.has(id));

      userIdsToFetch.forEach(async (id) => {
        try {
          const { data } = await api.get(`/users/${id}`);

          setUsers((prev) => new Map(prev).set(id, data));
        } catch (error) {
          console.error(`Failed to fetch user ${id}`, error);
        }
      });
    }
  }, [comments, users]);

  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      const { data } = await api.post("/comments", {
        projectId,
        userId: currentUserId,
        comment: commentText,
      });

      return data;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/comments/${commentId}`, {
        params: { userId: currentUserId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Comments ({comments?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Improved Comment Form Alignment */}
        <form className="flex items-start gap-2" onSubmit={handleAddComment}>
          <Textarea
            className="flex-1"
            disabled={addCommentMutation.isPending}
            placeholder="Add a comment..."
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            className="self-end"
            disabled={addCommentMutation.isPending}
            type="submit"
          >
            Post
          </Button>
        </form>

        <div className="space-y-6 mt-6">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading comments...</p>
          ) : (
            comments?.map((comment) => {
              const user = users.get(comment.userId);

              return (
                <div key={comment.id} className="flex gap-4 items-start">
                  <Avatar className="h-9 w-9">
                    <AvatarImage alt={user?.name} src={user?.avatarUrl} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {user?.name.charAt(0).toUpperCase() || "..."}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {user?.name || "Unknown User"}
                        </span>
                        {/* Improved Delete Button */}
                        {currentUserId === comment.userId && (
                          <Button
                            className="w-6 h-6 rounded-full text-gray-500 hover:text-red-500"
                            disabled={deleteCommentMutation.isPending}
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Icon
                              className="text-base"
                              icon="mdi:delete-outline"
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {comment.comment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
