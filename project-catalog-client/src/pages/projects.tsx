// src/pages/projects/index.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import api from "@/config/api";
import { useDebounce } from "@/hooks/useDebounce";
import DefaultLayout from "@/layouts/default";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectFilters } from "@/components/app-sidebar";

// --- TYPE DEFINITIONS (keep them here to be imported by children) ---
export interface Project {
  id: number;
  title: string;
  description: string;
  benefits: string;
  body: string;
  excerpt: string;
  contentFormat: string;
  githubLink: string;
  coverImageUrl: string;
  academic_year: string;
  student_year: string;
  objectives: string;
  status: string;
  userId: number;
  categoryId: number;
  supervisorId?: number;
  supervisorName?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  approvedById?: number;
  approvedByName?: string;
  projectFiles: string[];
  tags: String[];
  membersJson: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Filters {
  keyword: string;
  categoryId: string;
  academicYear: string;
  studentYear: string;
  status: string;
  tags: string;
  name: string;
  supervisor: string;
  members: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

// --- API HELPER (can be moved to a separate file) ---
const fetchProjects = async (params: Record<string, any>) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  );
  const { data } = await api.get("/projects/search", { params: cleanParams });

  return data as Page<Project>;
};

// --- REUSABLE HOOK (can be moved to a separate file) ---
const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debouncedValue] = useDebounce([value], delay);

  return debouncedValue;
};

// --- MAIN PAGE COMPONENT ---
export default function ProjectsPage() {
  const initialFilters: Filters = {
    keyword: "",
    categoryId: "",
    academicYear: "",
    studentYear: "",
    status: "",
    tags: "",
    name: "",
    supervisor: "",
    members: "",
    page: 0,
    size: 9,
    sortBy: "createdAt",
    sortDirection: "desc",
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);

  const debouncedFilters = {
    keyword: useDebouncedValue(filters.keyword, 500),
    members: useDebouncedValue(filters.members, 500),
    name: useDebouncedValue(filters.name, 500),
    supervisor: useDebouncedValue(filters.supervisor, 500),
    tags: useDebouncedValue(filters.tags, 500),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects", { ...filters, ...debouncedFilters }],
    queryFn: () => fetchProjects({ ...filters, ...debouncedFilters }),
  });

  const handleFilterChange = (field: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== "page" && { page: 0 }),
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handlePageChange = (page: number) => {
    handleFilterChange("page", page - 1);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center lg:text-left mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            Explore Projects
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl">
            Discover student projects, filter by year, category, or keywords,
            and dive into detailed reports.
          </p>
        </header>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column for Filters */}
          <ProjectFilters
            filters={filters}
            onClearFilters={handleClearFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Right Column for Project Grid */}
          <main className="w-full lg:w-2/3 xl:w-3/4">
            <ProjectGrid
              data={data}
              error={error as Error | null}
              filters={filters}
              handlePageChange={handlePageChange}
              isError={isError}
              isLoading={isLoading}
            />
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
}
