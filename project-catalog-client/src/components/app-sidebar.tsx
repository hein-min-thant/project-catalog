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

  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4">
      <Card className="p-4 sticky top-8 bg-card/70 backdrop-blur-sm border border-border shadow-lg">
        <CardHeader className="flex justify-between items-center pb-3">
          <h2 className="text-xl font-bold">Filters</h2>
          <Button
            aria-label="Clear filters"
            size="icon"
            variant="ghost"
            onClick={onClearFilters}
          >
            <Icon icon="solar:refresh-circle-bold-duotone" width={24} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Keyword */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Keyword</label>
            <Input
              className="w-full"
              placeholder="Search title, description..."
              value={filters.keyword}
              onChange={(e) => onFilterChange("keyword", e.target.value)}
            />
          </div>

          {/* Member Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Member Name</label>
            <Input
              className="w-full"
              placeholder="e.g., John Doe"
              value={filters.members}
              onChange={(e) => onFilterChange("members", e.target.value)}
            />
          </div>

          {/* Supervisor */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Supervisor</label>
            <Input
              className="w-full"
              placeholder="e.g., Dr. Smith"
              value={filters.supervisor}
              onChange={(e) => onFilterChange("supervisor", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Tags</label>
            <Input
              className="w-full"
              placeholder="e.g., react, spring"
              value={filters.tags}
              onChange={(e) => onFilterChange("tags", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.categoryId || ""}
              onValueChange={(val) => onFilterChange("categoryId", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {categories.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Academic Year</label>
            <Select
              value={filters.academicYear || ""}
              onValueChange={(val) => onFilterChange("academicYear", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any year" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {academicYears.map((y) => (
                  <SelectItem key={y.key} value={y.key}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Year */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Student Year</label>
            <Select
              value={filters.studentYear || ""}
              onValueChange={(val) => onFilterChange("studentYear", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any level" />
              </SelectTrigger>
              <SelectContent className="bg-background">
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
