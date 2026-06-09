"use client";

import { FormEvent, useEffect, useState } from "react";
import { X, Star, MapPin, User, FileText, Loader, Layers, Hash, ImageOff } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import axios from "axios";

type AmostraDetalhada = {
  id: number;
  nomeAmostra: string;
  localizacao: string;
  escoreQeVess?: number;
  descricaoManejo?: string;
  notaAmostra?: string;
  numeroCamadas?: number;
  ordemAmostra?: number;
  imagemUrl?: string | null;
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
  status?: "ATIVO" | "INATIVO" | string;
  escoreMedioGeral?: number;
  regiao?: { id: number; nome?: string } | null;
  amostras: AmostraDetalhada[];
};

type ModalProps = {
  avaliacaoId: number;
  mode: "view" | "edit";
  onClose: () => void;
  onSuccess?: () => void;
};

type Feedback = { type: "success" | "error"; message: string } | null;

type SampleImageProps = {
  src?: string | null;
  alt: string;
  unavailableLabel: string;
};

function SampleImage({ src, alt, unavailableLabel }: SampleImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const normalizedSrc = src?.trim() || null;

  if (!normalizedSrc || failedSrc === normalizedSrc) {
    return (
      <div
        className="aspect-video w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500"
        role="img"
        aria-label={`${alt}: ${unavailableLabel}`}
      >
        <ImageOff size={28} />
        <span className="text-xs font-medium">{unavailableLabel}</span>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      <img
        src={normalizedSrc}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailedSrc(normalizedSrc)}
      />
    </div>
  );
}

export default function AvaliacaoModal({ avaliacaoId, mode, onClose, onSuccess }: ModalProps) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.admin === true || user?.profile === "ADMINISTRADOR";
  const isReadOnly = mode === "view" || !isAdmin;

  useEffect(() => {
    const fetchDetalhes = async () => {
      setIsLoading(true);
      setFeedback(null);
      try {
        const response = await api.get(`/avaliacao/${avaliacaoId}/completa`);
        setAvaliacao(response.data);
      } catch (error) {
        setFeedback({ type: "error", message: "Erro ao carregar detalhes da avaliação." });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetalhes();
  }, [avaliacaoId]);

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "from-gray-400 to-gray-500";
    if (score >= 1 && score <= 2.9) return "from-emerald-500 to-emerald-600";
    if (score >= 3 && score <= 4.4) return "from-yellow-400 to-yellow-500";
    if (score >= 4.5) return "from-red-500 to-red-500";
    return "from-gray-400 to-gray-500";
  };

  const statusLabel = avaliacao?.status === "INATIVO" ? "Avaliação inativa" : "Avaliação ativa";
  const statusBadgeClass =
    avaliacao?.status === "INATIVO"
      ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";

  const updateField = (field: keyof AvaliacaoCompleta, value: string) => {
    setAvaliacao((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!avaliacao) return;

    try {
      setIsSaving(true);
      setFeedback(null);
      await api.put(`/avaliacao/${avaliacao.id}`, {
        nomeAvaliacao: avaliacao.nomeAvaliacao ?? null,
        dataInicio: avaliacao.dataInicio ?? null,
        dataFim: avaliacao.dataFim ?? null,
        resumoAvaliacao: avaliacao.resumoAvaliacao ?? null,
        descricaoManejoLocal: avaliacao.descricaoManejoLocal ?? null,
        avaliador: avaliacao.avaliador ?? null,
        informacoes: avaliacao.informacoes ?? null,
        regiaoId: avaliacao.regiao?.id ?? null,
      });
      setFeedback({ type: "success", message: "Sucesso ao editar avaliação." });
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.mensagem ?? error.response?.data?.message
        : null;
      setFeedback({ type: "error", message: message || "Erro ao editar avaliação." });
    } finally {
      setIsSaving(false);
    }
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
              {isLoading
                ? t("common.loading")
                : mode === "edit"
                ? "Editar avaliação"
                : avaliacao?.nomeAvaliacao || t("modal.evaluationDetails")}
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
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {feedback && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    feedback.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <User className="text-blue-600 dark:text-blue-300" size={16} />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{t("modal.evaluator")}</h3>
                  </div>
                  {isReadOnly ? (
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {avaliacao.avaliador || t("common.notInformed")}
                    </p>
                  ) : (
                    <input
                      value={avaliacao.avaliador ?? ""}
                      onChange={(e) => updateField("avaliador", e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  )}
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
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      {t("reports.evaluationName")}
                    </p>
                    {isReadOnly ? (
                      <p className="text-gray-700 dark:text-gray-300">{avaliacao.nomeAvaliacao || "-"}</p>
                    ) : (
                      <input
                        value={avaliacao.nomeAvaliacao ?? ""}
                        onChange={(e) => updateField("nomeAvaliacao", e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.summary")}</p>
                    {isReadOnly ? (
                      <p className="text-gray-700 dark:text-gray-300">{avaliacao.resumoAvaliacao || "-"}</p>
                    ) : (
                      <textarea
                        rows={3}
                        value={avaliacao.resumoAvaliacao ?? ""}
                        onChange={(e) => updateField("resumoAvaliacao", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.localManagement")}</p>
                    {isReadOnly ? (
                      <p className="text-gray-700 dark:text-gray-300">{avaliacao.descricaoManejoLocal || "-"}</p>
                    ) : (
                      <textarea
                        rows={3}
                        value={avaliacao.descricaoManejoLocal ?? ""}
                        onChange={(e) => updateField("descricaoManejoLocal", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Informações</p>
                    {isReadOnly ? (
                      <p className="text-gray-700 dark:text-gray-300">{avaliacao.informacoes || "-"}</p>
                    ) : (
                      <textarea
                        rows={3}
                        value={avaliacao.informacoes ?? ""}
                        onChange={(e) => updateField("informacoes", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t("modal.status")}</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
                      {statusLabel}
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
                      className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md hover:border-emerald-400/60 transition-all duration-200"
                    >
                      <SampleImage
                        src={amostra.imagemUrl}
                        alt={amostra.nomeAmostra}
                        unavailableLabel={t("modal.imageUnavailable")}
                      />

                      <div className="p-5">
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

                          {amostra.notaAmostra?.trim() && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Nota</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{amostra.notaAmostra}</p>
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
                    </div>
                  ))}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSaving ? t("common.saving") : "Salvar"}
                  </button>
                </div>
              )}
            </form>
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
