export type UserProfile = "ADMINISTRADOR" | "PESQUISADOR";
export type UserStatus = "PENDENTE_EMAIL" | "ATIVO" | "INATIVO";

export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
    institution: string;
    country: string;
    state: string;
    city: string;
    profile?: UserProfile;
    status?: UserStatus;
    admin?: boolean;
}

export interface AdminUserUpdatePayload {
    username: string;
    email: string;
    institution: string;
    country: string;
    state: string;
    city: string;
}

export interface UserProfilePayload {
    profile: UserProfile;
}