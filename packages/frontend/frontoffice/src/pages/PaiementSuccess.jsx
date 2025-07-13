import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PaiementSuccess() {
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const finalized = useRef(false);

  useEffect(() => {
    if (finalized.current) return;
    finalized.current = true;
    const context = searchParams.get("context");
    const annonceId = searchParams.get("annonce_id");
    const prestationId = searchParams.get("prestation_id");
    const sessionId = searchParams.get("session_id");
    const entrepotId = localStorage.getItem("reservationEntrepot");
    const annonceData = localStorage.getItem("annonceForm");
    const annoncePhoto = localStorage.getItem("annoncePhoto");

    const dataURLtoBlob = (dataUrl) => {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    };

    const finalize = async () => {
      try {
        let paiementOk = true;
        if (annonceId && sessionId) {
          try {
            await api.get(`/annonces/${annonceId}/paiement-callback`, {
              params: { session_id: sessionId },
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            console.error("Erreur callback paiement :", err);
            setMessage("\u274C Une erreur est survenue. Paiement non valid\u00e9.");
            paiementOk = false;
          }
        }
        if (context === "prestation_reserver" && prestationId && sessionId) {
          try {
            await api.get(`/prestations/${prestationId}/paiement-callback`, {
              params: { session_id: sessionId },
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            console.error("Erreur callback paiement prestation:", err);
            setMessage("Erreur lors de la réservation de la prestation.");
          }
        }

        if (!paiementOk) return;

        if (context === "reserver" && annonceId && entrepotId) {
          await api.post(
            `/annonces/${annonceId}/reserver`,
            { entrepot_arrivee_id: Number(entrepotId) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("reservationEntrepot");
          setMessage("Réservation confirmée !");
        } else if (context === "prestation_reserver" && prestationId) {
          setMessage("Prestation réservée !");
          localStorage.removeItem("prestationId");
        } else if (context === "creer" && annonceData) {
          const data = JSON.parse(annonceData);
          const formData = new FormData();
          for (const key in data.form) {
            formData.append(key, data.form[key]);
          }
          formData.append("type", data.type);
          if (annoncePhoto) {
            formData.append("photo", dataURLtoBlob(annoncePhoto), "photo.png");
          }
          await api.post("/annonces", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          localStorage.removeItem("annonceForm");
          localStorage.removeItem("annoncePhoto");
          setMessage("Annonce créée avec succès !");
        } else if (context === "payer" && annonceId) {
          localStorage.removeItem("payerAnnonceId");
          localStorage.removeItem("paymentContext");
          if (paiementOk) {
            setMessage("Annonce payée !");
          }
        } else {
          setMessage("Paiement confirmé.");
        }
        let redirect = "/annonces";
        if (context === "payer") redirect = "/mes-annonces";
        if (context === "prestation_reserver") redirect = "/prestations";
        setTimeout(() => navigate(redirect), 1500);
      } catch (err) {
        setMessage(err.response?.data?.message || "Erreur après paiement.");
      }
    };

    finalize();
  }, [searchParams, token, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Paiement</h2>
      <p>{message || "Traitement en cours..."}</p>
    </div>
  );
}