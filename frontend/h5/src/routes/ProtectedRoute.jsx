import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "/src/store/userStore";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRoles }) => {
  // useUserStore((state) => ...) 형태로 구독해야 상태 변경이 반영됩니다.
  const role = useUserStore((state) => state.role);

  // 권한 체크
  if (role === "") {
    return <div>Loading...</div>;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
