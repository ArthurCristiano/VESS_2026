"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Eye } from "lucide-react";
import api from "../../services/api";
import Modal from "../common/Modal";
import { useLanguage } from "../../context/LanguageContext";

interface Configuracao {
  id: number;
  nome: string;
  email: string;
  pais: string;
  cidadeEestado: string;
  dataCriacao: string;
}

export default function ConfiguracaoReport() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Configuracao | null>(null);
  const { t, locale } = useLanguage();

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/configuracao");
        setConfiguracoes(response.data);
      } catch (err) {
        setError(t("reports.configError"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfiguracoes();
  }, [t]);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("reports.configTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("reports.configSubtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  {t("common.name")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  {t("common.email")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  {t("common.country")}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  {t("reports.cityState")}
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
              {loading ? (
                <TableRow>
                  <TableCell className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {t("reports.loadingConfigs")}
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell className="px-4 py-6 text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : configuracoes.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {t("reports.noConfigs")}
                  </TableCell>
                </TableRow>
              ) : (
                configuracoes.map((config) => (
                  <TableRow key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate max-w-[180px]">
                      {config.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 truncate max-w-[220px]">
                      {config.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {config.pais}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {config.cidadeEestado}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(config.dataCriacao).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedConfig(config);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title={t("reports.viewDetails")}
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
          setSelectedConfig(null);
        }}
        title={selectedConfig ? t("reports.detailsFor", { name: selectedConfig.nome }) : t("reports.details")}
      >
        {selectedConfig && (
          <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
            <p><strong>ID:</strong> {selectedConfig.id}</p>
            <p><strong>{t("common.email")}:</strong> {selectedConfig.email}</p>
            <p><strong>{t("common.country")}:</strong> {selectedConfig.pais}</p>
            <p><strong>{t("reports.cityState")}:</strong> {selectedConfig.cidadeEestado}</p>
            <p>
              <strong>{t("common.creationDate")}:</strong>{" "}
              {new Date(selectedConfig.dataCriacao).toLocaleString(locale)}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
