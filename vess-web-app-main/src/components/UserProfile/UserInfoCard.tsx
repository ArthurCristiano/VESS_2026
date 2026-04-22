"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { getBackendErrorMessage } from "../../services/api";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import axios from "axios";
import { User } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { EyeClosed, EyeIcon } from "lucide-react";

const UserInfoCard: React.FC = () => {
  const { user, updateUserContext, logoutUser, loading: authLoading } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const fillFormFromUser = (profileUser: Partial<User>) => {
    setEditedUser({
      username: profileUser.username || "",
      email: profileUser.email || "",
      password: "",
      institution: profileUser.institution || "",
      country: profileUser.country || "",
      state: profileUser.state || "",
      city: profileUser.city || "",
    });
  };

  const normalizeUserPayload = (payload: unknown): Partial<User> | null => {
    if (!payload || typeof payload !== "object") return null;

    if ("user" in payload && payload.user && typeof payload.user === "object") {
      return payload.user as Partial<User>;
    }

    return payload as Partial<User>;
  };

  useEffect(() => {
    if (isOpen && user) {
      setError(null);
      setShowPassword(false);
      fillFormFromUser(user);
    }
  }, [isOpen, user]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const previousEmail = user.email || "";
    const previousUsername = user.username || "";

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        username: editedUser.username || "",
        email: editedUser.email || "",
        institution: editedUser.institution || "",
        country: editedUser.country || "",
        state: editedUser.state || "",
        city: editedUser.city || "",
        password: editedUser.password || "",
      };

      const response = await api.put("/users/me", payload);
      const updatedUser = normalizeUserPayload(response.data) ?? payload;

      const updatedEmail = String(updatedUser.email ?? payload.email ?? "");
      const updatedUsername = String(updatedUser.username ?? payload.username ?? "");
      const requiresRelogin =
        updatedEmail !== previousEmail || updatedUsername !== previousUsername;

      updateUserContext(updatedUser);
      fillFormFromUser(updatedUser);
      closeModal();

      if (requiresRelogin) {
        logoutUser();
        navigate("/login", {
          state: {
            message:
              "Dados de acesso atualizados. Faça login novamente para continuar.",
          },
        });
      }
    } catch (err: any) {
      let finalErrorMessage = "Não foi possível salvar as alterações. Tente novamente.";
      if (axios.isAxiosError(err)) {
        finalErrorMessage = getBackendErrorMessage(err) ??
          (err.response?.status === 404
            ? "Endpoint de atualização não encontrado no servidor."
            : err.response?.status === 401 || err.response?.status === 403
              ? "Você não tem permissão para realizar esta ação."
              : finalErrorMessage);
      }
      setError(finalErrorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) return <div className="text-center p-10">Carregando informações do usuário...</div>;
  if (!user) return <div className="text-center p-10">Usuário não encontrado ou não logado.</div>;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-800/20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
            Informações do Usuário
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Nome de Usuário</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.username || "-"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">E-mail</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.email || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Instituição</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.institution || "-"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">País</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.country || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Estado</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.state || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Cidade</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.city || "-"}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 lg:inline-flex lg:w-auto mt-4 lg:mt-0"
          variant="outline"
          size="sm"
        >
          Editar
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] w-full m-4">
        <div className="relative w-full overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
            &times;
          </button>
          <div className="pr-10">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Editar Usuário
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Atualize seus dados. Deixe a senha em branco para não alterá-la.
            </p>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="edit-username">Usuário</Label>
                <Input
                  id="edit-username"
                  name="username"
                  type="text"
                  value={editedUser.username || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editedUser.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Deixe em branco para manter a atual"
                    value={editedUser.password || ""}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeClosed className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label htmlFor="edit-institution">Instituição</Label>
                <Input
                  id="edit-institution"
                  name="institution"
                  type="text"
                  value={editedUser.institution || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-country">País</Label>
                <Input
                  id="edit-country"
                  name="country"
                  type="text"
                  value={editedUser.country || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-state">Estado</Label>
                <Input
                  id="edit-state"
                  name="state"
                  type="text"
                  value={editedUser.state || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  name="city"
                  type="text"
                  value={editedUser.city || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="flex items-center gap-3 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserInfoCard;
