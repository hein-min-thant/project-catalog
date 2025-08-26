// src/components/ProjectCard.tsx
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";

import { Project } from "@/pages/projects";
import { ApprovalStatusBadge } from "@/components/ApprovalStatusBadge";
import api from "@/config/api";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { data: categoryName } = useQuery({
    queryKey: ["categoryName", project.categoryId],
    queryFn: async () =>
      (await api.get(`/category/${project.categoryId}`)).data,
  });

  return (
    <article className="bg-glass rounded-2xl shadow-lg ring-1 ring-border overflow-hidden flex flex-col h-full">
      {/* Cover (optional) */}
      {project.coverImageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            alt={project.title}
            className="w-full h-full object-cover"
            src={project.coverImageUrl}
          />
        </div>
      )}

      {/* Content — fills available space */}
      <div className="p-2.5 flex flex-col flex-1">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {project.title}
        </h2>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
            {categoryName}
          </span>
          {project.approvalStatus && (
            <ApprovalStatusBadge
              className="text-xs"
              status={project.approvalStatus}
            />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {project.academic_year && (
            <div className="flex items-center gap-1">
              <Icon icon="mdi:calendar" />
              <span>{project.academic_year}</span>
            </div>
          )}
          {project.student_year && (
            <div className="flex items-center gap-1">
              <Icon icon="mdi:school" />
              <span>{project.student_year}</span>
            </div>
          )}
        </div>

        {/* Pushes button to the bottom */}
        <div className="mt-auto pt-4">
          <a
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 transition"
            href={`/projects/${project.id}`}
          >
            View Project
            <Icon icon="mdi:arrow-right" />
          </a>
        </div>
      </div>
    </article>
  );
}
