import { Route, Routes } from "react-router-dom";

import RegisterPage from "./pages/register";
import PublicRoute from "./config/PublicRoute";
import PrivateRoute from "./config/PrivateRoute";
import LoginPage from "./pages/login";
import EditProjectPage from "./pages/edit";

import IndexPage from "@/pages/index";
import ProjectsPage from "@/pages/projects";
import ProfilePage from "@/pages/profile";
import ProjectDetailPage from "@/pages/project-detail";
import CreateProjectPage from "@/pages/create";
import SavedProjectsPage from "@/pages/saved";
import SupervisorDashboardPage from "@/pages/supervisor-dashboard";
import AdminDashboardPage from "@/pages/admin-dashboard";
import NotificationsPage from "@/pages/notifications";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route
        element={
          <PrivateRoute>
            <ProjectsPage />
          </PrivateRoute>
        }
        path="/projects"
      />
      <Route
        element={
          <PrivateRoute>
            <CreateProjectPage />
          </PrivateRoute>
        }
        path="/create"
      />
      <Route
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
        path="/login"
      />

      <Route
        element={
          <PrivateRoute>
            <EditProjectPage />
          </PrivateRoute>
        }
        path="/projects/:id/edit"
      />
      <Route
        element={
          <PrivateRoute>
            <SavedProjectsPage />
          </PrivateRoute>
        }
        path="/saved-projects"
      />

      <Route
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
        path="/register"
      />
      <Route
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
        path="/profile"
      />
      <Route
        element={
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        }
        path="/projects/:id"
      />
      <Route
        element={
          <PrivateRoute>
            <SupervisorDashboardPage />
          </PrivateRoute>
        }
        path="/supervisor-dashboard"
      />
      <Route
        element={
          <PrivateRoute>
            <AdminDashboardPage />
          </PrivateRoute>
        }
        path="/admin-dashboard"
      />
      <Route
        element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        }
        path="/notifications"
      />
    </Routes>
  );
}

export default App;
