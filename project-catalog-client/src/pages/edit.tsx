import React, { useState, useMemo, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/config/api";

// Member interface
interface Member {
  name: string;
  rollNumber: string;
}

interface ProjectRequestDTO {
  title: string;
  description: string;
  body: string;
  objectives: string;
  githubLink: string;
  coverImageUrl: string;
  academic_year: string;
  student_year: string;
  categoryId: string;
  status: string;
  projectFiles: File[];
  tags: string;
  membersJson: string;
  benefits: string;
}

const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    body: string;
    approvalStatus: string;
    benefits: string;
    githubLink: string;
  }>({
    title: "",
    description: "",
    body: "",
    approvalStatus: "",
    benefits: "",
    githubLink: "",
  });

  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // Load existing project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const project = res.data;

        // Set only the editable fields
        setFormData({
          title: project.title || "",
          description: project.description || "",
          body: project.body || "",
          approvalStatus: "PENDING",
          benefits: project.benefits || "",
          githubLink: project.githubLink || "",
        });
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectFiles(Array.from(e.target.files));
    }
  };

  // Submit (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const formDataToSubmit = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSubmit.append(
        key,
        String(formData[key as keyof typeof formData])
      );
    });

    projectFiles.forEach((file) => {
      formDataToSubmit.append("projectFiles", file);
    });

    try {
      const res = await api.put(`/projects/${id}`, formDataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        setSubmitMessage("Project updated successfully!");
        navigate(`/projects/${id}`);
      } else {
        setSubmitMessage(`Failed: ${res.statusText}`);
      }
    } catch (error: any) {
      setSubmitMessage(
        error.response?.data || "Failed to update project. Try again."
      );
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill toolbar
  const modules = useMemo(
    () => ({
      toolbar: [
        { header: "1" },
        { header: "2" },
        { header: "3" },
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        { list: "ordered" },
        { list: "bullet" },
        { script: "sub" },
        { script: "super" },
        { indent: "-1" },
        { indent: "+1" },
        { direction: "rtl" },
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
        "link",
        "image",
        "video",
        "clean",
      ],
    }),
    []
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col min-h-screen bg-background">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl">
                  <Spinner size="lg" className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Loading Project</h2>
                  <p className="text-default-600">Please wait while we fetch your project details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <style>{`
        /* Custom styles for ReactQuill */
       .ql-snow.ql-toolbar,
        .ql-snow .ql-toolbar {
          border: none;
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: white;
        }
        .dark .ql-snow.ql-toolbar,
        .dark .ql-snow .ql-toolbar {
          background-color : rgb(30, 41, 59 );
        }

        .dark .ql-toolbar .ql-stroke {
        stroke: white;
    }
        .dark .ql-toolbar .ql-fill{
          fill : white;
        }

        .dark .ql-toolbar .ql-picker {
          color : white;
        }

        .dark .ql-picker-options{
        background-color : rgb(30, 41, 59);
        }
        .ql-container.ql-snow {
          border: none;
          font-size: 16px;
          font-family: "Geist", sans-serif;

        }
        .ql-editor {
          font-family: "Geist", sans-serif;
          -ms-overflow-style: none;
          scrollbar-width: none;
          }
        .ql-container {
          border-radius: 0.5rem;
        }
      `}</style>

      <div className={`flex flex-col min-h-screen bg-background  mx-auto
        ${showProjectInfo ? "" : "max-w-5xl"}
        `}>
        <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Enhanced Header Section */}
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-500/30 dark:to-red-500/30 rounded-2xl">
                <Icon className="h-12 w-12 text-orange-500" icon="mdi:pencil-circle" />
              </div>
            </div>
            <div className="flex justify-center items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-4">
                  Edit Project
                </h1>
                <p className="text-lg text-default-600 max-w-2xl mx-auto">
                  Refine your project details and enhance your documentation
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
          <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectInfo(!showProjectInfo)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
              >
                <Icon 
                  icon={showProjectInfo ? "mdi:eye-off" : "mdi:eye"} 
                  className="mr-2" 
                />
                {showProjectInfo ? "Hide" : "Show"} Project Information Column
          </Button>
          </div>
          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
          
            <div className={`grid gap-8 ${showProjectInfo ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {/* Left Column - General Info */}
              {showProjectInfo && (
                <div className="space-y-6 lg:col-span-1">
                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon icon="mdi:information-outline" className="text-xl text-orange-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Project Information</CardTitle>
                          <CardDescription>
                            Update your project's core details
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="font-medium">Project Title *</Label>
                        <Input
                          required
                          id="title"
                          name="title"
                          placeholder="e.g., AI-Powered Chatbot"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="font-medium">Short Description *</Label>
                        <Textarea
                          required
                          id="description"
                          name="description"
                          placeholder="Brief summary of your project"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20 min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="benefits" className="font-medium">Benefits (Optional)</Label>
                        <Textarea
                          id="benefits"
                          name="benefits"
                          placeholder="How will this project benefit users or the community?"
                          value={formData.benefits}
                          onChange={handleInputChange}
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20 min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="githubLink" className="font-medium">GitHub Repository (Optional)</Label>
                        <Input
                          id="githubLink"
                          name="githubLink"
                          placeholder="https://github.com/username/project"
                          value={formData.githubLink}
                          onChange={handleInputChange}
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon icon="mdi:file-upload" className="text-xl text-orange-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Project Files</CardTitle>
                          <CardDescription>
                            Upload additional files or replace existing ones
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Input
                          multiple
                          id="projectFiles"
                          name="projectFiles"
                          type="file"
                          onChange={handleFileChange}
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                        <p className="text-xs text-default-600">
                          Supported formats: PDF, DOC, PPT, Images, and more
                        </p>
                        {projectFiles.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Selected Files ({projectFiles.length})</Label>
                            <div className="space-y-1">
                              {projectFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-default-600 bg-background/50 p-2 rounded">
                                  <Icon icon="mdi:file-document-outline" className="text-orange-500" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-xs text-default-600">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Right Column - Project Body Editor */}
              <div className={`${showProjectInfo ? 'lg:col-span-2' : 'w-full'}`}>
                <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Icon icon="mdi:file-document-edit-outline" className="text-xl text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Project Documentation</CardTitle>
                        <CardDescription>
                          Edit your comprehensive project report
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/50 dark:to-red-950/50 p-4 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon icon="mdi:lightbulb-on" className="text-orange-500" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Editing Tips</span>
                        </div>
                        <ul className="text-sm text-default-600 space-y-1">
                          <li>• Focus on recent changes and improvements</li>
                          <li>• Update results and findings</li>
                          <li>• Add new code snippets or diagrams</li>
                          <li>• Include any lessons learned</li>
                        </ul>
                      </div>

                      <div className="h-[600px] p-6 border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
                        <ReactQuill
                          key="quill-editor"
                          className="h-full"
                          modules={modules}
                          placeholder="Update your project report here... Include recent changes, new findings, and improvements..."
                          theme="snow"
                          value={formData.body}
                          onChange={handleQuillChange}
                        />
                      </div>

                      <div className="text-sm text-default-600 bg-background/50 p-3 rounded-lg border border-border/50">
                        <Icon icon="mdi:information-outline" className="inline mr-1" />
                        Your changes will be saved and the project will be updated immediately.
                      </div>

                      {/* Update Button - Moved under editor */}
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/10 dark:to-red-500/10 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/50 mt-6">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Update Your Project?</h3>
                            <p className="text-default-600 text-sm">Review your changes and save your updates</p>
                          </div>
                          <div className="flex gap-3">
                            {submitMessage && (
                              <Badge 
                                className={`px-4 py-2 ${
                                  submitMessage.includes("successfully") 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                }`}
                              >
                                {submitMessage}
                              </Badge>
                            )}
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={isSubmitting}
                              type="submit"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner size="sm" className="mr-2" />
                                  Updating Project...
                                </>
                              ) : (
                                <>
                                  <Icon className="mr-2" icon="mdi:content-save" />
                                  Update Project
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>

        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditProjectPage;