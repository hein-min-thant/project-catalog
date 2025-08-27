// CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

import api from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Icon icon="mdi:comment-outline" className="text-xl text-cyan-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Comments</h2>
            <p className="text-sm text-default-600">
              {comments?.length || 0} comment{(comments?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-cyan-200/50 dark:border-cyan-800/50">
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex items-start gap-3">
                <img
                  alt="Your Avatar"
                  className="h-10 w-10 flex-shrink-0 rounded-full object-cover border-2 border-cyan-200 dark:border-cyan-800"
                  src={users.get(currentUserId)?.avatarUrl || "https://static.vecteezy.com/system/resources/thumbnails/021/548/095/small/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"}
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-default-600 focus:border-cyan-500 focus:outline-none min-h-[80px]"
                    disabled={addCommentMutation.isPending}
                    placeholder="Share your thoughts about this project..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-default-600">
                      Be respectful and constructive in your comments
                    </p>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={addCommentMutation.isPending || !newComment.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <Icon icon="mdi:loading" className="mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:send" className="mr-1" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-default-600">Loading comments...</p>
            </div>
          )}

          {!isLoading && comments && comments.length === 0 && (
            <Card className="bg-gray-50/50 dark:bg-gray-900/50 border-dashed">
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:comment-outline" className="text-2xl text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No comments yet</h3>
                <p className="text-sm text-default-600">Be the first to share your thoughts about this project!</p>
              </CardContent>
            </Card>
          )}

          {comments?.map((comment) => {
            const user = users.get(comment.userId);
            const isOwnComment = comment.userId === currentUserId;

            return (
              <Card key={comment.id} className={`bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 ${
                isOwnComment ? 'border-cyan-200 dark:border-cyan-800' : 'border-border'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      alt={user?.name || "User"}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      src={
                        user?.avatarUrl ||
                        "https://static.vecteezy.com/system/resources/thumbnails/021/548/095/small/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {user?.name || "Unknown User"}
                          </span>
                          {isOwnComment && (
                            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                              You
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <time className="text-xs text-default-600">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </time>
                          
                          {isOwnComment && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 p-1 h-auto"
                            >
                              <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm leading-relaxed text-foreground">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};