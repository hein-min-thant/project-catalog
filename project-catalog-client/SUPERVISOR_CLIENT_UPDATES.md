# Supervisor Feature - Client Updates

## Overview
This document outlines the client-side updates made to support the supervisor approval system.

## New Components

### 1. ApprovalStatusBadge Component
- **Location**: `src/components/ApprovalStatusBadge.tsx`
- **Purpose**: Reusable component for displaying approval status with appropriate colors and icons
- **Usage**: Used in project cards and detail pages

### 2. Supervisor Dashboard Page
- **Location**: `src/pages/supervisor-dashboard.tsx`
- **Purpose**: Dashboard for supervisors to review and approve/reject pending projects
- **Features**:
  - List of pending projects assigned to the supervisor
  - Approve/reject functionality with reason input
  - Role-based access control
  - Real-time updates using React Query

## Updated Components

### 1. ProjectCard Component
- **Location**: `src/components/ProjectCard.tsx`
- **Updates**:
  - Added approval status badge display
  - Uses new ApprovalStatusBadge component

### 2. Project Detail Page
- **Location**: `src/pages/project-detail.tsx`
- **Updates**:
  - Added approval status display in header
  - Added approval information section with supervisor details
  - Shows approval/rejection date and approver name

### 3. Create Project Form
- **Location**: `src/pages/create.tsx`
- **Updates**:
  - Added supervisor selection dropdown
  - Fetches supervisors from API using useSupervisors hook
  - Includes supervisorId in form submission

## New Hooks

### 1. useSupervisors Hook
- **Location**: `src/hooks/useSupervisors.ts`
- **Purpose**: Fetches list of supervisors for dropdown selection
- **Features**:
  - Caches data for 5 minutes
  - Handles loading states

## Updated Types

### 1. Project Interface
- **Location**: `src/pages/projects.tsx`
- **New Fields**:
  - `supervisorId?: number`
  - `supervisorName?: string`
  - `approvalStatus: "PENDING" | "APPROVED" | "REJECTED"`
  - `approvedAt?: string`
  - `approvedById?: number`
  - `approvedByName?: string`

### 2. Global Types
- **Location**: `src/types/index.ts`
- **New Types**:
  - `User` interface
  - `ProjectApprovalRequest` interface
  - `SupervisorProject` interface

## New Routes

### 1. Supervisor Dashboard Route
- **Path**: `/supervisor-dashboard`
- **Component**: `SupervisorDashboardPage`
- **Access**: Protected route, requires SUPERVISOR or ADMIN role

## Navigation Updates

### 1. Site Configuration
- **Location**: `src/config/site.ts`
- **Updates**: Added "Supervisor Dashboard" to navigation menu

## API Integration

### 1. Supervisor Endpoints
The client now integrates with these new backend endpoints:
- `GET /supervisor/projects/pending` - Get pending projects
- `POST /supervisor/projects/{id}/approve` - Approve project
- `POST /supervisor/projects/{id}/reject` - Reject project
- `GET /admin/users/supervisors` - Get list of supervisors

## User Experience Features

### 1. Role-Based Access
- Only users with SUPERVISOR or ADMIN role can access the supervisor dashboard
- Regular users see access denied message if they try to access supervisor features

### 2. Real-Time Updates
- Uses React Query for efficient data fetching and caching
- Automatic invalidation of queries after approval/rejection actions

### 3. Visual Feedback
- Loading states for all async operations
- Success/error messages for user actions
- Color-coded approval status badges

### 4. Form Validation
- Supervisor selection is optional but recommended for non-admin users
- Rejection requires a reason to be provided

## Security Considerations

### 1. Client-Side Validation
- Role-based access control for supervisor dashboard
- Form validation for required fields

### 2. API Security
- All supervisor endpoints require authentication
- Role-based authorization handled by backend

## Testing Recommendations

### 1. User Roles
- Test with different user roles (USER, SUPERVISOR, ADMIN)
- Verify access control works correctly

### 2. Project Lifecycle
- Test complete project creation → approval → visibility flow
- Test rejection flow with reason input

### 3. UI States
- Test loading states
- Test error handling
- Test empty states (no pending projects)

## Future Enhancements

### 1. Notifications
- Add real-time notifications for project approval/rejection
- Email notifications for project status changes

### 2. Advanced Filtering
- Add approval status filters to project listing
- Add supervisor filters for admin users

### 3. Bulk Operations
- Allow supervisors to approve/reject multiple projects at once
- Batch operations for efficiency

### 4. Approval History
- Show approval history for projects
- Track changes and reasons over time
