// src/components/ProjectGrid.tsx
import { Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";

import { Project, Page, Filters } from "../pages/projects";

import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  data: Page<Project> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filters: Filters;
  handlePageChange: (page: number) => void;
}

export function ProjectGrid({
  data,
  isLoading,
  isError,
  error,
  filters,
  handlePageChange,
}: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icon
          className="h-10 w-10 text-cyan-500"
          icon="svg-spinners:90-ring-with-bg"
        />
        <h2 className="text-cyan-500 ml-3">Loading...</h2>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-danger-50 rounded-lg text-danger-600">
        <p className="font-semibold">Failed to load projects</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  if (!data?.content || data.content.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
        <p className="font-semibold">No Projects Found</p>
        <p className="text-sm">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.content.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      {data.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            showControls
            color="primary"
            page={filters.page + 1}
            total={data.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
