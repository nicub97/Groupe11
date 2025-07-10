import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import RoleRoute from "./RoleRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RegisterCommercant from "../pages/RegisterCommercant";
import RegisterLivreur from "../pages/RegisterLivreur";
import RegisterPrestataire from "../pages/RegisterPrestataire";
import Profil from "../pages/Profil";
import EditProfil from "../pages/EditProfil";
import ChangePassword from "../pages/ChangePassword";
import ResetPassword from "../pages/ResetPassword";
import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "./PrivateRoute";
import Annonces from "../pages/Annonces";
import CreerAnnonce from "../pages/CreerAnnonce";
import AnnonceDetail from "../pages/AnnonceDetail";
import AdresseLivraison from "../pages/AdresseLivraison";
import Paiement from "../pages/Paiement";
import PaiementSuccess from "../pages/PaiementSuccess";
import PaiementCancel from "../pages/PaiementCancel";
import MesAnnonces from "../pages/MesAnnonces";
import AnnoncesDisponibles from "../pages/AnnoncesDisponibles";
import Factures from "../pages/Factures";
import ProfilPrestataire from "../pages/ProfilPrestataire";
import ProfilLivreur from "../pages/ProfilLivreur";
import PublierPrestation from "../pages/PublierPrestation";
import Notifications from "../pages/Notifications";
import Catalogue from "../pages/Catalogue";
import PrestationDetail from "../pages/PrestationDetail";
import Prestations from "../pages/Prestations";
import Disponibilites from "../pages/Disponibilites";
import MesTrajets from "../pages/MesTrajets";
import MesEtapes from "../pages/MesEtapes";
import ValidationCodeBox from "../pages/ValidationCodeBox";
import SuiviAnnonce from "../pages/SuiviAnnonce";
import ReserverAnnonce from "../pages/ReserverAnnonce";
import MesPaiements from "../pages/client/MesPaiements";

export default function AppRouter() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-commercant" element={<RegisterCommercant />} />
          <Route path="/register-livreur" element={<RegisterLivreur />} />
          <Route
            path="/register-prestataire"
            element={<RegisterPrestataire />}
          />
          <Route
            path="/annonces"
            element={
              <PrivateRoute>
                <RoleRoute role={["client", "commercant"]}>
                  <Annonces />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/annonces/:id"
            element={
              <PrivateRoute>
                <AnnonceDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/annonces/creer"
            element={
              <PrivateRoute>
                <RoleRoute role={["client", "commercant"]}>
                  <CreerAnnonce />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/mes-annonces"
            element={
              <PrivateRoute>
                <RoleRoute role={["client", "commercant"]}>
                  <MesAnnonces />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/adresse-livraison/:commandeId"
            element={<AdresseLivraison />}
          />
          <Route
            path="/paiement/:commandeId"
            element={
              <PrivateRoute>
                <Paiement />
              </PrivateRoute>
            }
          />
          <Route
            path="/paiement/success"
            element={
              <PrivateRoute>
                <PaiementSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path="/paiement/cancel"
            element={
              <PrivateRoute>
                <PaiementCancel />
              </PrivateRoute>
            }
          />
          <Route
            path="/monprofil"
            element={
              <PrivateRoute>
                <Profil />
              </PrivateRoute>
            }
          />

          <Route
            path="/profil/edit"
            element={
              <PrivateRoute>
                <EditProfil />
              </PrivateRoute>
            }
          />

          <Route
            path="/profil/motdepasse"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          <Route
            path="/profil/resetpassword"
            element={
              <PrivateRoute>
                <ResetPassword />
              </PrivateRoute>
            }
          />

          <Route
            path="/mes-trajets"
            element={
              <PrivateRoute>
                <RoleRoute role="livreur">
                  <MesTrajets />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/mes-etapes"
            element={
              <PrivateRoute>
                <RoleRoute role="livreur">
                  <MesEtapes />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/annonces-disponibles"
            element={
              <PrivateRoute>
                <AnnoncesDisponibles />
              </PrivateRoute>
            }
          />

          <Route
            path="/mes-paiements"
            element={
              <PrivateRoute>
                <RoleRoute role="client">
                  <MesPaiements />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/disponibilites"
            element={
              <PrivateRoute>
                <RoleRoute role={["prestataire"]}>
                  <Disponibilites />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/prestations"
            element={
              <PrivateRoute>
                <RoleRoute role={["client", "prestataire"]}>
                  <Prestations />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/prestations/:id"
            element={
              <PrivateRoute>
                <PrestationDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/factures"
            element={
              <PrivateRoute>
                <RoleRoute role={["prestataire"]}>
                  <Factures />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/profil-prestataire"
            element={
              <PrivateRoute>
                <RoleRoute role={["prestataire"]}>
                  <ProfilPrestataire />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/profil-livreur"
            element={
              <PrivateRoute>
                <RoleRoute role={["livreur"]}>
                  <ProfilLivreur />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/prestations/publier"
            element={
              <PrivateRoute>
                <RoleRoute role="prestataire">
                  <PublierPrestation />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          <Route path="/prestations/catalogue" element={<Catalogue />} />

          <Route
            path="/validation-code/:id"
            element={
              <PrivateRoute>
                <ValidationCodeBox />
              </PrivateRoute>
            }
          />

          <Route
            path="/annonces/:annonceId/suivi"
            element={
              <PrivateRoute>
                <SuiviAnnonce />
              </PrivateRoute>
            }
          />

          <Route
            path="/annonces/:annonceId/reserver"
            element={
              <PrivateRoute>
                <ReserverAnnonce />
              </PrivateRoute>
            }
          />
        </Routes>
      </MainLayout>
    </Router>
  );
}
