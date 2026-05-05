import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/patients/search?q=&page=1&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          patientsCount: data.pagination.total,
          recentPatients: data.data,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer"
          >
            <Logo size="md" showText={true} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-sm text-blue-100">
                {user?.roles?.[0] || "Utilisateur"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats?.patientsCount || 0}
            </div>
            <p className="text-gray-600 mt-2">Patients</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">5</div>
            <p className="text-gray-600 mt-2">Rendez-vous Aujourd'hui</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">12</div>
            <p className="text-gray-600 mt-2">Dossiers à Signer</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">3</div>
            <p className="text-gray-600 mt-2">Alertes</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/patients/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              + Nouveau Patient
            </button>
            <button
              onClick={() => navigate("/patients")}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
            >
              📋 Consulter les Patients
            </button>
            <button
              onClick={() => navigate("/audit")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              📊 Audit et Logs
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Patients Récents</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID Patient</th>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Téléphone</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentPatients?.map((patient) => (
                  <tr key={patient.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">
                      {patient.localId}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{patient.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {patient.phoneNumber}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Voir →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
