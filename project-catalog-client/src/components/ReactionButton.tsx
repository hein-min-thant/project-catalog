// src/components/ReactionButton.tsx
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import api from "@/config/api";

interface ReactionButtonProps {
  projectId: number;
  userId: number;
}

interface ReactionResponseDTO {
  projectId: number;
  userId: number;
  reacted: boolean;
  totalReactions: number;
}

export const ReactionButton = ({ projectId, userId }: ReactionButtonProps) => {
  const queryClient = useQueryClient();

  const { data: reactionStatus, isLoading } = useQuery<ReactionResponseDTO>({
    queryKey: ["reactionStatus", projectId, userId],
    queryFn: async () => {
      const { data } = await api.get("/reactions/status", {
        params: { projectId, userId },
      });

      return data;
    },
    enabled: !!projectId && !!userId,
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/reactions/toggle", {
        projectId,
        userId,
      });

      return data;
    },
    onSuccess: (newReactionStatus: ReactionResponseDTO) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ["reactionStatus", projectId, userId],
        newReactionStatus
      ); // Invalidate the query to fetch the latest data from the server
      // Invalidation handles synchronization across different pages/components
      queryClient.invalidateQueries({
        queryKey: ["reactionStatus", projectId, userId],
      });
    },
  });

  if (isLoading) {
    return (
      <Button disabled className="gap-1 text-sm" size="default" variant="ghost">
        <Icon
          className="text-xl text-gray-400 dark:text-gray-600"
          icon="mdi:heart-outline"
        />
        <span className="text-gray-500 dark:text-gray-500">...</span>
      </Button>
    );
  }

  const handleToggleReaction = () => {
    toggleReactionMutation.mutate();
  };

  const isReacted = reactionStatus?.reacted;
  const totalReactions = reactionStatus?.totalReactions || 0;

  return (
    <Button
      className={`
        gap-1 
        text-sm 
        font-semibold 
        transition-all duration-200 
        shadow-sm 
        border-1 border-rose-500
        // Conditionals for Active (Reacted) vs. Inactive (Outline) state
        ${
          isReacted
            ? "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700 dark:text-white"
            : "bg-transparent text-gray-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-rose-900/30"
        }
      `}
      disabled={toggleReactionMutation.isPending}
      variant={isReacted ? "default" : "ghost"}
      onClick={handleToggleReaction}
    >
      <Icon
        className={`text-xl transition-transform duration-100 ${isReacted ? "text-white dark:text-white" : "text-rose-500 dark:text-rose-400 group-hover:text-rose-600"}`}
        icon={isReacted ? "mdi:heart" : "mdi:heart-outline"}
      />
      <span
        className={`${isReacted ? "text-white dark:text-white" : "text-foreground dark:text-foreground"}`}
      >
        {totalReactions}
      </span>
    </Button>
  );
};
