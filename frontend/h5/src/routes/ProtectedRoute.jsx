import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "/src/store/userStore";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRoles }) => {
  const { role } = useUserStore.getState();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

export default ProtectedRoute;