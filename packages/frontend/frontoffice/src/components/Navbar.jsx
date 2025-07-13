import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (user?.role === "livreur" && location.pathname === "/") {
      navigate("/mes-trajets");
    }
  }, [user, location, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getMenuItems = () => {
    if (!user) return [];

    const common = [
      { path: "/monprofil", label: "Mon Profil", group: "profil" },
      { path: "/notifications", label: "Notifications" },
      { path: "/profil/motdepasse", label: "Modifier mot de passe", group: "profil" },
    ];

    if (user.role === "client") {
      return [
        ...common,
        { path: "/annonces", label: "Annonces", group: "annonces" },
        { path: "/mes-annonces", label: "Mes annonces", group: "annonces" },

        { path: "/prestations/catalogue", label: "Catalogue", group: "prestations" },
        { path: "/prestations", label: "Mes prestations", group: "prestations" },
        { path: "/mes-paiements", label: "Mes paiements", group: "profil" },
        { path: "/factures-manuelles", label: "Factures", group: "profil" },
      ];
    }

    if (user.role === "prestataire") {
      return [
        ...common,
        { path: "/prestations", label: "Prestations assignées", group: "prestations" },
        { path: "/disponibilites", label: "Disponibilités", group: "prestations" },
        { path: "/prestations/publier", label: "Publier une prestation", group: "prestations" },
        { path: "/factures", label: "Factures", group: "profil" },
      ];
    }

    if (user.role === "commercant") {
      return [
        ...common,
        { path: "/annonces/creer", label: "Créer une annonce", group: "annonces" },
        { path: "/mes-annonces", label: "Mes annonces", group: "annonces" },
        { path: "/factures-manuelles", label: "Factures", group: "profil" },
      ];
    }

    if (user.role === "livreur") {
      return [
        ...common,
        { path: "/mes-trajets", label: "Mes trajets", group: "annonces" },
        { path: "/annonces-disponibles", label: "Annonces disponibles", group: "annonces" },
        { path: "/mes-etapes", label: "Mes étapes", group: "annonces" },
        { path: "/factures-manuelles", label: "Factures", group: "profil" },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems();

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
    <header
      ref={navRef}
      className="bg-white text-green-900 shadow-md sticky top-0 z-50 border-b border-gray-200"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold hover:text-lime-300 transition">
          EcoDeli
        </Link>

        <ul className="hidden sm:flex gap-6 text-sm font-medium items-center">
          <li>
            <button
              onClick={() => navigate(-1)}
              className="hover:text-lime-300 transition"
            >
              ← Retour
            </button>
          </li>
          <li><Link to="/" className="hover:text-lime-300 transition">Accueil</Link></li>

          {!user ? (
            <>
              {/* Liens vitrine accessibles sans connexion */}
              <li>
                <Link
                  to="/annonces-public"
                  className="hover:text-lime-300 transition"
                >
                  Annonces
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogue-public"
                  className="hover:text-lime-300 transition"
                >
                  Prestations
                </Link>
              </li>
              <li>
                  <Link
                    to="/Devenir-livreur"
                    className="block hover:text-lime-300"
                  >
                    Devenir Livreur
                  </Link>
              </li>
              <li>
                <Link
                  to="/devenir-prestataire"
                  className="hover:text-lime-300 transition"
                >
                  Devenir prestataire
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-lime-300 transition"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-lime-300 transition"
                >
                  Inscription
                </Link>
              </li>
            </>
          ) : (
            <>
              {(user.role === "prestataire" || user.role === "client") && (
                <li>
                  <details className="relative group">
                    <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                      Prestations
                      <svg
                        className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 7l5 5 5-5H5z" />
                      </svg>
                    </summary>
                    <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                      {menuItems
                        .filter((i) => i.group === "prestations")
                        .map((item) => (
                          <li key={item.path}>
                            <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                              {item.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </details>
                </li>
              )}
              {user.role !== "prestataire" && (
              <li>
                <details className="relative group">
                  <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                    Annonces / Livraisons
                    <svg
                      className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 7l5 5 5-5H5z" />
                    </svg>
                  </summary>
                  <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                    {menuItems
                      .filter((i) => i.group === "annonces")
                      .map((item) => (
                        <li key={item.path}>
                          <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </details>
              </li>
              )}
              <li>
                <details className="relative group">
                  <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                    Paiement / Profil
                    <svg
                      className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 7l5 5 5-5H5z" />
                    </svg>
                  </summary>
                  <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                    {menuItems
                      .filter((i) => i.group === "profil")
                      .map((item) => (
                        <li key={item.path}>
                          <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </details>
              </li>
              {menuItems
                .filter((i) => !i.group)
                .map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>{item.label}</Link>
                  </li>
                ))}
              <li>
                <button onClick={handleLogout} className="hover:text-red-300 transition">
                  Se déconnecter
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 border border-white px-3 py-1 rounded-md hover:bg-white hover:text-green-700 transition"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>
      </nav>

      <Transition
        show={menuOpen}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 -translate-y-2"
        enterTo="transform opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 translate-y-0"
        leaveTo="transform opacity-0 -translate-y-2"
      >
        <div className="sm:hidden bg-white px-6 pb-4 space-y-2 text-sm font-medium text-green-900">
          <ul>
            <li>
              <button
                onClick={() => navigate(-1)}
                className="block hover:text-lime-300"
              >
                ← Retour
              </button>
            </li>
            <li><Link to="/" className="block hover:text-lime-300">Accueil</Link></li>
            {!user ? (
              <>
                {/* Liens vitrine accessibles sans connexion */}
                <li>
                  <Link
                    to="/annonces-public"
                    className="block hover:text-lime-300"
                  >
                    Annonces
                  </Link>
                </li>
                <li>
                  <Link
                    to="/catalogue-public"
                    className="block hover:text-lime-300"
                  >
                    Prestations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Devenir-livreur"
                    className="block hover:text-lime-300"
                  >
                    Devenir Livreur
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devenir-prestataire"
                    className="hover:text-lime-300 transition"
                  >
                    Devenir prestataire
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="block hover:text-lime-300">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="block hover:text-lime-300">
                    Inscription
                  </Link>
                </li>
              </>
            ) : (
              <>
                {(user.role === "prestataire" || user.role === "client") && (
                  <li>
                    <details className="relative group">
                      <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                        Prestations
                        <svg
                          className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M5 7l5 5 5-5H5z" />
                        </svg>
                      </summary>
                      <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                        {menuItems
                          .filter((i) => i.group === "prestations")
                          .map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                                {item.label}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </details>
                  </li>
                )}
                {user.role !== "prestataire" && (
                <li>
                  <details className="relative group">
                    <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                      Annonces / Livraisons
                      <svg
                        className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 7l5 5 5-5H5z" />
                      </svg>
                    </summary>
                    <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                      {menuItems
                        .filter((i) => i.group === "annonces")
                        .map((item) => (
                          <li key={item.path}>
                              <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                              {item.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </details>
                </li>
                )}
                <li>
                  <details className="relative group">
                    <summary className="flex items-center gap-1 px-3 py-2 rounded cursor-pointer text-green-700 hover:bg-green-50 transition">
                      Paiement / Profil
                      <svg
                        className="w-4 h-4 ml-1 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 7l5 5 5-5H5z" />
                      </svg>
                    </summary>
                    <ul className="absolute z-10 mt-2 w-48 bg-white border border-green-200 rounded shadow-lg py-1 text-sm">
                      {menuItems
                        .filter((i) => i.group === "profil")
                        .map((item) => (
                          <li key={item.path}>
                            <Link to={item.path} className="block px-4 py-2 hover:bg-green-50 text-green-800">
                              {item.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </details>
                </li>
                {menuItems
                  .filter((i) => !i.group)
                  .map((item) => (
                    <li key={item.path}>
                        <Link to={item.path}>{item.label}</Link>
                    </li>
                  ))}
                <li>
                  <button onClick={handleLogout} className="block hover:text-red-300">Se déconnecter</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </Transition>
    </header>
  );
}
