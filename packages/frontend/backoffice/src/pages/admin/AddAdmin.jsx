import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AddAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    identifiant: "",
    password: "",
    password_confirmation: "",
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

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Les mots de passe ne correspondent pas."] });
      return;
    }

    try {
      await api.post("/admin/register", {
        nom: form.nom,
        prenom: form.prenom,
        identifiant: form.identifiant,
        password: form.password,
      });
      alert("Administrateur créé !");
      navigate("/admin/utilisateurs");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Erreur lors de la création de l'administrateur");
      }
    }
  };

  const handleCancel = () => {
    navigate("/admin/utilisateurs");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-6">Ajouter un administrateur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nom</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
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
            required
          />
          {errors.prenom && <p className="text-red-600 text-sm">{errors.prenom[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Identifiant</label>
          <input
            type="text"
            name="identifiant"
            value={form.identifiant}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.identifiant && (
            <p className="text-red-600 text-sm">{errors.identifiant[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Confirmation du mot de passe</label>
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.password_confirmation && (
            <p className="text-red-600 text-sm">{errors.password_confirmation[0]}</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
