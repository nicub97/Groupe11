import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";

export default function PrestationDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestation, setPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrestation = async () => {
      try {
        const res = await api.get(`/public/prestations/${id}`);
        setPrestation(res.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestation();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;
  if (!prestation) return <p>Prestation introuvable.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Détail de la prestation</h2>
      <p className="mb-2">{prestation.description}</p>
      <p className="mb-2">
        Date : {new Date(prestation.date_heure).toLocaleString()} - Tarif:
        {" "}
        {prestation.tarif} €
      </p>
      <PrestationStatusBadge status={prestation.statut} />
      {prestation.intervention && prestation.intervention.note !== null && (
        <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 text-sm">
          Évaluée
        </span>
      )}
      <button onClick={() => navigate("/register")} className="btn-primary mt-4">
        Payer
      </button>
    </div>
  );
}
