import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/utilisateurs")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchText.toLowerCase();
    const matchesText =
      (u.nom || "").toLowerCase().includes(term) ||
      (u.prenom || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term);
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesText && matchesRole;
  });

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Liste des utilisateurs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/utilisateurs/ajouter-admin")}
            className="admin-btn-primary"
          >
            Créer un admin
          </button>
          <button
            onClick={() => navigate("/admin/utilisateurs/ajouter")}
            className="admin-btn-primary"
          >
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Rechercher..."
          className="border p-2 rounded"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="commercant">Commerçant</option>
          <option value="livreur">Livreur</option>
          <option value="prestataire">Prestataire</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => {
            setSearchText("");
            setRoleFilter("");
          }}
          className="admin-btn-secondary"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Prénom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rôle</th>
              <th className="p-3">Pays</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.nom}</td>
                <td className="p-3">{user.prenom}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">{user.pays}</td>
                <td className="p-3">{user.telephone}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  <Link
                    to={`/admin/utilisateurs/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Voir
                  </Link>
                  <Link
                    to={`/admin/utilisateurs/${user.id}/edit`}
                    className="text-yellow-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
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

  function handleDelete(id) {
    if (!confirm("Confirmer la suppression de l'utilisateur ?")) return;
    api
      .delete(`/utilisateurs/${id}`)
      .then(() => setUsers(users.filter((u) => u.id !== id)))
      .catch((err) => console.error(err));
  }
}