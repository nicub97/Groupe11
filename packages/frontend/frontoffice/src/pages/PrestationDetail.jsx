/* Page de détail d'une prestation avec actions de réservation ou gestion */
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../services/api";

export default function PrestationDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(1);
  const [commentaire, setCommentaire] = useState("");

  // Récupération de la prestation ciblée
  const {
    data: prestation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["prestation", id],
    queryFn: async () => {
      const res = await api.get(`/prestations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // Mutation pour réserver la prestation (client)
  const reserver = useMutation({
    mutationFn: async () => {
      await api.patch(`/prestations/${id}/reserver`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prestation", id] }),
  });

  // Mutation pour changer le statut (prestataire)
  const changerStatut = useMutation({
    mutationFn: async (statut) => {
      await api.patch(
        `/prestations/${id}/statut`,
        { statut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prestation", id] }),
  });

  // Mutation pour valider l'intervention (prestataire)
  const validerIntervention = useMutation({
    mutationFn: async () => {
      await api.post(
        "/interventions",
        { prestation_id: id, statut_final: "effectuée" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prestation", id] }),
  });

  // Mutation pour laisser une évaluation (client)
  const noter = useMutation({
    mutationFn: async () => {
      await api.post(
        "/evaluations",
        {
          intervention_id: prestation.intervention.id,
          note,
          commentaire_client: commentaire,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prestation", id] }),
  });

  if (isLoading) return <p>Chargement...</p>;
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
          onClick={() => reserver.mutate()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Réserver
        </button>
      )}

      {/* Actions pour le prestataire */}
      {isPrestataire && prestation.statut === "en_attente" && (
        <div className="space-x-2">
          <button
            onClick={() => changerStatut.mutate("acceptée")}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Accepter
          </button>
          <button
            onClick={() => changerStatut.mutate("refusée")}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Refuser
          </button>
        </div>
      )}

      {isPrestataire && prestation.statut === "acceptée" && (
        <button
          onClick={() => changerStatut.mutate("terminée")}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Terminer
        </button>
      )}

      {isPrestataire && prestation.statut === "terminée" && !prestation.intervention && (
        <button
          onClick={() => validerIntervention.mutate()}
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
            noter.mutate();
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
