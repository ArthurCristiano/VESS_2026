import api from "./api";
import type {
    AdminUserDto,
    AdminUserUpdatePayload,
    UserProfile,
    UserProfilePayload,
} from "../types/adminUser";

function normalizeUser(user: AdminUserDto): AdminUserDto {
    const profile = user.profile ?? (user.admin ? "ADMINISTRADOR" : "PESQUISADOR");

    return {
        ...user,
        profile,
        admin: user.admin ?? profile === "ADMINISTRADOR",
    };
}

export async function listUsers(): Promise<AdminUserDto[]> {
    const { data } = await api.get<AdminUserDto[]>("/users");
    return data.map(normalizeUser);
}

export async function getUser(id: number): Promise<AdminUserDto> {
    const { data } = await api.get<AdminUserDto>(`/users/${id}`);
    return normalizeUser(data);
}

export async function updateUser(
    id: number,
    body: AdminUserUpdatePayload
): Promise<number> {
    const { data } = await api.put<number>(`/users/${id}`, body);
    return data;
}

export async function updateProfile(
    id: number,
    profile: UserProfile
): Promise<AdminUserDto> {
    const payload: UserProfilePayload = { profile };
    const { data } = await api.patch<AdminUserDto>(`/users/${id}/profile`, payload);
    return normalizeUser(data);
}

export async function inactivateUser(id: number): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserDto>(`/users/${id}/inactivate`);
    return normalizeUser(data);
}

export async function activateUser(id: number): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserDto>(`/users/${id}/activate`);
    return normalizeUser(data);
}