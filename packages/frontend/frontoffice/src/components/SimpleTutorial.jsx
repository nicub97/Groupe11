import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SimpleTutorial() {
  const { user, completeTutorial } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user && user.role && user.tutorial_done === false) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user]);

  if (!visible) return null;

  const getContent = (role) => {
    switch (role) {
      case "livreur":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Bienvenue livreur !</h2>
            <p className="mb-1">Commencez par renseigner vos trajets disponibles.</p>
            <p className="mb-1">Vous pourrez ensuite consulter les annonces correspondantes, suivre vos étapes et générer vos factures.</p>
          </>
        );
      case "client":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Bienvenue client !</h2>
            <p className="mb-1">Publiez une annonce de livraison ou réservez un service depuis le catalogue.</p>
            <p className="mb-1">Retrouvez ensuite vos prestations et vos factures dans votre espace.</p>
          </>
        );
      case "commercant":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Bienvenue commerçant !</h2>
            <p className="mb-1">Créez vos annonces de livraison puis gérez-les depuis votre tableau de bord.</p>
            <p className="mb-1">Vous pourrez consulter vos factures à tout moment.</p>
          </>
        );
      case "prestataire":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Bienvenue prestataire !</h2>
            <p className="mb-1">Définissez votre planning et vos disponibilités.</p>
            <p className="mb-1">Suivez les prestations qui vous sont assignées, consultez vos évaluations et générez vos factures.</p>
          </>
        );
      default:
        return null;
    }
  };

  const finish = () => {
    completeTutorial();
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 max-w-xl mx-4 text-center">
        {getContent(user.role)}
        <button
          onClick={finish}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
