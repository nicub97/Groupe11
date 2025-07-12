import { useEffect, useState } from "react";
import api from "../services/api";
import PrestationCardPublic from "../components/PrestationCardPublic";

export default function CataloguePublic() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // VITE_API_URL doit pointer vers l'API backend (ex: http://localhost:8000/api)
        console.log("VITE_API_URL", import.meta.env.VITE_API_URL);
        const res = await api.get("/public/prestations");
        console.log(res.data);
        if (res.headers["content-type"]) {
          console.log(res.headers["content-type"]);
        }
        const prestationsArray = Array.isArray(res.data.data) ? res.data.data : [];
        setData(prestationsArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Catalogue des prestations</h2>
      {data && data.length > 0 ? (
        data.map((p) => <PrestationCardPublic key={p.id} prestation={p} />)
      ) : (
        <p>Aucune prestation disponible.</p>
      )}
    </div>
  );
}
