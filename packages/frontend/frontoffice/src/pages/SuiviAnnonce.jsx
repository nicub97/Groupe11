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

  const etapeDepotClient = etapesClient?.find(
    (e) =>
      e.statut === "en_cours" &&
      e.codes?.some((c) => c.type === "depot" && !c.utilise)
  );

  const depotEffectue = etapesClient?.some((e) =>
    e.codes?.some((c) => c.type === "depot" && c.utilise)
  );

  const retraitEffectue = etapesClient?.some((e) =>
    e.codes?.some((c) => c.type === "retrait" && c.utilise)
  );

  const etapeRetraitClient = etapesClient?.find(
    (e) =>
      e.statut === "en_cours" &&
      e.codes?.some((c) => c.type === "retrait" && !c.utilise)
  );

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

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Suivi de l'annonce : {annonce.titre}</h2>
      <p className="mb-2">Description : {annonce.description}</p>
      <p className="mb-4">Statut : {annonce.statut}</p>

      {etapeDepotClient && (
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

      {depotEffectue && !etapeRetraitClient && !retraitEffectue && (
        <p className="text-gray-600 font-medium mt-4">
          ⏳ Colis en cours d'acheminement.
        </p>
      )}

      {etapeRetraitClient && (
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
