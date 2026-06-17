import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import L from "leaflet";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    ChevronRight,
    Filter,
    Layers,
    Loader,
    LocateFixed,
    MapPin,
} from "lucide-react";
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

type UserLocation = {
    latitude: number;
    longitude: number;
};

const TAMANHO_LOTE_INICIAL = 100;
const LIMITE_CARREGAR_TODAS = 10000;
const OPCOES_LIMITE = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const RAIO_PROXIMIDADE_GRAUS = 0.25;

const scoreIconCache = new Map<string, L.DivIcon>();

const getScoreColor = (score?: number | null) => {
    if (score == null || Number.isNaN(score)) return "#6B7280";
    if (score >= 1 && score <= 2.9) return "#16A34A";
    if (score >= 3 && score <= 4.4) return "#FACC15";
    if (score >= 4.5 && score <= 5) return "#DC2626";
    return "#6B7280";
};

const createScoreIcon = (score?: number | null) => {
    const color = getScoreColor(score);
    const label = score == null || Number.isNaN(score) ? "-" : score.toFixed(1);
    const cacheKey = `${color}-${label}`;

    const cachedIcon = scoreIconCache.get(cacheKey);

    if (cachedIcon) {
        return cachedIcon;
    }

    const icon = L.divIcon({
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

    scoreIconCache.set(cacheKey, icon);

    return icon;
};

const userLocationIcon = L.divIcon({
    className: "vess-user-location-marker",
    html: `
    <div class="vess-user-location-pin">
      <div></div>
    </div>
  `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();

    let size = 42;
    let className = "custom-marker-cluster small";

    if (count >= 10 && count < 50) {
        size = 48;
        className = "custom-marker-cluster medium";
    } else if (count >= 50) {
        size = 56;
        className = "custom-marker-cluster large";
    }

    return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className,
        iconSize: L.point(size, size, true),
    });
};

const parseLocation = (localizacao: string): [number, number] | null => {
    const parts = localizacao.split(",");

    if (parts.length !== 2) {
        return null;
    }

    const lat = Number.parseFloat(parts[0].trim());
    const lon = Number.parseFloat(parts[1].trim());

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
    }

    return [lat, lon];
};

const calcularBoundingBox = (location: UserLocation) => ({
    minLat: location.latitude - RAIO_PROXIMIDADE_GRAUS,
    maxLat: location.latitude + RAIO_PROXIMIDADE_GRAUS,
    minLon: location.longitude - RAIO_PROXIMIDADE_GRAUS,
    maxLon: location.longitude + RAIO_PROXIMIDADE_GRAUS,
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();

        const mudouCentro =
            Math.abs(currentCenter.lat - center[0]) > 0.0001 ||
            Math.abs(currentCenter.lng - center[1]) > 0.0001;

        const mudouZoom = currentZoom !== zoom;

        if (mudouCentro || mudouZoom) {
            map.setView(center, zoom, {
                animate: false,
            });
        }
    }, [center, zoom, map]);

    return null;
}

