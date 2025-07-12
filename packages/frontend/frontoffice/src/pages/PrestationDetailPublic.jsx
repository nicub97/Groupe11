import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";

export default function PrestationDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestation, setPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrestation = async () => {
      try {
        const res = await api.get(`/public/prestations/${id}`);
        setPrestation(res.data);
      } catch {
        setError("Erreur lors du chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrestation();
  }, [id]);

  const payer = () => {
    navigate("/register");
  };

  if (loading) return <p>Chargement...</p>;
  if (error || !prestation) return <p>{error || "Prestation introuvable"}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Détail de la prestation</h2>
      <p className="mb-2">{prestation.description}</p>
      <div className="mb-2">
        Statut : <PrestationStatusBadge status={prestation.statut} />
      </div>
      <button onClick={payer} className="bg-blue-500 text-white px-4 py-2 rounded">
        Payer
      </button>
    </div>
  );
}
