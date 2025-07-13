import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import UsersList from "../pages/admin/UsersList";
import AddUser from "../pages/admin/AddUser";
import AddAdmin from "../pages/admin/AddAdmin";
import EditUserForm from "../pages/admin/EditUserForm";
import UserDetails from "../pages/admin/UserDetails";
import AnnoncesList from "../pages/admin/AnnoncesList";
import EntrepotsList from "../pages/admin/EntrepotsList";
import PrestationList from "../pages/admin/PrestationList";
import AdminPrestataires from "../pages/admin/AdminPrestataires";
import AdminLivreur from "../pages/admin/AdminLivreur";
import AdminFactures from "../pages/admin/AdminFactures";
import PaiementsList from "../pages/admin/PaiementsList";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="utilisateurs" element={<UsersList />} />
        <Route path="utilisateurs/ajouter" element={<AddUser />} />
        <Route path="utilisateurs/ajouter-admin" element={<AddAdmin />} />
        <Route path="utilisateurs/:id/edit" element={<EditUserForm />} />
        <Route path="utilisateurs/:id" element={<UserDetails />} />
        <Route path="annonces" element={<AnnoncesList />} />
        <Route path="entrepots" element={<EntrepotsList />} />
        <Route path="prestations" element={<PrestationList />} />
        <Route path="prestataires" element={<AdminPrestataires />} />
        <Route path="livreurs" element={<AdminLivreur />} />
        <Route path="factures-prestataires" element={<AdminFactures />} />
        <Route path="paiements" element={<PaiementsList />} />
      </Route>
    </Routes>
  );
}