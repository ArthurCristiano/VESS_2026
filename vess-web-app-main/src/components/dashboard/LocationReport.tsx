"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import AvaliacaoModal from "../common/AvaliaçãoModal";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

type RegiaoResumo = {
    id: number;
    nome: string;
    tipo?: string;
    corHex?: string;
};

type AvaliacaoApiResponse = {
    id: number;
    nomeAvaliacao?: string | null;
    resumoAvaliacao?: string | null;
    avaliador?: string | null;
    totalAmostras?: number | null;
    escoreMedioGeral?: number | null;
    dataCriacao?: string | null;
    status?: "ATIVO" | "INATIVO" | string | null;
    regiao?: RegiaoResumo | null;
};

type AvaliacaoReport = {
    id: number;
    nomeAvaliacao: string;
    resumoAvaliacao: string;
    avaliador: string;
    totalAmostras: number;
    escoreMedioGeral: number | null;
    dataCriacao: string;
    dataCriacaoRaw: string | null;
    status: "ATIVO" | "INATIVO";
    regiao: RegiaoResumo | null;
};

type Feedback = { type: "success" | "error"; message: string } | null;

type Filters = {
    date: string;
    evaluator: string;
    region: string;
};

type SelectOption = {
    value: string;
    label: string;
};

const PAGE_SIZE = 8;

const controlClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";

