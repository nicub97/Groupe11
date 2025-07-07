/* Liste des prestations de l'utilisateur connecté */
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import PrestationCard from "../components/PrestationCard";

export default function Prestations() {
  const { token } = useAuth();

  // Chargement des prestations liées à l'utilisateur connecté
  const { data, isLoading, error } = useQuery({
    queryKey: ["mes-prestations"],
    queryFn: async () => {
      const res = await api.get("/prestations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Chargement...</p>;
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
