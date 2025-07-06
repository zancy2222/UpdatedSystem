import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ClientRegisterPage from "../pages/Register/ClientRegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ClientAppointmentPage from "../pages/ClientAppointmentPage";
import Personel from "../pages/Personel";
import ProtectedRoute from "../components/ProtectedRoute";
import AppointmentNature from "../pages/AppointmentNature";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <ClientRegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute
        requiredUserType={["admin", "personnel"]}
        requiredPosition="Head of Office"
      >
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/appointment-nature",
    element: (
      <ProtectedRoute
        requiredUserType={["admin", "personnel"]}
        requiredPosition="Head of Office"
      >
        <AppointmentNature />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clientdashboard",
    element: (
      <ProtectedRoute requiredUserType="client">
        <ClientAppointmentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/personel",
    element: (
      <ProtectedRoute requiredUserType="personnel">
        <Personel />
      </ProtectedRoute>
    ),
  },
]);

export default router;
