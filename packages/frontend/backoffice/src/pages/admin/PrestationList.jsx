import { useEffect, useState } from "react";
import api from "../../services/api";

export default function PrestationList() {
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    prestataire_id: "",
    client_id: "",
    type_prestation: "",
    description: "",
    date_heure: "",
    duree_estimee: "",
    tarif: "",
    statut: "en_attente",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetchPrestations();
  }, []);

  async function fetchPrestations() {
    try {
      const res = await api.get("/prestations");
      setPrestations(res.data);
    } catch (err) {
      console.error(err);
      setApiError("Erreur lors du chargement des prestations");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    if (editingId) {
      await updatePrestation();
    } else {
      await createPrestation();
    }
  };

  async function createPrestation() {
    try {
      const res = await api.post("/prestations", form);
      setPrestations([...prestations, res.data.prestation]);
      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setApiError(err.response?.data?.message || "Erreur lors de la création");
      }
    }
  }

  async function updatePrestation() {
    try {
      const res = await api.put(`/prestations/${editingId}`, form);
      setPrestations((prev) =>
        prev.map((p) => (p.id === editingId ? res.data.prestation : p))
      );
      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setApiError(err.response?.data?.message || "Erreur lors de la mise à jour");
      }
    }
  }

  async function deletePrestation(id) {
    if (!window.confirm("Confirmer la suppression de la prestation ?")) return;
    try {
      await api.delete(`/prestations/${id}`);
      setPrestations((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setApiError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  }

  const startEdit = (prestation) => {
    setEditingId(prestation.id);
    setForm({
      prestataire_id: prestation.prestataire_id || "",
      client_id: prestation.client_id || "",
      type_prestation: prestation.type_prestation || "",
      description: prestation.description || "",
      date_heure: prestation.date_heure || "",
      duree_estimee: prestation.duree_estimee || "",
      tarif: prestation.tarif || "",
      statut: prestation.statut || "en_attente",
    });
    setErrors({});
  };

  const resetForm = () => {
    setForm({
      prestataire_id: "",
      client_id: "",
      type_prestation: "",
      description: "",
      date_heure: "",
      duree_estimee: "",
      tarif: "",
      statut: "en_attente",
    });
    setEditingId(null);
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des prestations</h1>
      {apiError && (
        <p className="text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Modifier la prestation" : "Nouvelle prestation"}
        </h2>
        <div>
          <label className="block font-semibold">Prestataire ID</label>
          <input
            type="number"
            name="prestataire_id"
            value={form.prestataire_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.prestataire_id && (
            <p className="text-red-600 text-sm">{errors.prestataire_id[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Client ID</label>
          <input
            type="number"
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.client_id && (
            <p className="text-red-600 text-sm">{errors.client_id[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Type</label>
          <input
            type="text"
            name="type_prestation"
            value={form.type_prestation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.type_prestation && (
            <p className="text-red-600 text-sm">{errors.type_prestation[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.description && (
            <p className="text-red-600 text-sm">{errors.description[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Date et heure</label>
          <input
            type="datetime-local"
            name="date_heure"
            value={form.date_heure}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.date_heure && (
            <p className="text-red-600 text-sm">{errors.date_heure[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Durée estimée (min)</label>
          <input
            type="number"
            name="duree_estimee"
            value={form.duree_estimee}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.duree_estimee && (
            <p className="text-red-600 text-sm">{errors.duree_estimee[0]}</p>
          )}
        </div>
        <div>
          <label className="block font-semibold">Tarif</label>
          <input
            type="number"
            name="tarif"
            value={form.tarif}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.tarif && <p className="text-red-600 text-sm">{errors.tarif[0]}</p>}
        </div>
        <div>
          <label className="block font-semibold">Statut</label>
          <input
            type="text"
            name="statut"
            value={form.statut}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.statut && <p className="text-red-600 text-sm">{errors.statut[0]}</p>}
        </div>
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date</th>
              <th className="p-3">Durée</th>
              <th className="p-3">Tarif</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Prestataire</th>
              <th className="p-3">Client</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prestations.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.type_prestation}</td>
                <td className="p-3">{p.description}</td>
                <td className="p-3">{p.date_heure}</td>
                <td className="p-3">{p.duree_estimee}</td>
                <td className="p-3">{p.tarif}</td>
                <td className="p-3">{p.statut}</td>
                <td className="p-3">{p.prestataire_id}</td>
                <td className="p-3">{p.client_id}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => startEdit(p)} className="text-yellow-600 hover:underline">
                    Modifier
                  </button>
                  <button onClick={() => deletePrestation(p.id)} className="text-red-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
