import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/utilisateurs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error(error);
        alert('Erreur lors du chargement des utilisateurs');
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Bienvenue {user?.prenom}</h1>
      <button onClick={logout}>Se déconnecter</button>
      <h2>Utilisateurs</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.prenom} {u.nom} - {u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}
