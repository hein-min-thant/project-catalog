// src/pages/profile/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Project } from "./projects";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import api from "@/config/api";
import ProjectCard from "@/components/ProjectCard";
interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

interface ProjectResponseDTO {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  coverImageUrl?: string;
}

// --- Change Password Form Component ---
// You can move this into its own file (e.g., src/components/ChangePasswordForm.tsx)
interface ChangePasswordFormProps {
  userId: number;
}

const ChangePasswordForm = ({ userId }: ChangePasswordFormProps) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Error", {
        description: "New passwords do not match.",
      });

      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/users/${userId}/change-password`, {
        oldPassword,
        newPassword,
      });
      toast("Success", {
        description: "Password changed successfully!",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast("Error", {
        description:
          error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleChangePassword}>
      <div className="space-y-2">
        <Label htmlFor="old-password">Old Password</Label>
        <Input
          required
          id="old-password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          required
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          required
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <Button disabled={isLoading} type="submit">
        {isLoading ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
};
// --- End of Change Password Form Component ---

export default function ProfilePage() {
  const { data: currentUser } = useQuery<UserProfile>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");

      return data;
    },
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<UserProfile, "id">>({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        avatarUrl: currentUser.avatarUrl || "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      if (!user?.id) return;

      const updateData: Partial<UserProfile> = {};

      if (formData.name !== user.name) {
        updateData.name = formData.name;
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      if (formData.bio !== user.bio) {
        updateData.bio = formData.bio;
      }
      if (formData.avatarUrl !== user.avatarUrl) {
        updateData.avatarUrl = formData.avatarUrl;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await api.put(`/users/${user.id}`, updateData);

        setUser(response.data);
        setEditing(false);
        toast("Profile Updated", {
          description: "Your profile has been successfully updated.",
        });
      } else {
        setEditing(false);
        toast("No Changes", {
          description: "No changes were made to the profile.",
        });
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while updating your profile"
      );
      toast("Update Failed", {
        description: error || "Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Fetch user-specific projects
  const { data: userProjects, isLoading: isProjectsLoading } = useQuery<
    Project[]
  >({
    queryKey: ["userProjects", user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/user/${user?.id}/projects`);

      return data;
    },
    enabled: !!user?.id,
  });

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-gray-500 animate-pulse">Loading profile...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div className="inline-block max-w-lg text-center justify-center">
            <h1 className={title()}>User not found</h1>
            <p className="mt-4">Please log in to view your profile.</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="container flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <h1 className={title()}>Profile</h1>

        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Information</CardTitle>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                {error}
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24">
                  {user.avatarUrl ? (
                    <AvatarImage alt={user.name} src={user.avatarUrl} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              {editing ? (
                <form className="flex-1 space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      disabled
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      name="avatarUrl"
                      value={formData.avatarUrl || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button disabled={updating} type="submit">
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Name
                    </h3>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Email
                    </h3>
                    <p>{user.email}</p>
                  </div>
                  {user.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Bio
                      </h3>
                      <p>{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {user.id && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm userId={user.id} />
            </CardContent>
          </Card>
        )}
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl mb-4 font-semibold">My Projects</h2>
          <div>
            {isProjectsLoading ? (
              <p className="text-center text-gray-500">Loading projects...</p>
            ) : userProjects && userProjects.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 xl:grid-cols-2 gap-6">
                  {userProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-700 dark:text-gray-400">
                No projects found.
              </p>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
