"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Eye } from "lucide-react";
import api from "../../services/api";
import Modal from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

interface UserReportData {
  id: number;
  username: string;
  email: string;
  institution: string;
  country: string;
  state: string;
  city: string;
  admin: boolean;
}

export default function UserReport() {
  const [users, setUsers] = useState<UserReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserReportData | null>(null);
  const { logoutUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err: any) {
        setError(t("reports.usersError"));
        console.error("Erro ao buscar usuários:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          logoutUser();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [logoutUser, t]);

  const formatLocation = (user: UserReportData) => {
    const parts = [user.city, user.state, user.country].filter(Boolean);
    return parts.join(", ") || "-";
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("reports.usersTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("reports.usersSubtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("reports.user")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("common.email")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("common.institution")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("reports.location")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("reports.admin")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center font-medium text-gray-500 text-xs dark:text-gray-400">
                  {t("common.view")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="px-4 py-24 text-center text-gray-500 dark:text-gray-400">
                    {t("reports.loadingUsers")}
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell className="px-4 py-24 text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-24 text-center text-gray-500 dark:text-gray-400">
                    {t("reports.noUsers")}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell className="px-4 py-3 font-medium text-gray-800 text-sm dark:text-white/90 truncate max-w-[150px]">
                      {user.username}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400 truncate max-w-[200px]">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400 truncate max-w-[180px]">
                      {user.institution}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400 truncate max-w-[200px]">
                      {formatLocation(user)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-sm dark:text-gray-400">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.admin
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {user.admin ? t("common.yes") : t("common.no")}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title={t("reports.viewUserDetails")}
                      >
                        <Eye size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? t("reports.userDetailsFor", { name: selectedUser.username }) : t("reports.userDetails")}
      >
        {selectedUser && (
          <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>{t("profile.username")}:</strong> {selectedUser.username}</p>
            <p><strong>{t("common.email")}:</strong> {selectedUser.email}</p>
            <p><strong>{t("common.institution")}:</strong> {selectedUser.institution}</p>
            <p><strong>{t("common.country")}:</strong> {selectedUser.country}</p>
            <p><strong>{t("common.state")}:</strong> {selectedUser.state}</p>
            <p><strong>{t("common.city")}:</strong> {selectedUser.city}</p>
            <p><strong>{t("reports.admin")}:</strong> {selectedUser.admin ? t("common.yes") : t("common.no")}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
