/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
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

  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all");

  // Fetch current user to check role
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

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

  // Filtered and searched data
  const filteredUsers = useMemo(() => {
    if (!usersData?.content) return [];

    return usersData.content.filter((user: User) => {
      const matchesSearch =
        userSearch === "" ||
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase());

      const matchesRole =
        userRoleFilter === "all" || user.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersData, userSearch, userRoleFilter]);

  const filteredProjects = useMemo(() => {
    if (!projectsData?.content) return [];

    return projectsData.content.filter((project: Project) => {
      const matchesSearch =
        projectSearch === "" ||
        project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(projectSearch.toLowerCase());

      const matchesStatus =
        projectStatusFilter === "all" ||
        project.approvalStatus === projectStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projectsData, projectSearch, projectStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const users = usersData?.content || [];
    const projects = projectsData?.content || [];

    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      approvedProjects: projects.filter(
        (p: Project) => p.approvalStatus === "APPROVED"
      ).length,
      pendingProjects: projects.filter(
        (p: Project) => p.approvalStatus === "PENDING"
      ).length,
      adminUsers: users.filter((u: User) => u.role === "ADMIN").length,
      supervisorUsers: users.filter((u: User) => u.role === "SUPERVISOR")
        .length,
      regularUsers: users.filter((u: User) => u.role === "USER").length,
    };
  }, [usersData, projectsData]);

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
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-default-600 max-w-2xl mx-auto">
              Comprehensive management system for users, projects, and system
              administration
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50 dark:border-blue-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Total Users
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.adminUsers}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Admins
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stats.supervisorUsers}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Supervisors
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 border-gray-200/50 dark:border-gray-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                  {stats.regularUsers}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Users
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50 border-orange-200/50 dark:border-orange-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {stats.totalProjects}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Projects
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.approvedProjects}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Approved
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-200/50 dark:border-yellow-800/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats.pendingProjects}
                </div>
                <div className="text-sm text-default-600 font-medium">
                  Pending
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs className="space-y-6" defaultValue="users">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger className="flex items-center gap-2" value="users">
              <Icon className="w-4 h-4" icon="mdi:account-group" />
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="projects">
              <Icon className="w-4 h-4" icon="mdi:folder-multiple" />
              Projects ({stats.totalProjects})
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="analytics">
              <Icon className="w-4 h-4" icon="mdi:chart-bar" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent className="space-y-6" value="users">
            <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icon
                      className="text-xl text-cyan-500"
                      icon="mdi:account-group"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">User Management</CardTitle>
                    <CardDescription>
                      Manage user accounts, roles, and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon
                        className="text-cyan-500 text-sm"
                        icon="mdi:magnify"
                      />
                      Search Users
                    </label>
                    <Input
                      className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon
                        className="text-cyan-500 text-sm"
                        icon="mdi:filter-variant"
                      />
                      Filter by Role
                    </label>
                    <Select
                      value={userRoleFilter}
                      onValueChange={setUserRoleFilter}
                    >
                      <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="USER">Users</SelectItem>
                        <SelectItem value="SUPERVISOR">Supervisors</SelectItem>
                        <SelectItem value="ADMIN">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-default-600 mb-4">
                  Showing {filteredUsers.length} of {stats.totalUsers} users
                </div>

                {/* Users List */}
                {usersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Loading Users...
                      </h3>
                      <p className="text-default-600">
                        Please wait while we fetch user data
                      </p>
                    </div>
                  </div>
                ) : usersError ? (
                  <Card className="bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <Icon
                          className="w-8 h-8 text-red-500"
                          icon="mdi:alert-circle"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                        Error Loading Users
                      </h3>
                      <p className="text-red-600/80 dark:text-red-300/80 mb-4">
                        Failed to load user data. Please try again.
                      </p>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredUsers.length === 0 ? (
                  <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Icon
                          className="w-8 h-8 text-gray-400 dark:text-gray-500"
                          icon="mdi:account-search"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {userSearch || userRoleFilter !== "all"
                          ? "No matching users"
                          : "No users found"}
                      </h3>
                      <p className="text-default-600 mb-6 max-w-md mx-auto">
                        {userSearch || userRoleFilter !== "all"
                          ? `No users found matching your search criteria. Try adjusting your filters.`
                          : "There are currently no users in the system."}
                      </p>
                      {(userSearch || userRoleFilter !== "all") && (
                        <Button
                          className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                          variant="outline"
                          onClick={() => {
                            setUserSearch("");
                            setUserRoleFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((user: User) => (
                      <Card
                        key={user.id}
                        className="group bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                <Icon
                                  className="text-white text-lg"
                                  icon="mdi:account"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {user.name}
                                </h3>
                                <p className="text-default-600 text-sm">
                                  {user.email}
                                </p>
                                <Badge
                                  className={`mt-1 ${
                                    user.role === "ADMIN"
                                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                                      : user.role === "SUPERVISOR"
                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                                  }`}
                                >
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
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
                                className="hover:scale-105 transition-transform"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Icon
                                  className="w-4 h-4 mr-1"
                                  icon="mdi:delete"
                                />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent className="space-y-6" value="projects">
            <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icon
                      className="text-xl text-cyan-500"
                      icon="mdi:folder-multiple"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Project Management
                    </CardTitle>
                    <CardDescription>
                      Manage all projects in the system
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon
                        className="text-cyan-500 text-sm"
                        icon="mdi:magnify"
                      />
                      Search Projects
                    </label>
                    <Input
                      className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                      placeholder="Search by title or description..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon
                        className="text-cyan-500 text-sm"
                        icon="mdi:filter-variant"
                      />
                      Filter by Status
                    </label>
                    <Select
                      value={projectStatusFilter}
                      onValueChange={setProjectStatusFilter}
                    >
                      <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-default-600 mb-4">
                  Showing {filteredProjects.length} of {stats.totalProjects}{" "}
                  projects
                </div>

                {/* Projects List */}
                {projectsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Loading Projects...
                      </h3>
                      <p className="text-default-600">
                        Please wait while we fetch project data
                      </p>
                    </div>
                  </div>
                ) : projectsError ? (
                  <Card className="bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <Icon
                          className="w-8 h-8 text-red-500"
                          icon="mdi:alert-circle"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                        Error Loading Projects
                      </h3>
                      <p className="text-red-600/80 dark:text-red-300/80 mb-4">
                        Failed to load project data. Please try again.
                      </p>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredProjects.length === 0 ? (
                  <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Icon
                          className="w-8 h-8 text-gray-400 dark:text-gray-500"
                          icon="mdi:folder-search"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {projectSearch || projectStatusFilter !== "all"
                          ? "No matching projects"
                          : "No projects found"}
                      </h3>
                      <p className="text-default-600 mb-6 max-w-md mx-auto">
                        {projectSearch || projectStatusFilter !== "all"
                          ? `No projects found matching your search criteria. Try adjusting your filters.`
                          : "There are currently no projects in the system."}
                      </p>
                      {(projectSearch || projectStatusFilter !== "all") && (
                        <Button
                          className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                          variant="outline"
                          onClick={() => {
                            setProjectSearch("");
                            setProjectStatusFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project: Project) => (
                      <Card
                        key={project.id}
                        className="group bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <Icon
                                className="text-white text-lg"
                                icon="mdi:folder"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                                    {project.title}
                                  </h3>
                                  <Badge
                                    className={`mt-1 ${
                                      project.approvalStatus === "APPROVED"
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : project.approvalStatus === "REJECTED"
                                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                    }`}
                                  >
                                    {project.approvalStatus}
                                  </Badge>
                                </div>
                                <Button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteProject(project)}
                                >
                                  <Icon
                                    className="w-4 h-4 mr-1"
                                    icon="mdi:delete"
                                  />
                                  Delete
                                </Button>
                              </div>

                              <p className="text-default-600 text-sm line-clamp-2 mb-2">
                                {project.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-default-600">
                                <span>Created by: {project.userId}</span>
                                <span>•</span>
                                <span>ID: {project.id}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent className="space-y-6" value="analytics">
            <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icon
                      className="text-xl text-cyan-500"
                      icon="mdi:chart-bar"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">System Analytics</CardTitle>
                    <CardDescription>
                      Overview of system usage and performance metrics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                    <Icon
                      className="w-8 h-8 text-cyan-500"
                      icon="mdi:chart-line"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-default-600">
                    Advanced analytics and reporting features are currently in
                    development.
                  </p>
                </div>
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
