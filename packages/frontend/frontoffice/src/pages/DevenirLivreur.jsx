import RegisterLivreur from "./RegisterLivreur";
import api from "../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function DevenirLivreur() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <img
        src={`${STORAGE_BASE_URL}/storage/livreur-public.png`}
        alt="Livreur souriant avec téléphone et colis"
        className="mx-auto mb-6"
      />
      <h1 className="text-3xl font-bold text-center mb-4">
        Devenir livreur chez EcoDeli
      </h1>
      <p className="mb-2">
        En tant que livreur EcoDeli, vous contribuez à un transport local plus durable.
      </p>
      <p className="mb-2">
        Vous recevez automatiquement des annonces de livraison compatibles avec vos trajets.
      </p>
      <p className="mb-4">
        Chaque livraison est rémunérée et vous suivez vos étapes grâce à un système de codes sécurisés.
      </p>
      <h2 className="text-xl font-semibold mb-2">Étapes pour devenir livreur :</h2>
      <ol className="list-decimal ml-6 space-y-1 mb-8">
        <li>Inscrivez-vous avec vos informations et justificatifs</li>
        <li>Attendez la validation de votre profil par l’équipe EcoDeli</li>
        <li>Définissez vos trajets et disponibilités</li>
        <li>Acceptez les livraisons compatibles avec votre trajet</li>
        <li>Suivez chaque étape via un système de retrait/dépôt sécurisé</li>
        <li>Recevez automatiquement vos paiements après validation finale</li>
      </ol>
      <div className="max-w-xl mx-auto">
        <RegisterLivreur />
      </div>
    </div>
  );
}
