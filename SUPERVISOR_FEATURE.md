# Supervisor Feature Implementation

## Overview
This feature implements a supervisor approval system for projects. When a regular user uploads a project, it requires supervisor approval before being visible to other users. Admin users bypass this requirement.

## Database Changes
- Added `supervisor_id` field to projects table (references users table)
- Added `approval_status` field with values: PENDING, APPROVED, REJECTED
- Added `approved_at` timestamp field
- Added `approved_by` field (references users table)

## Key Features

### 1. Project Creation Logic
- **Admin Users**: Projects are automatically approved upon creation
- **Regular Users**: Projects require supervisor approval and are set to PENDING status

### 2. Project Visibility
- **Admin Users**: Can see all projects (pending, approved, rejected)
- **Regular Users**: Can only see approved projects
- **Supervisors**: Can see projects assigned to them for approval

### 3. Approval Process
- Supervisors can approve or reject projects assigned to them
- Admins can approve/reject any project
- Approval/rejection timestamps and approver information are tracked

## API Endpoints

### Supervisor Endpoints
- `POST /supervisor/projects/{projectId}/approve` - Approve a project
- `POST /supervisor/projects/{projectId}/reject` - Reject a project with reason
- `POST /supervisor/projects/{projectId}/approval` - Generic approval endpoint
- `GET /supervisor/projects/pending` - Get pending projects for supervisor
- `GET /supervisor/projects/status/{status}` - Get projects by approval status

### Project Endpoints (Updated)
- `GET /projects` - Now filters based on user role (admin sees all, users see approved only)
- `GET /projects/search` - Now filters based on user role

## Request/Response Examples

### Approve Project
```json
POST /supervisor/projects/123/approve
Authorization: Bearer <token>
```

### Reject Project
```json
POST /supervisor/projects/123/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Incomplete documentation",
  "action": "reject"
}
```

### Generic Approval
```json
POST /supervisor/projects/123/approval
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve"
}
```

## Project Response DTO (Updated)
The ProjectResponseDTO now includes:
- `supervisorId`: ID of the assigned supervisor
- `supervisorName`: Name of the assigned supervisor
- `approvalStatus`: Current approval status
- `approvedAt`: When the project was approved/rejected
- `approvedById`: ID of the user who approved/rejected
- `approvedByName`: Name of the user who approved/rejected

## Security Considerations
- Only supervisors assigned to a project or admins can approve/reject it
- Regular users cannot see pending or rejected projects
- All operations require proper authentication

## Migration
Run the migration `V13__add_supervisor_approval.sql` to add the new database fields.
Run the migration `V14__add_supervisor_role.sql` to add the SUPERVISOR role.

## Setup Instructions

### 1. Database Setup
Run both migrations:
```sql
-- V13__add_supervisor_approval.sql
-- V14__add_supervisor_role.sql
```

### 2. User Role Setup
You need to set up users with different roles:

#### Option A: Using API Endpoints
```bash
# Set a user as supervisor
PUT /admin/users/{userId}/supervisor

# Set a user as admin
PUT /admin/users/{userId}/admin

# Set a user as regular user
PUT /admin/users/{userId}/user
```

#### Option B: Direct Database Update
```sql
-- Set a specific user as supervisor
UPDATE users SET role = 'SUPERVISOR' WHERE email = 'supervisor@example.com';

-- Set a specific user as admin
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';

-- Set a specific user as regular user
UPDATE users SET role = 'USER' WHERE email = 'user@example.com';
```

### 3. User Roles Explained

- **ADMIN**: Can do everything, bypass approval, approve/reject any project
- **SUPERVISOR**: Can approve/reject projects assigned to them
- **USER**: Regular users who need supervisor approval for their projects

### 4. Workflow Example

1. **Regular User** creates a project with `supervisorId` → Project status: PENDING
2. **Supervisor** reviews and approves/rejects the project → Project status: APPROVED/REJECTED
3. **Admin** can see all projects and approve/reject any project
4. **Regular Users** can only see approved projects
