"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import AvaliacaoModal from "../common/AvaliaçãoModal";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

interface RegiaoResumo {
    id: number;
    nome: string;
    tipo?: string;
    corHex?: string;
}

interface AvaliacaoApiResponse {
    id: number;
    nomeAvaliacao?: string | null;
    avaliador?: string | null;
    totalAmostras?: number | null;
    escoreMedioGeral?: number | null;
    dataCriacao?: string | null;
    status?: "ATIVO" | "INATIVO" | string | null;
    regiao?: RegiaoResumo | null;
}

interface AvaliacaoReport {
    id: number;
    nomeAvaliacao: string;
    avaliador: string;
    totalAmostras: number;
    escoreMedioGeral: number | null;
    dataCriacao: string;
    status: "ATIVO" | "INATIVO";
    regiao: RegiaoResumo | null;
}

function formatStatus(status: string) {
    if (status === "ATIVO") return "Ativo";
    if (status === "INATIVO") return "Inativo";
    return "Não informado";
}

function getStatusBadgeClass(status: string) {
    if (status === "ATIVO") {
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    }

    if (status === "INATIVO") {
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    }

    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

function getScoreBadgeClass(score: number | null) {
    if (score === null) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    if (score <= 1.5) return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    if (score <= 2.5) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (score <= 3.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (score <= 4.5) return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

function formatScore(score: number | null) {
    if (score === null) return "-";
    return Number(score).toFixed(1);
}

type Feedback = { type: "success" | "error"; message: string } | null;

export default function LocationReport() {
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<{ id: number; mode: "view" | "edit" } | null>(null);
    const { logoutUser, user } = useAuth();
    const { t, locale } = useLanguage();
    const isAdmin = user?.admin === true || user?.profile === "ADMINISTRADOR";

    const fetchAvaliacoes = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<AvaliacaoApiResponse[]>("/avaliacao");
            const mappedData: AvaliacaoReport[] = response.data.map((avaliacao) => ({
                id: avaliacao.id,
                nomeAvaliacao: avaliacao.nomeAvaliacao ?? t("common.noName"),
                avaliador: avaliacao.avaliador ?? t("common.notInformed"),
                totalAmostras: avaliacao.totalAmostras ?? 0,
                escoreMedioGeral: avaliacao.escoreMedioGeral ?? null,
                dataCriacao: avaliacao.dataCriacao ? new Date(avaliacao.dataCriacao).toLocaleDateString(locale) : "-",
                status: avaliacao.status === "INATIVO" ? "INATIVO" : "ATIVO",
                regiao: avaliacao.regiao ?? null,
            }));

            setAvaliacoes(mappedData);
        } catch (err) {
            console.error("Erro ao buscar avaliações:", err);
            setError(t("reports.evaluationsError"));
            if (axios.isAxiosError(err) && err.response?.status === 401) logoutUser();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchAvaliacoes();
    }, [locale, t]);

    const handleToggleStatus = async (avaliacao: AvaliacaoReport) => {
        if (!isAdmin) {
            setFeedback({ type: "error", message: "Sem permissão para executar esta ação." });
            return;
        }

        const inativar = avaliacao.status === "ATIVO";
        const confirmed = window.confirm(inativar ? "Confirmação de inativação" : "Confirmação de reativação");
        if (!confirmed) return;

        try {
            setActionLoadingId(avaliacao.id);
            setFeedback(null);
            await api.patch(`/avaliacao/${avaliacao.id}/${inativar ? "inativar" : "reativar"}`);
            setFeedback({
                type: "success",
                message: inativar ? "Sucesso ao inativar avaliação." : "Sucesso ao reativar avaliação.",
            });
            await fetchAvaliacoes();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data?.mensagem ?? err.response?.data?.message) : null;
            setFeedback({
                type: "error",
                message:
                    msg ||
                    (inativar
                        ? "Erro ao inativar avaliação."
                        : "Erro ao reativar avaliação."),
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Lista de avaliações</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Consulte rapidamente as principais informações das avaliações cadastradas.
                    </p>
                </div>
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
                <Table className="w-full min-w-[1180px]">
                    <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">{t("reports.evaluationName")}</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">{t("reports.evaluator")}</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">Região</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400">{t("reports.totalSamples")}</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">{t("reports.averageScore")}</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">{t("common.creationDate")}</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ações</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">{t("reports.loadingEvaluations")}</TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={9} className="px-4 py-10 text-center text-red-500">{error}</TableCell>
                            </TableRow>
                        ) : avaliacoes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">{t("reports.noEvaluations")}</TableCell>
                            </TableRow>
                        ) : (
                            avaliacoes.map((report) => (
                                <TableRow key={report.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">#{report.id}</TableCell>
                                    <TableCell className="max-w-[240px] px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">{report.nomeAvaliacao}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{report.avaliador}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.regiao ? (
                                            <div className="flex items-center gap-2">
                                                {report.regiao.corHex && <span className="h-2.5 w-2.5 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: report.regiao.corHex }} />}
                                                <span>{report.regiao.nome}</span>
                                            </div>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">{report.totalAmostras}</TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClass(report.escoreMedioGeral)}`}>{formatScore(report.escoreMedioGeral)}</span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-theme-sm">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(report.status)}`}>{formatStatus(report.status)}</span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{report.dataCriacao}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setAvaliacaoSelecionada({ id: report.id, mode: "view" })}
                                                className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title={t("reports.viewEvaluation")}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAvaliacaoSelecionada({ id: report.id, mode: "edit" })}
                                                    className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Editar avaliação"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            )}

                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleToggleStatus(report)}
                                                    disabled={actionLoadingId === report.id}
                                                    className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    title={report.status === "ATIVO" ? "Inativar avaliação" : "Reativar avaliação"}
                                                >
                                                    {report.status === "ATIVO" ? "Inativar" : "Reativar"}
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {avaliacaoSelecionada && (
                <AvaliacaoModal
                    avaliacaoId={avaliacaoSelecionada.id}
                    mode={avaliacaoSelecionada.mode}
                    onClose={() => setAvaliacaoSelecionada(null)}
                    onSuccess={() => void fetchAvaliacoes()}
                />
            )}
        </div>
    );
}
