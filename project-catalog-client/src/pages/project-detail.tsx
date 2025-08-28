// ProjectDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useState } from "react";

// Snow.css stays – it auto-inherits the new palette
import "react-quill/dist/quill.snow.css";

import { Project } from "./projects";

import api from "@/config/api";
import DefaultLayout from "@/layouts/default";
import ChatApp from "@/components/Chat";
import { ReactionButton } from "@/components/ReactionButton";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CardBody } from "@heroui/react";

interface MemberDTO {
  name: string;
  rollNumber?: string;
}

const DetailBlock: React.FC<{
  title: string;
  icon: string;
  children?: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="text-cyan-500 text-lg" icon={icon} />
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <div className="text-sm text-default-600 pl-6">{children}</div>
  </div>
);

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data as Project,
  });
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await api.get("/users/me")).data,
  });
  const { data: categoryName } = useQuery({
    queryKey: ["categoryName"],
    queryFn: async () =>
      (await api.get(`/category/${project?.categoryId}`)).data,
    enabled: !!project?.categoryId,
  });
  const { data: isSaved } = useQuery({
    queryKey: ["isProjectSaved", id, currentUser?.id],
    queryFn: async () => {
      if (!id || !currentUser?.id) return false;

      return (
        await api.get(
          `/saved-projects/check?projectId=${id}&userId=${currentUser.id}`
        )
      ).data;
    },
    enabled: !!id && !!currentUser?.id,
  });

  /* ---------- Mutations ---------- */
  const saveMutation = useMutation({
    mutationFn: (dto: { projectId: number; userId: number }) =>
      api.post("/saved-projects", dto),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["isProjectSaved", id, currentUser?.id],
      }),
  });
  const unsaveMutation = useMutation({
    mutationFn: (dto: { projectId: number; userId: number }) =>
      api.delete(`/saved-projects`, { params: dto }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["isProjectSaved", id, currentUser?.id],
      }),
  });

  const members = project?.membersJson
    ? (JSON.parse(project.membersJson) as MemberDTO[])
    : [];
  const canEdit = currentUser && project?.userId === currentUser.id;

  /* ---------- Handlers ---------- */
  const handleSave = () => {
    if (!project || !currentUser) return;
    const dto = { projectId: project.id, userId: currentUser.id };

    isSaved ? unsaveMutation.mutate(dto) : saveMutation.mutate(dto);
  };

  /* ---------- Loading / 404 ---------- */
  if (isLoading)
    return (
      <DefaultLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Loading Project...
              </h3>
              <p className="text-default-600">
                Please wait while we fetch the project details
              </p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  if (isError || !project)
    return (
      <DefaultLayout>
        <div className="flex h-screen items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-2xl text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Project Not Found
                </h3>
                <p className="text-red-600/80 dark:text-red-300/80">
                  The project you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
              <Button
                onClick={() => navigate("/projects")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Back to Projects
              </Button>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );

  /* ---------- Render ---------- */
  return (
    <DefaultLayout>
      <div className="relative min-h-screen bg-background">
        {/* Main Content */}
        <main
          className={`transition-all duration-500 ease-in-out ${
            isChatOpen ? "lg:pr-[10rem] xl:pr-[15rem]" : ""
          }`}
        >
          <div className="max-w-5xl p-4 md:p-6 lg:p-8 mx-auto">
            <div className="space-y-8">
              {/* Header Section */}
              {/* Breadcrumbs and Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {categoryName && (
                  <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                    {categoryName}
                  </Badge>
                )}
                {project.academic_year && (
                  <Badge variant="outline" className="text-default-600">
                    {project.academic_year}
                  </Badge>
                )}
                {project.student_year && (
                  <Badge variant="outline" className="text-default-600">
                    {project.student_year}
                  </Badge>
                )}
              </div>

              {/* Title and Description */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {project.title}
                </h1>

                {project.description && (
                  <div className="pl-4 border-l-4 border-cyan-500">
                    <p className="text-lg text-default-600 italic">
                      {project.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Core Details Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Icon
                        icon="mdi:information-outline"
                        className="text-xl text-cyan-500"
                      />
                    </div>
                    <h2 className="text-2xl font-bold">Project Details</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-[3fr_2fr] gap-8">
                    <div className="space-y-6">
                      {project.objectives && (
                        <DetailBlock icon="mdi:target" title="Objectives">
                          <p className="text-base leading-relaxed">
                            {project.objectives}
                          </p>
                        </DetailBlock>
                      )}

                      {project.benefits && (
                        <DetailBlock icon="mdi:trophy-variant" title="Benefits">
                          <p className="text-base leading-relaxed">
                            {project.benefits}
                          </p>
                        </DetailBlock>
                      )}

                      {project.tags && project.tags.length > 0 && (
                        <DetailBlock
                          icon="mdi:tag-multiple"
                          title="Technologies"
                        >
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {String(tag)}
                              </Badge>
                            ))}
                          </div>
                        </DetailBlock>
                      )}
                    </div>

                    <div className="space-y-6">
                      {project.approvalStatus && (
                        <DetailBlock
                          icon="mdi:check-decagram"
                          title="Approval Status"
                        >
                          <div className="space-y-2">
                            <Badge
                              className={
                                project.approvalStatus === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : project.approvalStatus === "REJECTED"
                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                    : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              }
                            >
                              {project.approvalStatus}
                            </Badge>

                            {project.supervisorName && (
                              <p className="text-sm text-default-600">
                                Supervisor: {project.supervisorName}
                              </p>
                            )}

                            {project.approvedAt && (
                              <p className="text-sm text-default-600">
                                Last Approved:{" "}
                                {format(
                                  new Date(project.approvedAt),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            )}
                          </div>
                        </DetailBlock>
                      )}

                      {project.githubLink && (
                        <DetailBlock icon="mdi:github" title="Source Code">
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
                          >
                            View on GitHub
                            <Icon icon="mdi:external-link" />
                          </a>
                        </DetailBlock>
                      )}

                      {project.projectFiles &&
                        project.projectFiles.length > 0 && (
                          <DetailBlock
                            icon="mdi:file-download"
                            title="Project Files"
                          >
                            <div className="space-y-2">
                              {project.projectFiles
                                .slice()
                                .reverse()
                                .map((url, i) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
                                  >
                                    <Icon
                                      icon="mdi:file-document-outline"
                                      className="text-sm"
                                    />
                                    Download File {i + 1}
                                    {i === project.projectFiles.length - 1 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Latest
                                      </Badge>
                                    )}
                                  </a>
                                ))}
                            </div>
                          </DetailBlock>
                        )}

                      {members.length > 0 && (
                        <DetailBlock
                          icon="mdi:account-group"
                          title="Team Members"
                        >
                          <div className="space-y-1">
                            {members.map((member, index) => (
                              <div key={index} className="flex items-center">
                                <span className="text-sm mr-3">
                                  {member.name}
                                </span>
                                {member.rollNumber && (
                                  <>({member.rollNumber})</>
                                )}
                              </div>
                            ))}
                          </div>
                        </DetailBlock>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Report Section */}
              {project.body && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Icon
                          className="text-xl text-cyan-500"
                          icon="mdi:file-document-outline"
                        />
                      </div>
                      <h2 className="text-2xl font-bold">Detailed Report</h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-6" />
                    <div
                      dangerouslySetInnerHTML={{ __html: project.body }}
                      className="ql-editor prose dark:prose-invert max-w-none text-base leading-relaxed"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              {currentUser && (
                <CommentSection
                  currentUserId={currentUser.id}
                  projectId={project.id}
                />
              )}
            </div>
          </div>
        </main>

        {/* Left Side - Action Buttons */}
        {currentUser && (
          <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
            {/* Save Button - Yellow Color */}

            <div className="">
              <ReactionButton projectId={project.id} userId={currentUser.id} />
            </div>
            <Button
              size="lg"
              className={` p-0 shadow-lg transition-all duration-300 rounded-lg ${
                isSaved
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-background hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
              }`}
              onClick={handleSave}
            >
              <Icon
                className="h-5 w-5"
                icon={isSaved ? "mdi:bookmark" : "mdi:bookmark-outline"}
              />
              {isSaved ? "Unsave" : "Save"}
            </Button>

            {/* Edit Button */}
            {canEdit && (
              <Button
                size="lg"
                className="p-0 shadow-lg text-white rounded-lg"
                onClick={() => navigate(`/projects/${project.id}/edit`)}
              >
                <Icon icon="mdi:pencil" className="h-5 w-5" />
                Edit
              </Button>
            )}
          </div>
        )}

        {/* Right Side - Chat Button (Hidden when chat is open) */}
        {currentUser && !isChatOpen && (
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-50 bg-cyan-500 hover:bg-cyan-600 text-white shadow-2xl w-12 h-12 p-0 transition-all duration-500 hover:scale-110 rounded-lg"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon className="h-6 w-6" icon="mdi:chat" />
          </Button>
        )}

        {/* Chat Sidebar - High Z-Index */}
        <aside
          className={`fixed right-0 top-16 z-45 w-full border-l bg-background shadow-2xl lg:w-80 xl:w-[22rem] transition-transform duration-500 ease-in-out ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ChatApp
            projectContent={
              project.title + " " + project.excerpt + " " + project.objectives
            }
            onClose={() => setIsChatOpen(false)}
          />
        </aside>

        {/* Overlay for mobile */}
        {isChatOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
