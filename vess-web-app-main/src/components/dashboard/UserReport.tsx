"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Pencil, RefreshCw, ShieldCheck, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Modal from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getBackendErrorMessage } from "../../services/api";
import {
    getUser,
    inactivateUser,
    listUsers,
    updateProfile,
    updateUser,
} from "../../services/adminUserService";
import type {
    AdminUserDto,
    AdminUserUpdatePayload,
    UserProfile,
    UserStatus,
} from "../../types/adminUser";

type Feedback = {
    type: "success" | "error";
    message: string;
} | null;

type UserFormData = AdminUserUpdatePayload & {
    profile: UserProfile;
};

const fieldClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";

function getUserProfile(user: AdminUserDto): UserProfile {
    return user.profile ?? (user.admin ? "ADMINISTRADOR" : "PESQUISADOR");
}

function getUserFormData(user: AdminUserDto): UserFormData {
    return {
        username: user.username ?? "",
        email: user.email ?? "",
        institution: user.institution ?? "",
        country: user.country ?? "",
        state: user.state ?? "",
        city: user.city ?? "",
        profile: getUserProfile(user),
    };
}

function formatLocation(user: AdminUserDto) {
    const parts = [user.city, user.state, user.country].filter(Boolean);
    return parts.join(", ") || "-";
}

function formatProfile(profile: UserProfile | undefined, t: ReturnType<typeof useLanguage>["t"]) {
    if (profile === "ADMINISTRADOR") return t("role.admin");
    if (profile === "PESQUISADOR") return t("role.researcher");
    return t("common.notInformed");
}

function formatStatus(status: UserStatus | undefined, t: ReturnType<typeof useLanguage>["t"]) {
    if (status === "ATIVO") return t("status.active");
    if (status === "INATIVO") return t("status.inactive");
    if (status === "PENDENTE_EMAIL") return t("status.pendingEmail");
    return t("common.notInformed");
}

