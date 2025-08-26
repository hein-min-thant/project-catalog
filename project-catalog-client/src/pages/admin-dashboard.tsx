import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/config/api";
import { Project, User } from "@/types";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] =
    useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Fetch current user to check role
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

  console.table(currentUser);
  // Fetch all users
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");

      return data;
    },
    enabled: currentUser?.role === "ADMIN",
  });

  // Fetch all projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery({
    queryKey: ["adminProjects"],
    queryFn: async () => {
      const { data } = await api.get("/admin/projects");

      return data;
    },
    enabled: currentUser?.role === "ADMIN",
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(null);
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      setIsDeleteProjectDialogOpen(false);
      setSelectedProject(null);
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.put(`/admin/users/${userId}/role?role=${role}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
    },
  });

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteProjectDialogOpen(true);
  };

  const handleUpdateRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role || "");
    setIsRoleDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const confirmDeleteProject = () => {
    if (selectedProject) {
      deleteProjectMutation.mutate(selectedProject.id);
    }
  };

  const confirmUpdateRole = () => {
    if (selectedUser && selectedRole) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: selectedRole,
      });
    }
  };

  // Check if user has admin role
  const canAccess = currentUser?.role === "ADMIN";

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
                  You don&apos;t have permission to access the admin dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    // AdminDashboardPage.tsx  (replace only the JSX markup)
    // ...imports & logic remain exactly the same
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-cyan-500">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, projects, and roles
          </p>
        </header>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full max-w-md mx-auto lg:mx-0 grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6" value="users">
            <Card className="bg-card/60 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : usersError ? (
                  <p className="text-red-500 text-center">
                    Failed to load users.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {usersData?.content?.map((user: User) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-background/50 border-border"
                      >
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <Badge className="mt-1" variant="default">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(user)}
                          >
                            <Icon
                              className="w-4 h-4 mr-1"
                              icon="mdi:account-cog"
                            />
                            Role
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Icon className="w-4 h-4 mr-1" icon="mdi:delete" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-6" value="projects">
            <Card className="bg-card/60 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage all projects</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : projectsError ? (
                  <p className="text-red-500 text-center">
                    Failed to load projects.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {projectsData?.content?.map((project: Project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-background/50 border-border"
                      >
                        <div>
                          <p className="font-semibold">{project.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <Badge className="mt-1" variant="outline">
                            {project.approvalStatus}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProject(project)}
                        >
                          <Icon className="w-4 h-4 mr-1" icon="mdi:delete" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs (unchanged) */}
        <Dialog
          open={isDeleteUserDialogOpen}
          onOpenChange={setIsDeleteUserDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedUser?.name}
                &quot;?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={deleteUserMutation.isPending}
                variant="destructive"
                onClick={confirmDeleteUser}
              >
                {deleteUserMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isDeleteProjectDialogOpen}
          onOpenChange={setIsDeleteProjectDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedProject?.title}
                &quot;?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={deleteProjectMutation.isPending}
                variant="destructive"
                onClick={confirmDeleteProject}
              >
                {deleteProjectMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Role</DialogTitle>
              <DialogDescription>
                Choose a new role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRoleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedRole || updateRoleMutation.isPending}
                onClick={confirmUpdateRole}
              >
                {updateRoleMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
}
