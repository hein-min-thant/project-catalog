import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

import { Project } from "./projects";

import "react-quill/dist/quill.snow.css";
import { Separator } from "@/components/ui/separator";
import api from "@/config/api";
import DefaultLayout from "@/layouts/default";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ChatApp from "@/components/Chat";
import { ReactionButton } from "@/components/ReactionButton";
import { CommentSection } from "@/components/CommentSection";

interface MemberDTO {
  name: string;
  rollNumber?: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch project data
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);

      return data as Project;
    },
  });

  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

  const { data: categoryName } = useQuery({
    queryKey: ["categoryName"],
    queryFn: async () => {
      const { data } = await api.get(`/category/${project?.categoryId}`);

      return data;
    },
    enabled: !!project?.categoryId,
  });

  // Fetch saved status
  const { data: isSaved, isLoading: isSavingStatusLoading } = useQuery({
    queryKey: ["isProjectSaved", id, currentUser?.id],
    queryFn: async () => {
      if (!id || !currentUser?.id) return false;
      const { data } = await api.get(
        `/saved-projects/check?projectId=${id}&userId=${currentUser.id}`
      );

      return data;
    },
    enabled: !!id && !!currentUser?.id,
  });

  // Mutations for saving and unsaving
  const saveMutation = useMutation({
    mutationFn: (dto: { projectId: number; userId: number }) =>
      api.post("/saved-projects", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["isProjectSaved", id, currentUser?.id],
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (dto: { projectId: number; userId: number }) =>
      api.delete(
        `/saved-projects?projectId=${dto.projectId}&userId=${dto.userId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["isProjectSaved", id, currentUser?.id],
      });
    },
  });

  const members = project?.membersJson
    ? (JSON.parse(project.membersJson) as MemberDTO[])
    : [];

  const handleEditClick = () => {
    navigate(`/projects/${project?.id}/edit`);
  };

  const handleSaveClick = () => {
    if (project && currentUser) {
      const dto = { projectId: project.id, userId: currentUser.id };

      if (isSaved) {
        unsaveMutation.mutate(dto);
      } else {
        saveMutation.mutate(dto);
      }
    }
  };

  if (isLoading || isSavingStatusLoading || isUserLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <Spinner label="Loading project..." size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (isError || !project) {
    return (
      <DefaultLayout>
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="text-center p-8 bg-card text-foreground">
            <CardHeader>
              <CardTitle>Failed to load project</CardTitle>
              <CardDescription>
                The project could not be found or an error occurred.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="mt-4"
                color="primary"
                onClick={() => navigate("/projects")}
              >
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  const canEdit = currentUser && project.userId === currentUser.id;

  return (
    <DefaultLayout>
      <div className="relative flex flex-col lg:flex-row h-screen">
        {/* Main content area */}
        <div
          className={`flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide transition-all duration-300 ${isChatOpen ? "lg:pr-[24rem]" : ""}`}
        >
          <div className="container mx-auto max-w-4xl pb-16">
            <header className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {project.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <Badge variant={"default"}>{categoryName}</Badge>
                    {project.academic_year && (
                      <span className="text-sm text-muted-foreground">
                        {project.academic_year}
                      </span>
                    )}
                    {project.student_year && (
                      <span className="text-sm text-muted-foreground">
                        {project.student_year}
                      </span>
                    )}
                    {project.approvalStatus && (
                      <Badge
                        variant={
                          project.approvalStatus === "APPROVED"
                            ? "default"
                            : project.approvalStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {project.approvalStatus}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <Button onClick={handleEditClick}>
                      <Icon className="mr-2" icon="mdi:pencil" />
                      Edit
                    </Button>
                  )}
                  {currentUser && (
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      onClick={handleSaveClick}
                    >
                      <Icon
                        className="mr-2 text-amber-300"
                        icon={isSaved ? "mdi:bookmark" : "mdi:bookmark-outline"}
                      />
                      {isSaved ? "Unsave" : "Save"}
                    </Button>
                  )}
                  {currentUser && (
                    <ReactionButton
                      projectId={project.id}
                      userId={currentUser.id}
                    />
                  )}
                </div>
              </div>
              {project.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {project.description}
                </p>
              )}
            </header>
            {/* Project Details section refactored to two-column layout */}
            <section className="mb-12 space-y-8">
              <h2 className="text-2xl font-bold">Project Details</h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  {project.objectives && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Objectives</h3>
                      <p>{project.objectives}</p>
                    </div>
                  )}
                  {project.benefits && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Benefits</h3>
                      <p>{project.benefits}</p>
                    </div>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="text-sm"
                            variant="secondary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {project.approvalStatus && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Approval Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              project.approvalStatus === "APPROVED"
                                ? "default"
                                : project.approvalStatus === "REJECTED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {project.approvalStatus}
                          </Badge>
                        </div>
                        {project.supervisorName && (
                          <p className="text-sm text-muted-foreground">
                            Supervisor: {project.supervisorName}
                          </p>
                        )}
                        {project.approvedAt && (
                          <p className="text-sm text-muted-foreground">
                            {project.approvalStatus === "APPROVED" ? "Approved" : "Rejected"} on: {new Date(project.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                        {project.approvedByName && (
                          <p className="text-sm text-muted-foreground">
                            {project.approvalStatus === "APPROVED" ? "Approved" : "Rejected"} by: {project.approvedByName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {project.githubLink && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        GitHub Repository
                      </h3>
                      <a
                        className="hover:underline flex items-center gap-2"
                        href={project.githubLink}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icon className="text-xl" icon="mdi:github" />
                        <span>View on GitHub</span>
                      </a>
                    </div>
                  )}
                  {project.projectFiles && project.projectFiles.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Project File
                      </h3>
                      <ul className="space-y-2">
                        {project.projectFiles.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 underline underline-offset-2"
                          >
                            <Icon
                              className="text-muted-foreground text-lg"
                              icon="mdi:file"
                            />
                            <a
                              className=""
                              href={file}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              Download File
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {members.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Team Members
                      </h3>
                      <ul className="space-y-2">
                        {members.map((member, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Icon
                              className="text-muted-foreground"
                              icon="mdi:account"
                            />
                            <span className="font-medium">{member.name}</span>
                            {member.rollNumber && (
                              <span className="text-muted-foreground">
                                ({member.rollNumber})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
            <Separator className="my-12" />
            <article className="ql-container border-none p-0">
              <div
                dangerouslySetInnerHTML={{ __html: project.body || "" }}
                className="ql-editor prose dark:prose-invert max-w-none font-sans text-lg"
              />
            </article>
            <Separator className="my-12" />
            <CommentSection
              currentUserId={currentUser.id}
              projectId={project.id}
            />
          </div>
        </div>

        {/* Chat Toggle Button (only visible when chat is closed) */}
        {!isChatOpen && (
          <Button
            className="fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg"
            color="primary"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon className="text-2xl" icon="mdi:chat" />
          </Button>
        )}

        {/* Chat Column */}
        <aside
          className={`fixed right-0 top-0 w-full lg:w-96 flex-shrink-0 border-l bg-slate-50 border-gray-200 h-screen transition-transform duration-300 ease-in-out z-40
          ${isChatOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="h-full">
            <ChatApp
              projectContent={
                project.title + project.excerpt + project.objectives
              }
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </aside>
      </div>
    </DefaultLayout>
  );
}
