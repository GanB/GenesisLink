import { Navigate, useLocation } from "react-router-dom";

const Authorized = ({ children }) => {
  const location = useLocation();

  if (sessionStorage.getItem("app_user")) {
    return children;
  } else {
    return <Navigate to={`/signin`} replace state={{ location }} />;
  }
};

export default Authorized;