export default function MapPage() {
    const [amostrasResumo, setAmostrasResumo] = useState<AmostraResumo[]>([]);
    const [regioes, setRegioes] = useState<Regiao[]>([]);
    const [selectedRegiaoId, setSelectedRegiaoId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<number | null>(null);

    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationStatus, setLocationStatus] = useState<
        "loading" | "allowed" | "denied" | "unavailable"
    >("loading");

    const [limiteSelecionado, setLimiteSelecionado] = useState<number | "TODOS">(
        TAMANHO_LOTE_INICIAL
    );

    const [limiteAplicado, setLimiteAplicado] = useState<number | "TODOS">(
        TAMANHO_LOTE_INICIAL
    );

    const { logoutUser } = useAuth();
    const { t } = useLanguage();

    const carregandoTodos = limiteAplicado === "TODOS";

    useEffect(() => {
        const fetchRegioes = async () => {
            try {
                const regioesResponse = await api.get<Regiao[]>("/regioes/ativas");
                setRegioes(regioesResponse.data);
            } catch (error) {
                setLoadError(true);

                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    logoutUser();
                }
            }
        };

        fetchRegioes();
    }, [logoutUser]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus("unavailable");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setLocationStatus("allowed");
            },
            () => {
                setLocationStatus("denied");
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 1000 * 60 * 5,
            }
        );
    }, []);

    const fetchAmostrasMapa = useCallback(async () => {
        setIsLoading(true);
        setLoadError(false);

        try {
            const params: Record<string, number | string> = {
                limit: carregandoTodos ? LIMITE_CARREGAR_TODAS : limiteAplicado,
            };

            if (selectedRegiaoId) {
                params.regiaoId = selectedRegiaoId;
            }

            if (!carregandoTodos && userLocation) {
                Object.assign(params, calcularBoundingBox(userLocation));
            }

            const amostrasResponse = await api.get<AmostraResumo[]>("/amostra/resumo-mapa", {
                params,
            });

            setAmostrasResumo(amostrasResponse.data);
        } catch (error) {
            setLoadError(true);

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logoutUser();
            }
        } finally {
            setIsLoading(false);
        }
    }, [carregandoTodos, limiteAplicado, logoutUser, selectedRegiaoId, userLocation]);

    useEffect(() => {
        if (locationStatus === "loading") {
            return;
        }

        fetchAmostrasMapa();
    }, [fetchAmostrasMapa, locationStatus]);

    const markers = useMemo(() => {
        return amostrasResumo
            .filter((amostra) => amostra.avaliacao?.status === "ATIVO")
            .map((amostra) => {
                const position = parseLocation(amostra.localizacao);
                return position ? { amostra, position } : null;
            })
            .filter((item): item is { amostra: AmostraResumo; position: [number, number] } =>
                Boolean(item)
            );
    }, [amostrasResumo]);

    const center: [number, number] =
        userLocation && !carregandoTodos
            ? [userLocation.latitude, userLocation.longitude]
            : markers[0]?.position ?? [-26.229, -52.671];

    const zoom = userLocation && !carregandoTodos ? 12 : markers.length > 0 ? 12 : 13;

    const locationMessage = useMemo(() => {
        if (locationStatus === "allowed" && !carregandoTodos) {
            return `Carregando até ${limiteAplicado} avaliações próximas à sua localização.`;
        }

        if (locationStatus === "denied") {
            return "Localização não permitida. Exibindo avaliações pela estratégia padrão.";
        }

        if (locationStatus === "unavailable") {
            return "Localização indisponível. Exibindo avaliações pela estratégia padrão.";
        }

        if (carregandoTodos) {
            return "Exibindo todas as avaliações carregadas para o mapa.";
        }

        return "Buscando avaliações para o mapa.";
    }, [carregandoTodos, limiteAplicado, locationStatus]);

    const handleChangeRegiao = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegiaoId(event.target.value);
        setLimiteSelecionado(TAMANHO_LOTE_INICIAL);
        setLimiteAplicado(TAMANHO_LOTE_INICIAL);
    };

    const handleChangeLimite = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setLimiteSelecionado(value === "TODOS" ? "TODOS" : Number(value));
    };

    const handleCarregar = () => {
        setLimiteAplicado(limiteSelecionado);
    };

    if (isLoading && amostrasResumo.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
                <Loader className="animate-spin text-blue-600 mb-4" size={48} />

                <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg">
                    {t("map.loading")}
                </p>

                <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
                    Solicitando localização e carregando um conjunto otimizado de avaliações.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-6rem)] flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t("map.title")}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {markers.length} {t("map.visibleEvaluations")}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {locationMessage}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex w-full flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-72">
            <span className="flex items-center gap-2">
              <Filter size={16} />
                {t("map.regionFilter")}
            </span>

                        <select
                            value={selectedRegiaoId}
                            onChange={handleChangeRegiao}
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

                    <label className="flex w-full flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-40">
                        <span>Quantidade</span>

                        <select
                            value={limiteSelecionado}
                            onChange={handleChangeLimite}
                            disabled={isLoading}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            {OPCOES_LIMITE.map((limite) => (
                                <option key={limite} value={limite}>
                                    Top {limite}
                                </option>
                            ))}

                            <option value="TODOS">Todos</option>
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={handleCarregar}
                        disabled={isLoading}
                        className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Carregar
                    </button>
                </div>
            </div>

            {loadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                    {t("map.loadError")}
                </div>
            )}

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <MapContainer
                    center={center}
                    zoom={zoom}
                    scrollWheelZoom={true}
                    preferCanvas={true}
                    className="h-full w-full z-[1]"
                >
                    <MapRecenter center={center} zoom={zoom} />

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    />

                    {userLocation && !carregandoTodos && (
                        <Marker
                            position={[userLocation.latitude, userLocation.longitude]}
                            icon={userLocationIcon}
                        >
                            <Popup>Sua localização aproximada</Popup>
                        </Marker>
                    )}

                    <MarkerClusterGroup
                        chunkedLoading
                        removeOutsideVisibleBounds
                        disableClusteringAtZoom={16}
                        spiderfyOnMaxZoom
                        showCoverageOnHover={false}
                        iconCreateFunction={createClusterCustomIcon}
                    >
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
                                            <p className="font-bold text-gray-900 text-base mb-3 leading-tight border-b border-gray-100 pb-2 flex items-center gap-1.5">
                                                <Layers size={16} className="text-gray-500" />
                                                {amostra.avaliacao?.nomeAvaliacao ?? t("map.unnamedEvaluation")}
                                            </p>

                                            <div className="space-y-2.5 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />

                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {t("map.sample")}:{" "}
                                                            <span className="font-normal text-gray-700">
                                {amostra.nomeAmostra}
                              </span>
                                                        </div>

                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {amostra.localizacao}
                                                        </div>
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
                              {escoreGeral != null
                                  ? escoreGeral.toFixed(1)
                                  : t("common.notInformed")}
                            </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pl-0.5">
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                amostra.avaliacao?.regiao?.corHex ?? "#CBD5E1",
                                                        }}
                                                    />

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
                    </MarkerClusterGroup>
                </MapContainer>

                {isLoading && (
                    <div className="absolute inset-0 z-[3] flex items-center justify-center bg-white/80 dark:bg-gray-950/80">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            <Loader className="animate-spin text-blue-600" size={20} />
                            Atualizando pontos do mapa...
                        </div>
                    </div>
                )}

                {!loadError && markers.length === 0 && !isLoading && (
                    <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            {t("map.noEvaluations")}
                        </div>
                    </div>
                )}

                {userLocation && !carregandoTodos && (
                    <div className="absolute left-4 top-4 z-[2] flex items-center gap-2 rounded-lg border border-blue-100 bg-white/95 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-gray-900/95 dark:text-blue-300">
                        <LocateFixed size={15} />
                        Localização usada para priorizar avaliações próximas
                    </div>
                )}
            </div>

            {selectedAvaliacaoId && (
                <AvaliacaoModal
                    avaliacaoId={selectedAvaliacaoId}
                    mode="view"
                    onClose={() => setSelectedAvaliacaoId(null)}
                />
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

        .vess-user-location-marker {
          background: transparent;
          border: 0;
        }

        .vess-user-location-pin {
          align-items: center;
          background: rgba(37, 99, 235, 0.18);
          border-radius: 999px;
          display: flex;
          height: 28px;
          justify-content: center;
          width: 28px;
        }

        .vess-user-location-pin div {
          background: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          height: 14px;
          width: 14px;
        }

        .custom-marker-cluster {
          background: transparent !important;
          border: none !important;
        }

        .custom-marker-cluster div {
          align-items: center;
          border: 4px solid rgba(255, 255, 255, 0.95);
          border-radius: 999px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22);
          color: #ffffff;
          display: flex;
          font-size: 14px;
          font-weight: 700;
          height: 100%;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }

        .custom-marker-cluster div span {
          line-height: 1;
        }

        .custom-marker-cluster.small div {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .custom-marker-cluster.medium div {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }

        .custom-marker-cluster.large div {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .custom-marker-cluster:hover div {
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.28);
          transform: scale(1.06);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 6px;
        }
      `}</style>
        </div>
    );
}