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
    <DefaultLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, projects, and system settings
          </p>
        </div>

        <Tabs className="space-y-6" defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent className="space-y-6" value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner size="lg" />
                  </div>
                ) : usersError ? (
                  <div className="text-center text-red-500">
                    Failed to load users.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData?.content?.map((user: User) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            <Badge variant="outline">{user.role}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(user)}
                          >
                            <Icon
                              className="w-4 h-4 mr-2"
                              icon="mdi:account-cog"
                            />
                            Change Role
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Icon className="w-4 h-4 mr-2" icon="mdi:delete" />
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

          {/* Projects Tab */}
          <TabsContent className="space-y-6" value="projects">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  View and manage all projects in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner size="lg" />
                  </div>
                ) : projectsError ? (
                  <div className="text-center text-red-500">
                    Failed to load projects.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectsData?.content?.map((project: Project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {project.approvalStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProject(project)}
                          >
                            <Icon className="w-4 h-4 mr-2" icon="mdi:delete" />
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

          {/* Role Management Tab */}
          <TabsContent className="space-y-6" value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Quick role assignment tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supervisors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">
                        Users with supervisor privileges
                      </p>
                      <Button className="w-full" variant="outline">
                        <Icon
                          className="w-4 h-4 mr-2"
                          icon="mdi:account-supervisor"
                        />
                        Manage Supervisors
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">
                        Users with admin privileges
                      </p>
                      <Button className="w-full" variant="outline">
                        <Icon className="w-4 h-4 mr-2" icon="mdi:account-key" />
                        Manage Admins
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Regular Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">
                        Standard user accounts
                      </p>
                      <Button className="w-full" variant="outline">
                        <Icon className="w-4 h-4 mr-2" icon="mdi:account" />
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete User Dialog */}
        <Dialog
          open={isDeleteUserDialogOpen}
          onOpenChange={setIsDeleteUserDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedUser?.name}
                &quot;? This action cannot be undone.
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
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog
          open={isDeleteProjectDialogOpen}
          onOpenChange={setIsDeleteProjectDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedProject?.title}
                &quot;? This action cannot be undone.
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
                  "Delete Project"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for &quot;{selectedUser?.name}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  "Update Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
}
