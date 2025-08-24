import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Supervisor-related types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Project {
  id: number;
  title: string;
  description: string;
  benefits: string;
  body: string;
  excerpt: string;
  contentFormat: string;
  githubLink: string;
  coverImageUrl: string;
  academic_year: string;
  student_year: string;
  objectives: string;
  status: string;
  userId: number;
  categoryId: number;
  supervisorId?: number;
  supervisorName?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  approvedById?: number;
  approvedByName?: string;
  projectFiles: string[];
  tags: String[];
  membersJson: string;
}

export interface ProjectApprovalRequest {
  reason?: string;
  action: "approve" | "reject";
}

export interface SupervisorProject extends Project {
  supervisorId?: number;
  supervisorName?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  approvedById?: number;
  approvedByName?: string;
}
