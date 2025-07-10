import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-bold">
        <Link to="/admin">EcoDeli Admin</Link>
      </div>

      <div className="flex gap-4 items-center">
        {!token ? (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            Se connecter
          </Link>
        ) : (
          <>
            <Link to="/admin" className="hover:text-gray-300 transition">
              Dashboard
            </Link>

            <details>
              <summary>Utilisateurs</summary>
              <ul>
                <li>
                  <Link to="/admin/utilisateurs">Liste utilisateurs</Link>
                </li>
                <li>
                  <Link to="/admin/livreurs">Livreurs</Link>
                </li>
                <li>
                  <Link to="/admin/prestataires">Prestataires</Link>
                </li>
              </ul>
            </details>

            <details>
              <summary>Activité</summary>
              <ul>
                <li>
                  <Link to="/admin/annonces">Annonces</Link>
                </li>
                <li>
                  <Link to="/admin/prestations">Prestations</Link>
                </li>
                <li>
                  <Link to="/admin/entrepots">Entrep\u00F4ts</Link>
                </li>
                <li>
                  <Link to="/admin/factures-prestataires">Factures Prestataires</Link>
                </li>
                <li>
                  <Link to="/admin/paiements">Paiements</Link>
                </li>
              </ul>
            </details>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