function formatStatus(status: string, t: ReturnType<typeof useLanguage>["t"]) {
    if (status === "ATIVO") return t("status.active");
    if (status === "INATIVO") return t("status.inactive");
    return t("common.notInformed");
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
    if (score >= 1 && score <= 2.9) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (score >= 3 && score <= 4.4) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (score >= 4.5 && score <= 5) return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

function formatScore(score: number | null) {
    if (score === null) return "-";
    return Number(score).toFixed(1);
}

function getDateKey(dateTime?: string | null) {
    if (!dateTime) return "";
    return dateTime.slice(0, 10);
}

function normalizeFilterValue(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

export default function LocationReport() {
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<{ id: number; mode: "view" | "edit" } | null>(null);
    const [filters, setFilters] = useState<Filters>({
        date: "",
        evaluator: "",
        region: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const { logoutUser, user } = useAuth();
    const { t, locale } = useLanguage();
    const isAdmin = user?.admin === true || user?.profile === "ADMINISTRADOR";

    const fetchAvaliacoes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<AvaliacaoApiResponse[]>("/avaliacao");
            const mappedData: AvaliacaoReport[] = response.data.map((avaliacao) => ({
                id: avaliacao.id,
                nomeAvaliacao: avaliacao.nomeAvaliacao ?? t("common.noName"),
                resumoAvaliacao: avaliacao.resumoAvaliacao ?? "",
                avaliador: avaliacao.avaliador ?? "",
                totalAmostras: avaliacao.totalAmostras ?? 0,
                escoreMedioGeral: avaliacao.escoreMedioGeral ?? null,
                dataCriacaoRaw: avaliacao.dataCriacao ?? null,
                dataCriacao: avaliacao.dataCriacao ? new Date(avaliacao.dataCriacao).toLocaleDateString(locale) : "-",
                status: avaliacao.status === "INATIVO" ? "INATIVO" : "ATIVO",
                regiao: avaliacao.regiao ?? null,
            }));

            setAvaliacoes(mappedData);
        } catch (err) {
            console.error("Erro ao buscar avaliacoes:", err);
            setError(t("reports.evaluationsError"));
            if (axios.isAxiosError(err) && err.response?.status === 401) logoutUser();
        } finally {
            setIsLoading(false);
        }
    }, [locale, logoutUser, t]);

    useEffect(() => {
        void fetchAvaliacoes();
    }, [fetchAvaliacoes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters.date, filters.evaluator, filters.region]);

    const evaluatorOptions = useMemo<SelectOption[]>(() => {
        const options = new Map<string, string>();

        avaliacoes.forEach((avaliacao) => {
            const value = normalizeFilterValue(avaliacao.avaliador);
            if (!value) return;
            options.set(value, avaliacao.avaliador.trim());
        });

        return Array.from(options.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, locale));
    }, [avaliacoes, locale]);

    const regionOptions = useMemo<SelectOption[]>(() => {
        const options = new Map<string, string>();

        avaliacoes.forEach((avaliacao) => {
            if (!avaliacao.regiao) return;
            options.set(String(avaliacao.regiao.id), avaliacao.regiao.nome);
        });

        return Array.from(options.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, locale));
    }, [avaliacoes, locale]);

    const filteredAvaliacoes = useMemo(() => {
        return avaliacoes.filter((avaliacao) => {
            if (filters.date && getDateKey(avaliacao.dataCriacaoRaw) !== filters.date) {
                return false;
            }

            if (filters.evaluator && normalizeFilterValue(avaliacao.avaliador) !== filters.evaluator) {
                return false;
            }

            if (filters.region && String(avaliacao.regiao?.id ?? "") !== filters.region) {
                return false;
            }

            return true;
        });
    }, [avaliacoes, filters]);

    const totalFiltered = filteredAvaliacoes.length;
    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

    useEffect(() => {
        if (totalPages === 0) {
            if (currentPage !== 1) {
                setCurrentPage(1);
            }
            return;
        }

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedAvaliacoes = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredAvaliacoes.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage, filteredAvaliacoes]);

    const currentRangeStart = totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const currentRangeEnd = totalFiltered === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalFiltered);
    const hasActiveFilters = Boolean(filters.date || filters.evaluator || filters.region);

    const handleToggleStatus = async (avaliacao: AvaliacaoReport) => {
        if (!isAdmin) {
            setFeedback({ type: "error", message: "Sem permissao para executar esta acao." });
            return;
        }

        const inativar = avaliacao.status === "ATIVO";
        const confirmed = window.confirm(
            inativar ? "Confirmacao de inativacao" : "Confirmacao de reativacao"
        );

        if (!confirmed) return;

        try {
            setActionLoadingId(avaliacao.id);
            setFeedback(null);
            await api.patch(`/avaliacao/${avaliacao.id}/${inativar ? "inativar" : "reativar"}`);
            setFeedback({
                type: "success",
                message: inativar ? "Sucesso ao inativar avaliacao." : "Sucesso ao reativar avaliacao.",
            });
            await fetchAvaliacoes();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data?.mensagem ?? err.response?.data?.message) : null;
            setFeedback({
                type: "error",
                message: msg || (inativar ? "Erro ao inativar avaliacao." : "Erro ao reativar avaliacao."),
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    const updateFilter = (field: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({
            date: "",
            evaluator: "",
            region: "",
        });
    };

    const emptyMessage = hasActiveFilters ? t("reports.noFilteredEvaluations") : t("reports.noEvaluations");

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("reports.evaluationsTitle")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Consulte rapidamente as principais informacoes das avaliacoes cadastradas.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void fetchAvaliacoes()}
                    disabled={isLoading || actionLoadingId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    {t("common.refresh")}
                </button>
            </div>

            <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {t("reports.filtersTitle")}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("reports.filtersDescription")}
                        </p>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("reports.filteredCount", { count: totalFiltered })}
                    </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-4">
                    <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("reports.filterDate")}
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(event) => updateFilter("date", event.target.value)}
                            className={controlClass}
                        />
                    </label>

                    <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("reports.filterEvaluator")}
                        <select
                            value={filters.evaluator}
                            onChange={(event) => updateFilter("evaluator", event.target.value)}
                            className={controlClass}
                        >
                            <option value="">{t("common.all")}</option>
                            {evaluatorOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("reports.filterRegion")}
                        <select
                            value={filters.region}
                            onChange={(event) => updateFilter("region", event.target.value)}
                            className={controlClass}
                        >
                            <option value="">{t("common.all")}</option>
                            {regionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t("reports.clearFilters")}
                        </button>
                    </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {t("reports.pageInfo", { current: currentPage, total: Math.max(totalPages, 1) })}
                    </span>
                    <span>
                        {totalFiltered === 0 ? emptyMessage : `${currentRangeStart}-${currentRangeEnd} / ${totalFiltered}`}
                    </span>
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
                <Table className="w-full min-w-[1500px]">
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
                                {t("reports.summary")}
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
                                {t("reports.region")}
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
                                {t("adminUsers.status")}
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
                                {t("adminUsers.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                    {t("reports.loadingEvaluations")}
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={10} className="px-4 py-10 text-center text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : totalFiltered === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedAvaliacoes.map((report) => (
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
                                    <TableCell className="max-w-[320px] px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <span
                                            className="block max-w-[320px] truncate"
                                            title={report.resumoAvaliacao || "-"}
                                        >
                                            {report.resumoAvaliacao || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.avaliador || t("common.notInformed")}
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
                                            {formatStatus(report.status, t)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {report.dataCriacao}
                                    </TableCell>
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
                                                    title={t("common.edit")}
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
                                                    title={report.status === "ATIVO" ? "Inativar avaliacao" : "Reativar avaliacao"}
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

            {!isLoading && !error && totalFiltered > 0 && totalPages > 1 && (
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("reports.pageInfo", { current: currentPage, total: totalPages })}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft size={16} />
                            {t("reports.previousPage")}
                        </button>

                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t("reports.nextPage")}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

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
