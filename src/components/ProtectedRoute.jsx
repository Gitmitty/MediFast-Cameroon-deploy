import { Navigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/RequireLogin" replace state={{ message: "Please log in first" }} />;
  }

  return children;
};

export default ProtectedRoute;
