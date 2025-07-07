/* Liste des prestations de l'utilisateur connecté */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PrestationCard from "../components/PrestationCard";

export default function Prestations() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/prestations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mes prestations</h2>
      {data && data.length > 0 ? (
        data.map((p) => <PrestationCard key={p.id} prestation={p} />)
      ) : (
        <p>Aucune prestation enregistrée.</p>
      )}
    </div>
  );
}
