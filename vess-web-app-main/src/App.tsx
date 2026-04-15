
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import UserConfigReport from "./components/dashboard/UserConfigReport";
import UserReport from "./components/dashboard/UserReport";
import AppLayout from "./layout/AppLayout";
import MapPage from "./pages/map/MapPage";
import LocationReport from "./components/dashboard/LocationReport";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import UserProfiles from "./pages/UserProfiles";
import { SidebarProvider } from "./context/SidebarContext";

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<SignIn />} />
            <Route path="/cadastro" element={<SignUp />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<MapPage />} />
                <Route path="/mapa" element={<MapPage />} />
                <Route path="/perfil" element={<UserProfiles />} />
                <Route
                  path="/relatorio-localizacao"
                  element={<LocationReport />}
                />
                <Route
                  path="/relatorio-pessoas"
                  element={<UserConfigReport />}
                />

                <Route element={<AdminProtectedRoute />}>
                  <Route path="/relatorio-usuarios" element={<UserReport />} />
                </Route>

              </Route>
            </Route>
            <Route path="*" element={<div className="p-10 text-center">Página não encontrada (404)</div>} />

          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}