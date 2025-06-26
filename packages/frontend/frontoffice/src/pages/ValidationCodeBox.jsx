import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ValidationCodeBox() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get("type");
  const navigate = useNavigate();
  const { token } = useAuth();

  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [etape, setEtape] = useState(null);

  const fetchEtapeInfos = async () => {
    try {
      const res = await api.get(`/etapes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const e = res.data;
      setEtape(e);

      const codes = e.codes || [];
      const retrait = codes.find((c) => c.type === "retrait");
      const depot = codes.find((c) => c.type === "depot");

      let nextStep = null;

      if (e.est_client) {
        if (retrait && !retrait.utilise) {
          nextStep = "retrait";
        } else if (depot && !depot.utilise) {
          nextStep = "depot";
        }
      } else {
        if (retrait && !retrait.utilise) {
          const annonceEtapes = await api.get(`/annonces/${e.annonce.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const blocage = annonceEtapes.data.etapes_livraison?.some(
            (et) =>
              (et.est_client === true || et.est_commercant === true) &&
              et.statut !== "terminee" &&
              new Date(et.created_at) < new Date(e.created_at)
          );

          if (!blocage) {
            nextStep = "retrait";
          }
        } else if (depot && !depot.utilise) {
          nextStep = "depot";
        }
      }

      // Si un type est spécifié dans l'URL, on vérifie qu'il est autorisé
      if (queryType && queryType !== nextStep) {
        nextStep = null;
      }

      setStep(nextStep);
    } catch (err) {
      console.error("Erreur chargement infos:", err);
    }
  };

  useEffect(() => {
    fetchEtapeInfos();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await api.post(
        "/valider-code-box",
        {
          code,
          type: step,
          etape_id: id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (step === "retrait") {
        setMessage("✅ Retrait validé. Vous pouvez continuer.");
        setCode("");
        await fetchEtapeInfos();
        // Si la validation est effectuée par un livreur, on retourne
        // automatiquement sur la liste des étapes après un court délai
        if (etape && !etape.est_client && !etape.est_commercant) {
          setTimeout(() => {
            navigate("/mes-etapes");
          }, 1000);
        }
      } else {
        await api.patch(`/etapes/${id}/cloturer`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Colis déposé. Étape clôturée.");
        navigate("/mes-etapes");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  if (!step) {
    return (
      <p className="text-center mt-10 text-gray-600 font-medium">
        ⏳ Aucune action requise pour le moment. Veuillez patienter.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">
        Validation du code pour l'étape #{id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Étape actuelle :{" "}
          {step === "retrait" ? "🔓 Retrait du colis" : "📦 Dépôt du colis"}
        </p>

        <label className="block mb-1 font-medium">Code d'accès ({step})</label>
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
            : step === "retrait"
            ? "Valider le retrait"
            : "Valider le dépôt"}
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
