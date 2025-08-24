// src/components/ProjectCard.tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Project } from "@/pages/projects";
import { ApprovalStatusBadge } from "@/components/ApprovalStatusBadge";
import api from "@/config/api";

export default function ProjectCard({ project }: { project: Project }) {
  const { data: categoryName } = useQuery({
    queryKey: ["categoryName", project.categoryId],
    queryFn: async () => {
      const { data } = await api.get(`/category/${project?.categoryId}`);

      return data;
    },
  });

  return (
    <Card className="overflow-hidden border-small border-foreground/1">
      {project.coverImageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            alt={project.title}
            className="w-full h-full object-cover"
            src={project.coverImageUrl}
          />
        </div>
      )}
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold">{project.title}</h2>
        </div>
      </CardHeader>

      <CardBody className="px-3 py-2">
        <div className="flex items-start gap-3 content-between">
          <Badge className="text-xs block">{categoryName}</Badge>
          {project.approvalStatus && (
            <ApprovalStatusBadge
              className="text-xs"
              status={project.approvalStatus}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <p className="text-sm  line-clamp-3">{project.description}</p>

          <div className="flex items-center gap-2 text-xs mt-2">
            {project.academic_year && (
              <div className="flex items-center gap-1">
                <Icon icon="mdi:calendar" />
                <span>{project.academic_year}</span>
              </div>
            )}
            {project.student_year && (
              <div className="flex items-center gap-1 ml-3">
                <Icon icon="mdi:school" />
                <span>{project.student_year}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button
          as="a"
          className="flex items-center gap-1"
          color="primary"
          href={`/projects/${project.id}`}
          size="sm"
        >
          View Project
          <Icon icon="mdi:arrow-right" />
        </Button>
      </CardFooter>
    </Card>
  );
}
