// src/pages/SavedProjectsPage.tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/react";
import { Button } from "@heroui/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import DefaultLayout from "@/layouts/default";
import api from "@/config/api";
import SavedProjectCard from "@/components/SavedProjectCard"; // Import the new component

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

  // Remove the problematic useQuery for categoryName here
  // const { data: categoryName } = useQuery({ ... });

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <Spinner label="Loading your saved projects..." size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (isError) {
    return (
      <DefaultLayout>
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="text-center p-8 bg-card text-foreground">
            <CardHeader>
              <CardTitle>Error loading saved projects</CardTitle>
              <CardDescription>
                We couldn&apos;t retrieve your saved projects. Please try again
                later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onPress={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <Icon
              className="inline-block text-primary mr-2 align-text-bottom"
              icon="mdi:bookmark-multiple"
            />
            Your Saved Projects
          </h1>
          <p className="text-lg text-muted-foreground">
            A list of projects you&apos;ve bookmarked for later.
          </p>
        </header>
        {savedProjects?.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              className="mx-auto text-6xl text-muted-foreground"
              icon="mdi:bookmark-remove-outline"
            />
            <h2 className="text-xl font-semibold mt-4">
              You haven&apos;t saved any projects yet.
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse the project list and save the ones you find interesting!
            </p>
            <Button className="mt-6" onClick={() => navigate("/projects")}>
              Explore Projects
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedProjects?.map((project) => (
              // Use the new component inside the map function
              <SavedProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
