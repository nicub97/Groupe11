/* Page de détail d'une prestation avec actions de réservation ou gestion */
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function PrestationDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [note, setNote] = useState(1);
  const [commentaire, setCommentaire] = useState("");
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

  const changerStatut = async (statut) => {
    try {
      await api.patch(
        `/prestations/${id}/statut`,
        { statut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const noter = async () => {
    try {
      await api.post(
        "/evaluations",
        {
          intervention_id: prestation.intervention.id,
          note,
          commentaire_client: commentaire,
        },
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
      <p className="mb-2">Statut : {prestation.statut}</p>

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
      {isPrestataire && prestation.statut === "en_attente" && (
        <div className="space-x-2">
          <button
            onClick={() => changerStatut("acceptée")}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Accepter
          </button>
          <button
            onClick={() => changerStatut("refusée")}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Refuser
          </button>
        </div>
      )}

      {isPrestataire && prestation.statut === "acceptée" && (
        <button
          onClick={() => changerStatut("terminée")}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Terminer
        </button>
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
      {isClient && prestation.statut === "terminée" && prestation.intervention && prestation.intervention.note === null && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            noter();
          }}
          className="mt-4 space-y-2"
        >
          <label>
            Note :
            <select
              value={note}
              onChange={(e) => setNote(Number(e.target.value))}
              className="ml-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <br />
          <textarea
            placeholder="Commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="w-full border p-2"
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">
            Noter
          </button>
        </form>
      )}
    </div>
  );
}
