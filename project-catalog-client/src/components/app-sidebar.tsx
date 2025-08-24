// src/components/ProjectFilters.tsx
import { useMemo } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// You may need to adjust the import path for Filters if it's in a different file
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
  // Memoize filter options to prevent re-calculation on every render
  const { academicYears, studentYears, categories, statuses } = useMemo(() => {
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
      statuses: [
        { key: "completed", label: "Completed" },
        { key: "in progress", label: "In Progress" },
      ],
    };
  }, []);

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4">
      <Card className="p-4 sticky top-8">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <Button
            isIconOnly
            aria-label="Clear filters"
            size="sm"
            variant="light"
            onPress={onClearFilters}
          >
            <Icon icon="solar:refresh-circle-bold-duotone" width={24} />
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Keyword"
            placeholder="Search title, description..."
            startContent={<Icon icon="solar:magnifer-linear" />}
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
          />
          <Input
            label="Member Name"
            placeholder="e.g., John Doe"
            startContent={<Icon icon="solar:user-linear" />}
            value={filters.members}
            onChange={(e) => onFilterChange("members", e.target.value)}
          />
          <Input
            label="Tags"
            placeholder="e.g., react, spring"
            startContent={<Icon icon="solar:tag-linear" />}
            value={filters.tags}
            onChange={(e) => onFilterChange("tags", e.target.value)}
          />
          <Select
            items={categories}
            label="Category"
            placeholder="Any category"
            selectedKeys={filters.categoryId ? [filters.categoryId] : []}
            onChange={(e) => onFilterChange("categoryId", e.target.value)}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={academicYears}
            label="Academic Year"
            placeholder="Any year"
            selectedKeys={filters.academicYear ? [filters.academicYear] : []}
            onChange={(e) => onFilterChange("academicYear", e.target.value)}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={studentYears}
            label="Student Year"
            placeholder="Any level"
            selectedKeys={filters.studentYear ? [filters.studentYear] : []}
            onChange={(e) => onFilterChange("studentYear", e.target.value)}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={statuses}
            label="Status"
            placeholder="Any status"
            selectedKeys={filters.status ? [filters.status] : []}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
        </CardBody>
      </Card>
    </div>
  );
}
