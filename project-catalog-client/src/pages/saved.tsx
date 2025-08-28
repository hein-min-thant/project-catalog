// src/pages/SavedProjectsPage.tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  Search,
  Filter,
  Bookmark,
  Calendar,
  School,
  ArrowRight,
  Grid3X3,
  List,
  Heart,
  Eye,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DefaultLayout from "@/layouts/default";
import api from "@/config/api";

interface SavedProjectDTO {
  projectId: number;
  projectTitle: string;
  projectDescription: string;
  categoryId: number;
  coverImageUrl: string;
  academic_year: string;
  student_year: string;
}

export default function SavedProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

  const {
    data: savedProjects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["savedProjects", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data } = await api.get(`/saved-projects/user/${currentUser.id}`);

      return data as SavedProjectDTO[];
    },
    enabled: !!currentUser?.id,
  });

  // Get unique categories and years for filtering
  const { categories, academicYears } = useMemo(() => {
    if (!savedProjects) return { categories: [], academicYears: [] };

    const uniqueCategories = Array.from(
      new Set(savedProjects.map((p) => p.categoryId))
    ).map((categoryId) => ({
      key: categoryId.toString(),
      label: `Category ${categoryId}`, // You might want to fetch actual category names
    }));

    const uniqueYears = Array.from(
      new Set(savedProjects.map((p) => p.academic_year))
    ).filter(Boolean);

    return {
      categories: uniqueCategories,
      academicYears: uniqueYears,
    };
  }, [savedProjects]);

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    if (!savedProjects) return [];

    return savedProjects.filter((project) => {
      const matchesSearch =
        project.projectTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.projectDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        project.categoryId.toString() === selectedCategory;
      const matchesYear =
        selectedYear === "all" || project.academic_year === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [savedProjects, searchQuery, selectedCategory, selectedYear]);

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col min-h-screen bg-background">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl animate-pulse">
                  <Bookmark className="h-12 w-12 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Loading Saved Projects
                  </h2>
                  <p className="text-default-600">
                    Please wait while we fetch your bookmarked projects...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (isError) {
    return (
      <DefaultLayout>
        <div className="flex flex-col min-h-screen bg-background">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-md bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl">
                      <Icon
                        className="h-8 w-8 text-red-500"
                        icon="mdi:alert-circle"
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-red-600">
                    Unable to Load Projects
                  </CardTitle>
                  <CardDescription>
                    We couldn&apos;t retrieve your saved projects. Please try
                    again later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    onClick={() => navigate("/")}
                  >
                    Go Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-10">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                <Bookmark className="h-12 w-12 text-purple-500" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                Saved Projects
              </h1>
              <p className="text-lg text-default-600 max-w-2xl mx-auto">
                Your collection of bookmarked projects for easy access and
                inspiration
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full lg:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-default-500 h-4 w-4" />
                  <Input
                    className="pl-10 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="Search saved projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full lg:w-48 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full lg:w-48 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-purple-200 dark:border-purple-800 rounded-lg p-1">
                  <Button
                    className={
                      viewMode === "grid" ? "bg-purple-500 text-white" : ""
                    }
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    className={
                      viewMode === "list" ? "bg-purple-500 text-white" : ""
                    }
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery ||
                selectedCategory !== "all" ||
                selectedYear !== "all") && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-default-600">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      variant="secondary"
                    >
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      variant="secondary"
                    >
                      Category:{" "}
                      {
                        categories.find((c) => c.key === selectedCategory)
                          ?.label
                      }
                    </Badge>
                  )}
                  {selectedYear !== "all" && (
                    <Badge
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      variant="secondary"
                    >
                      Year: {selectedYear}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            savedProjects?.length === 0 ? (
              // No saved projects at all
              <Card className="bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                      <Bookmark className="h-16 w-16 text-purple-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    No Saved Projects Yet
                  </h3>
                  <p className="text-default-600 mb-6 max-w-md mx-auto">
                    You haven&apos;t saved any projects yet. Browse the project
                    catalog and bookmark the ones that interest you!
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 CardContent:from-purple-600 hover:to-pink-600 text-white
                    transition-all duration-300"
                    onClick={() => navigate("/projects")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Explore Projects
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // No projects match filters
              <Card className="bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl">
                      <Filter className="h-16 w-16 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    No Matching Projects
                  </h3>
                  <p className="text-default-600 mb-6 max-w-md mx-auto">
                    No saved projects match your current search and filter
                    criteria. Try adjusting your filters.
                  </p>
                  <Button
                    className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedYear("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((project) => (
                <EnhancedSavedProjectCard
                  key={project.projectId}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Results Summary */}
          {filteredProjects.length > 0 && (
            <div className="mt-8 text-center text-sm text-default-600">
              Showing {filteredProjects.length} of {savedProjects?.length || 0}{" "}
              saved projects
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

// Enhanced Saved Project Card Component
interface EnhancedSavedProjectCardProps {
  project: SavedProjectDTO;
  viewMode: "grid" | "list";
}

function EnhancedSavedProjectCard({
  project,
  viewMode,
}: EnhancedSavedProjectCardProps) {
  const navigate = useNavigate();

  const { data: categoryName } = useQuery({
    queryKey: ["categoryName", project.categoryId],
    queryFn: async () => {
      const { data } = await api.get(`/category/${project.categoryId}`);

      return data;
    },
    enabled: !!project.categoryId,
  });

  if (viewMode === "list") {
    return (
      <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50 transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            {project.coverImageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  alt={project.projectTitle}
                  className="w-full h-full object-cover"
                  src={project.coverImageUrl}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {project.projectTitle}
              </h3>
              <p className="text-default-600 text-sm mb-3 line-clamp-2">
                {project.projectDescription}
              </p>
              <div className="flex items-center gap-4 text-xs text-default-500">
                {categoryName && (
                  <Badge className="text-xs" variant="secondary">
                    {categoryName}
                  </Badge>
                )}
                {project.academic_year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{project.academic_year}</span>
                  </div>
                )}
                {project.student_year && (
                  <div className="flex items-center gap-1">
                    <School className="h-3 w-3" />
                    <span>{project.student_year}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => navigate(`/projects/${project.projectId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50  transition-all duration-300  group">
      {project.coverImageUrl && (
        <div className="w-full h-48 overflow-hidden relative">
          <img
            alt={project.projectTitle}
            className="w-full h-full object-cover  transition-transform duration-300"
            src={project.coverImageUrl}
          />
          <div className="absolute top-3 right-3">
            <div className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full backdrop-blur-sm">
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </div>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
          {project.projectTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {categoryName && (
          <Badge className="mb-3 text-xs" variant="secondary">
            {categoryName}
          </Badge>
        )}
        <p className="text-sm text-default-600 line-clamp-3 mb-4">
          {project.projectDescription}
        </p>
        <div className="flex items-center justify-between text-xs text-default-500">
          <div className="flex items-center gap-3">
            {project.academic_year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{project.academic_year}</span>
              </div>
            )}
            {project.student_year && (
              <div className="flex items-center gap-1">
                <School className="h-3 w-3" />
                <span>{project.student_year}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 group-hover:shadow-purple-500/25"
          onClick={() => navigate(`/projects/${project.projectId}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Project
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
