import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import Quill's CSS
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import api from "@/config/api"; // Import the axios instance
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
    objectives: "",
    githubLink: "",
    coverImageUrl: "",
    academic_year: "",
    student_year: "",
    categoryId: "",
    supervisorId: "",
    tags: [],
    members: [{ name: "", rollNumber: "" }], // Start with one member field
  });
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch supervisors for dropdown
  const { data: supervisors, isLoading: isLoadingSupervisors } =
    useSupervisors();

  // The provided data for the dropdowns
  const { academicYears, studentYears, categories, statuses } = useMemo(() => {
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

        navigate(`/projects/${newProjectId}`); // Wait for 1.5 seconds to show the message
        // Reset form or redirect
      } else {
        setSubmitMessage(`Failed to create project: ${response.statusText}`);
      }
    } catch (error) {
      const err = error as any;

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setSubmitMessage(`Failed to create project: ${err.response.data}`);
      } else if (err.request) {
        // The request was made but no response was received
        setSubmitMessage("Failed to create project: No response from server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setSubmitMessage(`An error occurred during submission: ${err.message}`);
      }
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define the custom toolbar options
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { header: [3, 4, 5, 6] }],
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"], // remove formatting button
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
          top: 0; /* Stick to the top of the nearest scrolling ancestor */
          z-index: 10;
          background-color: white;
        }
        .dark .ql-snow.ql-toolbar,
        .dark .ql-snow .ql-toolbar {
          background-color : rgb(30, 41, 59 );
        }
        
        .dark .ql-toolbar .ql-stroke {
        stroke: white; /* Red color for icon strokes */
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
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;
          }
        .ql-container {
          border-radius: 0.5rem;
        }
      `}</style>
      <div className="flex flex-col h-full bg-background p-6 md:p-10">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-2 text-center text-cyan-500">
            Create New Project
          </h1>
          <p className="text-center mb-8">
            Fill in the details to add a new project to the catalog.
          </p>
          <form
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            onSubmit={handleSubmit}
          >
            {/* Left Column - General Info */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    General Information
                  </CardTitle>
                  <CardDescription>
                    Provide basic details about the project.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      required
                      id="title"
                      name="title"
                      placeholder="e.g., AI-Powered Chatbot"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      required
                      id="description"
                      name="description"
                      placeholder="A brief summary of the project"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objectives">Objectives</Label>
                    <Textarea
                      required
                      id="objectives"
                      name="objectives"
                      placeholder="What the project aims to achieve"
                      value={formData.objectives}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubLink">GitHub Link (Optional)</Label>
                    <Input
                      id="githubLink"
                      name="githubLink"
                      placeholder="https://github.com/..."
                      value={formData.githubLink}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    Project Details
                  </CardTitle>
                  <CardDescription>
                    Specify the project&apos;s academic context and status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Select
                      required
                      value={formData.academic_year}
                      onValueChange={(value) =>
                        handleSelectChange("academic_year", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.key} value={year.key}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_year">Student Year</Label>
                    <Select
                      required
                      value={formData.student_year}
                      onValueChange={(value) =>
                        handleSelectChange("student_year", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student year" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentYears.map((year) => (
                          <SelectItem key={year.key} value={year.key}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      required
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        handleSelectChange("categoryId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.key} value={category.key}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorId">Supervisor</Label>
                    <Select
                      value={formData.supervisorId}
                      onValueChange={(value) =>
                        handleSelectChange("supervisorId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supervisor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
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

              <Card className="p-6 ">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    Tags
                  </CardTitle>
                  <CardDescription>
                    Add keywords related to the project. Press Enter to add a
                    tag.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., react, spring boot"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 dark:text-white bg-cyan-500 rounded-full px-3 py-2 text-sm"
                      >
                        {tag}
                        <Button
                          className="p-0 w-auto h-auto"
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveTag(index)}
                        >
                          <Icon className="text-xs" icon="mdi:close" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Add team members with their name and roll number.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          required
                          id={`name-${index}`}
                          name="name"
                          placeholder="Member Name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, e)}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`rollNumber-${index}`}>Roll No.</Label>
                        <Input
                          id={`rollNumber-${index}`}
                          name="rollNumber"
                          placeholder="Roll Number"
                          value={member.rollNumber}
                          onChange={(e) => handleMemberChange(index, e)}
                        />
                      </div>
                      <Button
                        className="self-end"
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveMember(index)}
                      >
                        <Icon className="text-lg" icon="mdi:close" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    className="w-full"
                    type="button"
                    onClick={handleAddMember}
                  >
                    <Icon className="mr-2" icon="mdi:plus" /> Add Member
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-6 ">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    Project Files
                  </CardTitle>
                  <CardDescription>
                    Upload files related to the project (e.g., documents,
                    presentations).
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Input
                    multiple
                    id="projectFiles"
                    name="projectFiles"
                    type="file"
                    onChange={handleFileChange}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Body/Quill Editor */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="p-6 h-full flex flex-col ">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-cyan-500">
                    Project Body
                  </CardTitle>
                  <CardDescription>
                    Write the full, detailed content of the project report.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <div className="h-[700px] relative overflow-y-auto rounded-lg border hide-scrollbar">
                    <ReactQuill
                      className="flex-1 min-h-[500px] mb-4"
                      modules={modules}
                      placeholder="Start writing the project details here..."
                      theme="snow"
                      value={formData.body}
                      onChange={handleQuillChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Separator className="my-6" />
              <div className="flex justify-end items-center gap-4">
                {submitMessage && (
                  <span
                    className={`text-sm ${submitMessage.includes("successfully") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {submitMessage}
                  </span>
                )}
                <Button
                  className="w-full lg:w-auto"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2" size="sm" /> Creating...
                    </>
                  ) : (
                    "Submit Project"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CreateProjectPage;
