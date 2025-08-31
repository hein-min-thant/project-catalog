# Project Catalog

Project Catalog is a full-stack web application designed to help users submit, review, and manage projects in an academic or team environment. It features real-time notifications, project approval workflows, comments, and user management.

## Features

- **Project Submission:** Users can create and submit projects for review.
- **Project Review & Approval:** Projects can be approved or rejected by authorized reviewers/admins.
- **Comment System:** Users can comment on projects, and project owners receive notifications for new comments.
- **Real-Time Notifications:** Users receive instant in-app notifications for comments, approvals, or rejections via WebSocket.
- **Notification Management:** Users can view, mark as read, delete, or clear notifications.
- **User Authentication:** Secure login system (JWT-based).
- **User Roles:** Support for different user roles (admin, reviewer, regular user).
- **Responsive UI:** Modern React frontend for a seamless experience.

## Technology Stack

- **Backend:** Java, Spring Boot, JPA, WebSocket
- **Frontend:** React, TypeScript, TailwindCSS
- **Database:** (e.g., PostgreSQL, MySQL – configure as needed)
- **Authentication:** JWT
- **Notifications:** WebSocket for real-time updates

## Getting Started

### Prerequisites

- Java 24
- Node.js 18+
- (Recommended) PostgreSQL/MySQL

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/hein-min-thant/project-catalog.git
   cd project-catalog
   ```

2. Configure database settings in `src/main/resources/application.properties`.

3. Build and start the backend:

   ```bash
   ./mvnw spring-boot:run
   ```

### WebSocket

The backend provides a WebSocket endpoint at `ws://localhost:8080/ws` for real-time notifications. The frontend automatically connects and subscribes after user login.

## API Overview

- **Authentication:**
  - `POST /api/auth/login` – Login endpoint
- **Projects:**
  - `GET /api/projects` – List projects
  - `POST /api/projects` – Submit a new project
  - `PUT /api/projects/{id}/approve` – Approve a project
  - `PUT /api/projects/{id}/reject` – Reject a project
- **Comments:**
  - `POST /api/projects/{id}/comments` – Add a comment
- **Notifications:**
  - `GET /api/notifications` – Fetch user notifications
  - `PUT /api/notifications/{id}/read` – Mark as read
  - `PUT /api/notifications/read-all` – Mark all as read
  - `DELETE /api/notifications/{id}` – Delete a notification
  - `DELETE /api/notifications/clear-all` – Clear all notifications
  - `GET /api/notifications/count` – Get notification count

## Project Structure

- `src/main/java/com/ucsmgy/projectcatalog/` – Backend source
  - `entities/` – JPA entities (Project, Notification, User)
  - `repositories/` – Spring Data repositories
  - `services/` – Business logic (NotificationService, ProjectService)
  - `controllers/` – REST API controllers
  - `events/` – Event listeners for notifications
- `project-catalog-client/` – Frontend source
  - `src/pages/` – Page components (notifications, projects, login, etc.)
  - `src/hooks/useNotifications.ts` – Notification state management
  - `src/components/` – UI components

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or documentation improvements.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, open an issue or reach out to [hein-min-thant](https://github.com/hein-min-thant).

---

Let me know if you want to add specific usage instructions, environment variables, deployment details, or other custom sections!