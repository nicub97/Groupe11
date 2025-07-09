import { useEffect, useState } from "react";
import api from "../services/api";
import { createCheckoutSession } from "../services/paiement";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function MesAnnonces() {
  const { token } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [payLoadingId, setPayLoadingId] = useState(null);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await api.get("/mes-annonces", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonces(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
      }
    };

    fetchAnnonces();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmez-vous l'annulation de cette annonce ?")) return;
    try {
      await api.delete(`/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Échec de l'annulation.");
    }
  };

  const handlePay = async (annonce) => {
    setPayLoadingId(annonce.id);
    try {
      localStorage.setItem("paymentContext", "payer");
      localStorage.setItem("payerAnnonceId", annonce.id);
      const { checkout_url } = await createCheckoutSession(
        { annonce_id: annonce.id, type: annonce.type },
        token,
        "payer"
      );
      window.location.href = checkout_url;
    } catch (err) {
      console.error("Erreur paiement :", err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de la redirection de paiement."
      );
      setPayLoadingId(null);
    }
  };

  const afficherStatut = (statut) => {
    switch (statut) {
      case "en_attente":
        return "🕐 En attente";
      case "en_cours":
        return "📦 En cours de livraison";
      case "livree":
        return "🎉 Livrée";
      default:
        return "❓ Inconnu";
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Mes annonces</h2>

      {annonces.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <ul className="space-y-6">
          {annonces.map((a) => (
            <li key={a.id} className="border p-4 rounded shadow-sm">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {a.titre}

                {a.type === "produit_livre" && (
                  a.id_client ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Réservée par un client
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      Non réservée
                    </span>
                  )
                )}

                {a.is_paid ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Annonce payée
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Paiement en attente
                  </span>
                )}
              </h3>
              <p className="text-gray-600 mb-2">{a.description}</p>
              <p><strong>Prix :</strong> {a.prix_propose} €</p>
              {(a.entrepot_depart || a.entrepot_arrivee) && (
                <p>
                  <strong>Trajet :</strong>{" "}
                  {a.entrepot_depart?.ville || "❓"} → {a.entrepot_arrivee?.ville || "❓"}
                </p>
              )}

              <p className="mt-2 text-blue-700 font-medium">
                Statut global : {afficherStatut(a.statut)}
              </p>

              {a.etapes_livraison?.length > 0 ? (
                <div className="mt-4">
                  <p className="font-semibold">📦 Étapes de livraison :</p>
                  <ul className="list-disc ml-6 mt-2">
                    {a.etapes_livraison.map((etape) => (
                      <li key={etape.id}>
                        <strong>{etape.lieu_depart} → {etape.lieu_arrivee}</strong> — <span>{etape.statut}</span>
                        <br />
                        <span className="text-sm text-gray-600">
                          Livreur : {etape.livreur?.prenom} {etape.livreur?.nom} ({etape.livreur?.telephone})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-yellow-600">⏳ Aucune étape encore définie</p>
              )}

              <Link to={`/annonces/${a.id}/suivi`} className="text-blue-600 underline block mt-3">
                Suivre l'annonce
              </Link>

              {!a.is_paid && a.id_livreur_reservant !== null && (
                <button
                  onClick={() => handlePay(a)}
                  disabled={payLoadingId === a.id}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {payLoadingId === a.id ? "Redirection..." : "Payer maintenant"}
                </button>
              )}

              {/* ❗️Afficher le bouton seulement si aucune étape n’est liée */}
              {a.etapes_livraison?.length === 0 && (!a.id_client || a.type !== "produit_livre") && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Annuler l’annonce
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
