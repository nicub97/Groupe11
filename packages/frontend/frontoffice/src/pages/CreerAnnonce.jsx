import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { createCheckoutSession } from "../services/paiement";

export default function CreerAnnonce() {
  const { user, token } = useAuth();
  // Déterminer le type selon le rôle
  let typeAnnonce = null;
  if (user?.role === "client") typeAnnonce = "livraison_client";
  else if (user?.role === "commercant") typeAnnonce = "produit_livre";

  const [entrepots, setEntrepots] = useState([]);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix_propose: "",
    photo: "",
    entrepot_depart_id: "",
    entrepot_arrivee_id: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const res = await api.get("/entrepots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepots(res.data);
      } catch (err) {
        console.error("Erreur chargement entrepôts :", err);
      }
    };
    fetchEntrepots();
  }, [token]);

  if (!typeAnnonce) {
    return (
      <p className="text-center mt-10 text-red-600">
        Vous n'avez pas le droit de créer une annonce.
      </p>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      localStorage.setItem(
        "annonceForm",
        JSON.stringify({ form, type: typeAnnonce })
      );
      const { checkout_url } = await createCheckoutSession(
        { montant: form.prix_propose, type: typeAnnonce },
        token,
        "creer"
      );
      window.location.href = checkout_url;
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message ||
        "Erreur lors de la redirection de paiement.";
      setMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Créer une annonce</h2>
      {message && <p className="text-red-600 mb-2">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="prix_propose"
          placeholder="Prix proposé"
          value={form.prix_propose}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Champ toujours visible : entrepôt de départ */}
        {(typeAnnonce === "livraison_client" || typeAnnonce === "produit_livre") && (
          <select
            name="entrepot_depart_id"
            value={form.entrepot_depart_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Ville de départ</option>
            {entrepots.map((e) => (
              <option key={e.id} value={e.id}>
                {e.ville}
              </option>
            ))}
          </select>
        )}

        {/* Affiché uniquement pour les clients */}
        {typeAnnonce === "livraison_client" && (
          <select
            name="entrepot_arrivee_id"
            value={form.entrepot_arrivee_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Ville d'arrivée</option>
            {entrepots.map((e) => (
              <option key={e.id} value={e.id}>
                {e.ville}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          name="photo"
          placeholder="URL de la photo (optionnel)"
          value={form.photo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading || entrepots.length === 0}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Redirection..." : "Créer l'annonce"}
        </button>
      </form>
    </div>
  );
}
