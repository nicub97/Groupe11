import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ProfilPrestataire() {
  const { user, token } = useAuth();
  const [prestataire, setPrestataire] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get(`/prestataires/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPrestataire(res.data))
      .catch(() => setError("Erreur de chargement"));
  }, [user, token]);

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!prestataire) return <p className="p-4">Chargement...</p>;

  const statutLabel =
    prestataire.statut === "valide"
      ? "Validé"
      : prestataire.statut === "refuse"
      ? "Refusé"
      : "En attente";

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">Mon statut prestataire</h2>
      <p>
        <strong>Statut :</strong> {statutLabel}
      </p>
      {prestataire.statut === "refuse" && prestataire.motif_refus && (
        <p className="text-red-600">
          Motif : {prestataire.motif_refus}
        </p>
      )}
    </div>
  );
}
