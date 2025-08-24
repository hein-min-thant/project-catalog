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
      );
      // Invalidate the query to fetch the latest data from the server
      queryClient.invalidateQueries({
        queryKey: ["reactionStatus", projectId, userId],
      });
    },
  });

  if (isLoading) {
    return (
      <Button disabled className="gap-1" size="lg" variant="ghost">
        <Icon className="text-xl" icon="mdi:heart-outline" />
        <span className="text-sm">...</span>
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
      className="gap-1"
      disabled={toggleReactionMutation.isPending}
      variant={isReacted ? "default" : "outline"}
      onClick={handleToggleReaction}
    >
      <Icon
        className="text-rose-500"
        icon={isReacted ? "mdi:heart" : "mdi:heart-outline"}
      />
      <span className="text-sm">{totalReactions}</span>
    </Button>
  );
};
