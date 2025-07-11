import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "client",
    telephone: "",
    pays: "",
    adresse_postale: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await api.post("/utilisateurs", form);
      alert("Utilisateur créé !");
      navigate("/admin/utilisateurs");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Erreur lors de la création de l'utilisateur");
      }
    }
  };

  const handleCancel = () => {
    navigate("/admin/utilisateurs");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-6">Ajouter un utilisateur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nom</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.nom && <p className="text-red-600 text-sm">{errors.nom[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.prenom && <p className="text-red-600 text-sm">{errors.prenom[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Rôle</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="client">Client</option>
            <option value="commercant">Commerçant</option>
            <option value="prestataire">Prestataire</option>
            <option value="livreur">Livreur</option>
          </select>
          {errors.role && <p className="text-red-600 text-sm">{errors.role[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.telephone && <p className="text-red-600 text-sm">{errors.telephone[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Pays</label>
          <input
            type="text"
            name="pays"
            value={form.pays}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.pays && <p className="text-red-600 text-sm">{errors.pays[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Adresse Postale</label>
          <input
            type="text"
            name="adresse_postale"
            value={form.adresse_postale}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.adresse_postale && (
            <p className="text-red-600 text-sm">{errors.adresse_postale[0]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="admin-btn-primary"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="admin-btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
