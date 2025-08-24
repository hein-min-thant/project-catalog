import React, { useState } from "react";
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
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Icon
                  className="w-16 h-16 mx-auto text-red-500 mb-4"
                  icon="mdi:alert-circle"
                />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400">
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
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve pending projects
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Icon
                  className="w-16 h-16 mx-auto text-red-500 mb-4"
                  icon="mdi:alert-circle"
                />
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load pending projects.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : pendingProjects?.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Icon
                  className="w-16 h-16 mx-auto text-green-500 mb-4"
                  icon="mdi:check-circle"
                />
                <h2 className="text-2xl font-bold mb-2">No Pending Projects</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  All projects have been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProjects?.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col dark:bg-zinc-900 dark:border-zinc-700"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending Approval</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Academic Year
                        </p>
                        <p>{project.academic_year}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Student Year
                        </p>
                        <p>{project.student_year}</p>
                      </div>
                    </div>

                    {project.objectives && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Objectives
                        </p>
                        <p className="text-sm">{project.objectives}</p>
                      </div>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="mt-4 mb-4" />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="flex-1"
                      disabled={approveMutation.isPending}
                      onClick={() => handleApprove(project)}
                    >
                      {approveMutation.isPending ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Icon className="w-4 h-4 mr-2" icon="mdi:check" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                      onClick={() => handleReject(project)}
                    >
                      {rejectMutation.isPending ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Icon className="w-4 h-4 mr-2" icon="mdi:close" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={rejectMutation.isPending}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Icon className="w-4 h-4 mr-2" icon="mdi:arrow-right" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rejection Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Project</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting &quot;
                {selectedProject?.title}
                &quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <DialogFooter>
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
                  <Spinner size="sm" />
                ) : (
                  "Reject Project"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
}
