import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { useAuth } from "../context/AuthContext";

export default function Tutorial() {
  const { user, completeTutorial } = useAuth();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (user && user.role && user.tutorial_done === false) {
      setSteps(getSteps(user.role));
      setRun(true);
    }
  }, [user]);

  const getSteps = (role) => {
    switch (role) {
      case "livreur":
        return [
          { target: '[data-tour="trajets"]', content: "Renseignez d'abord vos trajets disponibles ici." },
          { target: '[data-tour="annonces-disponibles"]', content: "Consultez ensuite les annonces correspondant à vos trajets." },
          { target: '[data-tour="mes-etapes"]', content: "Suivez vos étapes de livraison." },
          { target: '[data-tour="factures"]', content: "Générez vos factures ici." }
        ];
      case "client":
        return [
          { target: '[data-tour="creer-annonce"]', content: "Publiez une annonce de livraison." },
          { target: '[data-tour="catalogue"]', content: "Réservez un service depuis le catalogue." },
          { target: '[data-tour="prestations"]', content: "Retrouvez vos prestations passées." },
          { target: '[data-tour="factures"]', content: "Accédez à vos factures." }
        ];
      case "commercant":
        return [
          { target: '[data-tour="creer-annonce"]', content: "Créez vos annonces de livraison." },
          { target: '[data-tour="mes-annonces"]', content: "Gérez vos annonces publiées." },
          { target: '[data-tour="factures"]', content: "Consultez vos factures." }
        ];
      case "prestataire":
        return [
          { target: '[data-tour="planning"]', content: "Définissez vos disponibilités." },
          { target: '[data-tour="prestations"]', content: "Suivez les prestations assignées." },
          { target: '[data-tour="factures"]', content: "Facturation mensuelle disponible ici." },
          { target: '[data-tour="evaluations"]', content: "Visualisez vos évaluations." }
        ];
      default:
        return [];
    }
  };

  const handleCallback = (data) => {
    if (data.status === "finished" || data.status === "skipped") {
      setRun(false);
      completeTutorial();
    }
  };

  if (!run) return null;

  return (
    <Joyride
      continuous
      scrollToFirstStep
      showSkipButton
      run={run}
      steps={steps}
      callback={handleCallback}
      styles={{ options: { zIndex: 10000 } }}
    />
  );
}
