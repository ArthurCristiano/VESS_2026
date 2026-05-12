
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import ConfirmEmail from "./pages/AuthPages/ConfirmEmail";
import UserConfigReport from "./components/dashboard/UserConfigReport";
import UserReport from "./components/dashboard/UserReport";
import AppLayout from "./layout/AppLayout";
import MapPage from "./pages/map/MapPage";
import LocationReport from "./components/dashboard/LocationReport";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import UserProfiles from "./pages/UserProfiles";
import { SidebarProvider } from "./context/SidebarContext";
import ForbiddenPage from "./pages/ForbiddenPage";
import RegionsManagementPage from "./pages/admin/RegionsManagementPage";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/login" element={<SignIn />} />
            <Route path="/cadastro" element={<SignUp />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />

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
                <Route path="/acesso-negado" element={<ForbiddenPage />} />

                <Route element={<AdminProtectedRoute />}>
                  <Route path="/relatorio-usuarios" element={<UserReport />} />
                  <Route path="/admin/regioes" element={<RegionsManagementPage />} />
                </Route>

              </Route>
            </Route>
            <Route path="*" element={<div className="p-10 text-center">{t("page.notFound")}</div>} />

        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}
