"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Eye } from "lucide-react";
import AvaliacaoModal from "../common/AvaliaçãoModal";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

interface AvaliacaoReport {
  id: number;
  nomeAvaliacao: string;
  avaliador: string;
  totalAmostras: number;
  escoreMedioGeral: number | null;
  dataCriacao: string;
}

export default function LocationReport() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<number | null>(null);
  const { logoutUser } = useAuth();
  const { t, locale } = useLanguage();

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/avaliacao");
        const data = response.data;

        const mappedData: AvaliacaoReport[] = data.map((a: any) => ({
          id: a.id,
          nomeAvaliacao: a.nomeAvaliacao ?? t("common.noName"),
          avaliador: a.avaliador ?? t("common.notInformed"),
          totalAmostras: a.totalAmostras ?? 0,
          escoreMedioGeral: a.escoreMedioGeral ?? null,
          dataCriacao: a.dataCriacao ? new Date(a.dataCriacao).toLocaleDateString(locale) : "-",
        }));

        setAvaliacoes(mappedData);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
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
            {t("reports.evaluationsTitle")}
          </h3>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("reports.evaluationName")}
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("reports.evaluator")}
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("reports.totalSamples")}
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("reports.averageScore")}
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("common.creationDate")}
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {t("common.view")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  {t("reports.loadingEvaluations")}
                </TableCell>
              </TableRow>
            ) : avaliacoes.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  {t("reports.noEvaluations")}
                </TableCell>
              </TableRow>
            ) : (
              avaliacoes.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {report.nomeAvaliacao}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {report.avaliador}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {report.totalAmostras}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {report.escoreMedioGeral ?? "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {report.dataCriacao}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => setAvaliacaoSelecionada(report.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={t("reports.viewEvaluation")}
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

      {avaliacaoSelecionada && (
        <AvaliacaoModal avaliacaoId={avaliacaoSelecionada} onClose={() => setAvaliacaoSelecionada(null)} />
      )}
    </div>
  );
}
