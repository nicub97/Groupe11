import { useEffect, useState } from "react";
import api from "../../services/api";

export default function PrestationList() {
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type_prestation: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
    }
  };

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

  // A prestation is considered engaged only if a client has booked it
  const isEngagee = (p) => p.client_id != null;

  const startEdit = (prestation) => {
    setEditingId(prestation.id);
    setForm({
      type_prestation: prestation.type_prestation || "",
      description: prestation.description || "",
    });
    setErrors({});
  };

  const resetForm = () => {
    setForm({ type_prestation: "", description: "" });
    setEditingId(null);
  };

  const filteredPrestations = prestations.filter((p) => {
    const term = searchText.toLowerCase();
    const matchesText =
      p.type_prestation.toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter ? p.statut === statusFilter : true;
    return matchesText && matchesStatus;
  });

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des prestations</h1>
      {apiError && (
        <p className="text-red-600" role="alert">
          {apiError}
        </p>
      )}

      {editingId && (
        <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded space-y-4">
          <h2 className="text-xl font-semibold">Modifier la prestation</h2>
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
          <div className="flex gap-4">
            <button type="submit" className="admin-btn-primary">
              Mettre à jour
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="admin-btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Rechercher..."
          className="border p-2 rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="acceptee">Acceptée</option>
          <option value="refusee">Refusée</option>
          <option value="terminee">Terminée</option>
        </select>
        <button onClick={() => {setSearchText('');setStatusFilter('');}} className="admin-btn-secondary">
          Réinitialiser les filtres
        </button>
      </div>

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
            {filteredPrestations.map((p) => (
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
                  {!isEngagee(p) && (
                    <>
                      <button onClick={() => startEdit(p)} className="text-yellow-600 hover:underline">
                        Modifier
                      </button>
                      <button onClick={() => deletePrestation(p.id)} className="text-red-600 hover:underline">
                        Supprimer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
