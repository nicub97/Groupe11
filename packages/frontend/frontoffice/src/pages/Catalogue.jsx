/* Page publique listant les prestations disponibles */
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import PrestationCard from "../components/PrestationCard";

export default function Catalogue() {
  // Récupération des prestations disponibles via React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["catalogue"],
    queryFn: async () => {
      const res = await api.get("/prestations/catalogue");
      return res.data;
    },
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Catalogue des prestations</h2>
      {data && data.length > 0 ? (
        data.map((p) => <PrestationCard key={p.id} prestation={p} />)
      ) : (
        <p>Aucune prestation disponible.</p>
      )}
    </div>
  );
}
