"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import axios from "axios";
import { User } from "../../services/AuthService";

export default function UserInfoCard() {
  const { user, updateUserContext, loading: authLoading } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  useEffect(() => {
    if (user && isOpen) {
      setEditedUser({
        username: user.username || "",
        email: user.email || "",
        password: "",
        institution: user.institution || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await api.put("/users/me", editedUser);
      updateUserContext(response.data);
      closeModal();
    } catch (err: any) {
      let finalErrorMessage = "Não foi possível salvar as alterações. Tente novamente.";
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") finalErrorMessage = errorData;
        else if (typeof errorData === "object" && errorData.message) finalErrorMessage = errorData.message;
        else if (typeof errorData === "object" && errorData.errors && Array.isArray(errorData.errors)) {
          finalErrorMessage = errorData.errors.map((e: any) => e.defaultMessage || e.message || "Erro de validação").join("; ");
        } else if (err.response?.status === 404) {
          finalErrorMessage = "Endpoint de atualização não encontrado no servidor.";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          finalErrorMessage = "Você não tem permissão para realizar esta ação.";
        }
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
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
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
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Deixe em branco para manter a atual"
                  value={editedUser.password || ""}
                  onChange={handleInputChange}
                />
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
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
