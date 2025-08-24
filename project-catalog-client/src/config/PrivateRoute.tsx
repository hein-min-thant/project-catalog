// routes/PrivateRoute.tsx
import { Navigate } from "react-router-dom";

import { isAuthenticated } from "../config/auth";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  return isAuthenticated() ? children : <Navigate replace to="/login" />;
}
