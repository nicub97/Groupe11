import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  // Redirection vers /login si pas connecté
  return user ? children : <Navigate to="/login" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
