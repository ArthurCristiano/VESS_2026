import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { useRoles } from "../hooks/useRoles";

export default function ForbiddenPage() {
    const navigate = useNavigate();
    const { role } = useRoles();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <ShieldOff size={40} className="text-red-500 dark:text-red-400" />
                    </div>
                </div>

                <p className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-2 select-none">
                    403
                </p>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-3">
                    Acesso negado
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Você não tem permissão para acessar esta página.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    Perfil atual:{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
            {role === "ADMINISTRADOR"
                ? "Administrador"
                : role === "PESQUISADOR"
                    ? "Pesquisador"
                    : "Visitante"}
          </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </button>
                    <Link
                        to="/mapa"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home size={16} />
                        Ir para o início
                    </Link>
                </div>
            </div>
        </div>
    );
}