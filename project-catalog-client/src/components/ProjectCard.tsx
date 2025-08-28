// src/components/ProjectCard.tsx
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Project } from "@/pages/projects";
import { ApprovalStatusBadge } from "@/components/ApprovalStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/config/api";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const { data: categoryName } = useQuery({
    queryKey: ["categoryName", project.categoryId],
    queryFn: async () =>
      (await api.get(`/category/${project.categoryId}`)).data,
  });

  const handleViewProject = () => {
    navigate(`/projects/${project.id}`);
  };

  // Get project status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "in-progress":
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <article className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 rounded-xl shadow-md border border-border/50 overflow-hidden flex flex-col h-full cursor-pointer">
      {/* Cover Image */}
      {project.coverImageUrl && (
        <div className="relative w-full h-32 overflow-hidden rounded-t-xl">
          <img
            alt={project.title}
            className="w-full h-full object-cover"
            src={project.coverImageUrl}
          />

          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">
            <ApprovalStatusBadge
              className="text-xs shadow-sm"
              status={project.approvalStatus}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {project.title}
        </h2>

        {/* Category and Status */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
            {categoryName || "Uncategorized"}
          </Badge>

          {project.status && (
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-default-600 line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Meta Information */}
        <div className="space-y-1 mb-4">
          {/* Academic Year */}
          {project.academic_year && (
            <div className="flex items-center gap-1 text-xs text-default-600">
              <Icon className="text-cyan-500 text-xs" icon="mdi:calendar" />
              <span>{project.academic_year}</span>
            </div>
          )}

          {/* Student Year */}
          {project.student_year && (
            <div className="flex items-center gap-1 text-xs text-default-600">
              <Icon className="text-cyan-500 text-xs" icon="mdi:school" />
              <span>{project.student_year}</span>
            </div>
          )}

          {/* Supervisor */}
          {project.supervisorName && (
            <div className="flex items-center gap-1 text-xs text-default-600">
              <Icon className="text-cyan-500 text-xs" icon="mdi:account-tie" />
              <span>Supervided by : {project.supervisorName}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Icon className="text-cyan-500 text-xs" icon="mdi:tag-multiple" />
            <div className="flex gap-1 flex-wrap">
              {project.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  className="text-xs py-0 px-1"
                  variant="outline"
                >
                  {String(tag)}
                </Badge>
              ))}
              {project.tags.length > 2 && (
                <Badge className="text-xs py-0 px-1" variant="outline">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            size="sm"
            onClick={handleViewProject}
          >
            <Icon className="mr-1 text-sm" icon="mdi:eye" />
            View
          </Button>
        </div>
      </div>
    </article>
  );
}
