import RegisterPrestataire from "./RegisterPrestataire";

export default function DevenirPrestataire() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <img
        src={`${import.meta.env.VITE_API_URL}/storage/prestataire-public.png`}
        alt="Prestataire EcoDeli souriant avec mallette"
        className="mx-auto mb-6"
      />
      <h1 className="text-3xl font-bold text-center mb-4">
        Devenir prestataire sur EcoDeli
      </h1>
      <p className="mb-2">
        Sur EcoDeli, les prestataires proposent des services utiles au quotidien : aide à domicile, courses, accompagnement, etc.
      </p>
      <p className="mb-2">Une fois votre profil validé, vous pourrez :</p>
      <ul className="list-disc ml-6 space-y-1 mb-4">
        <li>Publier vos prestations dans votre domaine</li>
        <li>Gérer vos plannings et vos disponibilités</li>
        <li>Intervenir chez des clients proches de vous</li>
        <li>Consulter et générer vos factures mensuelles</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">🧭 Les étapes :</h2>
      <ol className="list-decimal ml-6 space-y-1 mb-8">
        <li>Remplissez le formulaire d’inscription et envoyez vos justificatifs</li>
        <li>Attendez la validation de votre profil par notre équipe</li>
        <li>Publiez vos prestations et recevez vos premières demandes</li>
        <li>Intervenez chez les clients, enregistrez vos prestations</li>
        <li>Recevez vos paiements automatiquement chaque mois</li>
      </ol>
      <div className="max-w-xl mx-auto">
        <RegisterPrestataire />
      </div>
    </div>
  );
}
