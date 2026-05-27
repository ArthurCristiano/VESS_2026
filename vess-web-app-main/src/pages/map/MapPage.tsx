import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Filter, Loader, MapPin, BarChart3, Layers } from "lucide-react";
import AvaliacaoModal from "../../components/common/AvaliaçãoModal";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

type RegiaoResumo = {
  id: number;
  nome: string;
  tipo: string;
  corHex?: string;
};

type Regiao = RegiaoResumo & {
  ativa: boolean;
};

type AmostraResumo = {
  id: number;
  nomeAmostra: string;
  localizacao: string;
  avaliacao: {
    id: number;
    nomeAvaliacao: string;
    escoreMedioGeral?: number | null;
    status: "ATIVO" | "INATIVO";
    regiao?: RegiaoResumo | null;
  };
};

const getScoreColor = (score?: number | null) => {
  if (score == null || Number.isNaN(score)) return "#6B7280";
  if (score <= 1.5) return "#16A34A";
  if (score <= 2.5) return "#84CC16";
  if (score <= 3.5) return "#FACC15";
  if (score <= 4.5) return "#F97316";
  return "#DC2626";
};

const createScoreIcon = (score?: number | null) => {
  const color = getScoreColor(score);
  const label = score == null || Number.isNaN(score) ? "-" : score.toFixed(1);

  return L.divIcon({
    className: "vess-score-marker",
    html: `
      <div class="vess-score-pin" style="background:${color}">
        <span>${label}</span>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 46],
    popupAnchor: [0, -42],
  });
};

const parseLocation = (localizacao: string): [number, number] | null => {
  const parts = localizacao.split(",");
  if (parts.length !== 2) return null;

  const lat = Number.parseFloat(parts[0].trim());
  const lon = Number.parseFloat(parts[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  return [lat, lon];
};

export default function MapPage() {
  const [amostrasResumo, setAmostrasResumo] = useState<AmostraResumo[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [selectedRegiaoId, setSelectedRegiaoId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<number | null>(null);

  const { logoutUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const [amostrasResponse, regioesResponse] = await Promise.all([
          api.get<AmostraResumo[]>("/amostra/resumo-mapa"),
          api.get<Regiao[]>("/regioes/ativas"),
        ]);
        setAmostrasResumo(amostrasResponse.data);
        setRegioes(regioesResponse.data);
      } catch (error) {
        setLoadError(true);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logoutUser();
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [logoutUser]);

  const filteredAmostras = useMemo(() => {
    return amostrasResumo.filter((amostra) => {
      if (amostra.avaliacao?.status !== "ATIVO") return false;
      if (!selectedRegiaoId) return true;
      return String(amostra.avaliacao?.regiao?.id ?? "") === selectedRegiaoId;
    });
  }, [amostrasResumo, selectedRegiaoId]);

  const markers = useMemo(() => {
    return filteredAmostras
        .map((amostra) => {
          const position = parseLocation(amostra.localizacao);
          return position ? { amostra, position } : null;
        })
        .filter((item): item is { amostra: AmostraResumo; position: [number, number] } => Boolean(item));
  }, [filteredAmostras]);

  const center: [number, number] = markers[0]?.position ?? [-26.229, -52.671];
  const zoom = markers.length > 0 ? 12 : 13;

  if (isLoading) {
    return (
        <div className="w-full h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
          <Loader className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg">{t("map.loading")}</p>
        </div>
    );
  }

  return (
      <div className="w-full h-[calc(100vh-6rem)] flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t("map.title")}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {markers.length} {t("map.visibleEvaluations")}
            </p>
          </div>

          <label className="flex w-full flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 sm:max-w-xs">
          <span className="flex items-center gap-2">
            <Filter size={16} />
            {t("map.regionFilter")}
          </span>
            <select
                value={selectedRegiaoId}
                onChange={(event) => setSelectedRegiaoId(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">{t("map.allRegions")}</option>
              {regioes.map((regiao) => (
                  <option key={regiao.id} value={regiao.id}>
                    {regiao.nome}
                  </option>
              ))}
            </select>
          </label>
        </div>

        {loadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {t("map.loadError")}
            </div>
        )}

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-[1]">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {markers.map(({ amostra, position }) => {
              const escoreGeral = amostra.avaliacao?.escoreMedioGeral;
              const cardColor = getScoreColor(escoreGeral);

              return (
                  <Marker
                      key={amostra.id}
                      position={position}
                      icon={createScoreIcon(escoreGeral)}
                  >
                    <Popup offset={[0, -10]} maxWidth={320}>
                      <div className="text-gray-800 p-1">
                        {/* Cabeçalho do Popup com identificação clara da Avaliação */}
                        <p className="font-bold text-gray-900 text-base mb-3 leading-tight border-b border-gray-100 pb-2 flex items-center gap-1.5">
                          <Layers size={16} className="text-gray-500" />
                          {amostra.avaliacao?.nomeAvaliacao ?? t("map.unnamedEvaluation")}
                        </p>

                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {t("map.sample")}: <span className="font-normal text-gray-700">{amostra.nomeAmostra}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{amostra.localizacao}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-blue-600 flex-shrink-0" />
                            <div className="font-medium text-gray-900">
                              {t("map.score")}:{" "}
                              <span
                                  className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-bold rounded-md text-white shadow-xs"
                                  style={{ backgroundColor: cardColor }}
                              >
                            {escoreGeral != null ? escoreGeral.toFixed(1) : t("common.notInformed")}
                          </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-0.5">
                            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: amostra.avaliacao?.regiao?.corHex ?? '#CBD5E1' }} />
                            <div className="font-medium text-gray-900">
                              {t("map.region")}:{" "}
                              <span className="font-normal text-gray-700">
                            {amostra.avaliacao?.regiao?.nome ?? t("common.notInformed")}
                          </span>
                            </div>
                          </div>
                        </div>

                        <button
                            onClick={() => setSelectedAvaliacaoId(amostra.avaliacao.id)}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs hover:shadow-md active:scale-98 text-xs cursor-pointer"
                        >
                          {t("map.viewDetails")}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
              );
            })}
          </MapContainer>

          {!loadError && markers.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  {t("map.noEvaluations")}
                </div>
              </div>
          )}
        </div>

        {selectedAvaliacaoId && (
            <AvaliacaoModal avaliacaoId={selectedAvaliacaoId} onClose={() => setSelectedAvaliacaoId(null)} />
        )}

        <style>{`
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 2 !important;
        }
        .leaflet-popup {
          z-index: 3 !important;
        }
        .vess-score-marker {
          background: transparent;
          border: 0;
        }
        .vess-score-pin {
          align-items: center;
          border: 2px solid #ffffff;
          border-radius: 999px 999px 999px 4px;
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.28);
          color: #ffffff;
          display: flex;
          font-size: 12px;
          font-weight: 700;
          height: 34px;
          justify-content: center;
          transform: rotate(-45deg);
          width: 34px;
        }
        .vess-score-pin span {
          transform: rotate(45deg);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 6px;
        }
      `}</style>
      </div>
  );
}