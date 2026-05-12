import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useState, useEffect } from "react";
import { Loader, MapPin, ChevronRight } from "lucide-react";
import AvaliacaoModal from "../../components/common/AvaliaçãoModal";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

type AmostraResumo = {
  id: number;
  nomeAmostra: string;
  localizacao: string;
  avaliacao: {
    id: number;
    nomeAvaliacao: string;
  };
};

export default function MapPage() {
  const [amostrasResumo, setAmostrasResumo] = useState<AmostraResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<number | null>(null);

  const { logoutUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/amostra/resumo-mapa");
        setAmostrasResumo(response.data);
        console.log("Amostras resumo carregadas:", response.data);
      } catch (error) {
        console.error("Erro ao buscar resumo para o mapa:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logoutUser();
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [logoutUser]);

  const center: [number, number] = [-26.229, -52.671];
  const zoom = 13;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Loader className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-700 font-semibold text-lg">{t("map.loading")}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full rounded-2xl overflow-hidden">
          <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-[1]">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {amostrasResumo.map((amostra) => {
              const parts = amostra.localizacao.split(",");
              if (parts.length !== 2) return null;
              const lat = parseFloat(parts[0].trim());
              const lon = parseFloat(parts[1].trim());
              if (isNaN(lat) || isNaN(lon)) return null;

              return (
                <Marker key={amostra.id} position={[lat, lon]} icon={customIcon}>
                  <Popup offset={[0, -10]} maxWidth={300}>
                    <div className="text-gray-800">
                      <p className="font-bold text-gray-900 text-lg mb-3 leading-tight text-center">
                        {amostra.avaliacao?.nomeAvaliacao ?? t("map.unnamedEvaluation")}
                      </p>

                      <div className="flex items-start gap-2 mb-4">
                        <MapPin size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col gap-0">
                          <div className="font-medium text-sm">{amostra.nomeAmostra}</div>
                          <div className="font-medium text-lg">{amostra.localizacao}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (amostra.avaliacao?.id) {
                            setSelectedAvaliacaoId(amostra.avaliacao.id);
                          } else {
                            console.warn("Amostra sem avaliação associada:", amostra);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                      >
                        {t("map.viewDetails")}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
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
       `}</style>
    </div>
  );
}
