/* Page de détail d'une prestation avec actions de réservation ou gestion */
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";
import EvaluationForm from "../components/EvaluationForm";
import ActionButtons from "../components/ActionButtons";

export default function PrestationDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [prestation, setPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrestation = async () => {
    try {
      const res = await api.get(`/prestations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrestation(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const reserver = async () => {
    try {
      await api.patch(`/prestations/${id}/reserver`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPrestation();
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
    }
  };


  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  const isClient = user?.role === "client";
  const isPrestataire = user?.role === "prestataire";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Détail de la prestation</h2>
      <p className="mb-2">{prestation.description}</p>
      <div className="mb-2">
        Statut : <PrestationStatusBadge status={prestation.statut} />
      </div>

      {/* Actions pour le client */}
      {isClient && prestation.statut === "disponible" && (
        <button
          onClick={reserver}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Réserver
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
          <EvaluationForm prestationId={id} onSubmit={fetchPrestation} />
        )}
    </div>
  );
}
