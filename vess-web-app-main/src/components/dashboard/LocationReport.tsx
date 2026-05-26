"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, UserX } from "lucide-react";
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
    status?: string | null;
    regiao?: RegiaoResumo | null;
}

interface AvaliacaoReport {
    id: number;
    nomeAvaliacao: string;
    avaliador: string;
    totalAmostras: number;
    escoreMedioGeral: number | null;
    dataCriacao: string;
    status: string;
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
    if (score === null) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }

    if (score <= 1.5) {
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    }

    if (score <= 2.5) {
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    }

    if (score <= 3.5) {
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    }

    if (score <= 4.5) {
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    }

    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

function formatScore(score: number | null) {
    if (score === null) return "-";
    return Number(score).toFixed(1);
}

export default function LocationReport() {
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<number | null>(null);
    const { logoutUser } = useAuth();
    const { t, locale } = useLanguage();

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.get<AvaliacaoApiResponse[]>("/avaliacao");
                const data = response.data;

                const mappedData: AvaliacaoReport[] = data.map((avaliacao) => ({
                    id: avaliacao.id,
                    nomeAvaliacao: avaliacao.nomeAvaliacao ?? t("common.noName"),
                    avaliador: avaliacao.avaliador ?? t("common.notInformed"),
                    totalAmostras: avaliacao.totalAmostras ?? 0,
                    escoreMedioGeral: avaliacao.escoreMedioGeral ?? null,
                    dataCriacao: avaliacao.dataCriacao
                        ? new Date(avaliacao.dataCriacao).toLocaleDateString(locale)
                        : "-",
                    status: avaliacao.status ?? "",
                    regiao: avaliacao.regiao ?? null,
                }));

                setAvaliacoes(mappedData);
            } catch (err) {
                console.error("Erro ao buscar avaliações:", err);
                setError("Falha ao carregar a lista de avaliações.");

                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    logoutUser();
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvaliacoes();
    }, [logoutUser, locale, t]);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Lista de avaliações
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Consulte rapidamente as principais informações das avaliações cadastradas.
                    </p>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table className="w-full min-w-[1180px]">
                    <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                ID
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                {t("reports.evaluationName")}
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                {t("reports.evaluator")}
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                Região
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                {t("reports.totalSamples")}
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                {t("reports.averageScore")}
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                {t("common.creationDate")}
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-4 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                            >
                                Ações
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                                >
                                    {t("reports.loadingEvaluations")}
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={9} className="px-4 py-10 text-center text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : avaliacoes.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                                >
                                    {t("reports.noEvaluations")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            avaliacoes.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                        #{report.id}
                                    </TableCell>

                                    <TableCell className="max-w-[240px] px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                        {report.nomeAvaliacao}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.avaliador}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.regiao ? (
                                            <div className="flex items-center gap-2">
                                                {report.regiao.corHex && (
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full border border-gray-200 dark:border-gray-700"
                                                        style={{ backgroundColor: report.regiao.corHex }}
                                                    />
                                                )}
                                                <span>{report.regiao.nome}</span>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.totalAmostras}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-theme-sm">
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClass(
                            report.escoreMedioGeral
                        )}`}
                    >
                      {formatScore(report.escoreMedioGeral)}
                    </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-theme-sm">
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                            report.status
                        )}`}
                    >
                      {formatStatus(report.status)}
                    </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.dataCriacao}
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setAvaliacaoSelecionada(report.id)}
                                                className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title={t("reports.viewEvaluation")}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 opacity-50 dark:text-blue-400"
                                                title="Ação será implementada em outra task"
                                            >
                                                <Pencil size={15} />
                                                Gerenciar
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 opacity-50 dark:text-red-400"
                                                title="Ação será implementada em outra task"
                                            >
                                                <UserX size={15} />
                                                Inativar
                                            </button>
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
                    avaliacaoId={avaliacaoSelecionada}
                    onClose={() => setAvaliacaoSelecionada(null)}
                />
            )}
        </div>
    );
}