import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return children;
}
