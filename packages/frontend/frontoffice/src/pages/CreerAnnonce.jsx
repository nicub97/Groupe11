import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { createCheckoutSession } from "../services/paiement";

export default function CreerAnnonce() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  // Déterminer le type selon le rôle
  let typeAnnonce = null;
  if (user?.role === "client") typeAnnonce = "livraison_client";
  else if (user?.role === "commercant") typeAnnonce = "produit_livre";

  const [entrepots, setEntrepots] = useState([]);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix_propose: "",
    entrepot_depart_id: "",
    entrepot_arrivee_id: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      if (user?.role === "client") {
        localStorage.setItem(
          "annonceForm",
          JSON.stringify({ form, type: typeAnnonce })
        );
        if (photoPreview) {
          localStorage.setItem("annoncePhoto", photoPreview);
        }
        const { checkout_url } = await createCheckoutSession(
          { montant: form.prix_propose, type: typeAnnonce },
          token,
          "creer"
        );
        window.location.href = checkout_url;
      } else {
        const data = new FormData();
        for (const key in form) {
          data.append(key, form[key]);
        }
        data.append("type", typeAnnonce);
        if (photoFile) data.append("photo", photoFile);
        await api.post("/annonces", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("✅ Annonce créée avec succès !");
        setSuccess(true);
        setForm({
          titre: "",
          description: "",
          prix_propose: "",
          entrepot_depart_id: "",
          entrepot_arrivee_id: "",
        });
        setPhotoFile(null);
        setPhotoPreview("");
        setTimeout(() => navigate("/annonces"), 1500);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (user?.role === "client"
          ? "Erreur lors de la redirection de paiement."
          : "Erreur lors de la création de l'annonce.");
      setMessage(msg);
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Créer une annonce</h2>
      {message && (
        <p className={`mb-2 ${success ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
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
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full p-2 border rounded"
        />
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Aperçu"
            className="h-32 object-contain mt-2"
          />
        )}

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
