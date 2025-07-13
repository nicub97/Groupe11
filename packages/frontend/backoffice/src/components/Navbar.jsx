import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!navRef.current) return;
      const openMenus = navRef.current.querySelectorAll('details[open]');
      openMenus.forEach((menu) => {
        if (!menu.contains(e.target)) {
          menu.removeAttribute('open');
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center"
    >
      <div className="text-lg font-bold">
        <Link to="/admin">EcoDeli Admin</Link>
      </div>

      <div className="flex gap-4 items-center">
        {!user ? (
          <Link
            to="/login"
            className="admin-btn-primary"
          >
            Se connecter
          </Link>
        ) : (
          <>
            <Link to="/admin" className="hover:text-gray-300 transition">
              Dashboard
            </Link>

            <details className="relative group">
              <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                Utilisateurs
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 7l5 5 5-5H5z" />
                </svg>
              </summary>
              <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                <li>
                  <Link to="/admin/utilisateurs" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Liste utilisateurs
                  </Link>
                </li>
                <li>
                  <Link to="/admin/livreurs" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Livreurs
                  </Link>
                </li>
                <li>
                  <Link to="/admin/prestataires" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Prestataires
                  </Link>
                </li>
              </ul>
            </details>

            <details className="relative group">
              <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                Activité
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 7l5 5 5-5H5z" />
                </svg>
              </summary>
              <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                <li>
                  <Link to="/admin/annonces" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Annonces
                  </Link>
                </li>
                <li>
                  <Link to="/admin/prestations" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Prestations
                  </Link>
                </li>
                <li>
                  <Link to="/admin/entrepots" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Entrepots
                  </Link>
                </li>
                <li>
                  <Link to="/admin/factures-prestataires" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Factures Prestataires
                  </Link>
                </li>
                <li>
                  <Link to="/admin/paiements" className="block px-4 py-2 hover:bg-green-50 text-green-800">
                    Paiements
                  </Link>
                </li>
              </ul>
            </details>

            <button
              onClick={handleLogout}
              className="admin-btn-danger"
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}