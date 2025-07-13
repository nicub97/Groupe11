/* Page de détail d'une prestation avec actions de réservation ou gestion */
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";
import EvaluationForm from "../components/EvaluationForm";
import ActionButtons from "../components/ActionButtons";

export default function PrestationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [prestation, setPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrestation = async () => {
    setLoading(true);
    setError("");
    try {
      const storedToken = localStorage.getItem("token");
      const res = await api.get(`/prestations/${id}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setPrestation(res.data);
      console.log(res.data); // suivi de la prestation reçue
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("Accès refusé");
      } else {
        setError("Erreur lors du chargement.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const payer = async () => {
    try {
      localStorage.setItem("paymentContext", "prestation_reserver");
      localStorage.setItem("prestationId", id);
      const res = await api.post(`/prestations/${id}/payer`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      console.error(err);
    }
  };


  const validerIntervention = async () => {
    try {
      await api.post(
        "/interventions",
        { prestation_id: id, statut_final: "effectuée" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPrestation();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation de l'intervention.");
    }
  };


  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  const isClient = user?.role === "client";
  const isPrestataire = user?.role === "prestataire";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Détail de la prestation</h2>
      <p className="mb-2">{prestation.description}</p>
      <div className="mb-2">
        Statut : <PrestationStatusBadge status={prestation.statut} />
        {prestation.intervention && prestation.intervention.note !== null && (
          <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 text-sm">
            Évaluée
          </span>
        )}
      </div>

      {/* Actions pour le client */}
      {isClient && prestation.statut === "disponible" && !prestation.is_paid && (
        <button
          onClick={payer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Payer
        </button>
      )}

      {/* Actions pour le prestataire */}
      {isPrestataire && (
        <ActionButtons
          prestationId={id}
          statut={prestation.statut}
          onChange={fetchPrestation}
        />
      )}

      {isPrestataire && prestation.statut === "terminée" && !prestation.intervention && (
        <button
          onClick={validerIntervention}
          className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
        >
          Valider l'intervention
        </button>
      )}

      {/* Formulaire de notation pour le client */}
      {isClient &&
        prestation.statut === "terminée" &&
        prestation.intervention &&
        prestation.intervention.note === null && (
          <EvaluationForm interventionId={prestation.intervention.id} onSubmit={fetchPrestation} />
        )}
    </div>
  );
}