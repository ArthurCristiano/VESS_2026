import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Plus, RotateCcw, Undo2 } from "lucide-react";
import api, { getBackendErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Modal from "../../components/common/Modal";
import { useLanguage } from "../../context/LanguageContext";

type RegionType =
  | "CIDADE"
  | "ESTADO"
  | "REGIAO_ESTADO"
  | "AREA_PROJETO"
  | "OUTRO";

type RegionPoint = {
  id?: number;
  ordem: number;
  latitude: number;
  longitude: number;
};

type Region = {
  id: number;
  nome: string;
  descricao?: string | null;
  tipo: RegionType;
  corHex?: string | null;
  ativa?: boolean;
  pontos?: RegionPoint[];
};

type RegionForm = {
  nome: string;
  descricao: string;
  tipo: RegionType;
  corHex: string;
};

const REGION_TYPES: Array<{ value: RegionType; labelKey: RegionTypeTranslationKey }> = [
  { value: "CIDADE", labelKey: "regions.type.city" },
  { value: "ESTADO", labelKey: "regions.type.state" },
  { value: "REGIAO_ESTADO", labelKey: "regions.type.stateRegion" },
  { value: "AREA_PROJETO", labelKey: "regions.type.projectArea" },
  { value: "OUTRO", labelKey: "regions.type.other" },
];

const INITIAL_FORM: RegionForm = {
  nome: "",
  descricao: "",
  tipo: "REGIAO_ESTADO",
  corHex: "#1D9E75",
};

const DEFAULT_CENTER: [number, number] = [-26.229, -52.671];
const DEFAULT_ZOOM = 7;
const MAX_POINTS = 10;
const DEFAULT_REGION_COLOR = "#1D9E75";

type RegionTypeTranslationKey =
  | "regions.type.city"
  | "regions.type.state"
  | "regions.type.stateRegion"
  | "regions.type.projectArea"
  | "regions.type.other";

function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function getDisplayColor(value?: string | null): string {
  return value && isValidHexColor(value) ? value : DEFAULT_REGION_COLOR;
}

function RegionPointPicker({
  onAddPoint,
}: {
  onAddPoint: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onAddPoint(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function RegionsManagementPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<RegionForm>(INITIAL_FORM);
  const [selectedPoints, setSelectedPoints] = useState<Array<[number, number]>>([]);
  const { logoutUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    void fetchRegions();
  }, []);

  const mainMapRegions = useMemo(
    () =>
      regions
        .map((region) => {
          const mappedPoints =
            region.pontos?.map((point) => [point.latitude, point.longitude] as [number, number]) ?? [];
          return { ...region, mappedPoints };
        })
        .filter((region) => region.mappedPoints.length >= 3),
    [regions],
  );

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback(message);
    setFeedbackType(type);
  };

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Region[]>("/regioes");
      setRegions(response.data);
    } catch (err: unknown) {
      setError(getBackendErrorMessage(err) ?? t("regions.loadError"));
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
    setSelectedPoints([]);
  };

  const openCreateModal = () => {
    setFeedback(null);
    setForm(INITIAL_FORM);
    setSelectedPoints([]);
    setIsModalOpen(true);
  };

  const handleAddPoint = (latitude: number, longitude: number) => {
    if (selectedPoints.length >= MAX_POINTS) {
      showFeedback(t("regions.maxPointsReached", { max: MAX_POINTS }), "error");
      return;
    }
    setFeedback(null);
    setSelectedPoints((prev) => [...prev, [latitude, longitude]]);
  };

  const handleUndoPoint = () => {
    setSelectedPoints((prev) => prev.slice(0, -1));
  };

  const handleResetPoints = () => {
    setSelectedPoints([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFeedback(null);

    if (selectedPoints.length < 3 || selectedPoints.length > MAX_POINTS) {
      setSubmitting(false);
      showFeedback(t("regions.pointsValidation", { max: MAX_POINTS }), "error");
      return;
    }

    const trimmedName = form.nome.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setSubmitting(false);
      showFeedback(t("regions.nameValidation"), "error");
      return;
    }

    const trimmedDescription = form.descricao.trim();
    if (trimmedDescription.length > 500) {
      setSubmitting(false);
      showFeedback(t("regions.descriptionValidation"), "error");
      return;
    }

    const trimmedColor = form.corHex.trim();
    if (trimmedColor && !isValidHexColor(trimmedColor)) {
      setSubmitting(false);
      showFeedback(t("regions.colorValidation"), "error");
      return;
    }

    const payload = {
      nome: trimmedName,
      descricao: trimmedDescription || undefined,
      tipo: form.tipo,
      corHex: trimmedColor || null,
      pontos: selectedPoints.map((point, index) => ({
        ordem: index + 1,
        latitude: point[0],
        longitude: point[1],
      })),
    };

    try {
      await api.post("/regioes", payload);
      showFeedback(t("regions.createSuccess"), "success");
      closeModal();
      await fetchRegions();
    } catch (err: unknown) {
      showFeedback(getBackendErrorMessage(err) ?? t("regions.createError"), "error");
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t("regions.title")}</h3>
          <Button type="button" startIcon={<Plus size={16} />} onClick={openCreateModal}>
            {t("regions.create")}
          </Button>
        </div>

        {feedback && (
          <div
            className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${
              feedbackType === "success"
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="h-[560px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              {t("regions.loading")}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-4 text-sm text-red-500">{error}</div>
          ) : (
            <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-full w-full z-[1]">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />

              {mainMapRegions.map((region) => {
                const color = getDisplayColor(region.corHex);
                const regionType = REGION_TYPES.find((type) => type.value === region.tipo);
                return (
                  <Polygon
                    key={region.id}
                    positions={region.mappedPoints}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}
                  >
                    <Popup>
                      <div className="min-w-[180px] text-sm">
                        <h4 className="mb-1 font-semibold text-gray-900">{region.nome}</h4>
                        <p className="text-gray-700">
                          <span className="font-medium">{t("regions.type")}:</span>{" "}
                          {regionType ? t(regionType.labelKey) : region.tipo}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">{t("regions.description")}:</span>{" "}
                          {region.descricao?.trim() || "-"}
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={t("regions.create")} maxWidthClass="max-w-5xl">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nome">{t("regions.nameRequired")}</Label>
            <Input
              id="nome"
              placeholder={t("regions.namePlaceholder")}
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="tipo">{t("regions.typeRequired")}</Label>
            <select
              id="tipo"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={form.tipo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as RegionType }))}
            >
              {REGION_TYPES.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descricao">{t("regions.description")}</Label>
            <Input
              id="descricao"
              placeholder={t("regions.descriptionPlaceholder")}
              value={form.descricao}
              onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label>{t("regions.areaAndColor")}</Label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t("regions.pointsCount", { count: selectedPoints.length, max: MAX_POINTS })}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[220px]">
                <div className="flex gap-2">
                  <input
                    id="corHex"
                    type="color"
                    className="h-11 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
                    value={getDisplayColor(form.corHex)}
                    onChange={(e) => setForm((prev) => ({ ...prev, corHex: e.target.value.toUpperCase() }))}
                  />
                  <Input
                    value={form.corHex}
                    onChange={(e) => setForm((prev) => ({ ...prev, corHex: e.target.value.toUpperCase() }))}
                    placeholder="#1D9E75"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:!text-[#404040] dark:hover:!text-gray-300"
                startIcon={<Undo2 size={14} />}
                onClick={handleUndoPoint}
                disabled={selectedPoints.length === 0}
              >
                {t("regions.removeLastPoint")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:!text-[#404040] dark:hover:!text-gray-300"
                startIcon={<RotateCcw size={14} />}
                onClick={handleResetPoints}
                disabled={selectedPoints.length === 0}
              >
                {t("regions.resetPoints")}
              </Button>
            </div>

            <div className="h-[300px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-full w-full z-[1]">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />

                <RegionPointPicker onAddPoint={handleAddPoint} />

                {selectedPoints.map((point, index) => (
                  <CircleMarker
                    key={`${point[0]}-${point[1]}-${index}`}
                    center={point}
                    radius={6}
                    pathOptions={{ color: getDisplayColor(form.corHex), fillColor: getDisplayColor(form.corHex), fillOpacity: 1 }}
                  />
                ))}

                {selectedPoints.length >= 3 && (
                  <Polygon
                    positions={selectedPoints}
                    pathOptions={{
                      color: getDisplayColor(form.corHex),
                      fillColor: getDisplayColor(form.corHex),
                      fillOpacity: 0.35,
                      weight: 2,
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 pt-1">
            <Button
              type="submit"
              startIcon={<Plus size={16} />}
              disabled={submitting || form.nome.trim().length < 2 || selectedPoints.length < 3}
            >
              {t("regions.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hover:!text-[#404040] dark:hover:!text-gray-300"
              onClick={closeModal}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
