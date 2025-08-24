import { Badge } from "@/components/ui/badge";

interface ApprovalStatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  className?: string;
}

export const ApprovalStatusBadge = ({
  status,
  className = "",
}: ApprovalStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "PENDING":
      default:
        return "secondary";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "APPROVED":
        return "✓";
      case "REJECTED":
        return "✗";
      case "PENDING":
      default:
        return "⏳";
    }
  };

  return (
    <Badge className={className} variant={getVariant()}>
      <span className="mr-1">{getIcon()}</span>
      {status}
    </Badge>
  );
};
