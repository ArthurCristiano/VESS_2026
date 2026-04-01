import { useAuth } from "../context/AuthContext";

export type UserRole = "ADMINISTRADOR" | "PESQUISADOR" | "GUEST";

export interface RolePermissions {
    canViewMap: boolean;
    canViewLocationReport: boolean;
    canViewConfigReport: boolean;
    canViewUserReport: boolean;
    canEditProfile: boolean;
    isAdmin: boolean;
    isPesquisador: boolean;
    isAuthenticated: boolean;
    role: UserRole;
}

export function useRoles(): RolePermissions {
    const { user, token } = useAuth();

    const isAuthenticated = !!token && !!user;

    const isAdmin = isAuthenticated && (user?.admin === true || user?.profile === "ADMINISTRADOR");
    const isPesquisador = isAuthenticated && !isAdmin;

    const role: UserRole = !isAuthenticated
        ? "GUEST"
        : isAdmin
            ? "ADMINISTRADOR"
            : "PESQUISADOR";

    return {
        isAuthenticated,
        isAdmin,
        isPesquisador,
        role,

        canViewMap: isAuthenticated,
        canViewLocationReport: isAuthenticated,
        canViewConfigReport: isAuthenticated,
        canViewUserReport: isAdmin,
        canEditProfile: isAuthenticated,
    };
}