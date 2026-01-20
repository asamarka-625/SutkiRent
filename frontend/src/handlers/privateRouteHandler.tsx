import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";

interface PrivateRouterProps {
  Component: React.ComponentType;
}

interface ReRouteProps {
  Component: React.ComponentType;
  Reroute: string;
}

export const ReRoute = ({ Component, Reroute }: ReRouteProps): ReactElement => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  return isAuthenticated ? (
    <Navigate to={Reroute} state={{ from: location }} replace />
  ) : (
    <Component />
  );
};

export const PrivateRoute = ({
  Component,
}: PrivateRouterProps): ReactElement => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  return isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};


