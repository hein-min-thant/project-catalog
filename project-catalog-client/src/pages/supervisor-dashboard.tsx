import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import api from "@/config/api";
import { Project, ProjectApprovalRequest } from "@/types";

export default function SupervisorDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch pending projects for the current supervisor
  const {
    data: pendingProjects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pendingProjects"],
    queryFn: async () => {
      const { data } = await api.get("/supervisor/projects/pending");

      return data as Project[];
    },
  });

  // Fetch current user to check role
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

  // Approve project mutation
  const approveMutation = useMutation({
    mutationFn: (projectId: number) =>
      api.post(`/supervisor/projects/${projectId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProjects"] });
    },
  });

  // Reject project mutation
  const rejectMutation = useMutation({
    mutationFn: ({
      projectId,
      reason,
    }: {
      projectId: number;
      reason: string;
    }) =>
      api.post(`/supervisor/projects/${projectId}/reject`, {
        reason,
        action: "reject",
      } as ProjectApprovalRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProjects"] });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProject(null);
    },
  });

  const handleApprove = (project: Project) => {
    approveMutation.mutate(project.id);
  };

  const handleReject = (project: Project) => {
    setSelectedProject(project);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedProject && rejectionReason.trim()) {
      rejectMutation.mutate({
        projectId: selectedProject.id,
        reason: rejectionReason.trim(),
      });
    }
  };

  const navigate = useNavigate();

  // Check if user has supervisor or admin role
  const canAccess =
    currentUser?.role === "SUPERVISOR" || currentUser?.role === "ADMIN";

  if (!canAccess) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-4 md:p-8">
          <Card className="bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <Icon
                    className="w-8 h-8 text-red-500"
                    icon="mdi:alert-circle"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
                  Access Denied
                </h2>
                <p className="text-red-600/80 dark:text-red-300/80">
                  You don&apos;t have permission to access the supervisor
                  dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6"></div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Supervisor Dashboard
            </h1>
            <p className="text-lg text-default-600 max-w-2xl mx-auto">
              Review and approve pending student projects with AI-powered
              insights
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-200/50 dark:border-yellow-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {pendingProjects?.length || 0}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Pending Reviews
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {approveMutation.isSuccess ? "✓" : "—"}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Recently Approved
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-200/50 dark:border-red-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {rejectMutation.isSuccess ? "✗" : "—"}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Recently Rejected
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Loading Projects...
              </h3>
              <p className="text-default-600">
                Fetching pending projects for review
              </p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <Icon
                  className="w-8 h-8 text-red-500"
                  icon="mdi:alert-circle"
                />
              </div>
              <h3 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Projects
              </h3>
              <p className="text-red-600/80 dark:text-red-300/80 mb-6">
                Failed to load pending projects. Please try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : pendingProjects?.length === 0 ? (
          <Card className="bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50 border-green-200/50 dark:border-green-800/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Icon
                  className="w-8 h-8 text-green-500"
                  icon="mdi:check-circle"
                />
              </div>
              <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-2">
                All Caught Up!
              </h3>
              <p className="text-green-600/80 dark:text-green-300/80">
                No pending projects to review at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="text-center">
              <p className="text-default-600">
                Showing{" "}
                <span className="font-semibold text-cyan-600">
                  {pendingProjects?.length}
                </span>{" "}
                pending project{(pendingProjects?.length || 0) !== 1 ? "s" : ""}{" "}
                for review
              </p>
            </div>

            {/* Enhanced Project Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingProjects?.map((project) => (
                <Card
                  key={project.id}
                  className="group bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 shadow-lg border-border/50 hover:border-cyan-300/50 dark:hover:border-cyan-600/50 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            Pending Review
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardDescription className="text-base leading-relaxed line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Project Details Grid */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-default-600 font-medium">
                          Academic Year
                        </div>
                        <div className="font-semibold text-sm">
                          {project.academic_year}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-default-600 font-medium">
                          Student Year
                        </div>
                        <div className="font-semibold text-sm">
                          {project.student_year}
                        </div>
                      </div>
                    </div>

                    {/* Objectives Section */}
                    {project.objectives && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:target"
                            className="text-cyan-500 text-sm"
                          />
                          <span className="text-sm font-medium text-default-600">
                            Objectives
                          </span>
                        </div>
                        <p className="text-sm text-default-600 leading-relaxed pl-5 border-l-2 border-cyan-200 dark:border-cyan-800">
                          {project.objectives}
                        </p>
                      </div>
                    )}

                    {/* Technologies Section */}
                    {project.tags?.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:code-tags"
                            className="text-cyan-500 text-sm"
                          />
                          <span className="text-sm font-medium text-default-600">
                            Technologies
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-5">
                          {project.tags.slice(0, 4).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs py-0 px-2"
                            >
                              {String(tag)}
                            </Badge>
                          ))}
                          {project.tags.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs py-0 px-2"
                            >
                              +{project.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
                        disabled={approveMutation.isPending}
                        onClick={() => handleApprove(project)}
                      >
                        {approveMutation.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Icon className="w-4 h-4 mr-1" icon="mdi:check" />
                            Approve
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        className="transition-all duration-300"
                        disabled={rejectMutation.isPending}
                        onClick={() => handleReject(project)}
                      >
                        {rejectMutation.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Icon className="w-4 h-4 mr-1" icon="mdi:close" />
                            Reject
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-all duration-300"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <Icon className="w-4 h-4 mr-1" icon="mdi:eye" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Rejection Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-red-500 text-lg"
                  />
                </div>
                <DialogTitle className="text-red-600 dark:text-red-400">
                  Reject Project
                </DialogTitle>
              </div>
              <DialogDescription>
                Please provide a reason for rejecting{" "}
                <span className="font-semibold">
                  "{selectedProject?.title}"
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Enter detailed rejection reason..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20"
              />
              <div className="text-xs text-default-600 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <strong>Tip:</strong> Provide constructive feedback to help the
                student improve their project.
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                variant="destructive"
                onClick={handleRejectConfirm}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:close" className="mr-1" />
                    Reject Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
}
