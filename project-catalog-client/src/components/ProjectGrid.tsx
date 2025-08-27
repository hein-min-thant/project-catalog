// src/components/ProjectGrid.tsx
import { Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";

import { Project, Page, Filters } from "../pages/projects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400 rounded-full animate-spin animation-delay-75"></div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Loading Projects...</h3>
        <p className="text-default-600">Please wait while we fetch the latest projects</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
            <Icon icon="mdi:alert-circle" className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Failed to Load Projects
          </h3>
          <p className="text-red-600/80 dark:text-red-300/80 mb-6">
            {error?.message || "An unexpected error occurred while loading projects."}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.content || data.content.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <CardContent className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Icon icon="mdi:folder-open-outline" className="text-2xl text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Projects Found
          </h3>
          <p className="text-default-600 mb-6 max-w-md mx-auto">
            {filters.keyword || filters.categoryId || filters.academicYear || filters.studentYear
              ? "No projects match your current filters. Try adjusting your search criteria."
              : "There are no projects available at the moment. Check back later for new content."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/create'}
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/50"
            >
              <Icon icon="mdi:plus" className="mr-1" />
              Create Project
            </Button>
            <Button 
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.content.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination
            showControls
            color="primary"
            page={filters.page + 1}
            total={data.totalPages}
            onChange={handlePageChange}
            className="bg-background/50 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-default-600 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg py-3 px-4">
        Showing {data.content.length} of {data.content.length} projects 
        {data.totalPages > 1 && ` • Page ${filters.page + 1} of ${data.totalPages}`}
      </div>
    </div>
  );
}