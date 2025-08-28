// src/pages/profile/index.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Camera, X, Check, Edit3, User, Mail, FileText } from "lucide-react";

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

// --- Change Password Form Component ---
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<Omit<UserProfile, "id">>({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast("Error", {
        description: "Please select an image file.",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast("Error", {
        description: "Image size must be less than 2MB.",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await api.post("/users/upload-avatar", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.url;
      setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
      toast("Success", {
        description: "Avatar uploaded successfully!",
      });
    } catch (error: any) {
      toast("Error", {
        description: error.response?.data?.error || "Failed to upload avatar.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    toast("Avatar Removed", {
      description: "Avatar has been removed from your profile.",
    });
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
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl animate-pulse">
              <User className="h-12 w-12 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Loading Profile
              </h2>
              <p className="text-default-600">
                Please wait while we fetch your profile details...
              </p>
            </div>
          </div>
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
        <div className="w-full max-w-4xl">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-10">
            <div className="flex justify-center mb-6"></div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                My Profile
              </h1>
              <p className="text-lg text-default-600 max-w-2xl mx-auto">
                Manage your profile information and settings
              </p>
            </div>
          </div>

          {/* Main Profile Card */}
          <Card className="mb-8 bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <User className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Profile Information</CardTitle>
              </div>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 dark:text-red-400 font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 lg:w-48">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 ring-4 ring-purple-500/20 ring-offset-4 ring-offset-background">
                      {formData.avatarUrl ? (
                        <AvatarImage
                          className="object-cover"
                          alt={formData.name}
                          src={formData.avatarUrl}
                        />
                      ) : (
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400">
                          {formData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {editing && (
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="bg-white/90 hover:bg-white text-gray-900"
                        >
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {editing && formData.avatarUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveAvatar}
                      className="text-red-600 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove Avatar
                    </Button>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-default-600">
                      Click the avatar to upload a new image
                    </p>
                    <p className="text-xs text-default-500 mt-1">
                      Max 2MB • JPG, PNG, GIF
                    </p>
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6">
                  {editing ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="font-medium flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="font-medium flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            disabled
                            value={formData.email}
                            onChange={handleInputChange}
                            className="border-purple-200 dark:border-purple-800 bg-gray-50 dark:bg-gray-800"
                          />
                          <p className="text-xs text-default-500">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="font-medium flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Bio (Optional)
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          placeholder="Tell us about yourself..."
                          value={formData.bio || ""}
                          onChange={handleInputChange}
                          className="border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20 min-h-[100px]"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditing(false)}
                          className="border-purple-500/20 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          disabled={updating}
                          type="submit"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-default-600">
                            Full Name
                          </Label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <User className="h-4 w-4 text-default-500" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-default-600">
                            Email Address
                          </Label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Mail className="h-4 w-4 text-default-500" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>

                      {user.bio && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-default-600">
                            Bio
                          </Label>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm">{user.bio}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          {user.id && (
            <Card className="mb-8 bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Icon
                      icon="mdi:lock-outline"
                      className="h-5 w-5 text-orange-500"
                    />
                  </div>
                  <CardTitle className="text-xl">Security Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <ChangePasswordForm userId={user.id} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Section */}
          <Card className="bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Icon
                    icon="mdi:folder-multiple-outline"
                    className="h-5 w-5 text-blue-500"
                  />
                </div>
                <CardTitle className="text-xl">My Projects</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                    <p className="text-default-600">Loading your projects...</p>
                  </div>
                </div>
              ) : userProjects && userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full w-fit mx-auto mb-4">
                    <Icon
                      icon="mdi:folder-outline"
                      className="h-8 w-8 text-blue-500"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                  <p className="text-default-600 mb-4">
                    You haven't created any projects yet.
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <a href="/create">Create Your First Project</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
