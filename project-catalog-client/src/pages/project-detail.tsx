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

interface MemberDTO {
  name: string;
  rollNumber?: string;
}

/* ---------------------------------------------------------- */
/*  Helper                                                    */
/* ---------------------------------------------------------- */
const DetailBlock: React.FC<{
  title: string;
  icon: string;
  children?: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div>
    <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
      <Icon className="text-cyan-500" icon={icon} />
      {title}
    </h3>
    <div className="text-sm text-slate-600 dark:text-slate-400">{children}</div>
  </div>
);

/* ---------------------------------------------------------- */
/*  Page                                                      */
/* ---------------------------------------------------------- */
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);

  /* ---------- Queries ---------- */
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
          <Icon
            className="h-10 w-10 text-cyan-500"
            icon="svg-spinners:90-ring-with-bg"
          />
        </div>
      </DefaultLayout>
    );
  if (isError || !project)
    return (
      <DefaultLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="bg-glass rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-xl font-bold mb-2">Project not found</h2>
            <button
              className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-white"
              onClick={() => navigate("/projects")}
            >
              Back to Projects
            </button>
          </div>
        </div>
      </DefaultLayout>
    );

  /* ---------- Render ---------- */
  return (
    <DefaultLayout>
      <div className="relative min-h-screen bg-background">
        {/* Main */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-[padding] duration-300 ${
            isChatOpen ? "lg:pr-[25rem]" : ""
          }`}
        >
          <div className="mx-auto max-w-5xl space-y-10">
            {/* Header */}
            <header className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {categoryName && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {categoryName}
                      </span>
                    )}
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
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                    {project.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {canEdit && (
                    <button
                      className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                    >
                      <Icon icon="mdi:pencil" />
                      Edit
                    </button>
                  )}
                  {currentUser && (
                    <button
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                        ${
                          isSaved
                            ? "bg-cyan-500 text-white hover:bg-cyan-600"
                            : "border border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/30"
                        }`}
                      onClick={handleSave}
                    >
                      <Icon
                        icon={isSaved ? "mdi:bookmark" : "mdi:bookmark-outline"}
                      />
                      {isSaved ? "Unsave" : "Save"}
                    </button>
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
                <p className="text-lg text-muted-foreground border-l-4 border-cyan-500 pl-4">
                  {project.description}
                </p>
              )}
            </header>

            {/* Details card */}
            <section className="bg-glass rounded-2xl py-6 px-10 shadow-lg">
              <h2 className="text-2xl font-bold mb-3">Core Details</h2>
              <hr />
              <div className="grid md:grid-cols-2 mt-3 gap-x-8 gap-y-6">
                <div className="space-y-6">
                  {project.objectives && (
                    <DetailBlock icon="mdi:target" title="Objectives">
                      <p className="text-[16px]">{project.objectives}</p>
                    </DetailBlock>
                  )}
                  {project.benefits && (
                    <DetailBlock icon="mdi:trophy-variant" title="Benefits">
                      <p className="text-[16px]">{project.benefits}</p>
                    </DetailBlock>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                        <Icon
                          className="text-cyan-500"
                          icon="mdi:tag-multiple"
                        />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((t, index) => (
                          <span
                            key={index}
                            className="rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {project.approvalStatus && (
                    <DetailBlock icon="mdi:check-decagram" title="Approval">
                      <div className="space-y-1">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold
                            ${
                              project.approvalStatus === "APPROVED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : project.approvalStatus === "REJECTED"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }`}
                        >
                          {project.approvalStatus}
                        </span>
                        {project.supervisorName && (
                          <p className="text-[16px]">
                            Supervisor: {project.supervisorName}
                          </p>
                        )}
                        {project.approvedAt && (
                          <p className="text-[16px]">
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
                    <DetailBlock icon="mdi:github" title="Source">
                      <a
                        className="inline-flex items-center gap-1 text-cyan-500 hover:underline text-[16px]"
                        href={project.githubLink}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View on GitHub
                      </a>
                    </DetailBlock>
                  )}

                  {project.projectFiles && project.projectFiles.length > 0 && (
                    <DetailBlock icon="mdi:file-download" title="Files">
                      <ul className="space-y-1">
                        {project.projectFiles.map((url, i) => (
                          <li key={i}>
                            <a
                              className="text-cyan-500 hover:underline text-[16px]"
                              href={url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              Download file {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </DetailBlock>
                  )}

                  {members.length > 0 && (
                    <DetailBlock icon="mdi:account-group" title="Team">
                      <ul className="space-y-1 text-[16px]">
                        {members.map((m) => (
                          <li key={m.name}>
                            {m.name}
                            {m.rollNumber && (
                              <span className="ml-2 text-sm text-muted-foreground text-[16px]">
                                ({m.rollNumber})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </DetailBlock>
                  )}
                </div>
              </div>
            </section>

            {/* Report card */}
            <section className="bg-glass rounded-2xl py-6 shadow-lg px-10">
              <h2 className="text-2xl font-bold mb-3">Detailed Report</h2>
              <hr />
              <div
                dangerouslySetInnerHTML={{ __html: project.body || "" }}
                className="ql-editor mt-3 prose dark:prose-invert max-w-none text-lg"
              />
            </section>

            {/* Comments */}
            {currentUser && (
              <CommentSection
                currentUserId={currentUser.id}
                projectId={project.id}
              />
            )}
          </div>
        </main>

        {/* Chat drawer */}
        {!isChatOpen && (
          <button
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-xl transition-transform hover:scale-110"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon className="h-6 w-6" icon="mdi:chat" />
          </button>
        )}
        <aside
          className={`fixed right-0 top-0 z-40 h-full w-full border-l bg-glass shadow-2xl backdrop-blur-md lg:w-96
            transition-transform duration-300
            ${isChatOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <ChatApp
            projectContent={
              project.title + project.excerpt + project.objectives
            }
            onClose={() => setIsChatOpen(false)}
          />
        </aside>
      </div>
    </DefaultLayout>
  );
}
