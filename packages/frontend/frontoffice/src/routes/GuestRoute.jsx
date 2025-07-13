import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const { user } = useAuth();

  return user ? <Navigate to="/" replace /> : children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
