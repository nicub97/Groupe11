import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SuiviAnnonce() {
  const { annonceId } = useParams();
  const { token, user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [etatCode, setEtatCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnonce = async () => {
    try {
      const res = await api.get(`/annonces/${annonceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnonce(res.data);
    } catch (err) {
      console.error("Erreur chargement annonce:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnnonce();
    }
  }, [token, annonceId]);

  if (!annonce || !user) return <p className="text-center mt-10">Chargement...</p>;

  const etapesClient = annonce.etapes_livraison?.filter((e) => e.est_client);
  const etapesCommercant = annonce.etapes_livraison?.filter((e) => e.est_commercant);

  const etapeDepotClient = etapesClient?.find(
    (e) =>
      e.statut === "en_cours" &&
      e.codes?.some((c) => c.type === "depot" && !c.utilise)
  );

  const etapeDepotCommercant = etapesCommercant?.find(
    (e) =>
      e.statut === "en_cours" &&
      e.codes?.some((c) => c.type === "depot" && !c.utilise)
  );

  const depotEffectue = etapesClient?.some((e) =>
    e.codes?.some((c) => c.type === "depot" && c.utilise)
  );

  const estCommercantActuel = user?.id === annonce?.id_commercant;
  const estClientActuel = user?.id === annonce?.id_client;

  const retraitEffectue = etapesClient?.some((e) =>
    e.codes?.some((c) => c.type === "retrait" && c.utilise)
  );

  const etapeRetraitClient = etapesClient?.find(
    (e) =>
      e.statut === "en_cours" &&
      e.codes?.some((c) => c.type === "retrait" && !c.utilise)
  );

  const derniereEtape = annonce.etapes_livraison?.[
    annonce.etapes_livraison.length - 1
  ];

  const livraisonTerminee =
    derniereEtape &&
    derniereEtape.est_client === true &&
    derniereEtape.est_mini_etape === true &&
    derniereEtape.statut === "terminee";

  const validerCode = async (type, etape_id) => {
    setLoading(true);
    setEtatCode(null);
    setMessage("");

    try {
      await api.post(
        "/valider-code-box",
        { code, type, etape_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEtatCode("success");
      setMessage("✅ Code validé avec succès.");
      setCode("");
      await fetchAnnonce();
    } catch (err) {
      setEtatCode("error");
      setMessage(err.response?.data?.message || "Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString() : "-";

  const renderEtape = (e) => {
    const type = e.est_client
      ? "client"
      : e.est_commercant
      ? "commerçant"
      : "livreur";
    const date =
      e.statut === "terminee" && e.updated_at ? e.updated_at : e.created_at;

    return (
      <tr key={e.id} className="border-b">
        <td className="px-2 py-1 capitalize">{type}</td>
        <td className="px-2 py-1">
          {e.lieu_depart} → {e.lieu_arrivee}
        </td>
        <td className="px-2 py-1">{e.statut}</td>
        <td className="px-2 py-1">{formatDate(date)}</td>
      </tr>
    );
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Suivi de l'annonce : {annonce.titre}</h2>
      <p className="mb-2">Description : {annonce.description}</p>
      <p className="mb-4">Statut : {annonce.statut}</p>

      {livraisonTerminee && (
        <div className="mb-4 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded">
          ✅ Livraison terminée. Le colis a bien été récupéré.
        </div>
      )}

      {etapeDepotClient && estClientActuel && (
        <EtapeForm
          titre="🚚 Dépôt initial"
          code={code}
          setCode={setCode}
          loading={loading}
          valider={() => validerCode("depot", etapeDepotClient.id)}
          message={message}
          etatCode={etatCode}
        />
      )}

      {etapeDepotCommercant && estCommercantActuel && (
        <EtapeForm
          titre="🚚 Dépôt commerçant"
          code={code}
          setCode={setCode}
          loading={loading}
          valider={() => validerCode("depot", etapeDepotCommercant.id)}
          message={message}
          etatCode={etatCode}
        />
      )}

      {depotEffectue && !etapeRetraitClient && !retraitEffectue && (
        <p className="text-gray-600 font-medium mt-4">
          ⏳ Colis en cours d'acheminement.
        </p>
      )}

      {etapeRetraitClient && estClientActuel && (
        <EtapeForm
          titre="📦 Retrait du colis"
          code={code}
          setCode={setCode}
          loading={loading}
          valider={() => validerCode("retrait", etapeRetraitClient.id)}
          message={message}
          etatCode={etatCode}
          isRetrait
        />
      )}

      {retraitEffectue && (
        <p className="text-green-600 font-semibold mt-4">
          ✅ Colis retiré. Livraison terminée.
        </p>
      )}

      <div className="mt-8">
        <h3 className="font-semibold mb-2">📦 Détails des étapes :</h3>
        {annonce.etapes_livraison?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Type</th>
                  <th className="border px-2 py-1 text-left">Trajet</th>
                  <th className="border px-2 py-1 text-left">Statut</th>
                  <th className="border px-2 py-1 text-left">Date</th>
                </tr>
              </thead>
              <tbody>{annonce.etapes_livraison.map(renderEtape)}</tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Aucune étape de livraison.</p>
        )}
      </div>
    </div>
  );
}

function EtapeForm({ titre, code, setCode, loading, valider, message, etatCode, isRetrait }) {
  return (
    <div className="mt-10">
      {titre && <h3 className="text-lg font-semibold mb-2">{titre}</h3>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          valider();
        }}
        className="space-y-4"
      >
        <label className="block font-medium">Code {isRetrait ? "de retrait" : "de dépôt"}</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading
            ? "Vérification..."
            : isRetrait
            ? "Retirer le colis"
            : "Valider le dépôt"}
        </button>
        {etatCode === "success" && <p className="text-green-600">{message}</p>}
        {etatCode === "error" && <p className="text-red-600">{message}</p>}
      </form>
    </div>
  );
}
