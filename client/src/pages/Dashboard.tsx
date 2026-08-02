import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">TaskPilot AI</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Log out
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.name ?? "there"}
        </h2>
        <p className="mt-2 text-slate-600">
          You are signed in as {user?.email}
        </p>
      </div>
    </main>
  );
}
