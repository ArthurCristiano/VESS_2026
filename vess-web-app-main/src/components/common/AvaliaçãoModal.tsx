"use client";

import { useState, useEffect } from "react";
import { X, Star, MapPin, User, FileText, Loader, Layers, Hash } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type AmostraDetalhada = {
  id: number;
  nomeAmostra: string;
  localizacao: string;
  escoreQeVess?: number;
  descricaoManejo?: string;
  notaAmostra?: string;
  numeroCamadas?: number;
  ordemAmostra?: number;
};

type AvaliacaoCompleta = {
  id: number;
  nomeAvaliacao: string;
  dataInicio?: string;
  dataFim?: string;
  descricaoManejoLocal?: string;
  resumoAvaliacao?: string;
  avaliador?: string;
  informacoes?: string;
  status?: string;
  escoreMedioGeral?: number;
  amostras: AmostraDetalhada[];
};

type ModalProps = {
  avaliacaoId: number;
  onClose: () => void;
};

export default function AvaliacaoModal({ avaliacaoId, onClose }: ModalProps) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDetalhes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/avaliacao/${avaliacaoId}/completa`);
        if (!response.ok) throw new Error("Falha ao buscar detalhes da avaliação.");
        const data = await response.json();
        setAvaliacao(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetalhes();
  }, [avaliacaoId]);

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "from-gray-400 to-gray-500";
    if (score >= 1 && score <= 2.9) return "from-emerald-500 to-emerald-600";
    if (score >= 3 && score <= 4.4) return "from-yellow-400 to-yellow-500";
    if (score >= 4.5) return "from-red-500 to-red-500";
    return "from-gray-400 to-gray-500";
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl w-full h-[90vh] max-w-6xl overflow-hidden flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-emerald-400 rounded-full" />
            <h2 className="text-xl font-semibold text-white">
              {isLoading ? t("common.loading") : avaliacao?.nomeAvaliacao || t("modal.evaluationDetails")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            title={t("common.closeModal")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="animate-spin text-gray-600 dark:text-gray-300 mb-3" size={32} />
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t("modal.loadingInfo")}</p>
            </div>
          ) : avaliacao ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <User className="text-blue-600 dark:text-blue-300" size={16} />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{t("modal.evaluator")}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {avaliacao.avaliador || t("common.notInformed")}
                  </p>
                </div>

                <div className={`bg-gradient-to-br ${getScoreColor(avaliacao.escoreMedioGeral)} rounded-xl p-5 shadow-sm`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Star className="text-white" size={16} />
                    </div>
                    <h3 className="font-medium text-white text-sm">{t("modal.averageScore")}</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {avaliacao.escoreMedioGeral?.toFixed(2) ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileText className="text-gray-600 dark:text-gray-300" size={16} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("modal.evaluationInfo")}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.summary")}</p>
                    <p className="text-gray-700 dark:text-gray-300">{avaliacao.resumoAvaliacao || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.localManagement")}</p>
                    <p className="text-gray-700 dark:text-gray-300">{avaliacao.descricaoManejoLocal || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.status")}</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {avaliacao.status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <MapPin className="text-emerald-600 dark:text-emerald-400" size={16} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("modal.collectedSamples")}</h3>
                  <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400">
                    {avaliacao.amostras.length} {avaliacao.amostras.length === 1 ? t("modal.sampleSingular") : t("modal.samplePlural")}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {avaliacao.amostras.map((amostra) => (
                    <div
                      key={amostra.id}
                      className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-emerald-400/60 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-balance">{amostra.nomeAmostra}</h4>
                        {amostra.escoreQeVess !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                            <Star size={12} />
                            {amostra.escoreQeVess}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">{amostra.localizacao}</p>
                        </div>

                        {amostra.numeroCamadas !== undefined && (
                          <div className="flex items-center gap-2">
                            <Layers size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {amostra.numeroCamadas} {amostra.numeroCamadas === 1 ? t("modal.layerSingular") : t("modal.layerPlural")}
                            </p>
                          </div>
                        )}

                        {amostra.ordemAmostra !== undefined && (
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {t("modal.order", { order: amostra.ordemAmostra })}
                            </p>
                          </div>
                        )}

                        {amostra.descricaoManejo?.trim() && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.management")}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{amostra.descricaoManejo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400 text-center">{t("modal.loadError")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