function profileBadgeClass(profile?: UserProfile) {
    return profile === "ADMINISTRADOR"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

function statusBadgeClass(status?: UserStatus) {
    if (status === "ATIVO") {
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    }

    if (status === "INATIVO") {
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    }

    if (status === "PENDENTE_EMAIL") {
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    }

    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

function trimPayload(formData: UserFormData): AdminUserUpdatePayload {
    return {
        username: formData.username.trim(),
        email: formData.email.trim(),
        institution: formData.institution.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
    };
}

export default function UserReport() {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
    const [formData, setFormData] = useState<UserFormData | null>(null);
    const { logoutUser, user: currentUser, updateUserContext } = useAuth();
    const { t } = useLanguage();

    const handleAuthError = useCallback(
        (err: unknown) => {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                logoutUser();
            }
        },
        [logoutUser]
    );

    const resolveErrorMessage = useCallback(
        (err: unknown, fallback: string) => {
            handleAuthError(err);
            return getBackendErrorMessage(err) ?? fallback;
        },
        [handleAuthError]
    );

    const loadUsers = useCallback(
        async (showTableLoading = true) => {
            try {
                if (showTableLoading) setLoading(true);
                setError(null);
                const data = await listUsers();
                setUsers(data);
            } catch (err) {
                setError(resolveErrorMessage(err, t("reports.usersError")));
                console.error("Erro ao buscar usuários:", err);
            } finally {
                if (showTableLoading) setLoading(false);
            }
        },
        [resolveErrorMessage, t]
    );

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const handleOpenModal = async (user: AdminUserDto) => {
        try {
            setFeedback(null);
            setActionLoading(true);
            const freshUser = await getUser(user.id);
            setSelectedUser(freshUser);
            setFormData(getUserFormData(freshUser));
            setIsModalOpen(true);
        } catch (err) {
            setFeedback({
                type: "error",
                message: resolveErrorMessage(err, t("adminUsers.loadUserError")),
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (actionLoading) return;
        setIsModalOpen(false);
        setSelectedUser(null);
        setFormData(null);
    };

    const syncCurrentUserContext = (updatedUser: AdminUserDto) => {
        if (currentUser?.id !== updatedUser.id) return;

        updateUserContext({
            username: updatedUser.username,
            email: updatedUser.email,
            institution: updatedUser.institution,
            country: updatedUser.country,
            state: updatedUser.state,
            city: updatedUser.city,
            admin: updatedUser.admin ?? getUserProfile(updatedUser) === "ADMINISTRADOR",
            profile: getUserProfile(updatedUser),
            status: updatedUser.status,
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedUser || !formData) return;

        try {
            setActionLoading(true);
            setFeedback(null);

            await updateUser(selectedUser.id, trimPayload(formData));

            const originalProfile = getUserProfile(selectedUser);
            const updatedUser =
                formData.profile !== originalProfile
                    ? await updateProfile(selectedUser.id, formData.profile)
                    : await getUser(selectedUser.id);

            syncCurrentUserContext(updatedUser);

            setSelectedUser(updatedUser);
            setFormData(getUserFormData(updatedUser));
            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
            );

            setFeedback({ type: "success", message: t("adminUsers.updateSuccess") });
            await loadUsers(false);
        } catch (err) {
            setFeedback({
                type: "error",
                message: resolveErrorMessage(err, t("adminUsers.updateError")),
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleInactivate = async (targetUser: AdminUserDto) => {
        if (currentUser?.id === targetUser.id) {
            setFeedback({
                type: "error",
                message: t("adminUsers.cannotInactivateSelf"),
            });
            return;
        }

        if (targetUser.status === "INATIVO") {
            setFeedback({ type: "error", message: t("adminUsers.alreadyInactive") });
            return;
        }

        const confirmed = window.confirm(
            t("adminUsers.confirmInactivate", { name: targetUser.username })
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setFeedback(null);

            const updatedUser = await inactivateUser(targetUser.id);

            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
            );

            if (selectedUser?.id === updatedUser.id) {
                setSelectedUser(updatedUser);
                setFormData(getUserFormData(updatedUser));
            }

            setFeedback({ type: "success", message: t("adminUsers.inactivateSuccess") });
            await loadUsers(false);
        } catch (err) {
            setFeedback({
                type: "error",
                message: resolveErrorMessage(err, t("adminUsers.inactivateError")),
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormChange = <K extends keyof UserFormData>(
        field: K,
        value: UserFormData[K]
    ) => {
        setFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {t("adminUsers.title")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("adminUsers.subtitle")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadUsers()}
                        disabled={loading || actionLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        {t("common.refresh")}
                    </button>
                </div>

                {feedback && (
                    <div
                        className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                            feedback.type === "success"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}

                <div className="max-w-full overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("common.name")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("common.email")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("adminUsers.profile")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("adminUsers.status")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("common.institution")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("reports.location")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {t("adminUsers.actions")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="px-4 py-24 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        {t("reports.loadingUsers")}
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-24 text-center text-red-500">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="px-4 py-24 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        {t("reports.noUsers")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const profile = getUserProfile(user);
                                    const isCurrentUser = currentUser?.id === user.id;
                                    const isInactive = user.status === "INATIVO";

                                    return (
                                        <TableRow
                                            key={user.id}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <TableCell className="max-w-[160px] truncate px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {user.username}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm">
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${profileBadgeClass(
                                profile
                            )}`}
                        >
                          {formatProfile(profile, t)}
                        </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm">
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
                                user.status
                            )}`}
                        >
                          {formatStatus(user.status, t)}
                        </span>
                                            </TableCell>
                                            <TableCell className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {user.institution || "-"}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatLocation(user)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleOpenModal(user)}
                                                        disabled={actionLoading}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        title={t("adminUsers.viewEditTitle")}
                                                    >
                                                        <Pencil size={15} />
                                                        {t("adminUsers.manage")}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => void handleInactivate(user)}
                                                        disabled={actionLoading || isInactive || isCurrentUser}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        title={
                                                            isCurrentUser
                                                                ? t("adminUsers.inactivateTitle")
                                                                : t("adminUsers.inactivateUser")
                                                        }
                                                    >
                                                        <UserX size={15} />
                                                        {t("adminUsers.inactivate")}
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                maxWidthClass="max-w-3xl"
                title={
                    selectedUser
                        ? `${t("adminUsers.title")}: ${selectedUser.username}`
                        : t("adminUsers.title")
                }
            >
                {selectedUser && formData && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/60 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                    {selectedUser.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t("adminUsers.currentProfile")}</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                    {formatProfile(getUserProfile(selectedUser), t)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t("adminUsers.status")}</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                    {formatStatus(selectedUser.status, t)}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("common.name")}
                                <input
                                    className={fieldClass}
                                    value={formData.username}
                                    minLength={4}
                                    maxLength={50}
                                    required
                                    onChange={(event) => handleFormChange("username", event.target.value)}
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("common.email")}
                                <input
                                    className={fieldClass}
                                    type="email"
                                    value={formData.email}
                                    required
                                    onChange={(event) => handleFormChange("email", event.target.value)}
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("common.institution")}
                                <input
                                    className={fieldClass}
                                    value={formData.institution}
                                    minLength={2}
                                    maxLength={100}
                                    required
                                    onChange={(event) => handleFormChange("institution", event.target.value)}
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("adminUsers.profile")}
                                <select
                                    className={fieldClass}
                                    value={formData.profile}
                                    required
                                    onChange={(event) =>
                                        handleFormChange("profile", event.target.value as UserProfile)
                                    }
                                >
                                    <option value="PESQUISADOR">{t("role.researcher")}</option>
                                    <option value="ADMINISTRADOR">{t("role.admin")}</option>
                                </select>
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("common.country")}
                                <input
                                    className={fieldClass}
                                    value={formData.country}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    onChange={(event) => handleFormChange("country", event.target.value)}
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("common.state")}
                                <input
                                    className={fieldClass}
                                    value={formData.state}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    onChange={(event) => handleFormChange("state", event.target.value)}
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                                {t("common.city")}
                                <input
                                    className={fieldClass}
                                    value={formData.city}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    onChange={(event) => handleFormChange("city", event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={() => void handleInactivate(selectedUser)}
                                disabled={
                                    actionLoading ||
                                    selectedUser.status === "INATIVO" ||
                                    currentUser?.id === selectedUser.id
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <UserX size={16} />
                                {t("adminUsers.inactivateUser")}
                            </button>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={actionLoading}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {t("common.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <ShieldCheck size={16} />
                                    {actionLoading ? t("common.saving") : t("common.saveChanges")}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
