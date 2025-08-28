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
      <Button
        disabled
        className="gap-1 text-sm p-0 h-auto bg-transparent border-none"
        size="default"
        variant="ghost"
      >
        <Icon
          className="text-lg text-gray-400 dark:text-gray-600"
          icon="mdi:heart-outline"
        />
      </Button>
    );
  }

  const handleToggleReaction = () => {
    toggleReactionMutation.mutate();
  };

  const isReacted = reactionStatus?.reacted;
  const totalReactions = reactionStatus?.totalReactions || 0;

  // src/components/ReactionButton.tsx  (only the return block changes)

  return (
    <div className="flex items-center gap-2">
      <Button
        className={`
        hover:bg-rose-300
        shadow-lg
        group
        relative
        flex items-center justify-center rounded-lg
        bg-transprent border border-rose-500
        ${isReacted ? "bg-rose-500" : ""}
      `}
        size="lg"
        disabled={toggleReactionMutation.isPending}
        onClick={handleToggleReaction}
        aria-label={isReacted ? "Unlike" : "Like"}
      >
        {/* subtle ripple on click */}
        <span
          className={`
          absolute inset-0 rounded-full
          bg-rose-400/20
          scale-0 group-active:scale-100
          transition-transform duration-300
        `}
        />

        {/* oversized heart */}
        <Icon
          className={`
          z-10
          text-2xl
          transition-all duration-200 ease-in-out mr-4
          ${isReacted ? "text-white" : "text-rose-500"}
        `}
          icon={isReacted ? "mdi:heart" : "mdi:heart-outline"}
        />
        {totalReactions > 0 && (
          <span
            className={`
          text-sm font-bold ${isReacted ? "text-white" : "text-rose-500"}
        `}
          >
            {totalReactions}
          </span>
        )}
      </Button>

      {/* counter badge */}
    </div>
  );
};
