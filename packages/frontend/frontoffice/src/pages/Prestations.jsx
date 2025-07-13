/* Liste des prestations de l'utilisateur connecté */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PrestationCard from "../components/PrestationCard";

export default function Prestations() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // id prestataire récupéré depuis l'API dédiée
  const [prestataireId, setPrestataireId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/prestations", {
        });
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Récupération des infos détaillées de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let endpoint = "";
        if (user?.role === "client") {
          endpoint = `/clients/${user.id}`;
        } else if (user?.role === "prestataire") {
          endpoint = `/prestataires/${user.id}`;
        }

        if (!endpoint) return;

        const res = await api.get(endpoint, {
        });

        if (user.role === "client") {
          updateUser({ client: res.data });
        } else if (user.role === "prestataire") {
          updateUser({ prestataire: res.data });
          setPrestataireId(res.data.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    if (user) fetchUser();
  }, [user, updateUser]);

  if (loading || loadingUser) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  // Filtre les prestations selon le rôle utilisateur
  const isClient = user?.role === "client";
  const filteredData = isClient
    // match sur l'id client récupéré via l'API
    ? data.filter((p) => p.client_id === user.client?.id)
    // match sur l'id prestataire récupéré via l'API
    : data.filter((p) => p.prestataire_id === prestataireId);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mes prestations</h2>
      {filteredData && filteredData.length > 0 ? (
        filteredData.map((p) => <PrestationCard key={p.id} prestation={p} />)
      ) : (
        <p>Aucune prestation enregistrée.</p>
      )}
    </div>
  );
}