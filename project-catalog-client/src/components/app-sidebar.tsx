/* eslint-disable jsx-a11y/label-has-associated-control */
// src/components/ProjectFilters.tsx
import { useMemo } from "react";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filters } from "@/pages/projects";

interface ProjectFiltersProps {
  filters: Filters;
  onFilterChange: (field: keyof Filters, value: string | number) => void;
  onClearFilters: () => void;
}

export function ProjectFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProjectFiltersProps) {
  const { academicYears, studentYears, categories } = useMemo(() => {
    const years = [];
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    for (let year = startYear; year <= currentYear; year++) {
      years.push({ key: `${year}-${year + 1}`, label: `${year}-${year + 1}` });
    }

    return {
      academicYears: years.reverse(),
      studentYears: [
        { key: "First Year", label: "First Year" },
        { key: "Second Year", label: "Second Year" },
        { key: "Third Year", label: "Third Year" },
        { key: "Fourth Year", label: "Fourth Year" },
        { key: "Final Year", label: "Final Year" },
        { key: "Master", label: "Master" },
      ],
      categories: [
        { key: "1", label: "Web Development" },
        { key: "2", label: "Mobile App" },
      ],
    };
  }, []);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "page" &&
      key !== "size" &&
      key !== "sortBy" &&
      key !== "sortDirection" &&
      value !== ""
  ).length;

  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4">
      <Card className="sticky top-8 bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 backdrop-blur-sm border border-border/50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                <Icon
                  className="text-white text-lg"
                  icon="mdi:filter-variant"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-default-600">
                    {activeFiltersCount} active
                  </p>
                )}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                aria-label="Clear all filters"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 p-2"
                size="sm"
                variant="ghost"
                onClick={onClearFilters}
              >
                <Icon icon="mdi:refresh-circle" width={20} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:magnify" />
              Search
            </label>
            <Input
              className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
              placeholder="Project title, description..."
              value={filters.keyword}
              onChange={(e) => onFilterChange("keyword", e.target.value)}
            />
          </div>

          {/* Member Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:account-group" />
              Team Member
            </label>
            <Input
              className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
              placeholder="e.g., John Doe"
              value={filters.members}
              onChange={(e) => onFilterChange("members", e.target.value)}
            />
          </div>

          {/* Supervisor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:account-tie" />
              Supervisor
            </label>
            <Input
              className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
              placeholder="e.g., Dr. Smith"
              value={filters.supervisor}
              onChange={(e) => onFilterChange("supervisor", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:tag-multiple" />
              Technologies
            </label>
            <Input
              className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
              placeholder="e.g., react, spring, ai"
              value={filters.tags}
              onChange={(e) => onFilterChange("tags", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:folder" />
              Category
            </label>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(val) =>
                onFilterChange("categoryId", val === "all" ? "" : val)
              }
            >
              <SelectTrigger className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-xl">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:calendar" />
              Academic Year
            </label>
            <Select
              value={filters.academicYear || "all"}
              onValueChange={(val) =>
                onFilterChange("academicYear", val === "all" ? "" : val)
              }
            >
              <SelectTrigger className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-xl">
                <SelectItem value="all">All years</SelectItem>
                {academicYears.map((y) => (
                  <SelectItem key={y.key} value={y.key}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Year */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className="text-cyan-500" icon="mdi:school" />
              Student Year
            </label>
            <Select
              value={filters.studentYear || "all"}
              onValueChange={(val) =>
                onFilterChange("studentYear", val === "all" ? "" : val)
              }
            >
              <SelectTrigger className="w-full bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-xl">
                <SelectItem value="all">All levels</SelectItem>
                {studentYears.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
