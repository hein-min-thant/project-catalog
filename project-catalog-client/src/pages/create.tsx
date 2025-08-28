import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
import { useSupervisors } from "@/hooks/useSupervisors";

// Define the shape of a member
interface Member {
  name: string;
  rollNumber: string;
}

// Define the shape of the form data to match the DTO
interface ProjectRequestDTO {
  title: string;
  description: string;
  body: string;
  benefits: string;
  objectives: string;
  githubLink: string;
  coverImageUrl: string;
  academic_year: string;
  student_year: string;
  categoryId: string;
  supervisorId?: string;
  projectFiles: File[];
  tags: string[];
  membersJson: string;
}

const CreateProjectPage = () => {
  const [formData, setFormData] = useState<
    Omit<ProjectRequestDTO, "membersJson" | "projectFiles"> & {
      members: Member[];
    }
  >({
    title: "",
    description: "",
    body: "",
    benefits: "",
    objectives: "",
    githubLink: "",
    coverImageUrl: "",
    academic_year: "",
    student_year: "",
    categoryId: "",
    supervisorId: "",
    tags: [],
    members: [{ name: "", rollNumber: "" }],
  });
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [showProjectInfo, setShowProjectInfo] = useState(true);
  const navigate = useNavigate();

  // Fetch supervisors for dropdown
  const { data: supervisors, isLoading: isLoadingSupervisors } =
    useSupervisors();

  // The provided data for the dropdowns
  const { academicYears, studentYears, categories } = useMemo(() => {
    const years = [];
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    for (let year = startYear; year <= currentYear; year++) {
      years.push({ key: `${year}-${year + 1}`, label: `${year}-${year + 1}` });
    }

    return {
      academicYears: years.reverse(),
      studentYears: [
        { key: "First Year", label: "First Year" },
        { key: "Second Year", label: "Second Year" },
        { key: "Third Year", label: "Third Year" },
        { key: "Fourth Year", label: "Fourth Year" },
        { key: "Final Year", label: "Final Year" },
        { key: "Master", label: "Master" },
      ],
      categories: [
        { key: "1", label: "Web Development" },
        { key: "2", label: "Mobile App" },
      ],
      statuses: [
        { key: "completed", label: "Completed" },
        { key: "in progress", label: "In Progress" },
      ],
    };
  }, []);

  // Handle changes for simple text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for Select components
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Quill editor content change
  const handleQuillChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  // Handle dynamic member inputs
  const handleMemberChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newMembers = [...formData.members];

    newMembers[index] = { ...newMembers[index], [name]: value };
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { name: "", rollNumber: "" }],
    }));
  };

  const handleRemoveMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectFiles(Array.from(e.target.files));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const formDataToSubmit = new FormData();

    // Append all string fields
    Object.keys(formData).forEach((key) => {
      if (key !== "members" && key !== "tags") {
        const value = formData[key as keyof typeof formData];

        if (value !== undefined && value !== null && value !== "") {
          formDataToSubmit.append(key, String(value));
        }
      }
    });

    // Filter out empty members before converting to JSON
    const validMembers = formData.members.filter(
      (member) => member.name || member.rollNumber
    );

    // Convert valid members array to a Map<String, String> format for the backend
    const membersMap = validMembers.reduce(
      (map, member) => {
        if (member.name) {
          map[member.name] = member.rollNumber || "";
        }

        return map;
      },
      {} as { [key: string]: string }
    );

    const membersJsonString = JSON.stringify(membersMap);

    // Only append membersJson if there are valid members to send
    if (validMembers.length > 0) {
      formDataToSubmit.append("membersJson", membersJsonString);
    }

    // Handle tags array
    if (formData.tags.length > 0) {
      formData.tags.forEach((tag) => {
        formDataToSubmit.append("tags", tag);
      });
    }

    // Append files
    projectFiles.forEach((file) => {
      formDataToSubmit.append("projectFiles", file);
    });

    try {
      const response = await api.post("/projects", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setSubmitMessage("Project created successfully!");
        const newProjectId = response.data.id;

        navigate(`/projects/${newProjectId}`);
      } else {
        setSubmitMessage(`Failed to create project: ${response.statusText}`);
      }
    } catch (error) {
      const err = error as any;

      if (err.response) {
        setSubmitMessage(`Failed to create project: ${err.response.data}`);
      } else if (err.request) {
        setSubmitMessage("Failed to create project: No response from server.");
      } else {
        setSubmitMessage(`An error occurred during submission: ${err.message}`);
      }
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        { header: "1" },
        { header: "2" },
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
      ],
    }),
    []
  );

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

      <div
        className={`flex flex-col min-h-screen mx-auto bg-background ${showProjectInfo ? "" : "max-w-5xl"}`}
      >
        <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Enhanced Header Section */}
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                  Create New Project
                </h1>
                <p className="text-lg text-default-600 max-w-2xl mx-auto">
                  Bring your innovative ideas to life by creating a
                  comprehensive project entry
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Button
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
              size="sm"
              variant="outline"
              onClick={() => setShowProjectInfo(!showProjectInfo)}
            >
              <Icon
                className="mr-2"
                icon={showProjectInfo ? "mdi:eye-off" : "mdi:eye"}
              />
              {showProjectInfo ? "Hide" : "Show"} General Information Column
            </Button>
          </div>

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div
              className={`grid gap-8 ${showProjectInfo ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {/* Left Column - General Info */}
              {showProjectInfo && (
                <div className="space-y-6 lg:col-span-1">
                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-cyan-500"
                            icon="mdi:information-outline"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            General Information
                          </CardTitle>
                          <CardDescription>
                            Basic project details and objectives
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="title">
                          Project Title *
                        </Label>
                        <Input
                          required
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="title"
                          name="title"
                          placeholder="e.g., AI-Powered Chatbot"
                          value={formData.title}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="description">
                          Short Description *
                        </Label>
                        <Textarea
                          required
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 min-h-[100px]"
                          id="description"
                          name="description"
                          placeholder="Brief summary of your project"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="objectives">
                          Objectives *
                        </Label>
                        <Textarea
                          required
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 min-h-[100px]"
                          id="objectives"
                          name="objectives"
                          placeholder="What does your project aim to achieve?"
                          value={formData.objectives}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="benefits">
                          Benefits (Optional)
                        </Label>
                        <Textarea
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 min-h-[80px]"
                          id="benefits"
                          name="benefits"
                          placeholder="How will this project benefit users or the community?"
                          value={formData.benefits}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="githubLink">
                          GitHub Repository (Optional)
                        </Label>
                        <Input
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="githubLink"
                          name="githubLink"
                          placeholder="https://github.com/username/project"
                          value={formData.githubLink}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-cyan-500"
                            icon="mdi:cog-outline"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Project Settings
                          </CardTitle>
                          <CardDescription>
                            Academic details and categorization
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="academic_year">
                          Academic Year *
                        </Label>
                        <Select
                          required
                          value={formData.academic_year}
                          onValueChange={(value) =>
                            handleSelectChange("academic_year", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {academicYears.map((year) => (
                              <SelectItem key={year.key} value={year.key}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="student_year">
                          Student Year *
                        </Label>
                        <Select
                          required
                          value={formData.student_year}
                          onValueChange={(value) =>
                            handleSelectChange("student_year", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue placeholder="Select student year" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {studentYears.map((year) => (
                              <SelectItem key={year.key} value={year.key}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="categoryId">
                          Category *
                        </Label>
                        <Select
                          required
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            handleSelectChange("categoryId", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {categories.map((category) => (
                              <SelectItem
                                key={category.key}
                                value={category.key}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="supervisorId">
                          Supervisor (Optional)
                        </Label>
                        <Select
                          value={formData.supervisorId}
                          onValueChange={(value) =>
                            handleSelectChange("supervisorId", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue placeholder="Select a supervisor" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            <SelectItem value="null-supervisor">
                              No supervisor
                            </SelectItem>
                            {isLoadingSupervisors ? (
                              <SelectItem disabled value="loading-placeholder">
                                Loading supervisors...
                              </SelectItem>
                            ) : (
                              supervisors?.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id.toString()}
                                >
                                  {supervisor.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-cyan-500"
                            icon="mdi:tag-multiple"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Technologies & Tags
                          </CardTitle>
                          <CardDescription>
                            Add relevant tags and technologies
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Add Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                            placeholder="e.g., react, spring, ai"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button
                            className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                            type="button"
                            variant="outline"
                            onClick={handleAddTag}
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-default-600">
                          Press Enter or click Add to include tags
                        </p>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-medium">Selected Tags</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                              >
                                <span>{tag}</span>
                                <Button
                                  className="ml-1 p-0 w-auto h-auto hover:bg-transparent"
                                  size="sm"
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveTag(index)}
                                >
                                  <Icon className="text-xs" icon="mdi:close" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-cyan-500"
                            icon="mdi:account-group"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Team Members
                          </CardTitle>
                          <CardDescription>
                            Add your project team members
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.members.map((member, index) => (
                        <div
                          key={index}
                          className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-default-600">
                              Member {index + 1}
                            </span>
                            {formData.members.length > 1 && (
                              <Button
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveMember(index)}
                              >
                                <Icon className="text-sm" icon="mdi:close" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`name-${index}`}
                              >
                                Name *
                              </Label>
                              <Input
                                required
                                className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                                id={`name-${index}`}
                                name="name"
                                placeholder="Full Name"
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, e)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`rollNumber-${index}`}
                              >
                                Roll Number
                              </Label>
                              <Input
                                className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                                id={`rollNumber-${index}`}
                                name="rollNumber"
                                placeholder="e.g., CS001"
                                value={member.rollNumber}
                                onChange={(e) => handleMemberChange(index, e)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        type="button"
                        variant="outline"
                        onClick={handleAddMember}
                      >
                        <Icon className="mr-2" icon="mdi:plus" />
                        Add Team Member
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-cyan-500"
                            icon="mdi:file-upload"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Project Files
                          </CardTitle>
                          <CardDescription>
                            Upload documents, presentations, or other files
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Input
                          multiple
                          className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                          id="projectFiles"
                          name="projectFiles"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-default-600">
                          Supported formats: PDF, DOC, PPT, Images, and more
                        </p>
                        {projectFiles.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">
                              Selected Files ({projectFiles.length})
                            </Label>
                            <div className="space-y-1">
                              {projectFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-default-600 bg-background/50 p-2 rounded"
                                >
                                  <Icon
                                    className="text-cyan-500"
                                    icon="mdi:file-document-outline"
                                  />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-xs text-default-600">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
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
              <div
                className={`${showProjectInfo ? "lg:col-span-2" : "w-full"}`}
              >
                <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Icon
                          className="text-xl text-cyan-500"
                          icon="mdi:file-document-edit-outline"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Project Report
                        </CardTitle>
                        <CardDescription>
                          Write your comprehensive project documentation
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/50 dark:to-blue-950/50 p-4 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            className="text-cyan-500"
                            icon="mdi:lightbulb-on"
                          />
                          <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                            Tips for Writing
                          </span>
                        </div>
                        <ul className="text-sm text-default-600 space-y-1">
                          <li>• Use clear headings and sections</li>
                          <li>• Include methodology and results</li>
                          <li>• Add code snippets with syntax highlighting</li>
                          <li>• Use images and diagrams where helpful</li>
                        </ul>
                      </div>

                      <div className="h-[600px] border border-cyan-200 dark:border-cyan-800 rounded-lg overflow-hidden">
                        <ReactQuill
                          key="quill-editor"
                          className="h-full"
                          modules={modules}
                          placeholder="Start writing your project report here... Include methodology, results, challenges faced, and learnings..."
                          theme="snow"
                          value={formData.body}
                          onChange={handleQuillChange}
                        />
                      </div>

                      <div className="text-sm text-default-600 bg-background/50 p-3 rounded-lg border border-border/50">
                        <Icon
                          className="inline mr-1"
                          icon="mdi:information-outline"
                        />
                        Your project report will be displayed with rich
                        formatting including code syntax highlighting and
                        embedded media.
                      </div>

                      {/* Create Button - Moved under editor */}
                      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-xl p-6 border border-cyan-200/50 dark:border-cyan-800/50 mt-6">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              Ready to Create Your Project?
                            </h3>
                            <p className="text-default-600 text-sm">
                              Review your content and submit your project
                            </p>
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
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={isSubmitting}
                              size="lg"
                              type="submit"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner className="mr-2" size="sm" />
                                  Creating Project...
                                </>
                              ) : (
                                <>
                                  <Icon className="mr-2" icon="mdi:plus" />
                                  Submit Project
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

export default CreateProjectPage;
