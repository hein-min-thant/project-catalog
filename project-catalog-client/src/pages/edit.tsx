import React, { useState, useMemo, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/react";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    body: string;
    status: string;
    benefits: string;
    githubLink: string; // Corrected state field
  }>({
    title: "",
    description: "",
    body: "",
    status: "",
    benefits: "",
    githubLink: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

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
          status: project.status || "",
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

  // Submit (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const formDataToSubmit = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSubmit.append(
        key,
        String(formData[key as keyof typeof formData])
      );
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
        [{ header: "1" }, { header: "2" }, { header: [3, 4, 5, 6] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
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
          background-color: #18181b; /* dark:bg-zinc-600 */
          color: white;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: "Geist", sans-serif;
        }
        .ql-editor {
          font-family: "Geist", sans-serif;
        }
        .ql-container {
          border-radius: 0.5rem;
          position: relative;
        }
      `}</style>
      <div className="flex flex-col h-full bg-background dark:bg-zinc-950 p-6 md:p-10">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Edit Project</h1>
          <form
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            onSubmit={handleSubmit}
          >
            {/* Left Column (General Details) */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Update the project&apos;s key information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      required
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      required
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Benefit */}
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits</Label>
                    <Input
                      required
                      id="benefits"
                      name="benefits"
                      type="text"
                      value={formData.benefits}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="githubLink">Github Link</Label>
                    <Input
                      required
                      id="githubLink"
                      name="githubLink"
                      type="text"
                      value={formData.githubLink}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Body Editor) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Body</CardTitle>
                  <CardDescription>
                    Edit the detailed content of the project report.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-[500px] relative overflow-y-auto rounded-lg border dark:border-zinc-700">
                    <ReactQuill
                      className="mb-12"
                      modules={modules}
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
              <div className="flex justify-end pt-12">
                <Button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </div>
          </form>
          {submitMessage && (
            <p
              className={`mt-4 text-center ${
                submitMessage.includes("successfully")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {submitMessage}
            </p>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditProjectPage;
