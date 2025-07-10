import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function MesEtapes() {
  const { token, user } = useAuth();
  const livreur = user?.livreur;
  const navigate = useNavigate();
  const [etapes, setEtapes] = useState([]);
  const [toutesEtapes, setToutesEtapes] = useState([]);

  const fetchEtapes = async () => {
    try {
      const res = await api.get("/mes-etapes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const toutes = res.data;
      const livreurEtapes = toutes.filter(
        (e) => !e.est_client && !e.est_commercant && e.statut === "en_cours"
      );

      setToutesEtapes(toutes);
      setEtapes(livreurEtapes);
    } catch (err) {
      console.error("Erreur chargement etapes:", err);
    }
  };

  useEffect(() => {
    fetchEtapes();
  }, [token]);

  if (livreur && livreur.statut !== "valide") {
    return (
      <p className="p-4 text-red-600">
        ⛔️ Vous ne pouvez pas accéder à cette fonctionnalité tant que votre profil n’est pas validé.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Mes étapes de livraison</h2>

      {etapes.length === 0 ? (
        <p>⏳ En attente du dépôt du client.</p>
      ) : (
        <ul className="space-y-6">
          {etapes.map((e) => {
            const codeDepot = e.codes?.find((c) => c.type === "depot");
            const codeRetrait = e.codes?.find((c) => c.type === "retrait");

            let infoMessage = "";
            let boutonAction = null;

            // Étapes client/commerçant précédentes non terminées pour la même annonce
            const etapeBlocante = toutesEtapes.some(
              (et) =>
                et.annonce_id === e.annonce_id &&
                (et.est_client === true || et.est_commercant === true) &&
                et.statut !== "terminee" &&
                new Date(et.created_at) < new Date(e.created_at)
            );

            const colisEstDisponible = toutesEtapes.some(
              (et) =>
                et.annonce_id === e.annonce_id &&
                (et.est_client === true || et.est_commercant === true) &&
                et.codes?.some((c) => c.type === "depot" && c.utilise)
            );

            if (!codeRetrait?.utilise && e.statut === "en_cours") {
              if (etapeBlocante) {
                infoMessage = "⏳ En attente de dépôt du commerçant ou client";
              } else if (colisEstDisponible) {
                infoMessage = "🔓 Prêt pour retrait du colis";
                boutonAction = (
                  <Link
                    to={`/validation-code/${e.id}?type=retrait`}
                    className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Saisir le code pour retirer
                  </Link>
                );
              } else if (!e.est_client && !e.est_commercant) {
                infoMessage = "⏳ En attente de retrait par vous";
                boutonAction = (
                  <button
                    onClick={() =>
                      navigate(`/validation-code/${e.id}?type=retrait`)
                    }
                    className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Saisir le code pour retirer
                  </button>
                );
              }
            } else if (!codeDepot?.utilise && codeDepot) {
              infoMessage = "📦 Prêt pour dépôt à l'arrivée";
              boutonAction = (
                <Link
                  to={`/validation-code/${e.id}?type=depot`}
                  className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Saisir le code pour déposer
                </Link>
              );
            } else {
              infoMessage = "✅ Étape complétée";
            }

            return (
              <li key={e.id} className="border p-4 rounded shadow">
                <h3 className="text-lg font-semibold">
                  {e.lieu_depart} → {e.lieu_arrivee}
                </h3>
                <p className="text-sm text-gray-600">Statut : {e.statut}</p>
                <p className="text-sm text-gray-600">
                  Annonce : {e.annonce?.titre || "-"}
                </p>
                <p className="mt-2 font-medium text-blue-700">{infoMessage}</p>
                {boutonAction}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
