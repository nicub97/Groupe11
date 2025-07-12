import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children, redirectTo }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (token || user) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;

    // Fallback based on current path
    if (location.pathname.startsWith("/annonces-public")) {
      const parts = location.pathname.split("/");
      if (parts.length > 2) {
        return <Navigate to={`/annonces/${parts[2]}`} replace />;
      }
      return <Navigate to="/annonces" replace />;
    }
    if (location.pathname.startsWith("/prestations/catalogue-public")) {
      const parts = location.pathname.split("/");
      if (parts.length > 3) {
        return <Navigate to={`/prestations/${parts[3]}`} replace />;
      }
      return <Navigate to="/prestations/catalogue" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};
